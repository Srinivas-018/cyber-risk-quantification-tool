import sys
import os

# Ensure ai-service is on sys.path
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, repo_root)

import builtins

orig_import = builtins.__import__

def fake_import(name, globals=None, locals=None, fromlist=(), level=0):
    if name == 'redis' or name.startswith('redis.'):
        raise ImportError('simulated missing redis')
    return orig_import(name, globals, locals, fromlist, level)

builtins.__import__ = fake_import

try:
    from services.groq_client import GroqClient
    g = GroqClient()
    print("GroqClient initialized, cache_available=", g.cache_available)
except Exception as e:
    print("Initialization failed:", e)
finally:
    builtins.__import__ = orig_import
