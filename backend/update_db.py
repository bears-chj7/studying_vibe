import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def update_db():
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    cursor = conn.cursor()

    try:
        # Check if role column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'role'")
        result = cursor.fetchone()
        
        if not result:
            print("Adding 'role' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'")
        else:
            print("'role' column already exists.")

        # Update specific user to admin
        target_user = "bears_chj7"
        print(f"Updating role for {target_user}...")
        cursor.execute("UPDATE users SET role = 'admin' WHERE username = %s", (target_user,))
        
        conn.commit()
        print("Database updated successfully.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    update_db()
