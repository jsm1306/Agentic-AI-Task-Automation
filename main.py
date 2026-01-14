from crewai import Task, Crew
from agents.memory_agent import memory_agent
from agents.recovery_agent import recovery_agent
from agents.self_correct_agent import self_correct_agent
from agents.academic_agent import academic_agent

task1 = Task(
    description="Generate detailed study notes for Day 1 of Object Detection.",
    expected_output="Clear notes for Day 1",
    agent=academic_agent
)

task2 = Task(
    description="Take the notes from the previous task and save them using the Save Notes tool. Then, use the Update Progress tool to mark 'Day 1 completed'.",
    expected_output="Notes saved and progress updated",
    agent=academic_agent
)
# task2 = Task(
#     description="Based on failure, create a new improved plan",
#     expected_output="Recovery plan created",
#     agent=self_correct_agent
# )
crew = Crew(
    agents=[academic_agent],
    tasks=[task1,task2],
    max_rpm=1,
    process="sequential",
    verbose=False
)


result = crew.kickoff()
print(result)
