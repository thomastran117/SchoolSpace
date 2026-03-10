using backend.app.errors.http;
using backend.app.services.interfaces;
using StackExchange.Redis;

namespace backend.app.services.implementations
{
    public sealed class NoOpCacheService : ICacheService
    {
        public Task<bool> SetValueAsync(string key, string value, TimeSpan? expiry = null) =>
            Task.FromResult(false);

        public Task<string?> GetValueAsync(string key) => Task.FromResult<string?>(null);

        public Task<long> IncrementAsync(string key, long value = 1) => Task.FromResult(0L);

        public Task<long> DecrementAsync(string key, long value = 1) => Task.FromResult(0L);

        public Task<bool> HashSetAsync(string key, string field, string value) =>
            Task.FromResult(false);

        public Task<string?> HashGetAsync(string key, string field) =>
            Task.FromResult<string?>(null);

        public Task<Dictionary<string, string>> HashGetAllAsync(string key) =>
            Task.FromResult(new Dictionary<string, string>());

        public Task<bool> HashDeleteAsync(string key, string field) => Task.FromResult(false);

        public Task<bool> SetAddAsync(string key, string value) => Task.FromResult(false);

        public Task<bool> SetRemoveAsync(string key, string value) => Task.FromResult(false);

        public Task<string[]> SetMembersAsync(string key) => Task.FromResult(Array.Empty<string>());

        public Task<long> ListLeftPushAsync(string key, string value) => Task.FromResult(0L);

        public Task<long> ListRightPushAsync(string key, string value) => Task.FromResult(0L);

        public Task<string?> ListLeftPopAsync(string key) => Task.FromResult<string?>(null);

        public Task<string?> ListRightPopAsync(string key) => Task.FromResult<string?>(null);

        public Task<bool> DeleteKeyAsync(string key) => Task.FromResult(false);

        public Task<bool> KeyExistsAsync(string key) => Task.FromResult(false);

        public Task<TimeSpan?> GetTTLAsync(string key) => Task.FromResult<TimeSpan?>(null);

        public Task<bool> SetExpiryAsync(string key, TimeSpan expiry) => Task.FromResult(false);

        public Task<bool> AcquireLockAsync(string key, string value, TimeSpan expiry) =>
            Task.FromResult(false);

        public Task<bool> ReleaseLockAsync(string key, string value) => Task.FromResult(false);

        public Task<Dictionary<string, string?>> GetManyAsync(IEnumerable<string> keys) =>
            Task.FromResult(new Dictionary<string, string?>());

        public IConnectionMultiplexer GetMultiplexer() =>
            throw new NotAvaliableException(
                "Redis is not available. Cache is running in no-op mode."
            );

        public Task<TimeSpan> PingAsync(CommandFlags flags = CommandFlags.None) =>
            throw new NotAvaliableException(
                "Redis is not available. Cache is running in no-op mode."
            );

        public Task<RedisResult> EvalAsync(string script, RedisKey[] keys, RedisValue[] values) =>
            throw new NotAvaliableException(
                "Redis is not available. Cache is running in no-op mode."
            );

        public Task<bool> SetValueNXAsync(string key, string value, TimeSpan? expiry = null) =>
            Task.FromResult(false);

        public Task<bool> SetValueXXAsync(string key, string value, TimeSpan? expiry = null) =>
            Task.FromResult(false);

        public Task<string?> GetSetAsync(string key, string value) =>
            Task.FromResult<string?>(null);

        public Task<long> PublishAsync(
            string channel,
            string message,
            CommandFlags flags = CommandFlags.None
        ) =>
            throw new NotAvaliableException(
                "Redis is not available. Cache is running in no-op mode."
            );

        public Task SubscribeAsync(string channel, Action<RedisChannel, RedisValue> handler) =>
            throw new NotAvaliableException(
                "Redis is not available. Cache is running in no-op mode."
            );

        public Task UnsubscribeAsync(string channel, Action<RedisChannel, RedisValue> handler) =>
            throw new NotAvaliableException(
                "Redis is not available. Cache is running in no-op mode."
            );

        public async Task<string> GetOrSetAsync(
            string key,
            Func<Task<string>> factory,
            TimeSpan expiry
        )
        {
            return await factory().ConfigureAwait(false);
        }

        public Task<bool> SetManyAsync(IEnumerable<KeyValuePair<string, string>> entries, TimeSpan? expiry = null) =>
            Task.FromResult(false);

        public Task<string?> KeyEncodingAsync(string key) => Task.FromResult<string?>(null);

        public async IAsyncEnumerable<string> KeyScanAsync(string pattern = "*", int pageSize = 250)
        {
            await Task.CompletedTask;
            yield break;
        }

        public Task<bool> HashExistsAsync(string key, string field) => Task.FromResult(false);

        public Task<long> HashLengthAsync(string key) => Task.FromResult(0L);

        public Task<long> HashIncrementAsync(string key, string field, long value = 1) => Task.FromResult(0L);

        public Task<bool> SetContainsAsync(string key, string value) => Task.FromResult(false);

        public Task<long> SetLengthAsync(string key) => Task.FromResult(0L);

        public Task<bool> SortedSetAddAsync(string key, string member, double score) => Task.FromResult(false);

        public Task<bool> SortedSetRemoveAsync(string key, string member) => Task.FromResult(false);

        public Task<double?> SortedSetScoreAsync(string key, string member) => Task.FromResult<double?>(null);

        public Task<double> SortedSetIncrementAsync(string key, string member, double delta) => Task.FromResult(0.0);

        public Task<SortedSetEntry[]> SortedSetRangeByScoreWithScoresAsync(
            string key,
            double start = double.NegativeInfinity,
            double stop = double.PositiveInfinity,
            long skip = 0,
            long take = -1) =>
            Task.FromResult(Array.Empty<SortedSetEntry>());

        public Task<long?> SortedSetRankAsync(string key, string member, Order order = Order.Ascending) =>
            Task.FromResult<long?>(null);

        public Task<long> SortedSetLengthAsync(string key) => Task.FromResult(0L);

        public Task<long> SortedSetRemoveRangeByScoreAsync(string key, double start, double stop) =>
            Task.FromResult(0L);

        public Task<string[]> ListRangeAsync(string key, long start = 0, long stop = -1) =>
            Task.FromResult(Array.Empty<string>());

        public Task<long> ListLengthAsync(string key) => Task.FromResult(0L);
    }
}
