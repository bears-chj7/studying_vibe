from database import create_connection

def fix_schema():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            print("Dropping UNIQUE constraint on user_attributes...")
            
            # Constraint name is usually 'unique_user_attr' based on init_db.py
            # But just in case, we try. 
            try:
                cursor.execute("ALTER TABLE user_attributes DROP INDEX unique_user_attr")
                print("Constraint dropped.")
            except Exception as e:
                print(f"Failed to drop (might not exist): {e}")

            # We might want to add a index on user_id for performance though
            try:
                cursor.execute("CREATE INDEX idx_user_attributes_user_id ON user_attributes(user_id)")
                print("Index created.")
            except Exception as e:
                print(f"Index creation skipped: {e}")
            
            conn.commit()
            
        finally:
            conn.close()

if __name__ == "__main__":
    fix_schema()
