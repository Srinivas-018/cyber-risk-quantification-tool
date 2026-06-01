from flask import Flask, g
import time
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.health import health_bp
from routes.generate_report import generate_report_bp

app = Flask(__name__)

# WSGI Middleware to strip/override Server header to fix ZAP-02
class SecureServerMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        def custom_start_response(status, headers, exc_info=None):
            # Remove any existing Server header and add a secure one
            headers = [h for h in headers if h[0].lower() != 'server']
            headers.append(('Server', 'SecureServer'))
            return start_response(status, headers, exc_info)
        return self.wsgi_app(environ, custom_start_response)

app.wsgi_app = SecureServerMiddleware(app.wsgi_app)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["30 per minute"]
)

@app.before_request
def start_timer():
    g.start_time = time.time()

@app.after_request
def add_security_headers(response):
    # Track request duration for /health endpoint statistics
    if hasattr(g, 'start_time'):
        duration_ms = (time.time() - g.start_time) * 1000
        from routes.health import request_times
        request_times.append(duration_ms)

    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    # Fixed ZAP-01: Define specific fallback directives for Content Security Policy
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; frame-ancestors 'none';"
    response.headers['X-XSS-Protection'] = '1; mode=block'
    # Fixed ZAP-02: Prevent Server header leaks
    response.headers['Server'] = 'SecureServer'
    return response

app.register_blueprint(describe_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(health_bp)
app.register_blueprint(generate_report_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)