from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number starting from 1")
    limit: int = Field(default=10, ge=1, le=100, description="Items per page (max 100)")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit

class PageMeta(BaseModel):
    page: int
    limit: int
    total_items: int
    total_pages: int
    has_next: bool
    has_prev: bool

class PaginatedData(BaseModel, Generic[T]):
    items: List[T]
    meta: PageMeta

def create_paginated_response(items: List[Any], total_items: int, page: int, limit: int) -> dict:
    """Helper to generate paginated metadata dictionary."""
    total_pages = (total_items + limit - 1) // limit if limit > 0 else 0
    return {
        "items": items,
        "meta": {
            "page": page,
            "limit": limit,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }
