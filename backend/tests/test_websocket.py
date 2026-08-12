def test_websocket_connection(client):
    with client.websocket_connect("/api/v1/ws/test_user_123?room_id=test_room_456") as websocket:
        data = websocket.receive_json()
        assert data["event"] == "CONNECTED"
        assert data["client_id"] == "test_user_123"
        assert data["room_id"] == "test_room_456"
        
        # Test ping/pong
        websocket.send_json({"event": "PING"})
        pong = websocket.receive_json()
        assert pong["event"] == "PONG"

def test_webrtc_incoming_call_signaling(client):
    doctor_id = "dr_rajesh_verma_99"
    patient_id = "pat_ramesh_1082"
    room_id = "CONS-1082"

    # Doctor connects to signaling gateway
    with client.websocket_connect(f"/api/v1/ws/{doctor_id}") as dr_ws:
        dr_connected = dr_ws.receive_json()
        assert dr_connected["event"] == "CONNECTED"

        # Patient connects and initiates call targeting doctor
        with client.websocket_connect(f"/api/v1/ws/{patient_id}?room_id={room_id}") as pat_ws:
            pat_connected = pat_ws.receive_json()
            assert pat_connected["event"] == "CONNECTED"

            # Patient sends INITIATE_CALL targeting doctor_id
            pat_ws.send_json({
                "event": "INITIATE_CALL",
                "target_id": doctor_id,
                "consultation_id": room_id,
                "patient_name": "Ramesh Patel",
                "call_type": "video"
            })

            # Doctor receives INCOMING_CALL event
            inc_event = dr_ws.receive_json()
            assert inc_event["event"] == "INCOMING_CALL"
            assert inc_event["patient_name"] == "Ramesh Patel"
            assert inc_event["consultation_id"] == room_id

            # Doctor accepts call
            dr_ws.send_json({
                "event": "ACCEPT_CALL",
                "target_id": patient_id,
                "consultation_id": room_id
            })

            # Patient receives ACCEPT_CALL
            acc_event = pat_ws.receive_json()
            assert acc_event["event"] == "ACCEPT_CALL"
