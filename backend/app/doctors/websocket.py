import json
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("virtual_clinic.doctor_websocket")

doctor_ws_router = APIRouter()

# Active WebRTC & Chat room connections: room_id -> Set[WebSocket]
ROOM_CONNECTIONS: Dict[str, Set[WebSocket]] = {}

@doctor_ws_router.websocket("/ws/consultations/{room_id}")
async def consultation_websocket_endpoint(websocket: WebSocket, room_id: str):
    """
    WebSocket endpoint for real-time doctor-health worker messaging and WebRTC SDP/ICE signaling.
    """
    await websocket.accept()
    if room_id not in ROOM_CONNECTIONS:
        ROOM_CONNECTIONS[room_id] = set()
    ROOM_CONNECTIONS[room_id].add(websocket)
    logger.info(f"Client connected to consultation WebSocket room '{room_id}'. Total peers: {len(ROOM_CONNECTIONS[room_id])}")

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                message = json.loads(data_text)
            except Exception:
                message = {"type": "chat", "content": data_text}

            # Broadcast signaling / chat messages to all other peers in room
            peers = ROOM_CONNECTIONS.get(room_id, set())
            for peer in list(peers):
                if peer != websocket:
                    try:
                        await peer.send_text(json.dumps(message))
                    except Exception as e:
                        logger.error(f"Error broadcasting to peer in room '{room_id}': {e}")
    except WebSocketDisconnect:
        ROOM_CONNECTIONS[room_id].remove(websocket)
        if not ROOM_CONNECTIONS[room_id]:
            del ROOM_CONNECTIONS[room_id]
        logger.info(f"Client disconnected from consultation WebSocket room '{room_id}'.")
