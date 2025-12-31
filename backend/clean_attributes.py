from database import create_connection

def clean_attributes():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            print("Cleaning whitespace in user_attributes...")
            
            # Trim keys and values
            cursor.execute("UPDATE user_attributes SET attr_key = TRIM(attr_key), attr_value = TRIM(attr_value)")
            print(f"Rows affected: {cursor.rowcount}")
            
            # Also normalize common typos if any (optional but helpful)
            cursor.execute("UPDATE user_attributes SET attr_value = 'documents' WHERE attr_value = 'document'")
            print(f"Normalized 'document' -> 'documents': {cursor.rowcount}")
            
            cursor.execute("UPDATE user_attributes SET attr_value = 'users' WHERE attr_value = 'user'")
            print(f"Normalized 'user' -> 'users': {cursor.rowcount}")

            conn.commit()
            print("Clean complete.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            conn.close()

if __name__ == "__main__":
    clean_attributes()
