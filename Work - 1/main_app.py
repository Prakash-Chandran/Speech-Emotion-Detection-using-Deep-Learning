# main_app.py
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
import sqlite3, os
from random import randint

# Import the speech blueprint
from Speech_Emotion.app import speech_bp

# ---------------- APP SETUP ----------------
app = Flask(__name__)
app.secret_key = "super-secret-key-change-this"

# ---------------- MAIL CONFIG ----------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'metonystarkin2028@gmail.com'
app.config['MAIL_PASSWORD'] = 'jzod fmrt ljhs utvu'
app.config['MAIL_DEFAULT_SENDER'] = 'metonystarkin2028@gmail.com'
mail = Mail(app)

# ---------------- DATABASE ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'users.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------------- REGISTER BLUEPRINT ----------------
# The 'speech_bp' from Speech_Emotion.app is registered here.
# Access it via url_for('speech.function_name')
app.register_blueprint(speech_bp, url_prefix='/speech')

# ---------------- ROUTES ----------------
@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email'].strip()
        username = request.form['username'].strip()
        password = request.form['password'].strip()

        conn = get_db()
        if conn.execute("SELECT 1 FROM users WHERE email=?", (email,)).fetchone():
            flash("Email already registered. Please login or reset your password.", "danger")
            conn.close()
            return render_template('signup.html', username=username, email=email)

        otp = randint(100000, 999999)
        session['otp'] = otp
        session['temp_user'] = {
            "username": username,
            "email": email,
            "password": generate_password_hash(password)
        }

        msg = Message("OTP Verification", recipients=[email])
        msg.body = f"Your OTP is {otp}"
        mail.send(msg)

        flash("OTP sent to email", "success")
        return redirect(url_for('verify'))

    return render_template('signup.html')

@app.route('/verify', methods=['GET', 'POST'])
def verify():
    if 'otp' not in session:
        return redirect(url_for('signup'))

    if request.method == 'POST':
        if request.form['otp'] == str(session['otp']):
            user = session['temp_user']
            conn = get_db()
            conn.execute(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                (user['username'], user['email'], user['password'])
            )
            conn.commit()
            conn.close()

            session.clear()
            session['user'] = user['username']
            flash("Signup successful!", "success")
            return redirect(url_for('dashboard'))

        flash("Invalid OTP", "danger")
    return render_template('verify.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email'].strip()
        password = request.form['password'].strip()

        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        conn.close()

        if user and check_password_hash(user['password'], password):
            session['user'] = user['username']
            flash("Login successful!", "success")
            return redirect(url_for('dashboard'))

        flash("Invalid login credentials", "danger")
    return render_template('login.html')

s = URLSafeTimedSerializer(app.secret_key)

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        user_email = request.form.get('email').strip()

        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email=?", (user_email,)).fetchone()
        conn.close()

        if not user:
            flash("Email not registered", "danger")
            return render_template('forgot_password.html')

        token = s.dumps(user_email, salt='password-reset-salt')
        reset_link = url_for('reset_password_token', token=token, _external=True)

        msg = Message(
            subject="Password Reset",
            recipients=[user_email],
            sender=app.config['MAIL_DEFAULT_SENDER'],
            body=f"Hello {user['username']},\n\nClick the link below to reset your password:\n\n{reset_link}"
        )
        mail.send(msg)
        flash("Password reset email sent! Check your inbox.", "success")
        return redirect(url_for('login'))

    return render_template('forgot_password.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password_token(token):
    try:
        email = s.loads(token, salt='password-reset-salt', max_age=3600)
    except:
        flash("The reset link is invalid or expired.", "danger")
        return redirect(url_for('forgot_password'))

    if request.method == 'POST':
        password = request.form.get('password').strip()
        confirm = request.form.get('confirm_password').strip()

        if password != confirm:
            flash("Passwords do not match.", "danger")
            return render_template('new-password.html')

        hashed = generate_password_hash(password)
        conn = get_db()
        conn.execute("UPDATE users SET password=? WHERE email=?", (hashed, email))
        user = conn.execute("SELECT username FROM users WHERE email=?", (email,)).fetchone()
        conn.commit()
        conn.close()

        session.clear()
        session['user'] = user['username']
        flash("Password reset successful!", "success")
        return redirect(url_for('dashboard'))

    return render_template('new-password.html')

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template("dashboard.html", name=session['user'])

@app.route('/logout')
def logout():
    session.clear()
    flash("Logged out successfully!", "success")
    return redirect(url_for('login'))

if __name__ == "__main__":
    app.run(debug=True)