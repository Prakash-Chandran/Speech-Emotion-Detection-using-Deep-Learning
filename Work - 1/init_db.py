import sqlite3

def init_db():
    conn = sqlite3.connect('users.db')
    conn.execute('''CREATE TABLE IF NOT EXISTS users 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                 username TEXT NOT NULL, 
                 email TEXT NOT NULL, 
                 password TEXT NOT NULL)''')
    print("Database Initialized.")
    conn.close()

if __name__ == '__main__':
    init_db()