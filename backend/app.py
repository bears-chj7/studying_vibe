from flask import Flask, request, jsonify, Response
import requests
import os
from database import create_connection
from mysql.connector import Error
import hashlib

app = Flask(__name__)

# Basic CORS workaround (for production use flask-cors)
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/')
def home():
    return "Backend is running! Use the frontend to interact."

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not name or not username or not password or not confirm_password:
        return jsonify({"error": "All fields are required"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    hashed_password = hash_password(password)

    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (name, username, password_hash) VALUES (%s, %s, %s)", (name, username, hashed_password))
            conn.commit()
            return jsonify({"message": "User created successfully"}), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    else:
        return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    hashed_password = hash_password(password)

    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE username = %s AND password_hash = %s", (username, hashed_password))
            user = cursor.fetchone()

            if user:
                return jsonify({"message": "Login successful", "user_id": user['id'], "name": user['name']}), 200
            else:
                return jsonify({"error": "Invalid username or password"}), 401
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    else:
        return jsonify({"error": "Database connection failed"}), 500
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    model = data.get('model', 'ollama')  # Default to ollama

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    if model == 'gemini':
        try:
            # Try to read gemini.key from ../env/gemini.key (relative to backend folder)
            key_path = '../env/gemini.key'
            if not os.path.exists(key_path):
                 # Fallback to check absolute path or other locations if needed
                 key_path = '/home/judgejack/working_space/studying_vibe/env/gemini.key'
            
            if not os.path.exists(key_path):
                return jsonify({"error": "Gemini API key file not found at studying_vibe/env/gemini.key"}), 500

            with open(key_path, 'r') as f:
                api_key = f.read().strip()

            if not api_key:
                return jsonify({"error": "Gemini API key is empty"}), 500

            # Call Gemini API
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
            payload = {
                "contents": [{
                    "parts": [{"text": user_message}]
                }]
            }
            
            headers = {
                'Content-Type': 'application/json',
                'x-goog-api-key': api_key
            }
            
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                # Extract text from Gemini response structure
                try:
                    bot_text = result['candidates'][0]['content']['parts'][0]['text']
                    return jsonify({"response": bot_text, "done": True}) # Match Ollama format roughly
                except (KeyError, IndexError):
                     return jsonify({"error": f"Unexpected response format from Gemini: {result}"}), 500
            else:
                return jsonify({"error": f"Gemini API Error: {response.status_code} {response.text}"}), response.status_code

        except Exception as e:
            return jsonify({"error": f"Gemini integration failed: {str(e)}"}), 500

    else:
        # Default to Ollama (llama2 or specified model)
        # Using llama3.2:1b as requested for "ollama" option default, but passing through 'model' param if it's an ollama model name
        ollama_model = "llama3.2:1b"
        
        try:
            # Call Ollama API
            ollama_response = requests.post(
                'http://localhost:11434/api/generate',
                json={
                    "model": ollama_model,
                    "prompt": user_message,
                    "stream": False
                }
            )
            
            if ollama_response.status_code == 200:
                return jsonify(ollama_response.json())
            else:
                return jsonify({"error": f"Failed to get response from Ollama. Status: {ollama_response.status_code}, Response: {ollama_response.text}"}), 500
                
        except requests.exceptions.RequestException as e:
            return jsonify({"error": f"Ollama connection failed: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
