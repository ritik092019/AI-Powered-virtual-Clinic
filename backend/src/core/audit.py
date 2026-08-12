import logging
from typing import Optional, Any
from uuid import UUID
from datetime import datetime, timezone

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
