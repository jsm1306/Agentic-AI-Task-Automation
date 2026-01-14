from crewai import Task, Crew
from agents.search_agent import search_agent
from crewai import Agent

planner = Agent(
    role="Planner",
    goal="Break the user request into steps",
    backstory="Expert planner",
    llm="gemini/gemini-2.5-flash"
)

task1 = Task(
    description="Create a research plan about breast cancer",
    expected_output="A detailed research plan for studying breast cancer",
    agent=planner
)

task2 = Task(
    description="Use web search to find recent information about pests classification in Castor crop in 2024",
    expected_output="Recent articles and key data on pests classification in Castor crop in 2024",
    agent=search_agent
)


crew = Crew(
    agents=[planner, search_agent],
    tasks=[task1, task2]
)

result = crew.kickoff()
print("Task 1 Output (Breast Cancer Research Plan):")
print(task1.output)
print("\nTask 2 Output (Pests Classification in Castor Crop):")
print(task2.output)
