from tools.memory_tool import save_memory

def decide_and_retry(context):
    save_memory(f"RECOVERY PLAN: Try alternative strategy for: {context}")
    return "Recovery plan created"
