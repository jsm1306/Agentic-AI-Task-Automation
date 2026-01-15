from crewai import Agent
from crewai.tools import tool
from tools.decision_tool import decide_and_retry

@tool("Create Recovery Plan")
def recovery_plan(context: str) -> str:
    """Generate a recovery plan when a task fails."""
    return decide_and_retry(context)

self_correct_agent = Agent(
    role="Self Correcting Agent",
    goal="Recover from failures and improve task execution",
    backstory="Expert in adaptive problem solving",
    tools=[recovery_plan],
    llm="gemini/gemini-1.5-flash",
    max_iter=1,
    verbose=False
)
