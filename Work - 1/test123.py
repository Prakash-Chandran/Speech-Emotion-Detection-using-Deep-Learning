import sqlite3
from werkzeug.security import generate_password_hash

# Connect to your database
conn = sqlite3.connect('users.db')
cur = conn.cursor()

# Fetch all user IDs and passwords
cur.execute("SELECT id, password FROM users")
users = cur.fetchall()

for id, pwd in users:
    # Check if password is already hashed
    if not pwd.startswith('pbkdf2:'):
        # Hash the plain password
        hashed = generate_password_hash(pwd)
        # Update the database with hashed password
        cur.execute("UPDATE users SET password=? WHERE id=?", (hashed, id))
        print(f"Password for user ID {id} hashed.")

# Commit changes and close connection
conn.commit()
conn.close()

print("All existing passwords updated to hashed form.")
