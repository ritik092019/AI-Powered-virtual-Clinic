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
