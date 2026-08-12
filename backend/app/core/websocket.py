import logging
from typing import Dict, Set, Any, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

logger = logging.getLogger("virtual_clinic.websocket")

class ConnectionManager:
    """
    WebSocket Connection Manager for managing real-time clinic communications,
    consultation room updates, doctor notifications, and live AI processing feeds.
    """
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.room_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str, room_id: str = None):
        await websocket.accept()
        
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        self.active_connections[client_id].add(websocket)

        if room_id:
            if room_id not in self.room_connections:
                self.room_connections[room_id] = set()
            self.room_connections[room_id].add(websocket)

        logger.info(f"WebSocket client '{client_id}' connected to room '{room_id}'")

    def disconnect(self, websocket: WebSocket, client_id: str, room_id: str = None):
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
        if client_id in self.active_connections:
            for connection in list(self.active_connections[client_id]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to client {client_id}: {e}")

    async def broadcast_to_room(self, room_id: str, message: Any):
        if room_id in self.room_connections:
            for connection in list(self.room_connections[room_id]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to room {room_id}: {e}")

    async def broadcast(self, message: Any):
        for client_id, connections in list(self.active_connections.items()):
            for connection in list(connections):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting message to {client_id}: {e}")

manager = ConnectionManager()

ws_router = APIRouter(prefix="/ws", tags=["WebSocket Real-Time"])

@ws_router.websocket("/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: str,
    room_id: Optional[str] = Query(None, description="Optional consultation room ID")
):
    await manager.connect(websocket, client_id=client_id, room_id=room_id)
    try:
        await websocket.send_json({
            "event": "CONNECTED",
            "client_id": client_id,
            "room_id": room_id,
            "message": "Connected to Virtual Clinic Real-time Communication Gateway"
        })
        
        while True:
            data = await websocket.receive_json()
            event_type = data.get("event", "MESSAGE")
            
            if event_type == "PING":
                await websocket.send_json({"event": "PONG", "client_id": client_id})
            elif room_id:
                await manager.broadcast_to_room(room_id, {
                    "event": "ROOM_MESSAGE",
                    "sender_id": client_id,
                    "room_id": room_id,
                    "payload": data.get("payload", {})
                })
            else:
                await websocket.send_json({
                    "event": "ACK",
                    "client_id": client_id,
                    "payload": data.get("payload", {})
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id=client_id, room_id=room_id)
        if room_id:
            await manager.broadcast_to_room(room_id, {
                "event": "USER_DISCONNECTED",
                "client_id": client_id,
                "room_id": room_id
            })
