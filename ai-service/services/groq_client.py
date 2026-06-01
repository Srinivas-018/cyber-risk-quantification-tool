import os
import time
import hashlib
import logging
import redis
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class GroqClient:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning("GROQ_API_KEY environment variable is not set. AI features will be disabled.")
            self.client = None
        else:
            self.client = Groq(api_key=api_key)
            
        self.model = "llama-3.3-70b-versatile"
        try:
            self.cache = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=0,
                socket_connect_timeout=2
            )
            self.cache.ping()
            self.cache_available = True
            logger.info("Redis cache connected")
        except Exception:
            self.cache_available = False
            logger.warning("Redis not available, running without cache")

    def _cache_key(self, messages: list) -> str:
        content = str(messages).encode('utf-8')
        return f"groq:{hashlib.sha256(content).hexdigest()}"

    def call(self, messages: list, temperature=0.3, max_tokens=1000) -> str:
        if not self.client:
            logger.error("Groq API client is not initialized because GROQ_API_KEY is missing.")
            return "AI Service Error: GROQ_API_KEY is not configured on the server."

        cache_key = self._cache_key(messages)

        # Try cache first
        if self.cache_available:
            try:
                cached = self.cache.get(cache_key)
                if cached:
                    logger.info("Cache hit")
                    return cached.decode('utf-8')
            except Exception:
                pass

        # Call Groq with retry
        for attempt in range(3):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                result = response.choices[0].message.content

                # Store in cache
                if self.cache_available:
                    try:
                        self.cache.setex(cache_key, 900, result)
                    except Exception:
                        pass

                return result
            except Exception as e:
                logger.error(f"Groq attempt {attempt+1} failed: {e}")
                if attempt < 2:
                    time.sleep(2 ** attempt)

        return None