from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from src.core.websocket import manager
from src.core.security import decode_token

router = APIRouter(prefix="/ws", tags=["WebSocket Real-Time"])

@router.websocket("/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: str,
    token: Optional[str] = Query(None),
    room_id: Optional[str] = Query(None, description="Optional consultation room ID")
):
    """
    Persistent WebSocket endpoint for real-time WebRTC call signaling, 
    doctor incoming call notifications, room chat, and live feeds.
    """
    # Authenticate JWT token if provided
    auth_user_id = client_id
    if token:
        try:
            payload = decode_token(token)
            if payload.get("sub"):
                auth_user_id = str(payload.get("sub"))
        except Exception:
            pass

    await manager.connect(websocket, client_id=auth_user_id, room_id=room_id)
    try:
        await websocket.send_json({
            "event": "CONNECTED",
            "client_id": auth_user_id,
            "room_id": room_id,
            "message": "Connected to Virtual Clinic Real-time Signaling Gateway"
        })
        
        while True:
            data = await websocket.receive_json()
            event_type = data.get("event") or data.get("type", "MESSAGE")
            target_id = data.get("target_id") or data.get("targetUserId")
            target_room = data.get("room_id") or room_id

            if event_type == "PING":
                await websocket.send_json({"event": "PONG", "client_id": auth_user_id})

            elif event_type in ["INITIATE_CALL", "incoming_call"]:
                # Patient initiates call targeting doctor
                payload = {
                    "event": "INCOMING_CALL",
                    "type": "INCOMING_CALL",
                    "call_id": data.get("call_id") or f"call_{auth_user_id[:8]}",
                    "consultation_id": data.get("consultation_id") or target_room,
                    "patient_id": auth_user_id,
                    "patient_name": data.get("patient_name") or data.get("senderName") or "Patient",
                    "call_type": data.get("call_type") or "video",
                    "timestamp": data.get("timestamp")
                }
                if target_id:
                    await manager.send_personal_message(payload, target_id)
                elif target_room:
                    await manager.broadcast_to_room(target_room, payload)

            elif event_type in ["ACCEPT_CALL", "REJECT_CALL", "END_CALL"]:
                # Signaling response between doctor and patient
                payload = {
                    "event": event_type,
                    "type": event_type,
                    "sender_id": auth_user_id,
                    "consultation_id": data.get("consultation_id") or target_room,
                    "reason": data.get("reason")
                }
                if target_id:
                    await manager.send_personal_message(payload, target_id)
                if target_room:
                    await manager.broadcast_to_room(target_room, payload)

            elif event_type in ["WEBRTC_OFFER", "WEBRTC_ANSWER", "ICE_CANDIDATE", "offer", "answer", "ice-candidate"]:
                payload = {
                    "event": event_type,
                    "type": event_type,
                    "sender_id": auth_user_id,
                    "offer": data.get("offer"),
                    "answer": data.get("answer"),
                    "candidate": data.get("candidate")
                }
                if target_id:
                    await manager.send_personal_message(payload, target_id)
                elif target_room:
                    await manager.broadcast_to_room(target_room, payload)

            elif target_room:
                await manager.broadcast_to_room(target_room, {
                    "event": "ROOM_MESSAGE",
                    "sender_id": auth_user_id,
                    "room_id": target_room,
                    "payload": data.get("payload", data)
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id=auth_user_id, room_id=room_id)
        if room_id:
            await manager.broadcast_to_room(room_id, {
                "event": "USER_DISCONNECTED",
                "client_id": auth_user_id,
                "room_id": room_id
            })
