from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.common.enums import UserRole
from app.users.models import User
from app.admin.schemas import (
    AdminUserCreate,
    AdminUserStatusUpdate,
    ClinicalProtocolCreate
)
from app.admin.service import AdminService
from app.common.responses import APIResponse
from app.admin.routers.doctor_management_router import router as doctor_management_router

router = APIRouter(prefix="/admin", tags=["Administrator Management & System Ops"])
router.include_router(doctor_management_router)

@router.get("/users")
def list_users(
    role: Optional[UserRole] = Query(None, description="Filter users by role"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """List platform users with optional role filtering (Admin Only)."""
    service = AdminService(db)
    res = service.list_users(role=role, limit=limit, offset=offset)
    return APIResponse.success(data=res)

@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user_account(
    user_in: AdminUserCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Create new platform user account (Admin Only)."""
    service = AdminService(db)
    res = service.create_user(user_in, admin_user.id)
    return APIResponse.created(data=res, message="User account created successfully")

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: UUID,
    status_in: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Activate or deactivate user account (Admin Only)."""
    service = AdminService(db)
    res = service.update_user_status(user_id, status_in, admin_user.id)
    return APIResponse.success(data=res, message="User status updated successfully")

@router.get("/stats")
def get_platform_statistics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Retrieve platform usage statistics and metric totals (Admin Only)."""
    service = AdminService(db)
    res = service.get_platform_stats()
    return APIResponse.success(data=res)

@router.get("/system-status")
def get_system_operational_status(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Retrieve system health & component operational status without secret exposure (Admin Only)."""
    service = AdminService(db)
    res = service.get_system_status()
    return APIResponse.success(data=res)

@router.get("/protocols")
def list_clinical_protocols(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """List clinical protocols and rule version history (Admin Only)."""
    service = AdminService(db)
    res = service.list_protocols()
    return APIResponse.success(data=res)

@router.post("/protocols", status_code=status.HTTP_201_CREATED)
def create_clinical_protocol_version(
    proto_in: ClinicalProtocolCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Create or update clinical triage protocol version (Admin Only)."""
    service = AdminService(db)
    res = service.create_protocol(proto_in, admin_user.id)
    return APIResponse.created(data=res, message="Clinical protocol version created")

@router.get("/audit-logs")
def query_compliance_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action name"),
    performed_by: Optional[UUID] = Query(None, description="Filter by user UUID"),
    target_resource: Optional[str] = Query(None, description="Filter by target resource"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Query compliance audit logs (Admin Only)."""
    service = AdminService(db)
    res = service.get_audit_logs(
        action=action,
        performed_by=performed_by,
        target_resource=target_resource,
        limit=limit,
        offset=offset
    )
    return APIResponse.success(data=res)
