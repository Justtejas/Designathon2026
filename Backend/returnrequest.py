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
return_requests = db['ReturnRequests']
assets = db['Assets']
users = db['users']
asset_allocations = db['AssetAllocations']
asset_requests = db['AssetRequests']
categories = db['Categories']
 
return_requests_blueprint = Blueprint('return_requests', __name__)
 
def is_admin():
    """Check if user is admin"""
    return get_user_role() == "Admin"
 
def serialize_return_simple(doc):
    """Serialize basic ReturnRequest"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "returnId": doc.get('returnId'),
            "userId": doc.get('userId'),
            "assetId": doc.get('assetId'),
            "categoryId": doc.get('categoryId'),
            "returnDate": doc.get('returnDate'),
            "Reason": doc.get('Reason'),
            "Condition": doc.get('Condition'),
            "returnStatus": doc.get('returnStatus', 'Sent')
        }
    return None
 
def serialize_return_class(doc):
    """Serialize ReturnClassDto with full details"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return_status = doc.get('returnStatus', 'Sent')
        return {
            "returnId": doc.get('returnId'),
            "userId": doc.get('userId'),
            "userName": doc.get('userName'),
            "assetName": doc.get('assetName'),
            "assetId": doc.get('assetId'),
            "categoryId": doc.get('categoryId'),
            "categoryName": doc.get('categoryName'),
            "returnDate": doc.get('returnDate'),
            "Reason": doc.get('Reason'),
            "Condition": doc.get('Condition'),
            "returnStatus": return_status
        }
    return None
 
def user_has_asset(user_id):
    """Check if user has allocated assets"""
    return asset_allocations.find_one({"userId": user_id}) is not None
 
def handle_return_status_update(return_doc, return_status):
    """Handle complex return status logic"""
    if return_status in ["Approved", "Returned", "Rejected"]:
        return_doc["returnDate"] = datetime.now().isoformat()
        # Update asset status if returned
        if return_status == "Returned":
            assets.update_one(
                {"assetId": return_doc["assetId"]},
                {"$set": {"assetStatus": "OpenToRequest"}}
            )
            # Delete allocation
            asset_allocations.delete_one({
                "assetId": return_doc["assetId"],
                "userId": return_doc["userId"]
            })
            # Delete related asset request
            asset_requests.delete_one({
                "assetId": return_doc["assetId"],
                "userId": return_doc["userId"],
                "requestStatus": "Allocated"
            })
 
@return_requests_blueprint.route("/api/ReturnRequests/all", methods=["GET"])
def get_all_return_requests():
    try:
        logger.info("Fetching all return requests")
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
            {"$lookup": {
                "from": "Categories",
                "localField": "categoryId",
                "foreignField": "categoryId",
                "as": "category"
            }},
            {"$unwind": {"path": "$category", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "_id": 0,
                    "returnId": "$returnId",
                    "userId": "$userId",
                    "userName": "$user.userName",
                    "assetName": "$asset.assetName",
                    "assetId": "$assetId",
                    "categoryId": "$categoryId",
                    "categoryName": "$category.categoryName",
                    "returnDate": 1,
                    "Reason": 1,
                    "Condition": 1,
                    "returnStatus": {"$ifNull": ["$returnStatus", "Sent"]}
                }
            },
            {"$sort": {"returnDate": -1}}
        ]
        requests_cursor = return_requests.aggregate(pipeline)
        requests_list = list(requests_cursor)
        serialized_requests = [serialize_return_class(req) for req in requests_list]
        return jsonify(serialized_requests), 200
    except Exception as e:
        logger.info(f"Error fetching all return requests: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@return_requests_blueprint.route("/api/ReturnRequests", methods=["GET"])
def get_user_return_requests():
    try:
        user_id = get_user_id()
        logger.info(f"Fetching return requests for user: {user_id}")
        requests_list = list(return_requests.find({"userId": user_id}).sort("returnDate", -1))
        if not requests_list:
            return jsonify({"error": "No details found"}), 404
        serialized_requests = [serialize_return_simple(req) for req in requests_list]
        return jsonify(serialized_requests), 200
    except Exception as e:
        logger.info(f"Error fetching user return requests: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@return_requests_blueprint.route("/api/ReturnRequests/GetByreturnId/<int:return_id>", methods=["GET"])
def get_return_request_by_id(return_id):
    try:
        logger.info(f"Fetching return request by ID: {return_id}")
        pipeline = [
            {"$match": {"returnId": return_id}},
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
            {"$lookup": {
                "from": "Categories",
                "localField": "categoryId",
                "foreignField": "categoryId",
                "as": "category"
            }},
            {"$unwind": {"path": "$category", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "_id": 0,
                    "returnId": "$returnId",
                    "userId": "$userId",
                    "userName": "$user.userName",
                    "assetName": "$asset.assetName",
                    "assetId": "$assetId",
                    "categoryId": "$categoryId",
                    "categoryName": "$category.categoryName",
                    "returnDate": 1,
                    "Reason": 1,
                    "Condition": 1,
                    "returnStatus": {"$ifNull": ["$returnStatus", "Sent"]}
                }
            }
        ]
        request_cursor = return_requests.aggregate(pipeline)
        request_list = list(request_cursor)
        if not request_list:
            return jsonify({"error": f"Return request not found"}), 404
        serialized_request = serialize_return_class(request_list[0])
        return jsonify(serialized_request), 200
    except Exception as e:
        logger.info(f"Error fetching return request {return_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@return_requests_blueprint.route("/api/ReturnRequests/<int:return_id>", methods=["GET"])
def get_return_request_admin(return_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Admin fetching return request: {return_id}")
        pipeline = [
            {"$match": {"returnId": return_id}},
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
            {"$lookup": {
                "from": "Categories",
                "localField": "categoryId",
                "foreignField": "categoryId",
                "as": "category"
            }},
            {"$unwind": {"path": "$category", "preserveNullAndEmptyArrays": True}}
        ]
        request_cursor = return_requests.aggregate(pipeline)
        request_list = list(request_cursor)
        if not request_list:
            return jsonify({"error": f"Details for the request ID {return_id} not found"}), 404
        return jsonify(request_list[0]), 200
    except Exception as e:
        logger.info(f"Error fetching admin return request {return_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@return_requests_blueprint.route("/api/ReturnRequests/<int:return_id>", methods=["PUT"])
def put_return_request(return_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info(f"Updating return request {return_id}")
        if data.get("returnId") != return_id:
            return jsonify({"error": "Return ID mismatch"}), 400
        # Get existing request
        existing_request = return_requests.find_one({"returnId": return_id})
        if not existing_request:
            return jsonify({"error": f"Details for the request ID {return_id} not found"}), 404
        # Update fields
        update_data = {
            "$set": {
                "userId": data.get("userId", existing_request.get("userId")),
                "assetId": data.get("assetId", existing_request.get("assetId")),
                "categoryId": data.get("categoryId", existing_request.get("categoryId")),
                "returnDate": data.get("returnDate", existing_request.get("returnDate")),
                "Reason": data.get("Reason", existing_request.get("Reason")),
                "Condition": data.get("Condition", existing_request.get("Condition")),
                "returnStatus": data.get("returnStatus", existing_request.get("returnStatus", "Sent"))
            }
        }
        new_status = data.get("returnStatus")
        # Handle status change logic
        handle_return_status_update(existing_request, new_status)
        result = return_requests.update_one({"returnId": return_id}, update_data)
        if result.matched_count == 0:
            return jsonify({"error": f"Details for the request ID {return_id} not found"}), 404
        logger.info(f"Updated return request {return_id} to status: {new_status}")
        return jsonify({"message": "Return request updated successfully"}), 204
    except Exception as e:
        logger.info(f"Error updating return request {return_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating return request"}), 500
 
@return_requests_blueprint.route("/api/ReturnRequests", methods=["POST"])
def post_return_request():
    try:
        user_id = get_user_id()
        if get_user_role() != "Employee":
            return jsonify({"error": "Employee access required"}), 403
        data = request.get_json()
        logger.info(f"Creating return request for user: {user_id}")
        if not user_has_asset(user_id):
            return jsonify({"error": "User does not have an asset to return"}), 400
        returnId = get_next_sequence("Return")
        existing_asset = assets.find_one({"assetId": data.get("assetId")})
        return_request_doc = {
            "returnId": returnId,
            "userId": user_id,
            "assetId": data.get("assetId"),
            "categoryId": existing_asset.get("categoryId"),
            "returnDate": data.get("returnDate"),
            "Reason": data.get("Reason"),
            "Condition": data.get("Condition"),
            "returnStatus": "Sent"
        }
        result = return_requests.insert_one(return_request_doc)
        logger.info(f"Created return request with ID: {result.inserted_id}")
        return_request_doc["_id"] = str(result.inserted_id)
        return jsonify(return_request_doc), 201
    except Exception as e:
        logger.info(f"Error creating return request: {str(e)}")
        return jsonify({"error": "An error occurred while creating return request"}), 500
 
@return_requests_blueprint.route("/api/ReturnRequests/<int:return_id>", methods=["DELETE"])
def delete_return_request(return_id):
    try:
        user_id = get_user_id()
        if get_user_role() != "Employee":
            return jsonify({"error": "Employee access required"}), 403
        logger.info(f"Deleting return request {return_id} for user {user_id}")
        # Check ownership
        request_doc = return_requests.find_one({"returnId": return_id, "userId": user_id})
        if not request_doc:
            return jsonify({"error": f"Details for the request ID {return_id} not found"}), 404
        if request_doc.get("userId") != user_id:
            return jsonify({"error": "You are not allowed to delete other records"}), 403
        result = return_requests.delete_one({"returnId": return_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete return request"}), 404
        logger.info(f"Deleted return request {return_id}")
        return jsonify({"message": f"Deletion occurred for ID {return_id}"}), 200
    except Exception as e:
        logger.info(f"Error deleting return request {return_id}: {str(e)}")
        return jsonify({"error": f"Failed to delete return request: {str(e)}"}), 400