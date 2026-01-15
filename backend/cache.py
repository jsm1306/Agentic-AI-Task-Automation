"""
Simple caching system for the Academic AI Assistant
Provides TTL-based caching for API responses and expensive operations
"""

import time
import threading
from typing import Any, Optional, Dict
from collections import OrderedDict

class SimpleCache:
    """Thread-safe TTL-based cache implementation"""

    def __init__(self, max_size: int = 1000):
        self.cache = OrderedDict()
        self.max_size = max_size
        self._lock = threading.Lock()

    def _is_expired(self, item: Dict[str, Any]) -> bool:
        """Check if a cache item has expired"""
        return time.time() > item['expires_at']

    def _cleanup_expired(self):
        """Remove expired items from cache"""
        current_time = time.time()
        expired_keys = [
            key for key, item in self.cache.items()
            if current_time > item['expires_at']
        ]
        for key in expired_keys:
            del self.cache[key]

    def get(self, key: str) -> Optional[Any]:
        """Get an item from cache"""
        with self._lock:
            self._cleanup_expired()
            if key in self.cache:
                # Move to end (most recently used)
                item = self.cache.pop(key)
                self.cache[key] = item
                return item['value']
            return None

    def set(self, key: str, value: Any, ttl: int = 3600):
        """Set an item in cache with TTL in seconds"""
        with self._lock:
            self._cleanup_expired()

            # Remove if exists
            if key in self.cache:
                del self.cache[key]

            # Evict oldest if at capacity
            if len(self.cache) >= self.max_size:
                self.cache.popitem(last=False)

            # Add new item
            expires_at = time.time() + ttl
            self.cache[key] = {
                'value': value,
                'expires_at': expires_at
            }

    def delete(self, key: str):
        """Delete an item from cache"""
        with self._lock:
            if key in self.cache:
                del self.cache[key]

    def clear(self):
        """Clear all items from cache"""
        with self._lock:
            self.cache.clear()

    def size(self) -> int:
        """Get current cache size"""
        with self._lock:
            self._cleanup_expired()
            return len(self.cache)

    def stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            self._cleanup_expired()
            return {
                'size': len(self.cache),
                'max_size': self.max_size,
                'utilization_percent': (len(self.cache) / self.max_size) * 100
            }