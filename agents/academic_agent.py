from crewai import Agent
from crewai.tools import tool
from pathlib import Path

BASE = Path("subjects/ObjectDetection/extracted")

@tool("Load Academic Content")
def load_academic_content(_: str = "") -> str:
    """Load extracted academic text for study planning."""
    texts = []
    for file in BASE.glob("*.txt"):
        texts.append(file.read_text(encoding="utf-8"))
    return "\n".join(texts[:2])  # tiny sample → quota safe

academic_agent = Agent(
    role="Academic Assistant",
    goal="Help student study Object Detection efficiently",
    backstory="Expert academic tutor",
    tools=[load_academic_content],
    llm="gemini/gemini-2.5-flash",
    max_iter=2,
    verbose=False
)
