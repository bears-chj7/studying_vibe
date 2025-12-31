from flask import Blueprint, request, jsonify
from database import create_connection
from auth_middleware import check_abac

users_bp = Blueprint('users', __name__)

@users_bp.route('/api/users', methods=['GET'])
@check_abac({'access_page': 'users'})
def get_users():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            # Retrieve users and their attributes (aggregated)
            query = """
                SELECT u.id, u.username, u.name, ua.attr_key, ua.attr_value
                FROM users u
                LEFT JOIN user_attributes ua ON u.id = ua.user_id
                ORDER BY u.id
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            
            # Aggregate rows into user objects
            users_map = {}
            for row in rows:
                uid = row['id']
                if uid not in users_map:
                    users_map[uid] = {
                        'id': uid,
                        'username': row['username'],
                        'name': row['name'],
                        'attributes': {}
                    }
                
                if row['attr_key']:
                    if row['attr_key'] not in users_map[uid]['attributes']:
                        users_map[uid]['attributes'][row['attr_key']] = []
                    users_map[uid]['attributes'][row['attr_key']].append(row['attr_value'])
            
            return jsonify(list(users_map.values())), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    else:
        return jsonify({"error": "DB Connection failed"}), 500

# General endpoint to add/remove attributes
@users_bp.route('/api/users/<int:user_id>/attributes', methods=['POST'])
@check_abac({'action': 'manage_users'}) # Requirement: action=manage_users
def manage_user_attributes(user_id):
    data = request.get_json()
    action = data.get('action') # 'add' or 'remove'
    key = data.get('key')
    value = data.get('value')
    
    if not key or not value or action not in ['add', 'remove']:
        return jsonify({"error": "Invalid request"}), 400

    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            if action == 'add':
                # Allow duplicates? Yes, per 1:N requirement. 
                # But typically we don't want exact duplicates (same key, same value).
                # New table has NO unique constraint, so we must manually check if we want to avoid strict dupes.
                # Let's avoid strict duplicates (same key AND value).
                cursor.execute("SELECT id FROM user_attributes WHERE user_id=%s AND attr_key=%s AND attr_value=%s", (user_id, key, value))
                if not cursor.fetchone():
                    cursor.execute("INSERT INTO user_attributes (user_id, attr_key, attr_value) VALUES (%s, %s, %s)", (user_id, key, value))
                    message = "Attribute added"
                else:
                    message = "Attribute already exists"

            elif action == 'remove':
                cursor.execute("DELETE FROM user_attributes WHERE user_id=%s AND attr_key=%s AND attr_value=%s", (user_id, key, value))
                message = "Attribute removed"
            
            conn.commit()
            return jsonify({"message": message}), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
            
    return jsonify({"error": "DB Connection failed"}), 500
