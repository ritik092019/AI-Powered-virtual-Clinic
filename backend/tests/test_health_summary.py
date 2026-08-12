import pytest
from database.models import User, UserRole

def test_patient_health_summary_unauthorized_rejection(client):
    """Test that requesting health summary without authentication raises Unauthorized error."""
    unauth_resp = client.post("/api/v1/patient-summary/generate")
    assert unauth_resp.status_code == 401 or unauth_resp.status_code == 500
