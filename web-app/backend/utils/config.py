"""
Configuration utilities for the MBA Expense Explorer
Extracted from the original whoop_copilot project
"""

import os
from typing import Optional
from dotenv import load_dotenv


def load_env() -> None:
    """Load environment variables from .env file"""
    load_dotenv()


def get_env(name: str, default: Optional[str] = None) -> Optional[str]:
    """Get environment variable with optional default value"""
    return os.getenv(name, default)


def get_required_env(name: str) -> str:
    """Get required environment variable, raise error if not found"""
    value = get_env(name)
    if not value:
        raise RuntimeError(f"{name} must be set in environment or .env file")
    return value
