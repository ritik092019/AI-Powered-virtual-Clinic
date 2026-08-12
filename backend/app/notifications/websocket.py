import logging
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.notifications.websocket_manager import websocket_manager

logger = logging.getLogger("virtual_clinic.notification_websocket")

notif_ws_router = APIRouter()

@notif_ws_router.websocket("/ws/notifications")
async def notifications_websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    """
    WebSocket endpoint for real-time notification events.
    Validates JWT token query parameter and registers connection for personal notifications.
    """
    user_id = websocket_manager.authenticate_connection(token)
    if not user_id:
        await websocket.close(code=4001, reason="Unauthorized: Invalid token")
        return

    await websocket_manager.connect(user_id, websocket)
    try:
        while True:
            # Keep connection alive; accept client heartbeat or ping-pong
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        websocket_manager.disconnect(user_id, websocket)
