from flask import Flask, request, jsonify, send_from_directory
...
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')
