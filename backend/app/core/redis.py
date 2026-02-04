import redis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)
# Fallback to fakeredis if connection fails (or just always for this dev env without docker)
try:
    redis_client.ping()
except (redis.ConnectionError, ConnectionRefusedError):
    import fakeredis
    redis_client = fakeredis.FakeRedis(decode_responses=True)
