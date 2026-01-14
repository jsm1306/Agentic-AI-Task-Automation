from crewai import Agent
from crewai.tools import tool
from tools.search_tool import web_search

@tool("Web Search")
def search_tool(query: str) -> str:
    """Perform a web search using Perplexity API."""
    return web_search(query)

search_agent = Agent(
    role="Researcher",
    goal="Search the web and collect accurate information",
    backstory="Expert online researcher",
    tools=[search_tool],
    llm="gemini/gemini-2.5-flash"
)
