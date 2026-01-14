from crewai import Task, Crew
from agents.memory_agent import memory_agent

task = Task(
    description="Recall everything you remember",
    expected_output="List of stored memories",
    agent=memory_agent
)

crew = Crew(
    agents=[memory_agent],
    tasks=[task],
    max_rpm=1,
    process="sequential",
    verbose=False
)


result = crew.kickoff()
print(result)
