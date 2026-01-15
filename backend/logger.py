"""
Agent action logging system for the Academic AI Assistant
Tracks agent activities for frontend display and debugging
"""

import json
import threading
from typing import List, Dict, Any
from datetime import datetime
from collections import defaultdict
from pathlib import Path

class AgentLogger:
    """Thread-safe agent action logger"""

    def __init__(self, log_dir: str = "logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        self.logs = defaultdict(list)  # session_id -> list of actions
        self.max_actions_per_session = 100
        self._lock = threading.Lock()

    def log_action(self, session_id: str, action: str, details: Dict[str, Any] = None):
        """Log an agent action"""
        with self._lock:
            action_entry = {
                "timestamp": datetime.now().isoformat(),
                "action": action,
                "details": details or {},
                "session_id": session_id
            }

            # Add to in-memory logs
            if len(self.logs[session_id]) >= self.max_actions_per_session:
                self.logs[session_id].pop(0)  # Remove oldest

            self.logs[session_id].append(action_entry)

            # Also write to file
            self._write_to_file(session_id, action_entry)

            print(f"[AGENT LOG] Session {session_id}: {action}")

    def get_recent_actions(self, session_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent actions for a session"""
        with self._lock:
            return self.logs[session_id][-limit:] if session_id in self.logs else []

    def get_all_actions(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all actions for a session"""
        with self._lock:
            return self.logs[session_id].copy() if session_id in self.logs else []

    def clear_session_logs(self, session_id: str):
        """Clear logs for a specific session"""
        with self._lock:
            if session_id in self.logs:
                del self.logs[session_id]

    def _write_to_file(self, session_id: str, action_entry: Dict[str, Any]):
        """Write action to log file"""
        log_file = self.log_dir / f"{session_id}_actions.jsonl"

        try:
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(action_entry, ensure_ascii=False) + '\n')
        except Exception as e:
            print(f"Failed to write to log file: {e}")

    def info(self, message: str, session_id: str = None):
        """Log an info message"""
        self.log_action(session_id or "system", "INFO", {"message": message})

    def error(self, message: str, session_id: str = None):
        """Log an error message"""
        self.log_action(session_id or "system", "ERROR", {"message": message})

    def warning(self, message: str, session_id: str = None):
        """Log a warning message"""
        self.log_action(session_id or "system", "WARNING", {"message": message})

    def tool_used(self, session_id: str, tool_name: str, parameters: Dict[str, Any] = None):
        """Log tool usage"""
        self.log_action(session_id, "TOOL_USED", {
            "tool": tool_name,
            "parameters": parameters or {}
        })

    def task_completed(self, session_id: str, task_description: str, result: str = None):
        """Log task completion"""
        self.log_action(session_id, "TASK_COMPLETED", {
            "task": task_description,
            "result": result
        })

    def content_generated(self, session_id: str, content_type: str, content: str):
        """Log content generation"""
        self.log_action(session_id, "CONTENT_GENERATED", {
            "type": content_type,
            "content_preview": content[:100] + "..." if len(content) > 100 else content
        })

    def search_performed(self, session_id: str, query: str, results_count: int = 0):
        """Log search operations"""
        self.log_action(session_id, "SEARCH_PERFORMED", {
            "query": query,
            "results_count": results_count
        })

    def memory_updated(self, session_id: str, memory_type: str, key: str):
        """Log memory updates"""
        self.log_action(session_id, "MEMORY_UPDATED", {
            "type": memory_type,
            "key": key
        })