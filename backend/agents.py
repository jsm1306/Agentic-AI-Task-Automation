"""
CrewAI agents integration for the Academic AI Assistant
Extends existing agents with session-aware functionality
"""

from crewai import Agent, Crew, Task
from crewai.tools import tool
from pathlib import Path
import json
import os
from typing import Dict, Any

try:
    from .storage import FileStorage
    from .logger import AgentLogger
except ImportError:
    # Handle case when run as standalone script
    from storage import FileStorage
    from logger import AgentLogger

# Initialize components
storage = FileStorage()
logger = AgentLogger()

def get_academic_agent(session_id: str) -> Agent:
    """Get or create a CrewAI agent for a specific session"""

    # Get session data to determine subject
    session_data = storage.get_session(session_id)
    subject = session_data.get("subject", "General") if session_data else "General"

    # Create subject-specific base path
    base_path = Path("subjects") / subject.replace(" ", "")

    # Enhanced tools with session awareness
    @tool("Load Academic Content")
    def load_academic_content(query: str = "") -> str:
        """Load extracted academic text for study planning."""
        logger.tool_used(session_id, "Load Academic Content", {"query": query})

        texts = []
        extracted_path = base_path / "extracted"
        if extracted_path.exists():
            for file in extracted_path.glob("*.txt"):
                content = file.read_text(encoding="utf-8")
                if query.lower() in content.lower() or not query:
                    texts.append(content)

        result = "\n".join(texts[:3]) if texts else "No relevant content found."
        logger.info(f"Loaded {len(texts)} content pieces for session {session_id}")
        return result

    @tool("Update Progress")
    def update_progress(text: str) -> str:
        """Save study progress into subject memory."""
        logger.tool_used(session_id, "Update Progress", {"text": text})

        storage.update_progress(session_id, text)
        logger.memory_updated(session_id, "progress", "study_progress")
        return "Progress updated successfully."

    @tool("Save Notes")
    def save_notes(content: str, title: str = "Notes") -> str:
        """Save generated study notes to subject notes folder."""
        logger.tool_used(session_id, "Save Notes", {"title": title})

        storage.save_notes(session_id, content, title)
        logger.content_generated(session_id, "notes", content)
        return "Notes saved successfully."

    @tool("Generate Study Plan")
    def generate_study_plan(topic: str, duration: str = "4 weeks") -> str:
        """Generate a comprehensive study plan for a topic."""
        logger.tool_used(session_id, "Generate Study Plan", {"topic": topic, "duration": duration})

        # Parse duration to get number of weeks/days
        duration_lower = duration.lower()
        is_days = "day" in duration_lower
        is_weeks = "week" in duration_lower

        if is_days:
            try:
                days = int(duration_lower.split()[0])
                weeks = None
                duration_text = f"{days} days"
            except:
                days = 5  # default 5 days
                weeks = None
                duration_text = "5 days"
        elif is_weeks:
            try:
                weeks = int(duration_lower.split()[0])
                days = None
                duration_text = f"{weeks} weeks"
            except:
                weeks = 4  # default 4 weeks
                days = None
                duration_text = "4 weeks"
        else:
            # Default to weeks if no unit specified
            weeks = 4
            days = None
            duration_text = "4 weeks"

        # Generate detailed study plan content based on the topic
        plan_content = f"Study Plan: {topic} ({duration_text})\n\n"

        if "object detection" in topic.lower():
            if days:
                # 5-day plan for Object Detection CO1
                plan_content += """Day 1: Introduction to Object Detection Fundamentals
- What is Object Detection? Definition and importance
- Applications in computer vision and real-world scenarios
- Basic concepts: bounding boxes, ground truth, IoU
- Challenges: scale, pose, occlusion, illumination variations
- Practical: IoU calculation implementation

Day 2: Traditional Object Detection Methods
- Sliding window approach
- Haar cascades for face detection
- HOG (Histogram of Oriented Gradients) features
- SVM classification for detection
- DPM (Deformable Part Models)
- Practical: Implementing basic Haar cascade detection

Day 3: Deep Learning Foundations for Detection
- CNN basics and feature extraction
- Region proposal methods
- R-CNN architecture overview
- Selective search algorithms
- Two-stage vs one-stage detection paradigms
- Practical: Understanding CNN feature maps

Day 4: Modern One-Stage Detectors
- YOLO (You Only Look Once) fundamentals
- Grid-based detection approach
- Anchor boxes and regression
- SSD (Single Shot MultiBox Detector)
- Speed vs accuracy trade-offs
- Practical: YOLO prediction visualization

Day 5: Evaluation and Applications
- Performance metrics: Precision, Recall, mAP
- Non-Maximum Suppression (NMS)
- Real-world applications and case studies
- Future directions in object detection
- Practical: Model evaluation and comparison"""
            else:
                # 4-week plan for Object Detection (existing detailed plan)
                plan_content += """Week 1: Introduction to Object Detection & Traditional Methods

Topics:
- What is Object Detection? (Definition, Importance, Applications)
- Challenges in Object Detection (Variations in pose, scale, occlusion, illumination)
- History and Evolution of Object Detection
- Basic Concepts: Bounding Boxes, Ground Truth, IoU (Intersection over Union)
- Traditional Approaches: Sliding Window, Haar Cascades, HOG + SVM, DPM

Practical Session:
- Introduction to datasets (PASCAL VOC, COCO)
- Implementing IoU calculation
- Exploring pre-trained Haar Cascades

Week 2: Two-Stage Object Detectors (Region Proposal Based)

Topics:
- R-CNN Family: R-CNN, Fast R-CNN, Faster R-CNN
- Selective Search and Region Proposal Networks
- ROI Pooling and Multi-task loss
- Anchors and bounding box regression

Practical Session:
- Understanding Faster R-CNN architecture
- Running pre-trained models
- Visualizing RPN proposals

Week 3: One-Stage Object Detectors (Regression Based)

Topics:
- YOLO Family: YOLOv1 through YOLOv7
- SSD (Single Shot MultiBox Detector)
- Grid-based detection and direct regression
- Anchor boxes and loss functions

Practical Session:
- Implementing YOLO-like detection
- Training on custom datasets
- Speed vs accuracy analysis

Week 4: Advanced Topics, Evaluation, and Applications

Topics:
- Evaluation Metrics: Precision, Recall, mAP, NMS
- Advanced Architectures: RetinaNet, EfficientDet, DETR
- Data Augmentation and Transfer Learning
- Real-world Applications and Case Studies

Practical Session:
- Model evaluation with mAP
- Real-world project implementation
- Performance analysis and optimization

Recommended Resources:
- Python, PyTorch/TensorFlow, OpenCV
- Research papers and online courses
- Hands-on projects with public datasets"""
        else:
            # Generic study plan for other topics
            if days:
                # Daily breakdown for short plans
                for day in range(1, days + 1):
                    plan_content += f"Day {day}:\n"
                    if day == 1:
                        plan_content += f"  - Introduction to {topic}\n"
                        plan_content += f"  - Foundational concepts\n"
                        plan_content += f"  - Basic principles\n"
                    elif day == days:
                        plan_content += f"  - Review and assessment\n"
                        plan_content += f"  - Practical applications\n"
                        plan_content += f"  - Final exercises\n"
                    else:
                        plan_content += f"  - Core concepts\n"
                        plan_content += f"  - Hands-on practice\n"
                        plan_content += f"  - Problem-solving\n"
                    plan_content += "\n"
            else:
                # Weekly breakdown for longer plans
                for week in range(1, weeks + 1):
                    plan_content += f"Week {week}:\n"
                    if week == 1:
                        plan_content += f"  - Introduction to {topic}\n"
                        plan_content += f"  - Foundational concepts and principles\n"
                        plan_content += f"  - Basic terminology and definitions\n"
                    elif week == weeks:
                        plan_content += f"  - Advanced topics and applications\n"
                        plan_content += f"  - Review and comprehensive assessment\n"
                        plan_content += f"  - Final projects and case studies\n"
                    else:
                        plan_content += f"  - Core concepts and theories\n"
                        plan_content += f"  - Practical applications and examples\n"
                        plan_content += f"  - Problem-solving exercises\n"
                    plan_content += "\n"

        plan_data = {
            "title": f"Study Plan: {topic}",
            "topic": topic,
            "duration": duration_text,
            "content": plan_content.strip(),
            "objectives": ["Master fundamentals", "Practice applications", "Complete projects"]
        }

        storage.save_study_plan(session_id, plan_data)
        logger.content_generated(session_id, "study_plan", plan_data["content"])
        
        # Return a summary message instead of the full content to avoid duplication
        return f"Study plan generated and saved: {plan_data['title']} ({duration_text})"

    @tool("Search Academic Resources")
    def search_academic_resources(query: str) -> str:
        """Search for academic resources and information."""
        logger.tool_used(session_id, "Search Academic Resources", {"query": query})
        logger.search_performed(session_id, query)

        # This would integrate with Perplexity API in a real implementation
        # For now, return mock results
        return f"Search results for '{query}': Found relevant academic resources and research papers."

    @tool("Update Subject Memory")
    def update_subject_memory(key: str, value: str) -> str:
        """Update long-term memory for the subject."""
        logger.tool_used(session_id, "Update Subject Memory", {"key": key})

        session_data = storage.get_session(session_id)
        subject = session_data.get("subject", "General") if session_data else "General"

        memory_data = {key: value}
        storage.update_subject_memory(subject, memory_data)
        logger.memory_updated(session_id, "subject_memory", key)
        return f"Subject memory updated: {key}"

    @tool("Get Study Progress")
    def get_study_progress() -> str:
        """Retrieve current study progress."""
        logger.tool_used(session_id, "Get Study Progress", {})

        artifacts = storage.get_session_artifacts(session_id)
        progress_items = artifacts.get("progress", [])

        if not progress_items:
            return "No progress recorded yet."

        latest_progress = progress_items[-1] if progress_items else {}
        return f"Latest progress: {latest_progress.get('content', 'No progress available')}"

    # Create the academic agent with enhanced tools
    academic_agent = Agent(
        role="Academic Assistant",
        goal=f"Help students study {subject} efficiently with personalized guidance and content creation",
        backstory=f"Expert academic tutor specializing in {subject} with advanced AI capabilities. I actively create and save study materials, notes, and track progress to help students succeed.",
        tools=[
            load_academic_content,
            update_progress,
            save_notes,
            generate_study_plan,
            search_academic_resources,
            update_subject_memory,
            get_study_progress
        ],
        llm="gemini/gemini-2.5-flash",
        max_iter=5,
        verbose=False,
        allow_delegation=False
    )

    return academic_agent

def create_task_for_message(message: str, session_id: str) -> Task:
    """Create a CrewAI task from a user message"""
    enhanced_description = f"""
    {message}

    CRITICAL INSTRUCTIONS:
    - If asked to "create notes", "save notes", "generate notes", or similar: ALWAYS use the "Save Notes" tool
    - If asked to "create study plan" or "generate study plan": ALWAYS use the "Generate Study Plan" tool
    - If asked to "update progress" or "track progress": ALWAYS use the "Update Progress" tool
    - If asked to "load content" or "get academic content": ALWAYS use the "Load Academic Content" tool

    IMPORTANT: After using any tool, mention in your response what you saved/created.
    """

    return Task(
        description=enhanced_description,
        expected_output="Helpful academic response. If you used any tools, explicitly mention what you created/saved.",
        agent=get_academic_agent(session_id)
    )

def get_memory_agent(session_id: str) -> Agent:
    """Get a memory-focused agent for the session"""

    @tool("Retrieve Memory")
    def retrieve_memory(key: str) -> str:
        """Retrieve specific information from memory."""
        logger.tool_used(session_id, "Retrieve Memory", {"key": key})

        session_data = storage.get_session(session_id)
        subject = session_data.get("subject", "General") if session_data else "General"

        subject_memory = storage.get_subject_memory(subject)
        global_memory = storage.get_global_memory()

        result = subject_memory.get(key) or global_memory.get(key, f"No memory found for key: {key}")
        return result

    @tool("Store Memory")
    def store_memory(key: str, value: str, scope: str = "subject") -> str:
        """Store information in memory."""
        logger.tool_used(session_id, "Store Memory", {"key": key, "scope": scope})

        if scope == "global":
            storage.update_global_memory({key: value})
        else:
            session_data = storage.get_session(session_id)
            subject = session_data.get("subject", "General") if session_data else "General"
            storage.update_subject_memory(subject, {key: value})

        logger.memory_updated(session_id, scope + "_memory", key)
        return f"Memory stored: {key}"

    memory_agent = Agent(
        role="Memory Manager",
        goal="Manage and retrieve academic knowledge and progress information",
        backstory="Specialized AI for organizing and retrieving academic information",
        tools=[retrieve_memory, store_memory],
        llm="gemini/gemini-2.5-flash",
        max_iter=2,
        verbose=False
    )

    return memory_agent