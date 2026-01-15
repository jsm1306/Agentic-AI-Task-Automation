from tools.memory_tool import save_memory

def log_failure(context):
    save_memory(f"FAILURE: {context}")
    return "Failure recorded"
