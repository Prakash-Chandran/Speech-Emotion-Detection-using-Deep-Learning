import smtplib

EMAIL = "metonystarkin2028@gmail.com"
APP_PASSWORD = "jzod fmrt ljhs utvu"

with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(EMAIL, APP_PASSWORD)
    print("LOGIN SUCCESS")
