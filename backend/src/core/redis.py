import logging
from typing import AsyncGenerator, Optional, Any
from src.core.config import settings

logger = logging.getLogger("virtual_clinic.redis")

try:
    import redis.asyncio as aioredis
except ImportError:
    aioredis = None

redis_client: Optional[Any] = None

async def init_redis() -> Optional[Any]:
    """Initialize Redis connection pool on application startup."""
    global redis_client
    if not aioredis:
        logger.info("redis package not installed, running without Redis pool.")
        return None
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_timeout=5.0
        )
        await redis_client.ping()
        logger.info("Connected to Redis successfully.")
        return redis_client
    except Exception as e:
        logger.warning(f"Could not connect to Redis at {settings.REDIS_URL}: {e}")
        redis_client = None
        return None

async def close_redis() -> None:
    """Close Redis connection pool on application shutdown."""
    global redis_client
    if redis_client and hasattr(redis_client, "close"):
        await redis_client.close()
        logger.info("Redis connection closed.")

async def get_redis() -> AsyncGenerator[Optional[Any], None]:
    """FastAPI Dependency for accessing Redis client in endpoints."""
    yield redis_client

async def check_redis_health() -> dict:
    """Check Redis health status for /api/v1/health endpoint."""
    if not aioredis:
        return {"status": "disabled", "info": "redis package not installed"}
    if not redis_client:
        return {"status": "unhealthy", "error": "Redis client not connected"}
    try:
        pong = await redis_client.ping()
        if pong:
            return {"status": "healthy", "broker": settings.REDIS_HOST}
        return {"status": "unhealthy", "error": "No ping response"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
