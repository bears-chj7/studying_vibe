from database import create_connection

def drop_role_column():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            print("Dropping 'role' column from users table...")
            #Check if column exists first to avoid error? Or just try drop.
            # simpler to just try drop.
            try:
                cursor.execute("ALTER TABLE users DROP COLUMN role")
                print("Column 'role' dropped successfully.")
            except Exception as e:
                print(f"Error dropping column (might not exist): {e}")
            
            conn.commit()
        except Exception as e:
            print(f"Database error: {e}")
        finally:
            conn.close()

if __name__ == "__main__":
    drop_role_column()
