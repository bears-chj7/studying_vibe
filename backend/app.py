from flask import Flask, request, jsonify
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
