"""
Academic AI Assistant Backend Package
"""

__version__ = "1.0.0"
__author__ = "Academic AI Assistant Team"

from .main import app
from .models import *
from .storage import FileStorage
from .cache import SimpleCache
from .logger import AgentLogger
from .agents import get_academic_crew, create_task_for_message

__all__ = [
    "app",
    "FileStorage",
    "SimpleCache",
    "AgentLogger",
    "get_academic_crew",
    "create_task_for_message",
]