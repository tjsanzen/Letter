from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime, timezone

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/data')
def get_data():
    with open('data.json') as f:
        return jsonify(json.load(f))

@app.route('/log', methods=['POST'])
def log_action():
    data = request.json
    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_first_name": data.get("user_first_name"),
        "official_last_name": data.get("official_last_name")
    }

    logs = []
    if os.path.exists('logs.json'):
        with open('logs.json', 'r') as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                logs = []  # If file is empty or corrupt, start fresh

    logs.append(log_entry)

    with open('logs.json', 'w') as f:
        json.dump(logs, f, indent=2)

    return '', 204

@app.route('/logs')
def view_logs():
    logs = []
    if os.path.exists('logs.json'):
        with open('logs.json', 'r') as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                logs = []
    return render_template('logs.html', logs=logs)


if __name__ == '__main__':
    app.run(debug=True)
