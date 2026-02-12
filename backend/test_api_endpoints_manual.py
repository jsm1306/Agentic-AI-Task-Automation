
import unittest
import shutil
import json
from pathlib import Path
from fastapi.testclient import TestClient
from main import app, storage

# Use a separate test directory for storage to avoid messing up real data
TEST_DATA_DIR = "test_data_api_manual"

class TestSessionEndpoint(unittest.TestCase):
    def setUp(self):
        # Setup
        self.client = TestClient(app)
        self.original_base_path = storage.base_path
        storage.base_path = Path(TEST_DATA_DIR)
        storage.sessions_path = storage.base_path / "sessions"
        storage.subjects_path = storage.base_path / "subjects"
        storage.notes_path = storage.base_path / "notes"
        storage.memory_file = storage.base_path / "memory.json"
        storage.ensure_directories()

    def tearDown(self):
        # Teardown
        if Path(TEST_DATA_DIR).exists():
            shutil.rmtree(TEST_DATA_DIR)
        
        # Restore original path
        storage.base_path = self.original_base_path
        storage.sessions_path = storage.base_path / "sessions"
        storage.subjects_path = storage.base_path / "subjects"
        storage.notes_path = storage.base_path / "notes"
        storage.memory_file = storage.base_path / "memory.json"

    def test_get_session_endpoint(self):
        print("\nTesting Session Endpoints...")
        
        # 1. Create a session
        print("1. Creating session...")
        response = self.client.post("/session", json={"subject": "Test Subject", "title": "Test Session"})
        self.assertEqual(response.status_code, 200)
        session_data = response.json()
        session_id = session_data["id"]
        print(f"   Created session: {session_id}")
        
        # 2. Get the session by ID (This was the failing endpoint)
        print("2. Retrieving session by ID...")
        response = self.client.get(f"/session/{session_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_session = response.json()
        self.assertEqual(retrieved_session["id"], session_id)
        self.assertEqual(retrieved_session["subject"], "Test Subject")
        print("   Session retrieved successfully!")
        
        # 3. Test non-existent session
        print("3. Testing non-existent session...")
        response = self.client.get("/session/nonexistent-id")
        self.assertEqual(response.status_code, 404)
        print("   Correctly returned 404 for non-existent session.")

if __name__ == '__main__':
    unittest.main()
