import json

MEMORY_PATH = "memory/memory.json"

def save_memory(entry):
    with open(MEMORY_PATH, "r+") as f:
        data = json.load(f)
        data["history"].append(entry)
        f.seek(0)
        json.dump(data, f, indent=2)

    return "Memory saved."

def load_memory():
    with open(MEMORY_PATH, "r") as f:
        data = json.load(f)
    return data["history"]
