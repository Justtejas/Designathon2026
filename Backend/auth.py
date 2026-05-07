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
db = client["MaventoryDB"]
users = db["users"]
 
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
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

def create_admin():
    try:
        logger.info("Checking for admin..")
        # Check if Admin already exists
        if users.find_one({"User_Type": "Admin"}):
            logger.info("Admin already exists")
            return "Admin already exists"
        # Create Admin with default password
        logger.info("Registering new admin")
        hashed_pw = generate_password_hash("Admin@123")
        user_doc = {
            "userId": "0",
            "userName": "Admin",
            "userMail": "admin@gmail.com",
            "User_Type": "Admin",
            "Password": hashed_pw, 
            "ProfileImage": "profile-img.jpg"  # Default profile image
        }
        result = users.insert_one(user_doc)
        logger.info(f"Registered new admin: {user_doc['userMail']}")
        return "Admin created Successfully"
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        return "An error occurred while registering user"
 
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
            if payload and "userId" in payload:
                return int(payload["userId"])
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
            if payload and "userMail" in payload:
                return payload["userMail"]
        return None
    except Exception as e:
        logger.error(f"Error getting user email: {str(e)}")
        return None
 
@auth_bp.route('/api/auth', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get("userMail")
        password = data.get("Password")
 
        if not email or not password:
            logger.warning("Login attempt with missing credentials")
            return jsonify({"error": "userMail and Password are required"}), 400
 
        # Find user by email (case-insensitive)
        email_norm = email.strip().lower()
        user= users.find_one({"userMail": email_norm})
        print(user)
 
        if not user or not check_password_hash(user['Password'], password):
            logger.warning(f"Failed login attempt for email: {email}")
            return jsonify({"error": "Invalid credentials"}), 401
 
        # Create JWT token
        payload = {
            "userId": user["userId"],
            "userName": user["userName"],
            "userMail": user["userMail"],
            "User_Type": user.get("User_Type"),
            "exp": datetime.now() + timedelta(hours=JWT_EXPIRY_HOURS)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        logger.info(f"Successful login for user: {email}")
        return jsonify({
            "token": token,
            "userId": user["userId"],
            "userName": user["userName"],
            "userMail": user["userMail"],
            "User_Type": user.get("User_Type", "Employee"),
            "expires_in": JWT_EXPIRY_HOURS * 3600
        })
 
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
 
@auth_bp.route('/api/users', methods=['GET'])
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
 
@auth_bp.route('/api/users/role', methods=['GET'])
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
 
@auth_bp.route('/api/users/profile', methods=['GET'])
def get_user_profile():
    try:
        user_id = get_user_id()
        if not user_id:
            return jsonify({"error": "User not authenticated"}), 401
        logger.info(f"Fetching profile for user: {user_id}")
        user = users.find_one({"userId": user_id})
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
 
@auth_bp.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        logger.info(f"Fetching user: {user_id}")
        user = users.find_one({"userId": user_id})
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
 
@auth_bp.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        current_user_id = get_user_id()
        if not current_user_id:
            return jsonify({"error": "User not authenticated"}), 401

        data = request.get_json(silent=True) or {}
        logger.info("Updating user %s requested by %s", user_id, current_user_id)

        # Authorization: only self or admin may update
        admin = is_admin()
        if current_user_id != user_id and not admin:
            return jsonify({"error": "You do not have permission to update this user"}), 403

        # Retrieve existing user
        existing_user = users.find_one({"userId": user_id})
        if not existing_user:
            return jsonify({"error": "User not found"}), 404

        # Build set of allowed updatable fields from input (exclude password, userId, _id)
        allowed_fields = [
            "userName", "userMail", "Gender", "dept", "designation",
            "phoneNumber", "address", "branch", "ProfileImage"
        ]
        update_fields = {}
        for key in allowed_fields:
            # Only include keys that were provided (presence), allow explicit empty-string if intended
            if key in data:
                update_fields[key] = data[key]

        # Admin-only fields
        if admin and "User_Type" in data:
            update_fields["User_Type"] = data["User_Type"]

        if not update_fields:
            return jsonify({"error": "No updatable fields provided"}), 400

        result = users.find_one_and_update(
            {"userId": user_id},
            {"$set": update_fields},
            return_document=True  # import ReturnDocument if needed; adjust as per driver version
        )

        if not result:
            # Unexpected — we already checked existence, but handle gracefully
            return jsonify({"error": "Unable to update user"}), 500

        logger.info("Updated user %s (requested by %s)", user_id, current_user_id)
        # Do not return sensitive fields
        sanitized = {
            "userId": result.get("userId"),
            "userName": result.get("userName"),
            "userMail": result.get("userMail"),
            "User_Type": result.get("User_Type")
        }
        return jsonify({"message": "Updation Successful", "user": sanitized}), 200

    except Exception as e:
        logger.exception("Error updating user %s: %s", user_id, str(e))
        return jsonify({"error": "An error occurred while updating user"}), 500
 
@auth_bp.route('/api/users/<int:user_id>/password', methods=['PUT'])
def change_password(user_id):
    try:
        current_user_id = get_user_id()
        if not current_user_id:
            return jsonify({"error": "User not authenticated"}), 401

        data = request.get_json(silent=True) or {}
        logger.info("Password change requested for user id %s", user_id)

        # Prefer server-side identity check; ignore client-sent userId
        if current_user_id != user_id:
            return jsonify({"error": "Forbidden"}), 403

        # Validate input
        current_pw = data.get("CurrentPassword")
        new_pw = data.get("NewPassword")
        if not current_pw or not new_pw:
            return jsonify({"error": "CurrentPassword and NewPassword are required"}), 400
        if current_pw == new_pw:
            return jsonify({"error": "New password must be different from current password"}), 400

        # Get existing user
        existing_user = users.find_one({"userId": user_id})
        if not existing_user:
            return jsonify({"error": "User not found"}), 404

        # Verify current password (existing_user["Password"] should be the stored hash)
        if not check_password_hash(existing_user.get("Password", ""), current_pw):
            # Generic message preferred to avoid user enumeration
            return jsonify({"error": "Authentication failed"}), 401

        # Hash new password and update document correctly
        hashed_pw = generate_password_hash(new_pw)  # consider stronger algorithm/config
        result = users.update_one(
            {"userId": user_id},
            {"$set": {"Password": hashed_pw}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "User not found during update"}), 404
        if result.modified_count == 0:
            # This can mean the new hash is identical to stored hash (rare) or no change applied
            logger.info("Password update did not modify document for user %s", user_id)

        logger.info("Password changed for user %s", user_id)
        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        logger.exception("Error changing password for user %s", user_id)
        return jsonify({"error": "An error occurred while changing password"}), 500
 
@auth_bp.route('/api/users', methods=['POST'])
def register_user():
    try:
        data = request.json
        logger.info("Registering new user")
        required_fields = ["userName", "userMail", "phoneNumber", "branch"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        # Check if user already exists
        if users.find_one({"userMail": data.get("userMail")}):
            return jsonify({"error": "User already exists"}), 400
        # Create user with default password
        email = data.get("userMail", "").strip().lower()
        role = data.get("Role", "").strip()
        if "@" not in email:
            return jsonify({"error": "userMail must be a valid email"}), 400
        local_part = email.split("@", 1)[0]
        user_id = f"{local_part}_{role}".lower().replace(" ", "_")

        # Ensure the generated userId is unique; if taken, return error (simple behavior)
        if users.find_one({"userId": user_id}):
            return jsonify({"error": "userId already exists. Please use a different role or email"}), 409
        # Create user with default password
        hashed_pw = generate_password_hash("Maventory@123")
        user_doc = {
            "userId": user_id,
            "userName": data.get("userName"),
            "userMail": email,
            "phoneNumber": data.get("phoneNumber"),
            "branch": data.get("branch"),
            "User_Type": role,
            "Password": hashed_pw,
            "ProfileImage": "profile-img.jpg"
        }
        result = users.insert_one(user_doc)
        logger.info(f"Registered new user: {user_doc['userMail']}")
        user_doc["_id"] = str(result.inserted_id)
        user_doc.pop("Password", None)  # Remove password from response
        return jsonify(user_doc), 201
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        return jsonify({"error": "An error occurred while registering user"}), 500
 
@auth_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Deleting user: {user_id}")
        result = users.delete_one({"userId": user_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Id Not Found"}), 404
        logger.info(f"Deleted user {user_id}")
        return jsonify({"message": f"{user_id} has been deleted"}), 200
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting user"}), 500
 
@auth_bp.route('/api/users/<int:user_id>/upload', methods=['PUT'])
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
            {"userId": user_id},
            {"$set": {"ProfileImage": filename}}
        )
        logger.info(f"Uploaded profile image for user {user_id}")
        return jsonify({"FileName": filename}), 200
    except Exception as e:
        logger.error(f"Error uploading profile image: {str(e)}")
        return jsonify({"error": "Failed to upload image"}), 500
 
@auth_bp.route('/api/users/<int:user_id>/profileImage', methods=['GET'])
def get_profile_image(user_id):
    try:
        logger.info(f"Fetching profile image for user: {user_id}")
        user = users.find_one({"userId": user_id})
        if not user or not user.get("ProfileImage"):
            # Return default image logic would go here
            return jsonify({"error": "No profile image available"}), 404
        # In production, serve actual image file
        # For now, return filename
        return jsonify({"ProfileImage": user["ProfileImage"]}), 200
    except Exception as e:
        logger.error(f"Error fetching profile image: {str(e)}")
        return jsonify({"error": "Image not found"}), 404