from database import create_connection
from mysql.connector import Error

def init_db():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Users table - ensure it exists or we use existing one.
            # We assume users table is already there.
            
            # 1. User Attributes Table for ABAC
            print("Creating user_attributes table...")
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_attributes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                attr_key VARCHAR(50) NOT NULL,
                attr_value VARCHAR(255) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_attr (user_id, attr_key)
            )
            """)

            # 2. Documents Table
            print("Creating documents table...")
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                filepath VARCHAR(512) NOT NULL,
                uploaded_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
            )
            """)

            conn.commit()
            print("Database initialized successfully.")
            
        except Error as e:
            print(f"Error initializing database: {e}")
        finally:
            conn.close()

if __name__ == "__main__":
    init_db()
