from flask import Flask, request, jsonify, Response
import requests
import os
from database import create_connection
from mysql.connector import Error
import hashlib
from rag import RAGService
from blueprints.documents import documents_bp
from blueprints.users import users_bp

app = Flask(__name__)
# Register Blueprints
app.register_blueprint(documents_bp)
app.register_blueprint(users_bp)

rag_service = RAGService()

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
            # Default role is 'user' logic removed as column is gone. 
            # New users start with no attributes, or we can seed default attributes here if needed.
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
                # Fetch all attributes for frontend capabilities
                cursor.execute("SELECT attr_key, attr_value FROM user_attributes WHERE user_id = %s", (user['id'],))
                attr_rows = cursor.fetchall()
                
                user_attributes = {}
                for row in attr_rows:
                    k = row['attr_key']
                    v = row['attr_value']
                    if k not in user_attributes:
                        user_attributes[k] = []
                    user_attributes[k].append(v)

                return jsonify({
                    "message": "Login successful", 
                    "user_id": user['id'], 
                    "name": user['name'],
                    "attributes": user_attributes
                }), 200
            else:
                return jsonify({"error": "Invalid username or password"}), 401
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    else:
        return jsonify({"error": "Database connection failed"}), 500

# /api/admin/ingest is replaced by the documents blueprint APIs
# We keep the function for now if needed for legacy tests but it's largely redundant.
# Or better, let's remove it to avoid confusion as per plan.


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    model = data.get('model', 'ollama')  # Default to ollama

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    # Retrieve context from RAG
    # We always use RAG context if available, or we could make it optional.
    # User said "Use this data for RAG service", so we assume always.
    context_docs = rag_service.query(user_message)
    context_text = "\n\n".join(context_docs)
    
    # Construct prompt with context
    system_prompt = "당신은 대학 입시를 돕는 유용한 도우미입니다. 다음 문맥을 사용하여 사용자의 질문에 답하세요. 만약 문맥에 정답이 없다면 일반적인 지식을 사용하되, 제공된 문서에서 나온 정보가 아님을 언급하세요. 모든 답변은 한국어로 작성해야 합니다."
    full_prompt = f"{system_prompt}\n\nContext:\n{context_text}\n\nUser Question:\n{user_message}"

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
                    "parts": [{"text": full_prompt}] 
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
        # Using llama3.2:1b as requested for "ollama" option default
        ollama_model = "llama3.2:1b"
        
        try:
            # Call Ollama API
            ollama_response = requests.post(
                'http://localhost:11434/api/generate',
                json={
                    "model": ollama_model,
                    "prompt": full_prompt, # Use the prompt with context
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
