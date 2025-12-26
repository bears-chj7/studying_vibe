from database import create_connection
from mysql.connector import Error

def create_users_table():
    """ create users table in the MariaDB database """
    commands = (
        """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
    )
    
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            for command in commands:
                cursor.execute(command)
            conn.commit()
            print("Users table created successfully")
        except Error as e:
            print(f"Error creating table: {e}")
        finally:
            conn.close()
    else:
        print("Error! Cannot create the database connection.")

if __name__ == '__main__':
    create_users_table()
