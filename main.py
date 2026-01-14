from crewai import Agent, Task, Crew
from dotenv import load_dotenv
import os

load_dotenv()

planner = Agent(
    role="Planner",
    goal="Break user requests into clear steps",
    backstory="Expert project planner",
    llm="gemini/gemini-2.5-flash"
)

task = Task(
    description="Create a plan for organizing my study schedule",
    expected_output="A detailed study schedule plan",
    agent=planner
)

crew = Crew(
    agents=[planner],
    tasks=[task]
)

result = crew.kickoff()
print(result)
