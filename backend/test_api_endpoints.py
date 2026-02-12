
import pytest
from fastapi.testclient import TestClient
from main import app, storage
import shutil
from pathlib import Path

client = TestClient(app)

# Use a separate test directory for storage to avoid messing up real data
TEST_DATA_DIR = "test_data_api"

@pytest.fixture(autouse=True)
def setup_teardown():
    # Setup
    original_base_path = storage.base_path
    storage.base_path = Path(TEST_DATA_DIR)
    storage.sessions_path = storage.base_path / "sessions"
    storage.subjects_path = storage.base_path / "subjects"
    storage.notes_path = storage.base_path / "notes"
    storage.memory_file = storage.base_path / "memory.json"
    storage.ensure_directories()
    
    yield
    
    # Teardown
    if Path(TEST_DATA_DIR).exists():
        shutil.rmtree(TEST_DATA_DIR)
    
    # Restore original path (though in a real app we'd want dependency injection)
    storage.base_path = original_base_path
    storage.sessions_path = storage.base_path / "sessions"
    storage.subjects_path = storage.base_path / "subjects"
    storage.notes_path = storage.base_path / "notes"
    storage.memory_file = storage.base_path / "memory.json"

def test_get_session_endpoint():
    # 1. Create a session
    response = client.post("/session", json={"subject": "Test Subject", "title": "Test Session"})
    assert response.status_code == 200
    session_data = response.json()
    session_id = session_data["id"]
    
    # 2. Get the session by ID (This was the failing endpoint)
    response = client.get(f"/session/{session_id}")
    assert response.status_code == 200
    retrieved_session = response.json()
    assert retrieved_session["id"] == session_id
    assert retrieved_session["subject"] == "Test Subject"
    
    # 3. Test non-existent session
    response = client.get("/session/nonexistent-id")
    assert response.status_code == 404
