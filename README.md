# Autonomous Academic AI Assistant

An **agent-based academic assistant** built using CrewAI and LLM APIs (Gemini + Perplexity) that helps students plan study schedules, generate structured notes, and track progress on academic subjects — all while managing API usage safely and intelligently.

This project demonstrates a complete autonomous AI agent system with:

* ✅ **Multi-agent orchestration**
* 🔍 **Real web search integration**
* 📄 **Document ingestion (PDF + OCR)**
* 🧠 **Persistent memory**
* ⚠️ **Failure detection & self-correction**
* 📅 **Study plan generation**
* 📝 **Note generation and saving**
* 📈 **Progress tracking**

---

## 🌐 Live Deployment

🚀 **Live Demo:**
https://agentic-ai-task-automation.onrender.com/

### Deployment Architecture

* **Frontend:** Next.js hosted on Render
* **Backend:** FastAPI + CrewAI agents deployed on AWS EC2
* **Cloud Setup:**

  * Elastic IP for stable backend endpoint
  * Systemd service for automatic backend startup
  * Environment-based API routing
  * Secure API key management using `.env`

This setup reflects a real-world startup-style architecture where frontend and backend are deployed independently.

---

## 🚀 Project Overview

As a student, you don't just want an AI that *answers questions* — you want one that **plans your study**, **reads your material**, and **keeps you on track**.

This system does exactly that for a single subject (e.g., *Object Detection*) by:

1. Reading course materials (PDFs)
2. Extracting structured text
3. Generating study plans
4. Creating and saving notes
5. Tracking progress in memory

---

## 🧠 Highlights

✅ Multi-agent reasoning and tool usage
✅ Quota-safe extraction of academic content
✅ Memory-driven progress tracking
✅ Failure recovery and adaptive planning
✅ Practical, useful outputs (notes & planner)

---

## 🗂️ Folder Structure

```
subjects/
└── ObjectDetection/
    ├── source/          # Original PDFs
    ├── extracted/       # Clean text from PDFs
    ├── notes/           # Generated study notes
    └── memory.json      # Study progress history

agents/                   # Agent definitions
tools/                    # Custom tools
utils/                    # Utility scripts
```

---

## ⚙️ Setup Instructions

1. Clone the repo:

```bash
git clone https://github.com/jsm1306/Agentic-AI-Task-Automation
cd Agentic-AI-Task-Automation
```

2. Create & activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

3. Install dependencies:

```bash
pip install -r requirementsnew.txt
```

4. Add your LLM & search API keys to a `.env` file:

```
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
```

5. Set up Tesseract + Poppler (for PDF OCR extraction).

---

## 📌 How to Use

### 1️⃣ Extract Content

```bash
python extract_object_detection.py
```

### 2️⃣ Generate a Study Plan

```bash
python main.py
```

Outputs will be saved in:

```
subjects/ObjectDetection/notes/
```

---

## 🧪 Demo Outputs

✅ Structured multi-day study plan
✅ Generated academic notes saved to disk
✅ Persistent progress stored in `memory.json`

---

## 🧠 Learnings

This project covers:

* 🧩 CrewAI multi-agent architecture
* 🔧 Tool orchestration and autonomous workflows
* 💾 Memory persistence
* 📚 PDF & OCR pipelines
* 🤖 Intelligent task planning with LLMs
* 🔒 Production-safe rate limiting
* ☁️ AWS EC2 backend deployment with Elastic IP
* 🚀 Cloud-based AI application architecture

---

## 📦 Generating requirements.txt

From an activated virtual environment:

```bash
pip freeze > requirements.txt
```

For minimal dependencies:

```bash
pip install pipreqs
pipreqs /path/to/your/project
```
