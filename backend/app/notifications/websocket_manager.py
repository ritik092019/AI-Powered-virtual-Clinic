import uuid
import json
import logging
from typing import Dict, Set, List, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect
from app.core.security import decode_token

logger = logging.getLogger("virtual_clinic.websocket_manager")

class WebSocketManager:
    """
    Dedicated WebSocket connection and real-time event distribution manager.
    Supports user authentication, connection tracking, and Redis Pub/Sub event broadcasting.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WebSocketManager, cls).__new__(cls)
            cls._instance.active_connections = {}
        return cls._instance

    def __init__(self):
        # Prevent re-initialization on singleton
        if not hasattr(self, 'active_connections'):
            self.active_connections: Dict[uuid.UUID, Set[WebSocket]] = {}

    def authenticate_connection(self, token: str) -> Optional[uuid.UUID]:
        """Validate JWT token and return authenticated user_id."""
        if not token:
            return None
        try:
            payload = decode_token(token)
            user_id_str = payload.get("sub")
            if user_id_str:
                return uuid.UUID(user_id_str)
        except Exception as e:
            logger.warning(f"WebSocket authentication failed: {e}")
        return None

    async def connect(self, user_id: uuid.UUID, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"User '{user_id}' connected to Notifications WebSocket. Total user sockets: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: uuid.UUID, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User '{user_id}' disconnected from Notifications WebSocket.")

    async def send_personal_event(self, user_id: uuid.UUID, event_type: str, payload: Dict[str, Any]):
        """Send event directly to connected user sockets."""
        sockets = self.active_connections.get(user_id, set())
        if not sockets:
            return

        message = {
            "event_type": event_type,
            "user_id": str(user_id),
            "payload": payload
        }
        json_str = json.dumps(message)

        dead_sockets = set()
        for ws in list(sockets):
            try:
                await ws.send_text(json_str)
            except Exception as e:
                logger.error(f"Error sending event to user '{user_id}': {e}")
                dead_sockets.add(ws)

        for ws in dead_sockets:
            sockets.discard(ws)

    async def broadcast_event(self, user_ids: List[uuid.UUID], event_type: str, payload: Dict[str, Any]):
        """Broadcast event to multiple target users."""
        for uid in user_ids:
            await self.send_personal_event(uid, event_type, payload)

websocket_manager = WebSocketManager()
