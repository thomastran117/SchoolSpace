using backend.app.configurations.resources.redis;
using backend.app.services.interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace backend.app.services.implementations
{
    public sealed class CacheService : ICacheService
    {
        private readonly IDatabase _db;
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<CacheService> _logger;

        private static readonly LuaScript ReleaseLockScript = LuaScript.Prepare(
            @"
            if redis.call('GET', KEYS[1]) == ARGV[1] then
                return redis.call('DEL', KEYS[1])
            else
                return 0
            end
        "
        );

        public CacheService(RedisResource redisResource, ILogger<CacheService> logger)
        {
            _db = redisResource.Database;
            _redis = redisResource.Multiplexer;
            _logger = logger;
        }

        // -------------------------
        // String
        // -------------------------

        public async Task<bool> SetValueAsync(string key, string value, TimeSpan? expiry = null)
        {
            try { return await _db.StringSetAsync(key, value, expiry).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SetValueAsync), key); return false; }
        }

        public async Task<bool> SetValueNXAsync(string key, string value, TimeSpan? expiry = null)
        {
            try { return await _db.StringSetAsync(key, value, expiry, When.NotExists).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SetValueNXAsync), key); return false; }
        }

        public async Task<bool> SetValueXXAsync(string key, string value, TimeSpan? expiry = null)
        {
            try { return await _db.StringSetAsync(key, value, expiry, When.Exists).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SetValueXXAsync), key); return false; }
        }

        public async Task<string?> GetValueAsync(string key)
        {
            try
            {
                var v = await _db.StringGetAsync(key).ConfigureAwait(false);
                return v.HasValue ? v.ToString() : null;
            }
            catch (Exception ex) { Log(ex, nameof(GetValueAsync), key); return null; }
        }

        public async Task<string?> GetSetAsync(string key, string value)
        {
            try
            {
                var v = await _db.StringGetSetAsync(key, value).ConfigureAwait(false);
                return v.HasValue ? v.ToString() : null;
            }
            catch (Exception ex) { Log(ex, nameof(GetSetAsync), key); return null; }
        }

        public async Task<Dictionary<string, string?>> GetManyAsync(IEnumerable<string> keys)
        {
            var keyArr = keys.Select(k => (RedisKey)k).ToArray();
            if (keyArr.Length == 0)
                return new Dictionary<string, string?>();

            try
            {
                var values = await _db.StringGetAsync(keyArr).ConfigureAwait(false);
                var result = new Dictionary<string, string?>(keyArr.Length);
                for (int i = 0; i < keyArr.Length; i++)
                    result[keyArr[i].ToString()] = values[i].HasValue ? values[i].ToString() : null;
                return result;
            }
            catch (Exception ex)
            {
                Log(ex, nameof(GetManyAsync));
                return keyArr.ToDictionary(k => k.ToString(), _ => (string?)null);
            }
        }

        /// <summary>Write multiple key/value pairs in a single pipeline round-trip.</summary>
        public async Task<bool> SetManyAsync(
            IEnumerable<KeyValuePair<string, string>> entries,
            TimeSpan? expiry = null)
        {
            var pairs = entries.ToList();
            if (pairs.Count == 0) return true;

            try
            {
                var batch = _db.CreateBatch();
                var tasks = pairs.Select(p =>
                    batch.StringSetAsync(p.Key, p.Value, expiry)).ToList();
                batch.Execute();
                await Task.WhenAll(tasks).ConfigureAwait(false);
                return tasks.All(t => t.Result);
            }
            catch (Exception ex) { Log(ex, nameof(SetManyAsync)); return false; }
        }

        // -------------------------
        // Key
        // -------------------------

        public async Task<bool> DeleteKeyAsync(string key)
        {
            try { return await _db.KeyDeleteAsync(key).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(DeleteKeyAsync), key); return false; }
        }

        public async Task<bool> KeyExistsAsync(string key)
        {
            try { return await _db.KeyExistsAsync(key).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(KeyExistsAsync), key); return false; }
        }

        public async Task<TimeSpan?> GetTTLAsync(string key)
        {
            try { return await _db.KeyTimeToLiveAsync(key).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(GetTTLAsync), key); return null; }
        }

        public async Task<bool> SetExpiryAsync(string key, TimeSpan expiry)
        {
            try { return await _db.KeyExpireAsync(key, expiry).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SetExpiryAsync), key); return false; }
        }

        /// <summary>OBJECT ENCODING — useful for memory profiling.</summary>
        public async Task<string?> KeyEncodingAsync(string key)
        {
            try
            {
                var result = await _db.DebugObjectAsync(key).ConfigureAwait(false);
                return result;
            }
            catch (Exception ex) { Log(ex, nameof(KeyEncodingAsync), key); return null; }
        }

        /// <summary>SCAN over the keyspace. Returns an async stream of matching keys.</summary>
        public async IAsyncEnumerable<string> KeyScanAsync(string pattern = "*", int pageSize = 250)
        {
            IAsyncEnumerable<RedisKey> scan;
            try { scan = _redis.GetServer(_redis.GetEndPoints().First()).KeysAsync(pattern: pattern, pageSize: pageSize); }
            catch (Exception ex) { Log(ex, nameof(KeyScanAsync)); yield break; }

            await foreach (var key in scan)
                yield return key.ToString();
        }

        // -------------------------
        // Counters
        // -------------------------

        public async Task<long> IncrementAsync(string key, long value = 1)
        {
            try { return await _db.StringIncrementAsync(key, value).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(IncrementAsync), key); return 0; }
        }

        public async Task<long> DecrementAsync(string key, long value = 1)
        {
            try { return await _db.StringDecrementAsync(key, value).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(DecrementAsync), key); return 0; }
        }

        // -------------------------
        // Hash
        // -------------------------

        public async Task<bool> HashSetAsync(string key, string field, string value)
        {
            try { return await _db.HashSetAsync(key, field, value).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(HashSetAsync), key); return false; }
        }

        public async Task<string?> HashGetAsync(string key, string field)
        {
            try
            {
                var v = await _db.HashGetAsync(key, field).ConfigureAwait(false);
                return v.HasValue ? v.ToString() : null;
            }
            catch (Exception ex) { Log(ex, nameof(HashGetAsync), key); return null; }
        }

        public async Task<Dictionary<string, string>> HashGetAllAsync(string key)
        {
            try
            {
                var entries = await _db.HashGetAllAsync(key).ConfigureAwait(false);
                return entries.ToDictionary(e => e.Name.ToString(), e => e.Value.ToString());
            }
            catch (Exception ex) { Log(ex, nameof(HashGetAllAsync), key); return new Dictionary<string, string>(); }
        }

        public async Task<bool> HashDeleteAsync(string key, string field)
        {
            try { return await _db.HashDeleteAsync(key, field).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(HashDeleteAsync), key); return false; }
        }

        public async Task<bool> HashExistsAsync(string key, string field)
        {
            try { return await _db.HashExistsAsync(key, field).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(HashExistsAsync), key); return false; }
        }

        public async Task<long> HashLengthAsync(string key)
        {
            try { return await _db.HashLengthAsync(key).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(HashLengthAsync), key); return 0; }
        }

        /// <summary>HINCRBY — atomically increment a hash field.</summary>
        public async Task<long> HashIncrementAsync(string key, string field, long value = 1)
        {
            try { return await _db.HashIncrementAsync(key, field, value).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(HashIncrementAsync), key); return 0; }
        }

        // -------------------------
        // Set
        // -------------------------

        public async Task<bool> SetAddAsync(string key, string value)
        {
            try { return await _db.SetAddAsync(key, value).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SetAddAsync), key); return false; }
        }

        public async Task<bool> SetRemoveAsync(string key, string value)
        {
            try { return await _db.SetRemoveAsync(key, value).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SetRemoveAsync), key); return false; }
        }

        public async Task<string[]> SetMembersAsync(string key)
        {
            try
            {
                var members = await _db.SetMembersAsync(key).ConfigureAwait(false);
                return members.Select(m => m.ToString()).ToArray();
            }
            catch (Exception ex) { Log(ex, nameof(SetMembersAsync), key); return Array.Empty<string>(); }
        }

        public async Task<bool> SetContainsAsync(string key, string value)
        {
            try { return await _db.SetContainsAsync(key, value).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SetContainsAsync), key); return false; }
        }

        public async Task<long> SetLengthAsync(string key)
        {
            try { return await _db.SetLengthAsync(key).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SetLengthAsync), key); return 0; }
        }

        // -------------------------
        // Sorted Set (ZSet)
        // -------------------------

        /// <summary>ZADD</summary>
        public async Task<bool> SortedSetAddAsync(string key, string member, double score)
        {
            try { return await _db.SortedSetAddAsync(key, member, score).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SortedSetAddAsync), key); return false; }
        }

        /// <summary>ZREM</summary>
        public async Task<bool> SortedSetRemoveAsync(string key, string member)
        {
            try { return await _db.SortedSetRemoveAsync(key, member).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SortedSetRemoveAsync), key); return false; }
        }

        /// <summary>ZSCORE</summary>
        public async Task<double?> SortedSetScoreAsync(string key, string member)
        {
            try { return await _db.SortedSetScoreAsync(key, member).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SortedSetScoreAsync), key); return null; }
        }

        /// <summary>ZINCRBY</summary>
        public async Task<double> SortedSetIncrementAsync(string key, string member, double delta)
        {
            try { return await _db.SortedSetIncrementAsync(key, member, delta).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SortedSetIncrementAsync), key); return 0; }
        }

        /// <summary>ZRANGEBYSCORE (ascending, with scores).</summary>
        public async Task<SortedSetEntry[]> SortedSetRangeByScoreWithScoresAsync(
            string key, double start = double.NegativeInfinity, double stop = double.PositiveInfinity,
            long skip = 0, long take = -1)
        {
            try
            {
                return await _db.SortedSetRangeByScoreWithScoresAsync(
                    key, start, stop, Exclude.None, Order.Ascending, skip, take)
                    .ConfigureAwait(false);
            }
            catch (Exception ex) { Log(ex, nameof(SortedSetRangeByScoreWithScoresAsync), key); return Array.Empty<SortedSetEntry>(); }
        }

        /// <summary>ZRANK (0-based, ascending).</summary>
        public async Task<long?> SortedSetRankAsync(string key, string member, Order order = Order.Ascending)
        {
            try { return await _db.SortedSetRankAsync(key, member, order).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SortedSetRankAsync), key); return null; }
        }

        /// <summary>ZCARD</summary>
        public async Task<long> SortedSetLengthAsync(string key)
        {
            try { return await _db.SortedSetLengthAsync(key).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SortedSetLengthAsync), key); return 0; }
        }

        /// <summary>ZREMRANGEBYSCORE — remove members by score range.</summary>
        public async Task<long> SortedSetRemoveRangeByScoreAsync(
            string key, double start, double stop)
        {
            try { return await _db.SortedSetRemoveRangeByScoreAsync(key, start, stop).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SortedSetRemoveRangeByScoreAsync), key); return 0; }
        }

        // -------------------------
        // List
        // -------------------------

        public async Task<long> ListLeftPushAsync(string key, string value)
        {
            try { return await _db.ListLeftPushAsync(key, value).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(ListLeftPushAsync), key); return 0; }
        }

        public async Task<long> ListRightPushAsync(string key, string value)
        {
            try { return await _db.ListRightPushAsync(key, value).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(ListRightPushAsync), key); return 0; }
        }

        public async Task<string?> ListLeftPopAsync(string key)
        {
            try
            {
                var v = await _db.ListLeftPopAsync(key).ConfigureAwait(false);
                return v.HasValue ? v.ToString() : null;
            }
            catch (Exception ex) { Log(ex, nameof(ListLeftPopAsync), key); return null; }
        }

        public async Task<string?> ListRightPopAsync(string key)
        {
            try
            {
                var v = await _db.ListRightPopAsync(key).ConfigureAwait(false);
                return v.HasValue ? v.ToString() : null;
            }
            catch (Exception ex) { Log(ex, nameof(ListRightPopAsync), key); return null; }
        }

        /// <summary>LRANGE — slice of the list.</summary>
        public async Task<string[]> ListRangeAsync(string key, long start = 0, long stop = -1)
        {
            try
            {
                var values = await _db.ListRangeAsync(key, start, stop).ConfigureAwait(false);
                return values.Select(v => v.ToString()).ToArray();
            }
            catch (Exception ex) { Log(ex, nameof(ListRangeAsync), key); return Array.Empty<string>(); }
        }

        /// <summary>LLEN</summary>
        public async Task<long> ListLengthAsync(string key)
        {
            try { return await _db.ListLengthAsync(key).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(ListLengthAsync), key); return 0; }
        }

        // -------------------------
        // Locks
        // -------------------------

        public async Task<bool> AcquireLockAsync(string key, string value, TimeSpan expiry)
        {
            try { return await _db.StringSetAsync(key, value, expiry, When.NotExists).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(AcquireLockAsync), key); return false; }
        }

        public async Task<bool> ReleaseLockAsync(string key, string value)
        {
            try
            {
                var result = await _db.ScriptEvaluateAsync(
                    ReleaseLockScript.OriginalScript,
                    new RedisKey[] { key },
                    new RedisValue[] { value })
                    .ConfigureAwait(false);
                return (int)result == 1;
            }
            catch (Exception ex) { Log(ex, nameof(ReleaseLockAsync), key); return false; }
        }

        // -------------------------
        // Pub/Sub
        // -------------------------

        public async Task<long> PublishAsync(string channel, string message, CommandFlags flags = CommandFlags.None)
        {
            try { return await _redis.GetSubscriber().PublishAsync(channel, message, flags).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(PublishAsync)); return 0; }
        }

        public async Task SubscribeAsync(string channel, Action<RedisChannel, RedisValue> handler)
        {
            try { await _redis.GetSubscriber().SubscribeAsync(channel, handler).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(SubscribeAsync)); }
        }

        public async Task UnsubscribeAsync(string channel, Action<RedisChannel, RedisValue> handler)
        {
            try { await _redis.GetSubscriber().UnsubscribeAsync(channel, handler).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(UnsubscribeAsync)); }
        }

        // -------------------------
        // Higher-order helpers
        // -------------------------

        /// <summary>
        /// Get-or-set with NX to prevent thundering herd.
        /// Falls back to factory on any Redis failure.
        /// </summary>
        public async Task<string> GetOrSetAsync(string key, Func<Task<string>> factory, TimeSpan expiry)
        {
            try
            {
                var existing = await GetValueAsync(key).ConfigureAwait(false);
                if (existing is not null)
                    return existing;

                var created = await factory().ConfigureAwait(false);
                // NX so a concurrent writer wins cleanly
                await SetValueNXAsync(key, created, expiry).ConfigureAwait(false);
                return created;
            }
            catch (Exception ex)
            {
                Log(ex, nameof(GetOrSetAsync), key);
                // Redis is down — still serve the caller
                return await factory().ConfigureAwait(false);
            }
        }

        // -------------------------
        // Infra / diagnostics
        // -------------------------

        public IConnectionMultiplexer GetMultiplexer() => _redis;

        public async Task<TimeSpan> PingAsync(CommandFlags flags = CommandFlags.None)
        {
            try { return await _db.PingAsync(flags).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(PingAsync)); return TimeSpan.MaxValue; }
        }

        public async Task<RedisResult> EvalAsync(string script, RedisKey[] keys, RedisValue[] values)
        {
            try { return await _db.ScriptEvaluateAsync(script, keys, values).ConfigureAwait(false); }
            catch (Exception ex) { Log(ex, nameof(EvalAsync)); return RedisResult.Create(RedisValue.Null); }
        }

        // -------------------------
        // Private helpers
        // -------------------------

        private void Log(Exception ex, string operation, string? key = null) =>
            _logger.LogError(ex, "Redis operation failed. Operation={Operation} Key={Key}", operation, key ?? "(none)");
    }
}