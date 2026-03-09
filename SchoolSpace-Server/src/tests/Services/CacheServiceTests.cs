using backend.app.configurations.resources.redis;
using backend.app.services.implementations;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using StackExchange.Redis;
using Xunit;

namespace backend.tests.Services;

public class CacheServiceTests
{
    private readonly Mock<IDatabase> _db = new();
    private readonly Mock<IConnectionMultiplexer> _multiplexer = new();
    private readonly Mock<ISubscriber> _subscriber = new();
    private readonly Mock<ILogger<CacheService>> _logger = new();
    private readonly CacheService _sut;

    public CacheServiceTests()
    {
        _multiplexer
            .Setup(m => m.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
            .Returns(_db.Object);

        _multiplexer
            .Setup(m => m.GetSubscriber(It.IsAny<object>()))
            .Returns(_subscriber.Object);

        var resource = new RedisResource(_multiplexer.Object);
        _sut = new CacheService(resource, _logger.Object);
    }

    // =========================================================================
    // String — SetValueAsync
    // =========================================================================

    [Fact]
    public async Task SetValueAsync_DelegatesToDatabase_ReturnsTrue()
    {
        _db.Setup(d => d.StringSetAsync(
                It.IsAny<RedisKey>(), It.IsAny<RedisValue>(),
                It.IsAny<TimeSpan?>(), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(true);

        var result = await _sut.SetValueAsync("key", "value", TimeSpan.FromSeconds(10));

        result.Should().BeTrue();
    }

    [Fact]
    public async Task SetValueAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.Setup(d => d.StringSetAsync(
                It.IsAny<RedisKey>(), It.IsAny<RedisValue>(),
                It.IsAny<TimeSpan?>(), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("connection lost"));

        var result = await _sut.SetValueAsync("key", "value");

        result.Should().BeFalse();
    }

    // =========================================================================
    // String — SetValueNXAsync / SetValueXXAsync
    // =========================================================================

    [Fact]
    public async Task SetValueNXAsync_PassesWhenNotExistsToDatabase()
    {
        await _sut.SetValueNXAsync("key", "value");

        var call = _db.Invocations.First(i => i.Method.Name == "StringSetAsync");
        ((When)call.Arguments[3]).Should().Be(When.NotExists);
    }

    [Fact]
    public async Task SetValueNXAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.As<IDatabaseAsync>().Setup(d => d.StringSetAsync(
                It.IsAny<RedisKey>(), It.IsAny<RedisValue>(),
                It.IsAny<TimeSpan?>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("connection lost"));

        var result = await _sut.SetValueNXAsync("key", "value");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task SetValueXXAsync_PassesWhenExistsToDatabase()
    {
        await _sut.SetValueXXAsync("key", "value");

        var call = _db.Invocations.First(i => i.Method.Name == "StringSetAsync");
        ((When)call.Arguments[3]).Should().Be(When.Exists);
    }

    // =========================================================================
    // String — GetValueAsync
    // =========================================================================

    [Fact]
    public async Task GetValueAsync_WhenKeyHasValue_ReturnsString()
    {
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync((RedisValue)"hello");

        var result = await _sut.GetValueAsync("key");

        result.Should().Be("hello");
    }

    [Fact]
    public async Task GetValueAsync_WhenKeyDoesNotExist_ReturnsNull()
    {
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(RedisValue.Null);

        var result = await _sut.GetValueAsync("missing");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetValueAsync_WhenDatabaseThrows_ReturnsNull()
    {
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.GetValueAsync("key");

        result.Should().BeNull();
    }

    // =========================================================================
    // String — GetSetAsync
    // =========================================================================

    [Fact]
    public async Task GetSetAsync_WhenOldValueExists_ReturnsOldValue()
    {
        _db.Setup(d => d.StringGetSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync((RedisValue)"old-value");

        var result = await _sut.GetSetAsync("key", "new-value");

        result.Should().Be("old-value");
    }

    [Fact]
    public async Task GetSetAsync_WhenKeyIsNew_ReturnsNull()
    {
        _db.Setup(d => d.StringGetSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(RedisValue.Null);

        var result = await _sut.GetSetAsync("key", "value");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetSetAsync_WhenDatabaseThrows_ReturnsNull()
    {
        _db.Setup(d => d.StringGetSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.GetSetAsync("key", "value");

        result.Should().BeNull();
    }

    // =========================================================================
    // String — GetManyAsync
    // =========================================================================

    [Fact]
    public async Task GetManyAsync_WithEmptyKeys_ReturnsEmptyDictionary()
    {
        var result = await _sut.GetManyAsync(Array.Empty<string>());

        result.Should().BeEmpty();
        _db.Verify(d => d.StringGetAsync(It.IsAny<RedisKey[]>(), It.IsAny<CommandFlags>()), Times.Never);
    }

    [Fact]
    public async Task GetManyAsync_WithKeys_ReturnsMappedDictionary()
    {
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey[]>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(new RedisValue[] { "val-a", "val-b" });

        var result = await _sut.GetManyAsync(new[] { "key-a", "key-b" });

        result.Should().HaveCount(2);
        result["key-a"].Should().Be("val-a");
        result["key-b"].Should().Be("val-b");
    }

    [Fact]
    public async Task GetManyAsync_WhenKeyHasNoValue_MapsToNull()
    {
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey[]>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(new RedisValue[] { "val-a", RedisValue.Null });

        var result = await _sut.GetManyAsync(new[] { "key-a", "key-b" });

        result["key-a"].Should().Be("val-a");
        result["key-b"].Should().BeNull();
    }

    [Fact]
    public async Task GetManyAsync_WhenDatabaseThrows_ReturnsAllNullDictionary()
    {
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey[]>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.GetManyAsync(new[] { "key-a", "key-b" });

        result.Should().HaveCount(2);
        result["key-a"].Should().BeNull();
        result["key-b"].Should().BeNull();
    }

    // =========================================================================
    // Key operations
    // =========================================================================

    [Fact]
    public async Task DeleteKeyAsync_WhenKeyExists_ReturnsTrue()
    {
        _db.Setup(d => d.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(true);

        var result = await _sut.DeleteKeyAsync("key");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteKeyAsync_WhenKeyMissing_ReturnsFalse()
    {
        _db.Setup(d => d.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(false);

        var result = await _sut.DeleteKeyAsync("key");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteKeyAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.Setup(d => d.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.DeleteKeyAsync("key");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task KeyExistsAsync_WhenKeyPresent_ReturnsTrue()
    {
        _db.Setup(d => d.KeyExistsAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(true);

        var result = await _sut.KeyExistsAsync("key");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task KeyExistsAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.Setup(d => d.KeyExistsAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.KeyExistsAsync("key");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetTTLAsync_WhenKeyHasTTL_ReturnsTimeSpan()
    {
        var ttl = TimeSpan.FromMinutes(5);
        _db.Setup(d => d.KeyTimeToLiveAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(ttl);

        var result = await _sut.GetTTLAsync("key");

        result.Should().Be(ttl);
    }

    [Fact]
    public async Task GetTTLAsync_WhenKeyHasNoExpiry_ReturnsNull()
    {
        _db.Setup(d => d.KeyTimeToLiveAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync((TimeSpan?)null);

        var result = await _sut.GetTTLAsync("key");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTTLAsync_WhenDatabaseThrows_ReturnsNull()
    {
        _db.Setup(d => d.KeyTimeToLiveAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.GetTTLAsync("key");

        result.Should().BeNull();
    }

    [Fact]
    public async Task SetExpiryAsync_DelegatesToDatabase_ReturnsResult()
    {
        _db.Setup(d => d.KeyExpireAsync(It.IsAny<RedisKey>(), It.IsAny<TimeSpan?>(), It.IsAny<ExpireWhen>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(true);

        var result = await _sut.SetExpiryAsync("key", TimeSpan.FromSeconds(30));

        result.Should().BeTrue();
    }

    [Fact]
    public async Task SetExpiryAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.Setup(d => d.KeyExpireAsync(It.IsAny<RedisKey>(), It.IsAny<TimeSpan?>(), It.IsAny<ExpireWhen>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.SetExpiryAsync("key", TimeSpan.FromSeconds(30));

        result.Should().BeFalse();
    }

    // =========================================================================
    // Counters
    // =========================================================================

    [Fact]
    public async Task IncrementAsync_ReturnsNewValue()
    {
        _db.Setup(d => d.StringIncrementAsync(It.IsAny<RedisKey>(), It.IsAny<long>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(5L);

        var result = await _sut.IncrementAsync("counter");

        result.Should().Be(5L);
    }

    [Fact]
    public async Task IncrementAsync_WhenDatabaseThrows_ReturnsZero()
    {
        _db.Setup(d => d.StringIncrementAsync(It.IsAny<RedisKey>(), It.IsAny<long>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.IncrementAsync("counter");

        result.Should().Be(0L);
    }

    [Fact]
    public async Task DecrementAsync_ReturnsNewValue()
    {
        _db.Setup(d => d.StringDecrementAsync(It.IsAny<RedisKey>(), It.IsAny<long>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(3L);

        var result = await _sut.DecrementAsync("counter");

        result.Should().Be(3L);
    }

    [Fact]
    public async Task DecrementAsync_WhenDatabaseThrows_ReturnsZero()
    {
        _db.Setup(d => d.StringDecrementAsync(It.IsAny<RedisKey>(), It.IsAny<long>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.DecrementAsync("counter");

        result.Should().Be(0L);
    }

    // =========================================================================
    // Hash
    // =========================================================================

    [Fact]
    public async Task HashSetAsync_DelegatesToDatabase_ReturnsTrue()
    {
        _db.Setup(d => d.HashSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<RedisValue>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(true);

        var result = await _sut.HashSetAsync("hash", "field", "value");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task HashSetAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.Setup(d => d.HashSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<RedisValue>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.HashSetAsync("hash", "field", "value");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task HashGetAsync_WhenFieldExists_ReturnsValue()
    {
        _db.Setup(d => d.HashGetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync((RedisValue)"field-value");

        var result = await _sut.HashGetAsync("hash", "field");

        result.Should().Be("field-value");
    }

    [Fact]
    public async Task HashGetAsync_WhenFieldMissing_ReturnsNull()
    {
        _db.Setup(d => d.HashGetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(RedisValue.Null);

        var result = await _sut.HashGetAsync("hash", "missing");

        result.Should().BeNull();
    }

    [Fact]
    public async Task HashGetAsync_WhenDatabaseThrows_ReturnsNull()
    {
        _db.Setup(d => d.HashGetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.HashGetAsync("hash", "field");

        result.Should().BeNull();
    }

    [Fact]
    public async Task HashGetAllAsync_ReturnsMappedDictionary()
    {
        var entries = new HashEntry[]
        {
            new("field1", "val1"),
            new("field2", "val2")
        };
        _db.Setup(d => d.HashGetAllAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(entries);

        var result = await _sut.HashGetAllAsync("hash");

        result.Should().HaveCount(2);
        result["field1"].Should().Be("val1");
        result["field2"].Should().Be("val2");
    }

    [Fact]
    public async Task HashGetAllAsync_WhenDatabaseThrows_ReturnsEmptyDictionary()
    {
        _db.Setup(d => d.HashGetAllAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.HashGetAllAsync("hash");

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task HashDeleteAsync_DelegatesToDatabase_ReturnsResult()
    {
        _db.Setup(d => d.HashDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(true);

        var result = await _sut.HashDeleteAsync("hash", "field");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task HashDeleteAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.Setup(d => d.HashDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.HashDeleteAsync("hash", "field");

        result.Should().BeFalse();
    }

    // =========================================================================
    // Set
    // =========================================================================

    [Fact]
    public async Task SetAddAsync_DelegatesToDatabase_ReturnsTrue()
    {
        _db.Setup(d => d.SetAddAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(true);

        var result = await _sut.SetAddAsync("myset", "member");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task SetAddAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.Setup(d => d.SetAddAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.SetAddAsync("myset", "member");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task SetRemoveAsync_DelegatesToDatabase_ReturnsTrue()
    {
        _db.Setup(d => d.SetRemoveAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(true);

        var result = await _sut.SetRemoveAsync("myset", "member");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task SetRemoveAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.Setup(d => d.SetRemoveAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.SetRemoveAsync("myset", "member");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task SetMembersAsync_ReturnsMappedStringArray()
    {
        _db.Setup(d => d.SetMembersAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(new RedisValue[] { "alpha", "beta", "gamma" });

        var result = await _sut.SetMembersAsync("myset");

        result.Should().Equal("alpha", "beta", "gamma");
    }

    [Fact]
    public async Task SetMembersAsync_WhenDatabaseThrows_ReturnsEmptyArray()
    {
        _db.Setup(d => d.SetMembersAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.SetMembersAsync("myset");

        result.Should().BeEmpty();
    }

    // =========================================================================
    // List
    // =========================================================================

    [Fact]
    public async Task ListLeftPushAsync_ReturnsNewLength()
    {
        _db.Setup(d => d.ListLeftPushAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(3L);

        var result = await _sut.ListLeftPushAsync("list", "item");

        result.Should().Be(3L);
    }

    [Fact]
    public async Task ListLeftPushAsync_WhenDatabaseThrows_ReturnsZero()
    {
        _db.Setup(d => d.ListLeftPushAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.ListLeftPushAsync("list", "item");

        result.Should().Be(0L);
    }

    [Fact]
    public async Task ListRightPushAsync_ReturnsNewLength()
    {
        _db.Setup(d => d.ListRightPushAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(4L);

        var result = await _sut.ListRightPushAsync("list", "item");

        result.Should().Be(4L);
    }

    [Fact]
    public async Task ListRightPushAsync_WhenDatabaseThrows_ReturnsZero()
    {
        _db.Setup(d => d.ListRightPushAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.ListRightPushAsync("list", "item");

        result.Should().Be(0L);
    }

    [Fact]
    public async Task ListLeftPopAsync_WhenListHasItems_ReturnsValue()
    {
        _db.Setup(d => d.ListLeftPopAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync((RedisValue)"popped");

        var result = await _sut.ListLeftPopAsync("list");

        result.Should().Be("popped");
    }

    [Fact]
    public async Task ListLeftPopAsync_WhenListIsEmpty_ReturnsNull()
    {
        _db.Setup(d => d.ListLeftPopAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(RedisValue.Null);

        var result = await _sut.ListLeftPopAsync("list");

        result.Should().BeNull();
    }

    [Fact]
    public async Task ListLeftPopAsync_WhenDatabaseThrows_ReturnsNull()
    {
        _db.Setup(d => d.ListLeftPopAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.ListLeftPopAsync("list");

        result.Should().BeNull();
    }

    [Fact]
    public async Task ListRightPopAsync_WhenListHasItems_ReturnsValue()
    {
        _db.Setup(d => d.ListRightPopAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync((RedisValue)"popped");

        var result = await _sut.ListRightPopAsync("list");

        result.Should().Be("popped");
    }

    [Fact]
    public async Task ListRightPopAsync_WhenDatabaseThrows_ReturnsNull()
    {
        _db.Setup(d => d.ListRightPopAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.ListRightPopAsync("list");

        result.Should().BeNull();
    }

    // =========================================================================
    // Locks
    // =========================================================================

    [Fact]
    public async Task AcquireLockAsync_PassesWhenNotExistsToDatabase()
    {
        await _sut.AcquireLockAsync("lock:key", "owner-id", TimeSpan.FromSeconds(30));

        var call = _db.Invocations.First(i => i.Method.Name == "StringSetAsync");
        ((When)call.Arguments[3]).Should().Be(When.NotExists);
    }

    [Fact]
    public async Task AcquireLockAsync_WhenLockAlreadyHeld_ReturnsFalse()
    {
        // Default Moq behavior returns false for StringSetAsync — lock not acquired
        var result = await _sut.AcquireLockAsync("lock:key", "owner-id", TimeSpan.FromSeconds(30));

        result.Should().BeFalse();
    }

    [Fact]
    public async Task AcquireLockAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.As<IDatabaseAsync>().Setup(d => d.StringSetAsync(
                It.IsAny<RedisKey>(), It.IsAny<RedisValue>(),
                It.IsAny<TimeSpan?>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.AcquireLockAsync("lock:key", "owner-id", TimeSpan.FromSeconds(30));

        result.Should().BeFalse();
    }

    [Fact]
    public async Task ReleaseLockAsync_WhenOwnerMatches_ReturnsTrue()
    {
        _db.Setup(d => d.ScriptEvaluateAsync(
                It.IsAny<string>(), It.IsAny<RedisKey[]>(),
                It.IsAny<RedisValue[]>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(RedisResult.Create((RedisValue)1));

        var result = await _sut.ReleaseLockAsync("lock:key", "owner-id");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task ReleaseLockAsync_WhenOwnerDoesNotMatch_ReturnsFalse()
    {
        _db.Setup(d => d.ScriptEvaluateAsync(
                It.IsAny<string>(), It.IsAny<RedisKey[]>(),
                It.IsAny<RedisValue[]>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(RedisResult.Create((RedisValue)0));

        var result = await _sut.ReleaseLockAsync("lock:key", "wrong-owner");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task ReleaseLockAsync_WhenDatabaseThrows_ReturnsFalse()
    {
        _db.Setup(d => d.ScriptEvaluateAsync(
                It.IsAny<string>(), It.IsAny<RedisKey[]>(),
                It.IsAny<RedisValue[]>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.ReleaseLockAsync("lock:key", "owner-id");

        result.Should().BeFalse();
    }

    // =========================================================================
    // Pub/Sub
    // =========================================================================

    [Fact]
    public async Task PublishAsync_ReturnsSubscriberCount()
    {
        _subscriber.Setup(s => s.PublishAsync(
                It.IsAny<RedisChannel>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(3L);

        var result = await _sut.PublishAsync("events", "payload");

        result.Should().Be(3L);
    }

    [Fact]
    public async Task PublishAsync_WhenSubscriberThrows_ReturnsZero()
    {
        _subscriber.Setup(s => s.PublishAsync(
                It.IsAny<RedisChannel>(), It.IsAny<RedisValue>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.PublishAsync("events", "payload");

        result.Should().Be(0L);
    }

    [Fact]
    public async Task SubscribeAsync_InvokesSubscriberSubscribe()
    {
        Action<RedisChannel, RedisValue> handler = (_, _) => { };

        await _sut.SubscribeAsync("channel", handler);

        _subscriber.Verify(s => s.SubscribeAsync(
            It.IsAny<RedisChannel>(), handler, It.IsAny<CommandFlags>()),
            Times.Once);
    }

    [Fact]
    public async Task UnsubscribeAsync_InvokesSubscriberUnsubscribe()
    {
        Action<RedisChannel, RedisValue> handler = (_, _) => { };

        await _sut.UnsubscribeAsync("channel", handler);

        _subscriber.Verify(s => s.UnsubscribeAsync(
            It.IsAny<RedisChannel>(), handler, It.IsAny<CommandFlags>()),
            Times.Once);
    }

    // =========================================================================
    // Higher-order — GetOrSetAsync
    // =========================================================================

    [Fact]
    public async Task GetOrSetAsync_WhenKeyExists_ReturnsCachedValueWithoutCallingFactory()
    {
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync((RedisValue)"cached");

        var factoryCalled = false;
        var result = await _sut.GetOrSetAsync("key", () =>
        {
            factoryCalled = true;
            return Task.FromResult("from-factory");
        }, TimeSpan.FromMinutes(1));

        result.Should().Be("cached");
        factoryCalled.Should().BeFalse();
    }

    [Fact]
    public async Task GetOrSetAsync_WhenKeyMissing_CallsFactoryAndStoresResult()
    {
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(RedisValue.Null);
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(RedisValue.Null);

        var result = await _sut.GetOrSetAsync("key", () => Task.FromResult("fresh"), TimeSpan.FromMinutes(1));

        result.Should().Be("fresh");

        var setCall = _db.Invocations.First(i => i.Method.Name == "StringSetAsync");
        ((When)setCall.Arguments[3]).Should().Be(When.NotExists);
        setCall.Arguments[1].As<RedisValue>().ToString().Should().Be("fresh");
    }

    [Fact]
    public async Task GetOrSetAsync_WhenRedisIsDown_FallsBackToFactory()
    {
        // Redis is down — GetValueAsync will return null (it swallows the exception internally)
        _db.Setup(d => d.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("connection lost"));

        var result = await _sut.GetOrSetAsync("key", () => Task.FromResult("fallback"), TimeSpan.FromMinutes(1));

        result.Should().Be("fallback");
    }

    // =========================================================================
    // Diagnostics
    // =========================================================================

    [Fact]
    public void GetMultiplexer_ReturnsTheMultiplexerInstance()
    {
        var result = _sut.GetMultiplexer();

        result.Should().BeSameAs(_multiplexer.Object);
    }

    [Fact]
    public async Task PingAsync_ReturnsPingDuration()
    {
        var ping = TimeSpan.FromMilliseconds(3);
        _db.Setup(d => d.PingAsync(It.IsAny<CommandFlags>())).ReturnsAsync(ping);

        var result = await _sut.PingAsync();

        result.Should().Be(ping);
    }

    [Fact]
    public async Task PingAsync_WhenDatabaseThrows_ReturnsTimeSpanMaxValue()
    {
        _db.Setup(d => d.PingAsync(It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.PingAsync();

        result.Should().Be(TimeSpan.MaxValue);
    }

    [Fact]
    public async Task EvalAsync_DelegatesToDatabase_ReturnsResult()
    {
        var expected = RedisResult.Create((RedisValue)"ok");
        _db.Setup(d => d.ScriptEvaluateAsync(
                It.IsAny<string>(), It.IsAny<RedisKey[]>(),
                It.IsAny<RedisValue[]>(), It.IsAny<CommandFlags>()))
           .ReturnsAsync(expected);

        var result = await _sut.EvalAsync("return 'ok'", Array.Empty<RedisKey>(), Array.Empty<RedisValue>());

        result.Should().Be(expected);
    }

    [Fact]
    public async Task EvalAsync_WhenDatabaseThrows_ReturnsNullRedisResult()
    {
        _db.Setup(d => d.ScriptEvaluateAsync(
                It.IsAny<string>(), It.IsAny<RedisKey[]>(),
                It.IsAny<RedisValue[]>(), It.IsAny<CommandFlags>()))
           .ThrowsAsync(new RedisException("timeout"));

        var result = await _sut.EvalAsync("script", Array.Empty<RedisKey>(), Array.Empty<RedisValue>());

        result.IsNull.Should().BeTrue();
    }
}
