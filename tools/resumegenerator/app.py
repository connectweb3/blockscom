from flask import Flask, render_template, request, jsonify
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate_text():
    data = request.json
    prompt_type = data.get('type')
    context = data.get('context', {})

    if not OPENROUTER_API_KEY:
        return jsonify({'error': 'API key not configured'}), 500

    system_prompt = "You are a professional resume writer for a high-end Virtual Assistant (VA). Write concise, impactful, and professional content."
    
    # Extract Job Description if available
    job_description = ""
    if isinstance(context, dict):
        job_description = context.get('jobDescription', "")
        
    jd_context = ""
    if job_description:
        jd_context = f"\n\nIMPORTANT REFERENCE - Target Job Description:\n{job_description}\n\nTailor the content to align with this job description."

    user_prompt = ""
    if prompt_type == 'summary':
        # Context is now a dict for summary/skills too
        job_title = context.get('jobTitle', 'Virtual Assistant') if isinstance(context, dict) else context
        user_prompt = f"Write a professional summary for a {job_title}. Keep it under 50 words.{jd_context}"
    elif prompt_type == 'experience':
        user_prompt = f"Write a bullet point description for a job role: {context.get('role')} at {context.get('company')}. Key achievements: {context.get('achievements')}. Format as HTML <li> tags.{jd_context}"
    elif prompt_type == 'skills':
         # Context is now a dict for summary/skills too
        job_title = context.get('jobTitle', 'Virtual Assistant') if isinstance(context, dict) else context
        user_prompt = f"Generate a list of 5 key hard and soft skills for a {job_title}. Return as a comma-separated list.{jd_context}"
    else:
        user_prompt = f"Improve this text for a resume: {context.get('text')}{jd_context}"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
         "HTTP-Referer": "http://localhost:5000", # Optional, for including your app on openrouter.ai rankings.
        "X-Title": "Blockscom Resume Generator" # Optional. Shows in rankings on openrouter.ai.
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload)
        )
        response.raise_for_status()
        result = response.json()
        generated_text = result['choices'][0]['message']['content'].strip()
        
        # Cleanup markdown formatting
        if generated_text.startswith("```html"):
            generated_text = generated_text[7:]
        elif generated_text.startswith("```"):
            generated_text = generated_text[3:]
            
        if generated_text.endswith("```"):
            generated_text = generated_text[:-3]
            
        generated_text = generated_text.strip()
        
        # Cleanup minimal formatting if needed
        if prompt_type == 'skills':
            generated_text = generated_text.replace('\n', ', ')
            
        return jsonify({'result': generated_text})
        
    except Exception as e:
        print(f"Error calling OpenRouter: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)
