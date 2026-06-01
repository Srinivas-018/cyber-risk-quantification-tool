from flask import Blueprint, request, jsonify
from services.groq_client import GroqClient
from routes.middleware import validate_and_sanitize, sanitize_input, detect_injection
import json

generate_report_bp = Blueprint('generate_report', __name__)
client = GroqClient()

@generate_report_bp.route('/generate-report', methods=['POST'])
def generate_report():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    # Validate and sanitize input fields
    required_fields = ['asset_name', 'asset_type', 'description', 'risk_level', 'risk_score', 'impact']
    data, error = validate_and_sanitize(data, required_fields)
    if error:
        return jsonify({"error": error}), 400

    # Safely handle vulnerabilities list
    raw_json = request.get_json()
    vulns = raw_json.get('vulnerabilities', [])
    if not isinstance(vulns, list):
        vulns = [str(vulns)]
    
    sanitized_vulns = []
    for v in vulns:
        sanitized_v = sanitize_input(str(v))
        if detect_injection(sanitized_v):
            return jsonify({"error": "Invalid input detected in vulnerabilities"}), 400
        sanitized_vulns.append(sanitized_v)
    
    data['vulnerabilities_str'] = ", ".join(sanitized_vulns) if sanitized_vulns else "None identified"

    with open("prompts/generate_report_prompt.txt", "r") as f:
        prompt_template = f.read()

    # Format the prompt
    prompt = prompt_template.format(**data)
    messages = [{"role": "user", "content": prompt}]
    result = client.call(messages)

    if result is None:
        # Fallback template if Groq fails
        return jsonify({
            "title": f"Cyber Risk Report for {data['asset_name']}",
            "summary": "AI service temporarily unavailable. Please review risk posture manually.",
            "overview": f"This fallback report details the risk profile for {data['asset_name']} ({data['asset_type']}) with assessed risk level {data['risk_level']}.",
            "key_items": [
                f"Asset: {data['asset_name']} ({data['asset_type']})",
                f"Assessed Risk Level: {data['risk_level']} (Score: {data['risk_score']})",
                f"Impact Profile: {data['impact']}"
            ],
            "recommendations": [
                "Verify security controls and access logs for the asset.",
                "Enforce multi-factor authentication and network segmentation.",
                "Ensure patches are up to date and conduct regular audits."
            ],
            "is_fallback": True
        }), 200

    try:
        parsed = json.loads(result)
        return jsonify(parsed), 200
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response"}), 500
