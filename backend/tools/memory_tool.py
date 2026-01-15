import json
import os
from pathlib import Path

MEMORY_PATH = "data/memory.json"

def save_memory(entry):
    """Save an entry to global memory"""
    memory_file = Path(MEMORY_PATH)

    # Ensure directory exists
    memory_file.parent.mkdir(parents=True, exist_ok=True)

    # Read existing memory or create default structure
    if memory_file.exists():
        with open(memory_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {"subjects": {}, "global_memory": {}}

    # Initialize global_memory if it doesn't exist
    if "global_memory" not in data:
        data["global_memory"] = {}

    # Add entry to global memory history
    if "history" not in data["global_memory"]:
        data["global_memory"]["history"] = []

    data["global_memory"]["history"].append(entry)

    # Write back to file
    with open(memory_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return "Memory saved."

def load_memory():
    """Load memory entries"""
    memory_file = Path(MEMORY_PATH)

    if not memory_file.exists():
        return []

    with open(memory_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Return history from global_memory if it exists
    if "global_memory" in data and "history" in data["global_memory"]:
        return data["global_memory"]["history"]

    return []
