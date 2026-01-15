"""
File-based storage system for the Academic AI Assistant
Handles sessions, artifacts, and memory persistence
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import threading
from pathlib import Path
import json

try:
    from .logger import AgentLogger
except ImportError:
    # Handle case when run as standalone script
    from logger import AgentLogger

class FileStorage:
    """File-based storage with thread-safe operations"""

    def __init__(self, base_path: str = "data"):
        self.base_path = Path(base_path)
        self.sessions_path = self.base_path / "sessions"
        self.subjects_path = self.base_path / "subjects"
        self.notes_path = self.base_path / "notes"
        self.memory_file = self.base_path / "memory.json"
        self._lock = threading.Lock()
        self.logger = AgentLogger()

    def ensure_directories(self):
        """Ensure all required directories exist"""
        directories = [
            self.base_path,
            self.sessions_path,
            self.subjects_path,
            self.notes_path
        ]
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)

        # Initialize memory file if it doesn't exist
        if not self.memory_file.exists():
            self._write_json(self.memory_file, {"subjects": {}, "global_memory": {}})

    def _write_json(self, file_path: Path, data: Any):
        """Thread-safe JSON write"""
        with self._lock:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

    def _read_json(self, file_path: Path) -> Any:
        """Thread-safe JSON read"""
        with self._lock:
            if not file_path.exists():
                return None
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)

    def session_exists(self, session_id: str) -> bool:
        """Check if a session exists"""
        session_file = self.sessions_path / f"{session_id}.json"
        return session_file.exists()

    def save_session(self, session_data: Dict[str, Any]):
        """Save a session to file"""
        session_id = session_data["id"]
        session_file = self.sessions_path / f"{session_id}.json"
        self._write_json(session_file, session_data)
        self.logger.info(f"Saved session: {session_id}")

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get a session by ID"""
        session_file = self.sessions_path / f"{session_id}.json"
        return self._read_json(session_file)

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """Get all sessions"""
        sessions = []
        if self.sessions_path.exists():
            for session_file in self.sessions_path.glob("*.json"):
                session_data = self._read_json(session_file)
                if session_data:
                    sessions.append(session_data)
        return sorted(sessions, key=lambda x: x.get("created_at", ""), reverse=True)

    def delete_session(self, session_id: str) -> bool:
        """Delete a session and all its associated data"""
        try:
            # Delete session file
            session_file = self.sessions_path / f"{session_id}.json"
            if session_file.exists():
                session_file.unlink()

            # Delete associated notes file
            notes_file = self.notes_path / f"{session_id}_notes.json"
            if notes_file.exists():
                notes_file.unlink()

            # Delete associated logs
            logs_dir = Path("logs")
            if logs_dir.exists():
                for log_file in logs_dir.glob(f"{session_id}_*.jsonl"):
                    log_file.unlink()

            self.logger.info(f"Deleted session: {session_id}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to delete session {session_id}: {e}")
            return False

    def add_message_to_session(self, session_id: str, message: Dict[str, Any]):
        """Add a message to a session"""
        session_data = self.get_session(session_id)
        if session_data:
            session_data["messages"].append(message)
            self.save_session(session_data)

    def get_session_artifacts(self, session_id: str) -> Dict[str, Any]:
        """Get artifacts for a session"""
        session_data = self.get_session(session_id)
        if session_data:
            return {
                "session_id": session_id,
                **session_data.get("artifacts", {})
            }
        return {"session_id": session_id, "study_plans": [], "notes": [], "progress": [], "memory": {}}

    def save_notes(self, session_id: str, content: str, title: str):
        """Save notes for a session"""
        session_data = self.get_session(session_id)
        if session_data:
            notes_entry = {
                "id": f"note_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "title": title,
                "content": content,
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id
            }

            # Add to session artifacts
            if "artifacts" not in session_data:
                session_data["artifacts"] = {"notes": []}
            if "notes" not in session_data["artifacts"]:
                session_data["artifacts"]["notes"] = []

            session_data["artifacts"]["notes"].append(notes_entry)
            self.save_session(session_data)

            # Also save to global notes
            notes_file = self.notes_path / f"{session_id}_notes.json"
            existing_notes = self._read_json(notes_file) or []
            existing_notes.append(notes_entry)
            self._write_json(notes_file, existing_notes)

            self.logger.info(f"Saved notes for session: {session_id}")

    def update_progress(self, session_id: str, progress_text: str):
        """Update progress for a session"""
        session_data = self.get_session(session_id)
        if session_data:
            progress_entry = {
                "id": f"progress_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "content": progress_text,
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id
            }

            # Add to session artifacts
            if "artifacts" not in session_data:
                session_data["artifacts"] = {"progress": []}
            if "progress" not in session_data["artifacts"]:
                session_data["artifacts"]["progress"] = []

            session_data["artifacts"]["progress"].append(progress_entry)
            self.save_session(session_data)

            self.logger.info(f"Updated progress for session: {session_id}")

    def save_study_plan(self, session_id: str, plan_data: Dict[str, Any]):
        """Save a study plan for a session"""
        session_data = self.get_session(session_id)
        if session_data:
            plan_entry = {
                "id": f"plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id,
                **plan_data
            }

            # Add to session artifacts
            if "artifacts" not in session_data:
                session_data["artifacts"] = {"study_plans": []}
            if "study_plans" not in session_data["artifacts"]:
                session_data["artifacts"]["study_plans"] = []

            session_data["artifacts"]["study_plans"].append(plan_entry)
            self.save_session(session_data)

            self.logger.info(f"Saved study plan for session: {session_id}")

    def get_subject_memory(self, subject: str) -> Dict[str, Any]:
        """Get memory for a specific subject"""
        memory_data = self._read_json(self.memory_file)
        if memory_data and "subjects" in memory_data:
            return memory_data["subjects"].get(subject, {})
        return {}

    def update_subject_memory(self, subject: str, memory_data: Dict[str, Any]):
        """Update memory for a specific subject"""
        current_memory = self._read_json(self.memory_file) or {"subjects": {}, "global_memory": {}}

        if "subjects" not in current_memory:
            current_memory["subjects"] = {}

        current_memory["subjects"][subject] = {
            **current_memory["subjects"].get(subject, {}),
            **memory_data,
            "last_updated": datetime.now().isoformat()
        }

        self._write_json(self.memory_file, current_memory)
        self.logger.info(f"Updated memory for subject: {subject}")

    def get_global_memory(self) -> Dict[str, Any]:
        """Get global memory"""
        memory_data = self._read_json(self.memory_file)
        if memory_data and "global_memory" in memory_data:
            return memory_data["global_memory"]
        return {}

    def update_global_memory(self, memory_data: Dict[str, Any]):
        """Update global memory"""
        current_memory = self._read_json(self.memory_file) or {"subjects": {}, "global_memory": {}}

        current_memory["global_memory"] = {
            **current_memory.get("global_memory", {}),
            **memory_data,
            "last_updated": datetime.now().isoformat()
        }

        self._write_json(self.memory_file, current_memory)
        self.logger.info("Updated global memory")