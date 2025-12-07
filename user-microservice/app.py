# user/app.py
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Flask-CORS is crucial here to allow the frontend to fetch data
CORS(app) 

@app.route('/api/v1/user/profile', methods=['GET'])
def get_user_profile():
    print("User profile request received.")
    user_data = {
        "id": "user-123",
        "name": "DevOps User",
        "email": "devops@example.com",
        "status": "Logged In"
    }
    return jsonify(user_data)

if __name__ == '__main__':
    # Use debug=False for production, but it's handy for local development
    app.run(port=3002, debug=True) # Runs on port 3002