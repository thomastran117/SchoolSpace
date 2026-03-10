using StackExchange.Redis;

namespace backend.app.services.interfaces
{
    public interface ICacheService
    {
        // -------------------------
        // String
        // -------------------------
        Task<bool> SetValueAsync(string key, string value, TimeSpan? expiry = null);
        Task<bool> SetValueNXAsync(string key, string value, TimeSpan? expiry = null);
        Task<bool> SetValueXXAsync(string key, string value, TimeSpan? expiry = null);
        Task<string?> GetValueAsync(string key);
        Task<string?> GetSetAsync(string key, string value);
        Task<Dictionary<string, string?>> GetManyAsync(IEnumerable<string> keys);
        Task<bool> SetManyAsync(IEnumerable<KeyValuePair<string, string>> entries, TimeSpan? expiry = null);

        // -------------------------
        // Key
        // -------------------------
        Task<bool> DeleteKeyAsync(string key);
        Task<bool> KeyExistsAsync(string key);
        Task<TimeSpan?> GetTTLAsync(string key);
        Task<bool> SetExpiryAsync(string key, TimeSpan expiry);
        Task<string?> KeyEncodingAsync(string key);
        IAsyncEnumerable<string> KeyScanAsync(string pattern = "*", int pageSize = 250);

        // -------------------------
        // Counters
        // -------------------------
        Task<long> IncrementAsync(string key, long value = 1);
        Task<long> DecrementAsync(string key, long value = 1);

        // -------------------------
        // Hash
        // -------------------------
        Task<bool> HashSetAsync(string key, string field, string value);
        Task<string?> HashGetAsync(string key, string field);
        Task<Dictionary<string, string>> HashGetAllAsync(string key);
        Task<bool> HashDeleteAsync(string key, string field);
        Task<bool> HashExistsAsync(string key, string field);
        Task<long> HashLengthAsync(string key);
        Task<long> HashIncrementAsync(string key, string field, long value = 1);

        // -------------------------
        // Set
        // -------------------------
        Task<bool> SetAddAsync(string key, string value);
        Task<bool> SetRemoveAsync(string key, string value);
        Task<string[]> SetMembersAsync(string key);
        Task<bool> SetContainsAsync(string key, string value);
        Task<long> SetLengthAsync(string key);

        // -------------------------
        // Sorted Set (ZSet)
        // -------------------------
        Task<bool> SortedSetAddAsync(string key, string member, double score);
        Task<bool> SortedSetRemoveAsync(string key, string member);
        Task<double?> SortedSetScoreAsync(string key, string member);
        Task<double> SortedSetIncrementAsync(string key, string member, double delta);
        Task<SortedSetEntry[]> SortedSetRangeByScoreWithScoresAsync(
            string key,
            double start = double.NegativeInfinity,
            double stop = double.PositiveInfinity,
            long skip = 0,
            long take = -1);
        Task<long?> SortedSetRankAsync(string key, string member, Order order = Order.Ascending);
        Task<long> SortedSetLengthAsync(string key);
        Task<long> SortedSetRemoveRangeByScoreAsync(string key, double start, double stop);

        // -------------------------
        // List
        // -------------------------
        Task<long> ListLeftPushAsync(string key, string value);
        Task<long> ListRightPushAsync(string key, string value);
        Task<string?> ListLeftPopAsync(string key);
        Task<string?> ListRightPopAsync(string key);
        Task<string[]> ListRangeAsync(string key, long start = 0, long stop = -1);
        Task<long> ListLengthAsync(string key);

        // -------------------------
        // Locks
        // -------------------------
        Task<bool> AcquireLockAsync(string key, string value, TimeSpan expiry);
        Task<bool> ReleaseLockAsync(string key, string value);

        // -------------------------
        // Pub/Sub
        // -------------------------
        Task<long> PublishAsync(string channel, string message, CommandFlags flags = CommandFlags.None);
        Task SubscribeAsync(string channel, Action<RedisChannel, RedisValue> handler);
        Task UnsubscribeAsync(string channel, Action<RedisChannel, RedisValue> handler);

        // -------------------------
        // Higher-order helpers
        // -------------------------
        Task<string> GetOrSetAsync(string key, Func<Task<string>> factory, TimeSpan expiry);

        // -------------------------
        // Infra / diagnostics
        // -------------------------
        IConnectionMultiplexer GetMultiplexer();
        Task<TimeSpan> PingAsync(CommandFlags flags = CommandFlags.None);
        Task<RedisResult> EvalAsync(string script, RedisKey[] keys, RedisValue[] values);
    }
}