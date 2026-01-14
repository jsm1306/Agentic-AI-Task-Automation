from crewai import Task, Crew
from agents.file_agent import file_agent

task = Task(
    description="Write a short note about AI agents and save it to notes",
    expected_output="Confirmation that the note was saved",
    agent=file_agent
)

crew = Crew(
    agents=[file_agent],
    tasks=[task],
    max_rpm=1   # extremely safe
)

result = crew.kickoff()
print(result)
