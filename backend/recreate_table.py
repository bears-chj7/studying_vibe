from database import create_connection

def recreate_table():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            print("Dropping user_attributes table...")
            cursor.execute("DROP TABLE IF EXISTS user_attributes")
            
            print("Recreating user_attributes table (allowing duplicates)...")
            cursor.execute("""
                CREATE TABLE user_attributes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    attr_key VARCHAR(50) NOT NULL,
                    attr_value VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            print("Table recreated.")
            conn.commit()
        except Exception as e:
            print(f"Error: {e}")
        finally:
            conn.close()

if __name__ == "__main__":
    recreate_table()
