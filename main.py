from crewai import Task, Crew
from agents.memory_agent import memory_agent
from agents.recovery_agent import recovery_agent
from agents.self_correct_agent import self_correct_agent

task1 = Task(
    description="Simulate failure: Search tool returned empty result",
    expected_output="Failure recorded",
    agent=recovery_agent
)
task2 = Task(
    description="Based on failure, create a new improved plan",
    expected_output="Recovery plan created",
    agent=self_correct_agent
)
crew = Crew(
    agents=[recovery_agent,self_correct_agent],
    tasks=[task1, task2],
    max_rpm=1,
    process="sequential",
    verbose=False
)


result = crew.kickoff()
print(result)
