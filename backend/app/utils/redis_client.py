import redis
import json
from app.config import settings

# Connect to Redis
r = redis.from_url(settings.REDIS_URL, decode_responses=True)

def save_session(session_id: str, data: dict, ttl: int = 3600):
    """Save session data to Redis. TTL = 1 hour by default."""
    r.setex(session_id, ttl, json.dumps(data))

def get_session(session_id: str) -> dict | None:
    """Get session data from Redis. Returns None if not found."""
    data = r.get(session_id)
    if data is None:
        return None
    return json.loads(data)

def update_session(session_id: str, data: dict, ttl: int = 3600):
    """Overwrite existing session with new data."""
    save_session(session_id, data, ttl)

def delete_session(session_id: str):
    """Remove session from Redis."""
    r.delete(session_id)