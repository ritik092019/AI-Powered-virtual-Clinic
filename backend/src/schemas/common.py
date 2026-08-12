from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class BaseResponseSchema(BaseModel):
    success: bool = True
    message: str = "Success"

class DataResponseSchema(BaseResponseSchema, Generic[T]):
    data: Optional[T] = None

class HealthCheckSchema(BaseModel):
    status: str
    environment: str
    database: str
    redis: str
    celery: str
