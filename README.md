# Autonomous Academic AI Assistant

An **agent-based academic assistant** built using CrewAI and LLM APIs (Gemini + Perplexity) that helps students plan study schedules, generate structured notes, and track progress on academic subjects — all while managing API usage safely and intelligently.

This project demonstrates a complete autonomous AI agent system with:

-   ✅ **Multi-agent orchestration**
-   🔍 **Real web search integration**
-   📄 **Document ingestion (PDF + OCR)**
-   🧠 **Persistent memory**
-   ⚠️ **Failure detection & self-correction**
-   📅 **Study plan generation**
-   📝 **Note generation and saving**
-   📈 **Progress tracking**

---

## 🚀 Project Overview

As a student, you don't just want an AI that *answers questions* — you want one that **plans your study**, **reads your material**, and **keeps you on track**.

This system does exactly that for a single subject (e.g., *Object Detection*) by:

1.  Reading course materials (PDFs)
2.  Extracting structured text
3.  Generating study plans
4.  Creating and saving notes
5.  Tracking progress in memory

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
subjects/└── ObjectDetection/    ├── source/          # Original PDFs    ├── extracted/       # Clean text from PDFs    ├── notes/           # Generated study notes    └── memory.json      # Study progress historyagents/                   # Agent definitionstools/                    # Custom toolsutils/                    # Utility scripts
```

---

## ⚙️ Setup Instructions

1.  **Clone the repo:**
    
    ```bash
    git clone https://github.com/jsm1306/Agentic-AI-Task-Automationcd Agentic-AI-Task-Automation
    ```
    
2.  **Create & activate a virtual environment:**
    
    ```bash
    python -m venv venvsource venv/bin/activate        # macOS/LinuxvenvScriptsactivate           # Windows
    ```
    
3.  **Install dependencies:**
    
    ```bash
    pip install -r requirements.txt
    ```
    
4.  **Add your LLM & search API keys to a `.env` file:**
    
    ```
    GEMINI_API_KEY=your_gemini_keyPERPLEXITY_API_KEY=your_perplexity_key
    ```
    
5.  **Set up Tesseract + Poppler (for PDF OCR extraction).**
    

---

## � Generating a requirements.txt

You can create a `requirements.txt` that lists the packages your project depends on.

-   From an activated virtual environment, run:

```bash
pip freeze > requirements.txt
```

This writes the exact package versions installed in the environment to `requirements.txt`.

-   For a minimal set of packages used by your project, use `pipreqs`:

```bash
pip install pipreqspipreqs /path/to/your/project
```

If you want, I can generate a starter `requirements.txt` for you from your `agentenv` virtual environment — tell me and I’ll run `pip freeze` and add the file to the repo.

---

## �📌 How to Use

1.  **Extract Content:**
    
    ```bash
    python extract_object_detection.py
    ```
    
2.  **Generate a Study Plan:**
    
    ```bash
    python main.py
    ```
    
    You'll get a structured 3-day plan & automated notes saved in:
    
    ```
    subjects/ObjectDetection/notes/
    ```
    

---

## 🧪 Demo Outputs

✅ 5-day study plan for your subject  
✅ Notes file saved to disk  
✅ Progress stored in `memory.json`

---

## 🧠 Learnings

This project covers:

-   🧩 **CrewAI multi-agent setup**
-   🔧 **Tool orchestration**
-   💾 **Memory persistence**
-   📚 **PDF & OCR pipelines**
-   🤖 **Intelligent task planning**
-   🔒 **Production-safe rate limiting**
-   💡 **Practical tool-driven workflows**
-   ✅ **Testing & failure recovery practices**