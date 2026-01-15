from crewai import Agent
from crewai.tools import tool
from tools.file_tool import write_file, read_file

@tool("Write Notes")
def save_notes(text: str) -> str:
    """Save notes to a file."""
    return write_file(text)

@tool("Read Notes")
def load_notes(_: str = "") -> str:
    """Load notes from a file."""
    return read_file()

file_agent = Agent(
    role="File Manager",
    goal="Store and retrieve important information",
    backstory="Expert data archivist",
    tools=[save_notes, load_notes],
    llm="gemini/gemini-1.5-flash"
)
