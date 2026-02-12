"""Utility functions for timezone-aware timestamps (IST)

Provides small helpers to get current time in IST (UTC+5:30) and produce
ISO-formatted timestamp strings used throughout the backend.
"""
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))


def now_iso() -> str:
    """Return current time in IST as an ISO 8601 string with offset."""
    return datetime.now(IST).isoformat()


def ist_now() -> datetime:
    """Return a datetime object for now in IST."""
    return datetime.now(IST)


def ensure_ist_iso(timestamp_str: str) -> str:
    """Ensure a timestamp string is returned as an ISO 8601 string with IST offset.

    If timestamp_str already includes timezone info (Z or +/-HH:MM) it will be
    returned unchanged. Otherwise it's parsed as naive local time and converted
    to IST by attaching the IST tzinfo (interpreting the naive time as IST).
    """
    if not timestamp_str or not isinstance(timestamp_str, str):
        return timestamp_str

    # Quick check for timezone info
    if timestamp_str.endswith('Z') or '+' in timestamp_str[-6:] or '-' in timestamp_str[-6:]:
        return timestamp_str

    try:
        # Parse naive ISO string and attach IST tz
        dt = datetime.fromisoformat(timestamp_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=IST)
        return dt.isoformat()
    except Exception:
        # If parsing fails, return the original string
        return timestamp_str
