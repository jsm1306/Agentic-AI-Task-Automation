from crewai import Agent
from crewai.tools import tool
from tools.failure_tool import log_failure

@tool("Log Failure")
def record_failure(context: str) -> str:
    """Log failure details for recovery analysis."""
    return log_failure(context)

recovery_agent = Agent(
    role="Recovery Manager",
    goal="Detect failures and design recovery strategies",
    backstory="Expert in fixing broken workflows",
    tools=[record_failure],
    llm="gemini/gemini-1.5-flash",
    max_iter=1,
    verbose=False
)
