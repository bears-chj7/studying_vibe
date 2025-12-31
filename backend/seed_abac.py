from database import create_connection

def seed_abac():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Find admin user
            cursor.execute("SELECT id FROM users WHERE username = 'bears_chj7'")
            result = cursor.fetchone()
            
            if not result:
                print("Admin user 'bears_chj7' not found.")
                return

            user_id = result[0]
            
            # Define attributes to insert
            attributes = [
                ('department', 'engineering'),
                ('clearance_level', 'top_secret'),
                ('project_access', 'vibe_coding')
            ]
            
            print(f"Seeding attributes for user {user_id}...")
            
            inserted_count = 0
            for key, value in attributes:
                # Use REPLACE INTO or INSERT IGNORE to handle re-runs
                # Since we defined UNIQUE(user_id, attr_key), simple INSERT might fail if run twice.
                # Let's use INSERT IGNORE
                cursor.execute(
                    "INSERT IGNORE INTO user_attributes (user_id, attr_key, attr_value) VALUES (%s, %s, %s)",
                    (user_id, key, value)
                )
                if cursor.rowcount > 0:
                    inserted_count += 1
            
            conn.commit()
            print(f"Seeding complete. Inserted {inserted_count} new attributes.")
            
        finally:
            conn.close()

if __name__ == "__main__":
    seed_abac()
