# test_memurai.py
# Save this file and run: python test_memurai.py

import redis
import sys

def test_basic_connection():
    print("🔄 Testing basic Memurai connection...")
    try:
        # Connect to Memurai
        r = redis.Redis(
            host='localhost',  # or '127.0.0.1'
            port=6379,
            db=0,
            decode_responses=True  # This makes strings readable
        )
        
        # Test ping
        response = r.ping()
        print(f"✅ Ping successful: {response}")
        return r
        
    except redis.ConnectionError as e:
        print(f"❌ Connection failed: {e}")
        print("💡 Make sure Memurai is running on port 6379")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def test_basic_operations(redis_client):
    print("\n🔄 Testing basic Redis operations...")
    try:
        # Set a value
        redis_client.set('test_key', 'Hello from Memurai!')
        print("✅ SET operation successful")
        
        # Get the value
        value = redis_client.get('test_key')
        print(f"✅ GET operation successful: {value}")
        
        # Test lists (useful for chat messages)
        redis_client.lpush('test_list', 'message1', 'message2', 'message3')
        messages = redis_client.lrange('test_list', 0, -1)
        print(f"✅ LIST operations successful: {messages}")
        
        # Test expiry
        redis_client.setex('temp_key', 10, 'expires in 10 seconds')
        ttl = redis_client.ttl('temp_key')
        print(f"✅ EXPIRE operation successful: TTL = {ttl} seconds")
        
        # Cleanup
        redis_client.delete('test_key', 'test_list', 'temp_key')
        print("✅ Cleanup successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Operations failed: {e}")
        return False

def test_chat_simulation(redis_client):
    print("\n🔄 Testing chat-like operations...")
    try:
        # Simulate chat room
        room_name = 'test_room'
        
        # Add messages to chat room
        messages = [
            {'user': 'Alice', 'message': 'Hello everyone!', 'timestamp': '2024-01-01T10:00:00'},
            {'user': 'Bob', 'message': 'Hi Alice!', 'timestamp': '2024-01-01T10:01:00'},
            {'user': 'Charlie', 'message': 'Good morning!', 'timestamp': '2024-01-01T10:02:00'}
        ]
        
        import json
        for msg in messages:
            redis_client.lpush(f'chat:{room_name}', json.dumps(msg))
        
        print(f"✅ Added {len(messages)} messages to chat room")
        
        # Retrieve recent messages
        recent_messages = redis_client.lrange(f'chat:{room_name}', 0, 9)  # Last 10 messages
        print(f"✅ Retrieved {len(recent_messages)} messages")
        
        # Show messages
        for i, msg_json in enumerate(reversed(recent_messages)):
            msg = json.loads(msg_json)
            print(f"   {i+1}. {msg['user']}: {msg['message']}")
        
        # Test pub/sub (for real-time chat)
        pubsub = redis_client.pubsub()
        pubsub.subscribe(f'chat_room:{room_name}')
        print("✅ Pub/Sub subscription successful")
        
        # Publish a test message
        redis_client.publish(f'chat_room:{room_name}', 'Test real-time message')
        print("✅ Message published")
        
        # Cleanup
        redis_client.delete(f'chat:{room_name}')
        pubsub.close()
        print("✅ Chat simulation cleanup successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Chat simulation failed: {e}")
        return False

def test_django_channels_compatibility():
    print("\n🔄 Testing Django Channels compatibility...")
    try:
        # Test if channels_redis can connect
        import channels_redis.core
        
        channel_layer = channels_redis.core.RedisChannelLayer(
            hosts=[('127.0.0.1', 6379)]
        )
        
        print("✅ Django Channels Redis layer created successfully")
        return True
        
    except ImportError:
        print("⚠️  channels_redis not installed (run: pip install channels-redis)")
        return False
    except Exception as e:
        print(f"❌ Django Channels test failed: {e}")
        return False

def main():
    print("🚀 Memurai Connection Test")
    print("=" * 50)
    
    # Test 1: Basic connection
    redis_client = test_basic_connection()
    if not redis_client:
        print("\n❌ Cannot proceed without basic connection")
        return
    
    # Test 2: Basic operations
    if not test_basic_operations(redis_client):
        print("\n⚠️  Basic operations failed, but connection works")
    
    # Test 3: Chat simulation
    if not test_chat_simulation(redis_client):
        print("\n⚠️  Chat simulation failed, but basic Redis works")
    
    # Test 4: Django Channels
    test_django_channels_compatibility()
    
    print("\n" + "=" * 50)
    print("🎉 Memurai testing completed!")
    print("💡 If all tests passed, your Django chat should work fine!")

if __name__ == "__main__":
    main()