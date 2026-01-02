from functools import wraps
from flask import request, jsonify
from database import create_connection

def check_abac(required_attributes):
    """
    Decorator to check if the user has specific attributes.
    required_attributes: dict of {key: value} that the user must match.
    Example: @check_abac({'role': 'admin'})
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # 1. basic auth check: user_id from session or body?
            # Since we don't have a full session system yet, we rely on the client sending 'username' or similar credential.
            # Ideally this should use a token/session from request headers/cookies.
            # For this MVP refactor, let's assume the frontend sends 'username' in the JSON body for protected actions,
            # OR we rely on a simplified header 'X-User-ID' or similar if we change the auth flow.
            
            # Re-reading the `app.py`:
            # - /api/admin/ingest used `username` in body.
            # - /api/chat used `model` in body, no user check yet.
            
            # Let's standardize on extracting user identity. 
            # Given the constraints, let's check JSON body for 'username' or 'user_id' as a fallback, 
            # but for a GET request (like listing docs), we might need query params or headers.
            # Let's try to get 'username' from request.json or request.args.
            
            # Priority: Header (X-Username) > JSON Body > Form Data > Query Args (Legacy/Fallback)
            username = request.headers.get('X-Username')

            if not username:
                if request.is_json:
                    username = request.get_json().get('username')
                elif request.form:
                    # Handle multipart/form-data for uploads
                    username = request.form.get('username')
            
            # Fallback to args (to be removed later, or kept for strict debugging/legacy)
            if not username:
                username = request.args.get('username')
            
            if not username:
                return jsonify({"error": "Authentication required (username missing)"}), 401

            conn = create_connection()
            if not conn:
                 return jsonify({"error": "Database error"}), 500

            try:
                cursor = conn.cursor(dictionary=True)
                
                # Get User ID
                cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"error": "User not found"}), 401
                
                user_id = user['id']

                # Check Attributes
                # We need to verify if the user has ALL the required attributes with the matching values.
                # Query: Get all attributes for this user
                cursor.execute("SELECT attr_key, attr_value FROM user_attributes WHERE user_id = %s", (user_id,))
                user_attrs_rows = cursor.fetchall()
                
                # Convert to dict of lists: {key: [value1, value2]}
                user_attrs = {}
                for row in user_attrs_rows:
                    key = row['attr_key']
                    val = row['attr_value']
                    if key not in user_attrs:
                        user_attrs[key] = []
                    user_attrs[key].append(val)
                
                # Legacy 'role' check removed. Only user_attributes are used.
                # If we need a 'role' concept, it should be an attribute like {'role': ['admin']}

                # Verify requirements
                for req_key, req_val in required_attributes.items():
                    if req_key not in user_attrs:
                        return jsonify({"error": f"Missing permission attribute: {req_key}"}), 403
                    
                    # Check if the required value exists in the list of values for this key
                    if req_val not in user_attrs[req_key]:
                        return jsonify({"error": f"Permission denied for attribute: {req_key} (Required: {req_val})"}), 403
                
                # If we pass all checks
                return f(*args, **kwargs)

            except Exception as e:
                print(f"Auth specific error: {e}")
                return jsonify({"error": "Authorization check failed"}), 500
            finally:
                conn.close()

        return decorated_function
    return decorator
