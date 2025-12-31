from database import create_connection

def check_data():
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            
            print("--- Users ---")
            cursor.execute("SELECT id, username FROM users")
            users = cursor.fetchall()
            for user in users:
                print(user)
                
            print("\n--- User Attributes (ABAC) ---")
            cursor.execute("SELECT * FROM user_attributes")
            attrs = cursor.fetchall()
            if not attrs:
                print("No attributes found.")
            for attr in attrs:
                print(attr)
                
        finally:
            conn.close()

if __name__ == "__main__":
    check_data()
