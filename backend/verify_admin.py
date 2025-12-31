import mysql.connector
import os
import hashlib
from dotenv import load_dotenv

load_dotenv()

def verify_admin():
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    cursor = conn.cursor(dictionary=True)

    try:
        username = "bears_chj7"
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        
        if user:
            print(f"User {username} found. Role: {user.get('role')}")
            if user.get('role') != 'admin':
                print("Updating to admin...")
                cursor.execute("UPDATE users SET role = 'admin' WHERE username = %s", (username,))
                conn.commit()
                print("Updated.")
        else:
            print(f"User {username} NOT found. Creating...")
            # Create user with default password 'password' (hash it)
            password = "password"
            hashed = hashlib.sha256(password.encode()).hexdigest()
            cursor.execute("INSERT INTO users (name, username, password_hash, role) VALUES (%s, %s, %s, 'admin')", 
                           ("Admin", username, hashed))
            conn.commit()
            print("Created admin user.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    verify_admin()
