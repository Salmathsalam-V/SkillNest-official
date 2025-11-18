# test_memurai.py
# Save this file and run: python test_memurai.py

import redis
import sys

def test_basic_connection():
    try:
        r = redis.Redis(
            host='localhost',
            port=6379,
            db=0,
            decode_responses=True
        )
        
        response = r.ping()
        return r
        
    except redis.ConnectionError as e:
        return None
    except Exception as e:
        return None

def test_basic_operations(redis_client):
    try:
        redis_client.set('test_key', 'Hello from Memurai!')
        
        value = redis_client.get('test_key')
        
        redis_client.lpush('test_list', 'message1', 'message2', 'message3')
        messages = redis_client.lrange('test_list', 0, -1)
        
        redis_client.setex('temp_key', 10, 'expires in 10 seconds')
        ttl = redis_client.ttl('temp_key')
        
        redis_client.delete('test_key', 'test_list', 'temp_key')
        
        return True
        
    except Exception as e:
        return False

def test_chat_simulation(redis_client):
    try:
        room_name = 'test_room'
        
        messages = [
            {'user': 'Alice', 'message': 'Hello everyone!', 'timestamp': '2024-01-01T10:00:00'},
            {'user': 'Bob', 'message': 'Hi Alice!', 'timestamp': '2024-01-01T10:01:00'},
            {'user': 'Charlie', 'message': 'Good morning!', 'timestamp': '2024-01-01T10:02:00'}
        ]
        
        import json
        for msg in messages:
            redis_client.lpush(f'chat:{room_name}', json.dumps(msg))
        
        recent_messages = redis_client.lrange(f'chat:{room_name}', 0, 9)
        
        pubsub = redis_client.pubsub()
        pubsub.subscribe(f'chat_room:{room_name}')
        
        redis_client.publish(f'chat_room:{room_name}', 'Test real-time message')
        
        redis_client.delete(f'chat:{room_name}')
        pubsub.close()
        
        return True
        
    except Exception as e:
        return False

def test_django_channels_compatibility():
    try:
        import channels_redis.core
        
        channel_layer = channels_redis.core.RedisChannelLayer(
            hosts=[('127.0.0.1', 6379)]
        )
        
        return True
        
    except ImportError:
        return False
    except Exception as e:
        return False

def main():
    redis_client = test_basic_connection()
    if not redis_client:
        return
    
    test_basic_operations(redis_client)
    test_chat_simulation(redis_client)
    test_django_channels_compatibility()
    

if __name__ == "__main__":
    main()
