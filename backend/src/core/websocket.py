import logging
from typing import Dict, List, Set, Any
from fastapi import WebSocket

logger = logging.getLogger("virtual_clinic.websocket")

class ConnectionManager:
    """
    WebSocket Connection Manager for managing real-time clinic communications,
    consultation room updates, doctor notifications, and live AI processing feeds.
    """
    def __init__(self):
        # Map user_id -> Set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map room_id (consultation_id) -> Set of active WebSocket connections
        self.room_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str, room_id: str = None):
        """Accept connection and add to user and optional room connection pools."""
        await websocket.accept()
        
        # User connection pool
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        self.active_connections[client_id].add(websocket)

        # Room connection pool
        if room_id:
            if room_id not in self.room_connections:
                self.room_connections[room_id] = set()
            self.room_connections[room_id].add(websocket)

        logger.info(f"WebSocket client '{client_id}' connected to room '{room_id}'")

    def disconnect(self, websocket: WebSocket, client_id: str, room_id: str = None):
        """Remove connection from active pools."""
        if client_id in self.active_connections:
            self.active_connections[client_id].discard(websocket)
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]

        if room_id and room_id in self.room_connections:
            self.room_connections[room_id].discard(websocket)
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

        logger.info(f"WebSocket client '{client_id}' disconnected from room '{room_id}'")

    async def send_personal_message(self, message: Any, client_id: str):
        """Send message to a specific user's connections."""
        if client_id in self.active_connections:
            for connection in list(self.active_connections[client_id]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to client {client_id}: {e}")

    async def broadcast_to_room(self, room_id: str, message: Any):
        """Broadcast message to all connections inside a consultation room."""
        if room_id in self.room_connections:
            for connection in list(self.room_connections[room_id]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to room {room_id}: {e}")

    async def broadcast(self, message: Any):
        """Broadcast message to all active WebSocket connections across system."""
        for client_id, connections in list(self.active_connections.items()):
            for connection in list(connections):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting message to {client_id}: {e}")

manager = ConnectionManager()
