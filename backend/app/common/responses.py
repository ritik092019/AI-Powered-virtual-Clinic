from typing import Any, Optional, Dict
from fastapi.responses import JSONResponse
from fastapi import status

class APIResponse:
    """Standardized API Response Builder for AI-Powered Virtual Clinic."""

    @staticmethod
    def success(
        data: Any = None, 
        message: str = "Operation completed successfully", 
        status_code: int = status.HTTP_200_OK,
        meta: Optional[Dict[str, Any]] = None
    ) -> JSONResponse:
        content = {
            "success": True,
            "message": message,
            "data": data,
        }
        if meta is not None:
            content["meta"] = meta

        return JSONResponse(status_code=status_code, content=content)

    @staticmethod
    def created(
        data: Any = None, 
        message: str = "Resource created successfully",
        meta: Optional[Dict[str, Any]] = None
    ) -> JSONResponse:
        return APIResponse.success(
            data=data, 
            message=message, 
            status_code=status.HTTP_201_CREATED, 
            meta=meta
        )

    @staticmethod
    def error(
        message: str = "Operation failed", 
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Any] = None
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "message": message,
                "error": {
                    "code": status_code,
                    "details": details
                }
            }
        )
