from crewai import Agent
from crewai.tools import tool
from pathlib import Path
import json
BASE = Path("subjects/ObjectDetection")

@tool("Load Academic Content")
def load_academic_content(_: str = "") -> str:
    """Load extracted academic text for study planning."""
    texts = []
    for file in (BASE / "extracted").glob("*.txt"):
        texts.append(file.read_text(encoding="utf-8"))
    return "\n".join(texts[:2])  # tiny sample → quota safe
@tool("Update Progress")
def update_progress(text: str) -> str:
    """Save study progress into subject memory."""
    mem_file = BASE / "memory.json"
    if not mem_file.exists():
        data = {"progress": []}
    else:
        data = json.loads(mem_file.read_text())
    data["progress"].append(text)
    mem_file.write_text(json.dumps(data, indent=2))
    return "Progress updated."
@tool("Save Notes")
def save_notes(content: str) -> str:
    """Save generated study notes to subject notes folder."""
    notes_dir = BASE / "notes"
    notes_dir.mkdir(exist_ok=True)
    
    file_path = notes_dir / "day1_notes.txt"
    file_path.write_text(content, encoding="utf-8")
    return "Notes saved."

academic_agent = Agent(
    role="Academic Assistant",
    goal="Help student study Object Detection efficiently",
    backstory="Expert academic tutor",
    tools=[load_academic_content, update_progress, save_notes],
    llm="gemini/gemini-2.5-flash",
    max_iter=2,
    verbose=False
)
