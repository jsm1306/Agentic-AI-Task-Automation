from crewai import Agent
from crewai.tools import tool
from tools.memory_tool import save_memory, load_memory

@tool("Save Memory")
def remember(text: str) -> str:
    """Save information to memory."""
    return save_memory(text)

@tool("Load Memory")
def recall(_: str = "") -> str:
    """Load information from memory."""
    return str(load_memory())

memory_agent = Agent(
    role="Memory Keeper",
    goal="Store and recall important information from past actions",
    backstory="Expert memory manager",
    tools=[remember, recall],
    llm="gemini/gemini-2.5-flash",
    max_iter=1,
    verbose=False
)


