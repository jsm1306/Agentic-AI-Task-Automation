from crewai import Agent
from crewai.tools import tool
from tools.search_tool import web_search
from tools.file_tool import write_file, read_file

@tool("Web Search")
def search_tool(query: str) -> str:
    """Perform a web search using Perplexity API."""
    return web_search(query)

@tool("Write Notes")
def save_notes(text: str) -> str:
    """Save notes to a file."""
    return write_file(text)

@tool("Read Notes")
def load_notes(_: str = "") -> str:
    """Load notes from a file."""
    return read_file()

search_agent = Agent(
    role="Researcher",
    goal="Search the web and collect accurate information",
    backstory="Expert online researcher",
    tools=[search_tool, save_notes, load_notes],
    llm="gemini/gemini-1.5-flash"
)
