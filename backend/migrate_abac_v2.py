from database import create_connection

def migrate_abac_v2():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            
            print("Beginning ABAC v2 Migration (Multi-value attributes)...")
            
            # 1. Clear old 'job_role' and previous test data
            cursor.execute("DELETE FROM user_attributes WHERE attr_key IN ('job_role', 'department', 'clearance_level', 'project_access')")
            print(f"Cleaned up {cursor.rowcount} old attributes.")
            
            # 2. Assign attributes based on identity (for migration continuity)
            # bears_chj7 -> Admin rights (access docs, access users)
            # others -> Normal (no special access rights by default)
            
            def add_attr(cur, uid, k, v):
                # Insert attribute. We allow duplicates in concept (1:N), but to keep DB clean let's check or just insert.
                # Since we cleared table for keys, insert is safe.
                cur.execute("INSERT INTO user_attributes (user_id, attr_key, attr_value) VALUES (%s, %s, %s)", (uid, k, v))

            cursor.execute("SELECT id, username FROM users")
            users = cursor.fetchall()
            
            for user in users:
                user_id = user['id']
                username = user['username']
                
                if username == 'bears_chj7':
                    print(f"Granting ADMIN capabilities to {username}")
                    # Access rights
                    add_attr(cursor, user_id, 'access_page', 'documents')
                    add_attr(cursor, user_id, 'access_page', 'users')
                    # Action capabilities (optional future proofing)
                    add_attr(cursor, user_id, 'action', 'manage_documents')
                    add_attr(cursor, user_id, 'action', 'manage_users')
                elif username == 'general_ben':
                    # Let's say we give general_ben document access only, for testing variety
                    print(f"Granting DOCUMENT capabilities to {username}")
                    add_attr(cursor, user_id, 'access_page', 'documents')
                else:
                    print(f"User {username} gets NO special attributes")

            conn.commit()
            print("Migration v2 completed successfully.")
            
        except Exception as e:
            print(f"Error during migration: {e}")
            conn.rollback()
        finally:
            conn.close()

if __name__ == "__main__":
    migrate_abac_v2()
