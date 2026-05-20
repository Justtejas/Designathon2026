from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from auth import get_user_id, get_user_role, is_admin, get_next_sequence
from datetime import datetime
import os
import logging
from dotenv import load_dotenv
from bson.objectid import ObjectId
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
import re
 
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
 
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['MaventoryDB']
audits = db['Audits']
assets = db['Assets']
users = db['users']
asset_allocations = db['AssetAllocations']
 
# Email Configuration
SENDER_EMAIL = os.getenv('SENDER_EMAIL')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
 
audits_blueprint = Blueprint('audits', __name__)
 
def send_email(recipient_email, subject, message):
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(message, 'html'))
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, recipient_email, text)
        server.quit()
        logger.info(f"Email sent to {recipient_email}: {subject}")
        return True
    except Exception as e:
        logger.info(f"Failed to send email to {recipient_email}: {str(e)}")
        return False
 
def send_audit_notification(user_email, audit_id, notification_type):
    """Send audit-specific notifications"""
    if notification_type == "Completed":
        subject = "Audit Request Completed"
        body = f"Greetings Maventory,<br><br>Audit Request for Audit ID: {audit_id} has been Completed."
    elif notification_type == "InProgress":
        subject = "Audit Request In Progress"
        body = f"Greetings Maventory,<br><br>Audit Request for Audit ID: {audit_id} has been set to InProgress."
    else:
        return False
    return send_email(user_email, subject, body)
 
def get_admin_users():
    """Get all admin users"""
    return list(users.find({"User_Type": "Admin"}))
 
def serialize_audit_doc(doc):
    """Serialize MongoDB audit document to match C# AuditsDto"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        status_map = {
            "Completed": "Completed",
            "InProgress": "InProgress", 
            "Sent": "Sent"
        }
        auditStatus = doc.get('auditStatus', 'Sent')
        display_status = status_map.get(auditStatus, auditStatus)
        existing_user = users.find_one({"userId": doc.get('userId')})
        existing_asset = assets.find_one({"assetId": doc.get('assetId')})
        return {
            "auditId": doc.get('auditId'),
            "assetId": doc.get('assetId'),
            "userId": doc.get('userId'),
            "auditDate": doc.get('auditDate'),
            "auditMessage": doc.get('auditMessage'),
            "auditStatus": display_status,
            "assetName": existing_asset.get('assetName'),
            "userName": existing_user.get('userName')
        }
    return None
 
@audits_blueprint.route("/api/Audits/allocated-assets", methods=["GET"])
def get_allocated_assets():
    try:
        logger.info("Fetching allocated assets for audit")
        pipeline = [
            {"$lookup": {
                "from": "Assets",
                "localField": "assetId",
                "foreignField": "assetId",
                "as": "asset"
            }},
            {"$unwind": {"path": "$asset", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "Users",
                "localField": "userId",
                "foreignField": "userId",
                "as": "user"
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "_id": 0,
                    "assetId": "$assetId",
                    "assetName": "$asset.assetName",
                    "userId": "$userId",
                    "userName": "$user.userName"
                }
            }
        ]
        allocated_assets = list(asset_allocations.aggregate(pipeline))
        return jsonify(allocated_assets), 200
    except Exception as e:
        logger.info(f"Error fetching allocated assets: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@audits_blueprint.route("/api/Audits", methods=["GET"])
def get_audits():
    try:
        user_id = get_user_id()
        logger.info(f"Fetching audits for user: {user_id}")
        if is_admin():
            # Admin sees all audits
            audits_list = list(audits.find({}).sort("auditDate", -1))
        else:
            # Executive sees only their audits
            audits_list = list(audits.find({"userId": user_id}).sort("auditDate", -1))
        if not audits_list:
            return jsonify({"error": "id not Found"}), 404
        serialized_audits = [serialize_audit_doc(audit) for audit in audits_list]
        return jsonify(serialized_audits), 200
    except Exception as e:
        logger.info(f"Error fetching audits: {str(e)}")
        return jsonify({"error": "An error occurred while fetching audits"}), 500
 
@audits_blueprint.route("/api/Audits/All", methods=["GET"])
def get_all_audits():
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info("Fetching all audits (Admin - top 5)")
        pipeline = [
            {"$lookup": {
                "from": "users",
                "localField": "userId",
                "foreignField": "userId",
                "as": "user"
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "Assets",
                "localField": "assetId",
                "foreignField": "assetId",
                "as": "asset"
            }},
            {"$unwind": {"path": "$asset", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "auditId": 1,
                    "assetId": 1,
                    "userId": 1,
                    "auditDate": 1,
                    "auditMessage": 1,
                    "auditStatus": 1,
                    "assetName": "$asset.assetName",
                    "userName": "$user.userName"
                }
            },
            {"$sort": {"auditDate": -1}},
            {"$limit": 5}
        ]
        audits_cursor = audits.aggregate(pipeline)
        audits_list = list(audits_cursor)
        serialized_audits = [serialize_audit_doc(audit) for audit in audits_list]
        return jsonify(serialized_audits), 200
    except Exception as e:
        logger.info(f"Error fetching all audits: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@audits_blueprint.route("/api/Audits/Audis/<int:audit_id>", methods=["GET"])
def get_audit_by_id(audit_id):
    try:
        logger.info(f"Fetching audit by ID: {audit_id}")
        pipeline = [
            {"$match": {"auditId": audit_id}},
            {"$lookup": {
                "from": "users",
                "localField": "userId",
                "foreignField": "userId",
                "as": "user"
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "Assets",
                "localField": "assetId",
                "foreignField": "assetId",
                "as": "asset"
            }},
            {"$unwind": {"path": "$asset", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "auditId": 1,
                    "assetId": 1,
                    "userId": 1,
                    "auditDate": 1,
                    "auditMessage": 1,
                    "auditStatus": 1,
                    "assetName": "$asset.assetName",
                    "userName": "$user.userName"
                }
            }
        ]
        audit_cursor = audits.aggregate(pipeline)
        audit_list = list(audit_cursor)
        if not audit_list:
            return jsonify({"error": "Audit not found"}), 404
        serialized_audit = serialize_audit_doc(audit_list[0])
        return jsonify(serialized_audit), 200
    except Exception as e:
        logger.info(f"Error fetching audit {audit_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@audits_blueprint.route("/api/Audits/<int:audit_id>", methods=["GET"])
def get_audit(audit_id):
    try:
        user_id = get_user_id()
        logger.info(f"Fetching audit {audit_id}")
        if is_admin():
            # Admin can see any audit
            pipeline = [{"$match": {"auditId": audit_id}}]
        else:
            # Executive can only see their own audits
            pipeline = [{"$match": {"auditId": audit_id, "userId": user_id}}]
        pipeline += [
            {"$lookup": {
                "from": "users",
                "localField": "userId",
                "foreignField": "userId",
                "as": "user"
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "Assets",
                "localField": "assetId",
                "foreignField": "assetId",
                "as": "asset"
            }},
            {"$unwind": {"path": "$asset", "preserveNullAndEmptyArrays": True}}
        ]
        audit_cursor = audits.aggregate(pipeline)
        audit_list = list(audit_cursor)
        if not audit_list:
            return jsonify({"error": "id not Found"}), 404
        serialized_audit = serialize_audit_doc(audit_list[0])
        return jsonify(serialized_audit), 200
    except Exception as e:
        logger.info(f"Error fetching audit {audit_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@audits_blueprint.route("/api/Audits/<int:audit_id>", methods=["PUT"])
def put_audit(audit_id):
    try:
        user_id = get_user_id()
        if get_user_role() != "Executive":
            return jsonify({"error": "Executive access required"}), 403
        data = request.get_json()
        logger.info(f"Updating audit {audit_id}")
        if data.get("auditId") != audit_id:
            return jsonify({"error": "Audit ID mismatch"}), 400
        # Check if audit exists and belongs to user
        existing_audit = audits.find_one({"auditId": audit_id})
        if not existing_audit:
            return jsonify({"error": "id not Found"}), 404
        if existing_audit.get("userId") != user_id:
            return jsonify({"error": f"Sorry you are not User {user_id}"}), 403
        # Validate status
        new_status = data.get("auditStatus")
        valid_statuses = ["Completed", "InProgress", "Sent"]
        if new_status not in valid_statuses:
            return jsonify({"error": f"Invalid Audit Status: {new_status}"}), 400
        # Update audit
        update_result = audits.update_one(
            {"auditId": audit_id},
            {
                "$set": {
                    "auditDate": data.get("auditDate", existing_audit.get("auditDate")),
                    "auditMessage": data.get("auditMessage", existing_audit.get("auditMessage")),
                    "auditStatus": new_status
                }
            }
        )
        if update_result.matched_count == 0:
            return jsonify({"error": "No Audit Exists"}), 404
        # Send notifications to admins
        admin_users = get_admin_users()
        for admin in admin_users:
            send_audit_notification(
                admin.get("userMail"), 
                audit_id, 
                new_status
            )
        logger.info(f"Updated audit {audit_id} to status: {new_status}")
        return jsonify({"message": "Audit Sent Successfully"}), 200
    except Exception as e:
        logger.info(f"Error updating audit {audit_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating audit"}), 500
 
@audits_blueprint.route("/api/Audits", methods=["POST"])
def post_audit():
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info("Creating new audit")
        auditId = get_next_sequence("audit")
        audit_doc = {
            "auditId": auditId,
            "assetId": data.get("assetId"),
            "userId": data.get("userId"),
            "auditDate": data.get("auditDate", datetime.now().isoformat()),
            "auditMessage": data.get("auditMessage"),
            "auditStatus": "Sent"
        }
        result = audits.insert_one(audit_doc)
        logger.info(f"Created audit with ID: {result.inserted_id}")
        # Notify executive
        executive = users.find_one({"userId": audit_doc["userId"]})
        # if executive:
        #     send_email(
        #         executive["userMail"],
        #         "Audit Request",
        #         f"Dear {executive['userName']},<br><br>You have been assigned an Audit Request {audit_doc['auditId']} which needs to be completed ASAP.<br><br>Best regards,<br>Maventory"
        #     )
        # else:
        #     return jsonify({"error": "Executive not found"}), 404
        audit_doc["_id"] = str(result.inserted_id)
        return jsonify(audit_doc), 201
    except Exception as e:
        logger.info(f"Error creating audit: {str(e)}")
        return jsonify({"error": "An error occurred while creating audit"}), 500
 
@audits_blueprint.route("/api/Audits/<int:audit_id>", methods=["DELETE"])
def delete_audit(audit_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Deleting audit {audit_id}")
        existing_audit = audits.find_one({"auditId": audit_id})
        if not existing_audit:
            return jsonify({"error": f"Audit with ID {audit_id} not found"}), 404
        if existing_audit.get("auditStatus") == "Completed":
            return jsonify({"error": "Cannot delete a completed audit"}), 400
        result = audits.delete_one({"auditId": audit_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete audit"}), 404
        logger.info(f"Deleted audit {audit_id}")
        return jsonify({"message": "Audit Deleted Successfully"}), 200
    except Exception as e:
        logger.info(f"Error deleting audit {audit_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting audit"}), 500