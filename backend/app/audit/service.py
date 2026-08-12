import logging
from typing import Optional, Any
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session

logger = logging.getLogger("virtual_clinic.audit")

def log_audit_event(
    action: str,
    performed_by: Optional[UUID] = None,
    target_resource: Optional[str] = None,
    resource_id: Optional[UUID] = None,
    details: Optional[Any] = None
):
    """
    Log structured audit events for compliance, identity tracking, and security monitoring.
    """
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "performed_by": str(performed_by) if performed_by else "SYSTEM",
        "target_resource": target_resource,
        "resource_id": str(resource_id) if resource_id else None,
        "details": details
    }
    logger.info(f"[AUDIT] {event['action']} | User: {event['performed_by']} | Resource: {event['target_resource']} ({event['resource_id']})")
    return event

class AuditService:
    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def log_event(
        self,
        user_id: Optional[UUID],
        action: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        details: Optional[Any] = None
    ):
        return log_audit_event(
            action=action,
            performed_by=user_id,
            target_resource=resource_type,
            resource_id=resource_id,
            details=details
        )
