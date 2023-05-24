import json, os, re, smtplib, hashlib, random

from flask import Flask, request, render_template, Response, redirect, url_for, flash
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


app = Flask(__name__)
app.secret_key = os.getenv('APP_SECRET_KEY')

@app.route('/', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.form
        if is_valid_email(data['email']) and create_account(data['email'], data['password']):
            flash('Your account was successfully created, check your email for a validation token', 'success')
            return redirect(url_for('validate_account'))
        else:
            flash('Something went wrong creating your account', 'danger')
            return redirect(url_for('register'))

    return render_template('register.html')

@app.route('/validate-account', methods=['GET', 'POST'])
def validate_account():
    if request.method == 'POST':
        data = get_data_json()
        valid = False
        for d in data:
            if request.form['token'] == d['token']:
                d['token'] = None
                valid = True

        set_data_json(data)
        if valid:
            flash('Your account was successfully validated', 'success')
            return redirect(url_for('register'))
        else:
            flash('Something went wrong validating your account', 'danger')
            return redirect(url_for('validate_account'))

    return render_template('validate-account.html')

def get_token():
    existing_tokens = []
    data = get_data_json()
    existing_tokens = [d['token'] for d in data]

    token = generate_token()
    while token in existing_tokens:
        token = generate_token()

    return token

def generate_token():
    alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    length = 6
    token = ''
    for i in range(length):
        token += alpha[random.randint(0, len(alpha) - 1)]

    return token

def create_account(email, pwd):
    try:        
        md5 = hashlib.md5()
        md5.update(pwd.encode('utf-8'))
        hash_pwd = md5.hexdigest()

        data = get_data_json()

        existing_accounts = [d['email'] for d in data]
        if email in existing_accounts:
            raise Exception

        token = get_token()
        data.append({
            'email': email,
            'passwordHash': hash_pwd,
            'token': token
        })

        set_data_json(data)

        send_email(email, token)
            
        return True
    except Exception as e:
        print(e)
        return False

def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None


def send_email(to, token):
    msg = MIMEMultipart()
    msg['From'] = os.getenv('GOOGLE_USERNAME')
    msg['To'] = to
    msg['Subject'] = 'One-Time Token'

    msg.attach(MIMEText(f'Here is your token: {token}', 'plain'))

    try :
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(os.getenv('GOOGLE_USERNAME'), os.getenv('GOOGLE_PWD'))
            server.sendmail(os.getenv('GOOGLE_USERNAME'), to, msg.as_string())

        return True
    except smtplib.SMTPException as e:
        print("Error: Unable to send email.")
        print(e)

        return False

def get_data_json():
    if not os.path.exists('data.json'):
        data = []  
        with open('data.json', "w") as f:
            json.dump(data, f)

        return data

    with open('data.json') as f:
        try:
            data = json.load(f)
        except ValueError as err:
            data = []

    return data

def set_data_json(data):
    with open('data.json', 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    