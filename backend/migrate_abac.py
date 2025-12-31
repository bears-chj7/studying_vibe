from database import create_connection

def migrate_abac():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            
            print("Beginning ABAC Migration...")
            
            # 1. Clear existing generic attributes (optional, but good for clean slate based on new requirement)
            # We will delete 'department', 'clearance_level' etc if they exist from previous seed
            cursor.execute("DELETE FROM user_attributes WHERE attr_key IN ('department', 'clearance_level', 'project_access')")
            print(f"Cleaned up {cursor.rowcount} old attributes.")
            
            # 2. Migrate Users
            cursor.execute("SELECT id, username, role FROM users")
            users = cursor.fetchall()
            
            for user in users:
                user_id = user['id']
                username = user['username']
                old_role = user.get('role', 'user')
                
                # Determine new job_role
                # User 'bears_chj7' is the main Admin. We assign 'account_manager' to them.
                # All others 'normal'.
                # Note: Currently we don't have a 'document_manager'. The Account Manager will have to assign it.
                
                new_role = 'normal'
                if username == 'bears_chj7':
                    new_role = 'account_manager'
                
                print(f"Migrating User {username} ({user_id}) -> {new_role}")
                
                # Insert attribute
                # attr_key='job_role', attr_value=new_role
                cursor.execute("""
                    INSERT INTO user_attributes (user_id, attr_key, attr_value)
                    VALUES (%s, 'job_role', %s)
                    ON DUPLICATE KEY UPDATE attr_value = %s
                """, (user_id, new_role, new_role))
            
            conn.commit()
            print("Migration completed successfully.")
            
        except Exception as e:
            print(f"Error during migration: {e}")
            conn.rollback()
        finally:
            conn.close()

if __name__ == "__main__":
    migrate_abac()
