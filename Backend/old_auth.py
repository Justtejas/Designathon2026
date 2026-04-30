from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
import logging
from dotenv import load_dotenv

load_dotenv()

bp = Blueprint('auth', __name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = MongoClient(os.getenv('MONGODB_URI'))
db = client["MaventoryDB"]
users = db["users"]

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_EXPIRY_MINUTES = 60

@bp.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "ARREQUESTOR")

        if not email or not password:
            logger.warning("Signup attempt with missing credentials")
            return jsonify({"error": "Email and password are required"}), 400

        if users.find_one({"email": email}):
            logger.warning(f"Duplicate signup attempt for email: {email}")
            return jsonify({"error": "User already exists"}), 400

        hashed_pw = generate_password_hash(password)
        users.insert_one({"email": email, "password": hashed_pw,"role": role})
        logger.info(f"New user created: {email}")
        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            logger.warning("Login attempt with missing credentials")
            return jsonify({"error": "Email and password are required"}), 400

        user = users.find_one({"email": email})
        if not user or not check_password_hash(user['password'], password):
            logger.warning(f"Failed login attempt for email: {email}")
            return jsonify({"error": "Invalid credentials"}), 401

        payload = {
            "id": str(user["_id"]),
            "email": email,
            "exp": datetime.now() + timedelta(minutes=JWT_EXPIRY_MINUTES)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        logger.info(f"Successful login for email: {email}")
        return jsonify({
            "role":user["role"],
            "token": token,
            "expires_in": JWT_EXPIRY_MINUTES * 60
        })

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def decode_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        return None

def get_user_id():
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if payload:
                return payload["id"]
        return None
    except Exception as e:
        logger.error(f"Error getting user ID: {str(e)}")
        return None

def get_user_email():
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if payload:
                return payload["email"]
        return None
    except Exception as e:
        logger.error(f"Error getting user email: {str(e)}")
        return None