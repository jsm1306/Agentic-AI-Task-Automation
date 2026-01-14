from crewai import Task, Crew
from agents.memory_agent import memory_agent
from agents.recovery_agent import recovery_agent
from agents.self_correct_agent import self_correct_agent
from agents.academic_agent import academic_agent

task1 = Task(
    description="Using my subject content, generate a 5-day study plan for Object Detection",
    expected_output="Clear 5-day study plan",
    agent=academic_agent
)
# task2 = Task(
#     description="Based on failure, create a new improved plan",
#     expected_output="Recovery plan created",
#     agent=self_correct_agent
# )
crew = Crew(
    agents=[academic_agent],
    tasks=[task1],
    max_rpm=1,
    process="sequential",
    verbose=False
)


result = crew.kickoff()
print(result)
