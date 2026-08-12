from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from src.core.websocket import manager

router = APIRouter(prefix="/ws", tags=["WebSocket Real-Time"])

@router.websocket("/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: str,
    room_id: Optional[str] = Query(None, description="Optional consultation room ID")
):
    """
    WebSocket endpoint for real-time room communication, live AI processing feeds,
    and doctor-health worker consultation chat.
    """
    await manager.connect(websocket, client_id=client_id, room_id=room_id)
    try:
        # Send initial connection confirmation message
        await websocket.send_json({
            "event": "CONNECTED",
            "client_id": client_id,
            "room_id": room_id,
            "message": "Connected to Virtual Clinic Real-time Communication Gateway"
        })
        
        while True:
            # Receive json data from client
            data = await websocket.receive_json()
            event_type = data.get("event", "MESSAGE")
            
            if event_type == "PING":
                await websocket.send_json({"event": "PONG", "client_id": client_id})
            elif room_id:
                # Broadcast message to consultation room participants
                await manager.broadcast_to_room(room_id, {
                    "event": "ROOM_MESSAGE",
                    "sender_id": client_id,
                    "room_id": room_id,
                    "payload": data.get("payload", {})
                })
            else:
                # Echo message back
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
