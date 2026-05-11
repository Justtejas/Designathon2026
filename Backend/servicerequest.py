from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from auth import get_user_id, get_user_role,get_next_sequence
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
service_requests = db['ServiceRequests']
assets = db['Assets']
users = db['Users']
maintenance_logs = db['MaintenanceLogs']
 
service_requests_blueprint = Blueprint('service_requests', __name__)
 
def is_admin():
    """Check if user is admin"""
    return get_user_role() == "Admin"
 
def serialize_service_simple(doc):
    """Serialize basic ServiceRequest"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "ServiceId": doc.get('ServiceId'),
            "assetId": doc.get('assetId'),
            "userId": doc.get('userId'),
            "ServiceRequestDate": doc.get('ServiceRequestDate'),
            "Issue_Type": doc.get('Issue_Type', 'Repair'),
            "ServiceDescription": doc.get('ServiceDescription'),
            "ServiceReqStatus": doc.get('ServiceReqStatus', 'UnderReview')
        }
    return None
 
def serialize_service_class(doc):
    """Serialize ServiceClassDto with full details"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "ServiceId": doc.get('ServiceId'),
            "userName": doc.get('userName'),
            "userId": doc.get('userId'),
            "assetId": doc.get('assetId'),
            "assetName": doc.get('assetName'),
            "ServiceDescription": doc.get('ServiceDescription'),
            "ServiceRequestDate": doc.get('ServiceRequestDate'),
            "Issue_Type": doc.get('Issue_Type', 'Repair'),
            "serviceReqStatus": doc.get('ServiceReqStatus', 'UnderReview')
        }
    return None
 
def asset_exists(asset_id):
    """Check if asset exists"""
    return assets.find_one({"assetId": asset_id}) is not None
 
@service_requests_blueprint.route("/api/ServiceRequests", methods=["GET"])
def get_service_requests():
    try:
        user_id = get_user_id()
        logger.info(f"Fetching service requests for user: {user_id}")
        if is_admin():
            # Admin sees all requests
            pipeline = [
                {"$lookup": {
                    "from": "Users",
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
                        "_id": 0,
                        "ServiceId": "$ServiceId",
                        "userName": "$user.userName",
                        "userId": "$userId",
                        "assetId": "$assetId",
                        "assetName": "$asset.assetName",
                        "ServiceDescription": 1,
                        "ServiceRequestDate": 1,
                        "Issue_Type": {"$ifNull": ["$Issue_Type", "Repair"]},
                        "serviceReqStatus": {"$ifNull": ["$ServiceReqStatus", "UnderReview"]}
                    }
                },
                {"$sort": {"ServiceRequestDate": -1}}
            ]
        else:
            # User sees only their requests
            pipeline = [
                {"$match": {"userId": user_id}},
                {"$lookup": {
                    "from": "Users",
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
                        "_id": 0,
                        "ServiceId": "$ServiceId",
                        "userName": "$user.userName",
                        "userId": "$userId",
                        "assetId": "$assetId",
                        "assetName": "$asset.assetName",
                        "ServiceDescription": 1,
                        "ServiceRequestDate": 1,
                        "Issue_Type": {"$ifNull": ["$Issue_Type", "Repair"]},
                        "serviceReqStatus": {"$ifNull": ["$ServiceReqStatus", "UnderReview"]}
                    }
                },
                {"$sort": {"ServiceRequestDate": -1}}
            ]
        requests_cursor = service_requests.aggregate(pipeline)
        requests_list = list(requests_cursor)
        if not requests_list:
            user_msg = f"No service requests found for user {user_id}"
            if is_admin():
                user_msg = "No service requests found"
            logger.info(user_msg)
            return jsonify({"error": user_msg}), 404
        serialized_requests = [serialize_service_class(req) for req in requests_list]
        return jsonify(serialized_requests), 200
    except Exception as e:
        logger.info(f"Error fetching service requests: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@service_requests_blueprint.route("/api/ServiceRequests/<int:service_id>", methods=["PUT"])
def put_service_request(service_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info(f"Updating service request {service_id}")
        if data.get("ServiceId") != service_id:
            return jsonify({"error": f"Given IDs {service_id} and {data.get('ServiceId')} don't match"}), 400
        # Get existing request
        existing_request = service_requests.find_one({"ServiceId": service_id})
        if not existing_request:
            return jsonify({"error": f"Service request with ID {service_id} not found"}), 404
        new_status = data.get("serviceReqStatus")
        valid_statuses = ["UnderReview", "Approved", "Completed", "Rejected"]
        if new_status not in valid_statuses:
            return jsonify({"error": "Invalid ServiceReqStatus value"}), 400
        # Prepare update data
        update_data = {
            "$set": {
                "assetId": data.get("assetId", existing_request.get("assetId")),
                "userId": data.get("userId", existing_request.get("userId")),
                "ServiceRequestDate": data.get("ServiceRequestDate", existing_request.get("ServiceRequestDate")),
                "Issue_Type": data.get("Issue_Type", existing_request.get("Issue_Type", "Repair")),
                "ServiceDescription": data.get("ServiceDescription", existing_request.get("ServiceDescription")),
                "ServiceReqStatus": new_status
            }
        }
        # Handle status-specific logic
        if new_status == "Approved":
            # Set asset to UnderMaintenance
            assets.update_one(
                {"assetId": data.get("assetId")},
                {"$set": {"assetStatus": "UnderMaintenance"}}
            )
            # Create maintenance log
            maintenanceId = get_next_sequence("maintenance")
            maintenance_log = {
                "maintenanceId": maintenanceId,
                "assetId": data.get("assetId"),
                "userId": data.get("userId"),
                "maintenanceDate": datetime.now().isoformat(),
                "maintenanceDescription": data.get("ServiceDescription")
            }
            maintenance_logs.insert_one(maintenance_log)
        elif new_status == "Completed":
            # Set asset back to Allocated
            assets.update_one(
                {"assetId": data.get("assetId")},
                {"$set": {"assetStatus": "Allocated"}}
            )
        # Update service request
        result = service_requests.update_one({"ServiceId": service_id}, update_data)
        if result.matched_count == 0:
            return jsonify({"error": f"Service request with ID {service_id} not found"}), 404
        logger.info(f"Updated service request {service_id} to status: {new_status}")
        return jsonify({"message": "Data modified successfully"}), 200
    except Exception as e:
        logger.info(f"Error updating service request {service_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating service request"}), 500
 
@service_requests_blueprint.route("/api/ServiceRequests", methods=["POST"])
def post_service_request():
    try:
        user_id = get_user_id()
        if get_user_role() != "Employee":
            return jsonify({"error": "Employee access required"}), 403
        data = request.get_json()
        logger.info(f"Creating service request for user: {user_id}")
        # Validate asset exists
        if not asset_exists(data.get("assetId")):
            return jsonify({"error": "Invalid Asset. Asset Not Found"}), 400
        service_request_doc = {
            "ServiceId": data.get("ServiceId"),
            "assetId": data.get("assetId"),
            "userId": user_id,
            "ServiceRequestDate": data.get("ServiceRequestDate", datetime.now().isoformat()),
            "Issue_Type": data.get("Issue_Type", "Repair"),
            "ServiceDescription": data.get("ServiceDescription"),
            "ServiceReqStatus": "UnderReview"
        }
        result = service_requests.insert_one(service_request_doc)
        logger.info(f"Created service request with ID: {result.inserted_id}")
        service_request_doc["_id"] = str(result.inserted_id)
        return jsonify(service_request_doc), 201
    except Exception as e:
        logger.info(f"Error creating service request: {str(e)}")
        return jsonify({"error": "An error occurred while creating service request"}), 500
 
@service_requests_blueprint.route("/api/ServiceRequests/<int:service_id>", methods=["DELETE"])
def delete_service_request(service_id):
    try:
        user_id = get_user_id()
        if get_user_role() != "Employee":
            return jsonify({"error": "Employee access required"}), 403
        logger.info(f"Deleting service request {service_id} for user {user_id}")
        # Get request details
        request_doc = service_requests.find_one({"ServiceId": service_id})
        if not request_doc:
            return jsonify({"error": "ID's Mismatch"}), 404
        if request_doc.get("userId") != user_id:
            return jsonify({"error": "You are not able to delete"}), 403
        status = request_doc.get("ServiceReqStatus", "UnderReview")
        if status in ["Approved", "Completed"]:
            return jsonify({
                "error": f"The Service ID {service_id} for user {user_id} is already {status}"
            }), 400
        result = service_requests.delete_one({"ServiceId": service_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete service request"}), 404
        logger.info(f"Deleted service request {service_id}")
        return jsonify({"message": "Deletion of data occurred"}), 200
    except Exception as e:
        logger.info(f"Error deleting service request {service_id}: {str(e)}")
        return jsonify({"error": str(e)}), 400
 
@service_requests_blueprint.route("/api/ServiceRequests/Status/<status>", methods=["GET"])
def get_service_requests_by_status(status):
    try:
        logger.info(f"Fetching service requests by status: {status}")
        requests_list = list(service_requests.find({"ServiceReqStatus": status}))
        if not requests_list:
            return jsonify({"error": "No service requests found with the given status"}), 404
        serialized_requests = [serialize_service_simple(req) for req in requests_list]
        return jsonify(serialized_requests), 200
    except Exception as e:
        logger.info(f"Error fetching service requests by status {status}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
 
@service_requests_blueprint.route("/api/ServiceRequests/<int:service_id>", methods=["GET"])
def get_service_request_by_id(service_id):
    try:
        logger.info(f"Fetching service request by ID: {service_id}")
        pipeline = [
            {"$match": {"ServiceId": service_id}},
            {"$lookup": {
                "from": "Users",
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
                    "_id": 0,
                    "ServiceId": "$ServiceId",
                    "userName": "$user.userName",
                    "userId": "$userId",
                    "assetId": "$assetId",
                    "assetName": "$asset.assetName",
                    "ServiceDescription": 1,
                    "ServiceRequestDate": 1,
                    "Issue_Type": {"$ifNull": ["$Issue_Type", "Repair"]},
                    "serviceReqStatus": {"$ifNull": ["$ServiceReqStatus", "UnderReview"]}
                }
            }
        ]
        request_cursor = service_requests.aggregate(pipeline)
        request_list = list(request_cursor)
        if not request_list:
            return jsonify({"error": "Service request not found"}), 404
        serialized_request = serialize_service_class(request_list[0])
        return jsonify(serialized_request), 200
    except Exception as e:
        logger.info(f"Error fetching service request {service_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500