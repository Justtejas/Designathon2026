from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from auth import get_user_id, get_user_role
from datetime import datetime
import os
import logging
from dotenv import load_dotenv
from bson.objectid import ObjectId
from dateutil import parser
 
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
 
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['MaventoryDB']
maintenance_logs = db['MaintenanceLogs']
assets = db['Assets']
users = db['Users']
 
maintenance_logs_blueprint = Blueprint('maintenance_logs', __name__)

def is_admin():
    """Check if user is admin"""
    role = get_user_role()
    return role == "Admin"
 
def serialize_maintenance_simple(doc):
    """Serialize basic maintenance log"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "MaintenanceId": doc.get('MaintenanceId'),
            "assetId": doc.get('assetId'),
            "userId": doc.get('userId'),
            "Maintenance_date": doc.get('Maintenance_date'),
            "Cost": doc.get('Cost'),
            "Maintenance_Description": doc.get('Maintenance_Description')
        }
    return None
 
def serialize_maintenance_class(doc):
    """Serialize MaintenanceClassDto with asset/user info"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "MaintenanceId": doc.get('MaintenanceId'),
            "assetId": doc.get('assetId'),
            "assetName": doc.get('assetName'),
            "userId": doc.get('userId'),
            "userName": doc.get('userName'),
            "Maintenance_date": doc.get('Maintenance_date'),
            "Cost": doc.get('Cost'),
            "Maintenance_Description": doc.get('Maintenance_Description')
        }
    return None
 
@maintenance_logs_blueprint.route("/api/MaintenanceLogs/AllLog", methods=["GET"])
def get_all_maintenance_log():
    try:
        logger.info("Fetching all maintenance logs (class DTO)")
        # Aggregation to join with assets and users
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
                    "MaintenanceId": "$MaintenanceId",
                    "assetId": "$assetId",
                    "assetName": "$asset.assetName",
                    "userId": "$userId",
                    "userName": "$user.userName",
                    "Maintenance_date": 1,
                    "Cost": 1,
                    "Maintenance_Description": 1
                }
            },
            {"$sort": {"Maintenance_date": -1}}
        ]
        logs_cursor = maintenance_logs.aggregate(pipeline)
        logs_list = list(logs_cursor)
        serialized_logs = [serialize_maintenance_class(log) for log in logs_list]
        return jsonify(serialized_logs), 200
    except Exception as e:
        logger.info(f"Error fetching all maintenance logs: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@maintenance_logs_blueprint.route("/api/MaintenanceLogs", methods=["GET"])
def get_maintenance_logs():
    try:
        user_id = get_user_id()
        logger.info(f"Fetching maintenance logs for user: {user_id}")
        if is_admin():
            # Admin sees all logs
            logs_list = list(maintenance_logs.find({}).sort("Maintenance_date", -1))
        else:
            # User sees only their logs
            logs_list = list(maintenance_logs.find({"userId": user_id}).sort("Maintenance_date", -1))
        if not logs_list:
            user_msg = f"No maintenance logs found for user {user_id}"
            logger.info(user_msg)
            return jsonify({"error": user_msg}), 404
        serialized_logs = [serialize_maintenance_simple(log) for log in logs_list]
        return jsonify(serialized_logs), 200
    except Exception as e:
        logger.info(f"Error fetching maintenance logs: {str(e)}")
        return jsonify({"error": "An error occurred while fetching maintenance logs"}), 500
 
@maintenance_logs_blueprint.route("/api/MaintenanceLogs/id/<int:log_id>", methods=["GET"])
def get_maintenance_log_by_id(log_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Fetching maintenance log by ID: {log_id}")
        pipeline = [
            {"$match": {"MaintenanceId": log_id}},
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
                    "MaintenanceId": "$MaintenanceId",
                    "assetId": "$assetId",
                    "assetName": "$asset.assetName",
                    "userId": "$userId",
                    "userName": "$user.userName",
                    "Maintenance_date": 1,
                    "Cost": 1,
                    "Maintenance_Description": 1
                }
            }
        ]
        logs_cursor = maintenance_logs.aggregate(pipeline)
        logs_list = list(logs_cursor)
        if not logs_list:
            return jsonify({"error": f"No maintenance log found with ID {log_id}"}), 404
        serialized_log = serialize_maintenance_class(logs_list[0])
        return jsonify(serialized_log), 200
    except Exception as e:
        logger.info(f"Error fetching maintenance log {log_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@maintenance_logs_blueprint.route("/api/MaintenanceLogs/<int:user_id>", methods=["GET"])
def get_maintenance_log_by_user(user_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Fetching maintenance logs for user: {user_id}")
        logs_list = list(maintenance_logs.find({"userId": user_id}).sort("Maintenance_date", -1))
        if not logs_list:
            return jsonify({"error": f"No maintenance logs found for user {user_id}"}), 404
        serialized_logs = [serialize_maintenance_simple(log) for log in logs_list]
        return jsonify(serialized_logs), 200
    except Exception as e:
        logger.info(f"Error fetching maintenance logs for user {user_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@maintenance_logs_blueprint.route("/api/MaintenanceLogs/<int:log_id>", methods=["PUT"])
def put_maintenance_log(log_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info(f"Updating maintenance log {log_id}")
        # Validate required fields
        required_fields = ["Maintenance_date", "Cost", "Maintenance_Description"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        # Get existing log
        existing_log = maintenance_logs.find_one({"MaintenanceId": log_id})
        if not existing_log:
            return jsonify({"error": f"No maintenance log found with ID {log_id}"}), 404
        update_data = {
            "$set": {
                "Maintenance_date": data.get("Maintenance_date"),
                "Cost": float(data.get("Cost")),
                "Maintenance_Description": data.get("Maintenance_Description")
            }
        }
        result = maintenance_logs.update_one({"MaintenanceId": log_id}, update_data)
        if result.matched_count == 0:
            return jsonify({"error": f"No maintenance log found with ID {log_id}"}), 404
        logger.info(f"Updated maintenance log {log_id}")
        return jsonify({"message": "Update successful"}), 200
    except Exception as e:
        logger.info(f"Error updating maintenance log {log_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating maintenance log"}), 500
 
@maintenance_logs_blueprint.route("/api/MaintenanceLogs/<int:log_id>", methods=["DELETE"])
def delete_maintenance_log(log_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Deleting maintenance log {log_id}")
        result = maintenance_logs.delete_one({"MaintenanceId": log_id})
        if result.deleted_count == 0:
            logger.warning(f"Maintenance log {log_id} not found")
            return jsonify({"error": f"Maintenance log with ID {log_id} not found"}), 404
        logger.info(f"Deleted maintenance log {log_id}")
        return jsonify({"message": f"Deletion occurred for ID {log_id}"}), 200
    except Exception as e:
        logger.info(f"Error deleting maintenance log {log_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting maintenance log"}), 500