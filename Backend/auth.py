from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
import logging
import base64
from dotenv import load_dotenv
from bson.objectid import ObjectId
 
load_dotenv()
 
auth_bp = Blueprint('auth', __name__)
 
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
 
client = MongoClient(os.getenv('MONGODB_URI'))
db = client["HexaHubDB"]
users = db["Users"]
 
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
JWT_EXPIRY_HOURS = 1
 
def get_user_role():
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if payload and "User_Type" in payload:
                return payload["User_Type"]  # Returns "Admin", "Employee", etc.
        return None  # Default if no token or invalid
    except Exception as e:
        logger.error(f"Error getting user role: {str(e)}")
        return None
 
def is_admin():
    """Check if user is admin"""
    role = get_user_role()
    return role == "Admin"
 
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
            if payload and "UserId" in payload:
                return int(payload["UserId"])
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
            if payload and "UserMail" in payload:
                return payload["UserMail"]
        return None
    except Exception as e:
        logger.error(f"Error getting user email: {str(e)}")
        return None
 
@bp.route('/api/auth', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get("UserMail")
        password = data.get("Password")
 
        if not email or not password:
            logger.warning("Login attempt with missing credentials")
            return jsonify({"error": "UserMail and Password are required"}), 400
 
        # Find user by email (case-insensitive)
        user = users.find_one({
            "UserMail": {"$regex": email, "$options": "i"}
        })
 
        if not user or user.get("Password") != password:  # Plain text comparison (match C#)
            logger.warning(f"Failed login attempt for email: {email}")
            return jsonify({"error": "Invalid credentials"}), 401
 
        # Create JWT token
        payload = {
            "UserId": user["UserId"],
            "UserName": user["UserName"],
            "UserMail": user["UserMail"],
            "User_Type": user.get("User_Type", "Employee"),
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        logger.info(f"Successful login for user: {email}")
        return jsonify({
            "token": token,
            "UserId": user["UserId"],
            "UserName": user["UserName"],
            "UserMail": user["UserMail"],
            "User_Type": user.get("User_Type", "Employee"),
            "expires_in": JWT_EXPIRY_HOURS * 3600
        })
 
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
 
@bp.route('/api/users', methods=['GET'])
def get_users():
    try:
        logger.info("Fetching all users")
        users_list = list(users.find({}))
        if not users_list:
            logger.debug("No users found")
            return jsonify([]), 200
        # Serialize users (exclude password)
        serialized_users = []
        for user in users_list:
            user_doc = dict(user)
            user_doc.pop("Password", None)  # Remove password
            user_doc['_id'] = str(user_doc.get('_id'))
            serialized_users.append(user_doc)
        return jsonify(serialized_users), 200
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@bp.route('/api/users/role', methods=['GET'])
def get_users_by_role():
    try:
        role = request.args.get('role')
        if not role:
            return jsonify({"error": "role parameter is required"}), 400
        logger.info(f"Fetching users by role: {role}")
        users_list = list(users.find({"User_Type": role}))
        if not users_list:
            logger.debug(f"No users found with role: {role}")
            return jsonify({"error": "No users found with the specified role"}), 404
        # Serialize users (exclude password)
        serialized_users = []
        for user in users_list:
            user_doc = dict(user)
            user_doc.pop("Password", None)
            user_doc['_id'] = str(user_doc.get('_id'))
            serialized_users.append(user_doc)
        return jsonify(serialized_users), 200
    except Exception as e:
        logger.error(f"Error fetching users by role: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@bp.route('/api/users/profile', methods=['GET'])
def get_user_profile():
    try:
        user_id = get_user_id()
        if not user_id:
            return jsonify({"error": "User not authenticated"}), 401
        logger.info(f"Fetching profile for user: {user_id}")
        user = users.find_one({"UserId": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        # Create UserDto response
        user_doc = dict(user)
        user_doc.pop("Password", None)
        user_doc['_id'] = str(user_doc.get('_id'))
        return jsonify(user_doc), 200
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@bp.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        logger.info(f"Fetching user: {user_id}")
        user = users.find_one({"UserId": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        # Exclude password
        user_doc = dict(user)
        user_doc.pop("Password", None)
        user_doc['_id'] = str(user_doc.get('_id'))
        return jsonify(user_doc), 200
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@bp.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        current_user_id = get_user_id()
        if not current_user_id:
            return jsonify({"error": "User not authenticated"}), 401
        data = request.json
        logger.info(f"Updating user {user_id}")
        if data.get("UserId") != user_id:
            return jsonify({"error": "Check Id"}), 400
        # Permission check: self or admin
        if current_user_id != user_id and not is_admin():
            return jsonify({"error": "You do not have permission to update this user"}), 403
        # Get existing user
        existing_user = users.find_one({"UserId": user_id})
        if not existing_user:
            return jsonify({"error": "User not found"}), 404
        # Prepare update data (exclude password)
        update_data = {
            "$set": {
                "UserName": data.get("UserName", existing_user.get("UserName")),
                "UserMail": data.get("UserMail", existing_user.get("UserMail")),
                "Gender": data.get("Gender", existing_user.get("Gender")),
                "Dept": data.get("Dept", existing_user.get("Dept")),
                "Designation": data.get("Designation", existing_user.get("Designation")),
                "PhoneNumber": data.get("PhoneNumber", existing_user.get("PhoneNumber")),
                "Address": data.get("Address", existing_user.get("Address")),
                "Branch": data.get("Branch", existing_user.get("Branch")),
                "ProfileImage": data.get("ProfileImage", existing_user.get("ProfileImage"))
            }
        }
        # Admin can update role
        if is_admin():
            update_data["$set"]["User_Type"] = data.get("User_Type", existing_user.get("User_Type"))
        result = users.update_one({"UserId": user_id}, update_data)
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
        logger.info(f"Updated user {user_id}")
        return jsonify({"message": "Updation Successful"}), 200
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating user"}), 500
 
@bp.route('/api/users/<int:user_id>/password', methods=['PUT'])
def change_password(user_id):
    try:
        current_user_id = get_user_id()
        if not current_user_id:
            return jsonify({"error": "User not authenticated"}), 401
        data = request.json
        logger.info(f"Changing password for user: {user_id}")
        if data.get("UserId") != user_id:
            return jsonify({"error": "Check Your Id"}), 400
        # Only self password change allowed
        if current_user_id != user_id:
            return jsonify({"error": "Check your Id"}), 403
        # Get existing user
        existing_user = users.find_one({"UserId": user_id})
        if not existing_user:
            return jsonify({"error": "User not found"}), 404
        # Verify current password
        if existing_user.get("Password") != data.get("CurrentPassword"):
            return jsonify({"error": "Current password is incorrect"}), 401
        # Update password (plain text to match C#)
        users.update_one(
            {"UserId": user_id},
            {"$set": {"Password": data.get("NewPassword")}}
        )
        logger.info(f"Password changed for user {user_id}")
        return jsonify({"message": "Password Changed Successfully"}), 200
    except Exception as e:
        logger.error(f"Error changing password for user {user_id}: {str(e)}")
        return jsonify({"error": "An error occurred while changing password"}), 500
 
@bp.route('/api/users', methods=['POST'])
def register_user():
    try:
        data = request.json
        logger.info("Registering new user")
        required_fields = ["UserName", "UserMail", "PhoneNumber", "Branch"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        # Check if user already exists
        if users.find_one({"UserMail": data.get("UserMail")}):
            return jsonify({"error": "User already exists"}), 400
        # Create user with default password
        user_doc = {
            "UserName": data.get("UserName"),
            "UserMail": data.get("UserMail"),
            "PhoneNumber": data.get("PhoneNumber"),
            "Branch": data.get("Branch"),
            "User_Type": "Employee",
            "Password": "Hexahub@123",  # Default password matching C#
            "ProfileImage": "profile-img.jpg"  # Default profile image
        }
        result = users.insert_one(user_doc)
        logger.info(f"Registered new user: {user_doc['UserMail']}")
        user_doc["_id"] = str(result.inserted_id)
        user_doc.pop("Password", None)  # Remove password from response
        return jsonify(user_doc), 201
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        return jsonify({"error": "An error occurred while registering user"}), 500
 
@bp.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Deleting user: {user_id}")
        result = users.delete_one({"UserId": user_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Id Not Found"}), 404
        logger.info(f"Deleted user {user_id}")
        return jsonify({"message": f"{user_id} has been deleted"}), 200
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting user"}), 500
 
@bp.route('/api/users/<int:user_id>/upload', methods=['PUT'])
def upload_profile_image(user_id):
    try:
        current_user_id = get_user_id()
        if not current_user_id:
            return jsonify({"error": "User not authenticated"}), 401
        if current_user_id != user_id:
            return jsonify({"error": "You are not authorized to update this image"}), 401
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png']
        if file.content_type not in allowed_types:
            return jsonify({"error": "Only JPEG or PNG formats are allowed"}), 400
        # Save file and update user (simplified - store filename)
        filename = f"profile_{user_id}.jpg"
        users.update_one(
            {"UserId": user_id},
            {"$set": {"ProfileImage": filename}}
        )
        logger.info(f"Uploaded profile image for user {user_id}")
        return jsonify({"FileName": filename}), 200
    except Exception as e:
        logger.error(f"Error uploading profile image: {str(e)}")
        return jsonify({"error": "Failed to upload image"}), 500
 
@bp.route('/api/users/<int:user_id>/profileImage', methods=['GET'])
def get_profile_image(user_id):
    try:
        logger.info(f"Fetching profile image for user: {user_id}")
        user = users.find_one({"UserId": user_id})
        if not user or not user.get("ProfileImage"):
            # Return default image logic would go here
            return jsonify({"error": "No profile image available"}), 404
        # In production, serve actual image file
        # For now, return filename
        return jsonify({"ProfileImage": user["ProfileImage"]}), 200
    except Exception as e:
        logger.error(f"Error fetching profile image: {str(e)}")
        return jsonify({"error": "Image not found"}), 404