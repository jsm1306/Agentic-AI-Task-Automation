# Academic AI Assistant Backend

A FastAPI-based backend for an autonomous academic AI assistant that integrates with CrewAI multi-agent orchestration, providing comprehensive academic support with file-based persistence.

## 🚀 Features

- **Multi-Agent AI System**: CrewAI-powered agents for academic assistance
- **Real-time Streaming**: Server-sent events for live AI responses
- **File-based Storage**: No database required, works with local JSON/text files
- **Caching System**: Intelligent caching to reduce API calls and improve performance
- **Comprehensive Logging**: Track all agent actions for debugging and UX
- **RESTful API**: Clean API design for frontend integration
- **Free Tier Optimized**: Works with Gemini and Perplexity free tiers

## 🏗️ Architecture

```
backend/
├── main.py              # FastAPI application & routes
├── models.py            # Pydantic data models
├── storage.py           # File-based persistence layer
├── cache.py             # TTL-based caching system
├── logger.py            # Agent action logging
├── agents.py            # CrewAI integration & agent definitions
├── streaming.py         # Real-time response streaming
├── __init__.py          # Package initialization
├── requirements.txt     # Python dependencies
└── .env.example         # Environment configuration template
```

## 📋 API Endpoints

### Core Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /chat` - Send message to AI assistant
- `GET /sessions` - List all chat sessions
- `POST /session` - Create new chat session
- `GET /artifacts/{session_id}` - Get session artifacts
- `POST /save-notes` - Save study notes
- `POST /update-progress` - Update study progress
- `GET /agent-logs/{session_id}` - Get agent action logs

### Request/Response Examples

#### Create Session
```bash
POST /session
{
  "title": "Machine Learning Study Session",
  "subject": "Computer Vision"
}
```

#### Chat Message
```bash
POST /chat
{
  "session_id": "session_123",
  "message": "Explain convolutional neural networks",
  "stream": false
}
```

#### Save Notes
```bash
POST /save-notes
{
  "session_id": "session_123",
  "title": "CNN Fundamentals",
  "content": "CNNs use convolutional layers to detect patterns..."
}
```

## 🛠️ Setup & Installation

### Prerequisites

- Python 3.8+
- API keys for Gemini and Perplexity (free tiers available)

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Run the server:**
   ```bash
   python main.py
   # or
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

The API will be available at `http://localhost:8000`

## 📊 Data Storage Structure

```
data/
├── sessions/           # Chat session data
│   └── {session_id}.json
├── subjects/           # Subject-specific data
│   └── {subject}/
├── notes/              # Saved notes
│   └── {session_id}_notes.json
└── memory.json         # Long-term memory
```

## 🤖 AI Agent System

### Academic Agent
- **Role**: Primary academic assistant
- **Tools**:
  - Load academic content
  - Generate study plans
  - Save notes and progress
  - Search academic resources
  - Update subject memory

### Memory Agent
- **Role**: Knowledge management
- **Tools**:
  - Retrieve/store subject memory
  - Manage global knowledge base

## 🔧 Configuration

### Environment Variables

```env
# Required API Keys
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key

# Application Settings
APP_ENV=development
DEBUG=true

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Performance Tuning
CACHE_MAX_SIZE=1000
MAX_RPM=1
```

## 📈 Performance Features

- **Intelligent Caching**: Avoids redundant API calls
- **Rate Limiting**: Respects free tier limits
- **Streaming Responses**: Real-time AI output
- **Background Processing**: Non-blocking operations
- **Memory Optimization**: Efficient data structures

## 🔒 Security & Production

- **Input Validation**: Pydantic models for all inputs
- **Error Handling**: Comprehensive error responses
- **CORS Support**: Configurable cross-origin settings
- **Environment Variables**: Secure API key management
- **Logging**: Detailed operation tracking

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Server

```bash
# Using Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📚 API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI.

## 🤝 Integration with Frontend

The backend is designed to seamlessly integrate with the Academic AI Assistant frontend:

- **CORS Enabled**: Accepts requests from frontend
- **Streaming Support**: Real-time chat responses
- **Session Management**: Persistent conversation state
- **Artifact Sync**: Study materials and progress tracking

## 📝 Development

### Adding New Tools

1. Define tool function in `agents.py`
2. Add to agent tools list
3. Update logging calls
4. Test with existing endpoints

### Extending API

1. Add new models in `models.py`
2. Implement endpoint in `main.py`
3. Add storage methods if needed
4. Update documentation

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure `.env` file is properly configured
2. **Port Conflicts**: Change port in `.env` or kill conflicting processes
3. **Memory Issues**: Reduce cache size or clear cache
4. **Rate Limits**: Free tier limits may cause temporary failures

### Logs

Check `logs/` directory for detailed agent action logs and error information.

## 📄 License

This project is part of the Academic AI Assistant system.