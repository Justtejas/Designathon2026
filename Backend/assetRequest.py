from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from auth import get_user_id, get_user_role,get_next_sequence
from datetime import datetime
import os
import logging
from dotenv import load_dotenv
from bson.objectid import ObjectId
from dateutil import parser
import calendar
 
load_dotenv()

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['MaventoryDB']  # Adjust database name as needed
asset_requests = db['AssetRequests']
assets = db['Assets']
users = db['Users']
categories = db['Categories']
asset_allocations = db['AssetAllocations']

asset_requests_blueprint = Blueprint('asset_requests', __name__)
 
def is_admin():
    """Check if user is admin"""
    role = get_user_role()
    return role == "Admin"
 
def serialize_asset_request(doc):
    """Serialize MongoDB document to match C# DTO structure"""
    if doc:
        existing_category = categories.find_one({"categoryId": doc.get('categoryId')})
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "assetReqId": doc.get('assetReqId'),
            "userName": doc.get('userName'),
            "userId": doc.get('userId'),
            "assetId": doc.get('assetId'),
            "assetName": doc.get('assetName'),
            "categoryName": existing_category.get('categoryName'),
            "assetReqDate": doc.get('assetReqDate'),
            "assetReqReason": doc.get('assetReqReason'),
            "requestStatus": doc.get('requestStatus', 'Pending')
        }
    return None
 
def parse_month_name(month_name):
    """Convert month name to month number"""
    try:
        return datetime.strptime(month_name, '%B').month
    except ValueError:
        raise ValueError(f"Invalid month name: {month_name}")
 
def get_requestStatus_enum(status_str):
    """Map string status to enum-like values"""
    status_map = {
        'Pending': 'Pending',
        'Allocated': 'Allocated', 
        'Rejected': 'Rejected'
    }
    return status_map.get(status_str, status_str)
 
@asset_requests_blueprint.route("/api/AssetRequests", methods=["GET"])
def get_asset_requests():
    try:
        user_id = get_user_id()
        logger.info("Fetching Asset Requests")
        if is_admin():
            # Admin can see all requests
            requests = list(asset_requests.find({}).sort("assetReqDate", -1))
            serialized_requests = [serialize_asset_request(req) for req in requests]
            logger.info("Fetched all Asset Requests for Admin")
            return jsonify(serialized_requests), 200
        else:
            # Regular user sees only their requests
            requests = list(asset_requests.find({"userId": user_id}).sort("assetReqDate", -1))
            if not requests:
                logger.info("Asset Request Not Found for user")
                return jsonify({"error": "No requests found"}), 404
            serialized_requests = [serialize_asset_request(req) for req in requests]
            logger.info(f"Fetched Asset Requests for user: {user_id}")
            return jsonify(serialized_requests), 200
    except Exception as e:
        logger.info(f"Error fetching asset requests: {str(e)}")
        return jsonify({"error": "An error occurred while fetching requests"}), 500

@asset_requests_blueprint.route("/api/AssetRequests/GetAll", methods=["GET"])
def get_all_asset_requests():
    try:
        logger.info("Fetching All Asset Requests")
        requests = list(asset_requests.find({}).sort("assetReqDate", -1))
        serialized_requests = [serialize_asset_request(req) for req in requests]
        return jsonify(serialized_requests), 200
    except Exception as e:
        logger.info(f"Error fetching all asset requests: {str(e)}")
        return jsonify({"error": "An error occurred while fetching all requests"}), 500
 
@asset_requests_blueprint.route("/api/AssetRequests/<int:asset_req_id>", methods=["GET"])
def get_asset_request_by_id(asset_req_id):
    try:
        logger.info(f"Fetching Asset Request by id: {asset_req_id}")
        request_doc = asset_requests.find_one({"assetReqId": asset_req_id})
        if not request_doc:
            return jsonify({"error": "Request not found"}), 404
        serialized_request = serialize_asset_request(request_doc)
        return jsonify(serialized_request), 200
    except Exception as e:
        logger.info(f"Error fetching asset request by id {asset_req_id}: {str(e)}")
        return jsonify({"error": "An error occurred while fetching request"}), 500
 
@asset_requests_blueprint.route("/api/AssetRequests", methods=["POST"])
def post_asset_request():
    try:
        user_id = get_user_id()
        data = request.get_json()
        logger.info("Adding Asset Requests Process Started")
        # Validate user can only create for themselves
        if data.get("userId") != user_id:
            return jsonify({"error": "You can only create a request for yourself"}), 403
        # Check if asset is available
        asset = assets.find_one({"assetId": data.get("assetId")})
        if not asset:
            return jsonify({"error": "Asset not found"}), 404
        assetStatus = asset.get("assetStatus", "Available")
        if assetStatus in ["Allocated", "UnderMaintenance"]:
            logger.info("Asset already allocated")
            return jsonify({"error": "The Requested Asset is currently locked (Allocated to another user)"}), 403
        # Prepare document
        assetReqId = get_next_sequence("assetReq")
        asset_request_doc = {
            "assetReqId": assetReqId,
            "userId": user_id,
            "assetId": data.get("assetId"),
            "categoryId": data.get("categoryId"),
            "assetReqDate": data.get("assetReqDate", datetime.now().isoformat()),
            "assetReqReason": data.get("assetReqReason"),
            "requestStatus": "Pending",
            "userName": data.get("userName"),
            "assetName": data.get("assetName"),
        }
        result = asset_requests.insert_one(asset_request_doc)
        logger.info(f"Added Asset Request with ID: {result.inserted_id}")
        return jsonify(asset_request_doc), 201
    except Exception as e:
        logger.info(f"Error creating asset request: {str(e)}")
        return jsonify({"error": "An error occurred while creating request"}), 500
 
@asset_requests_blueprint.route("/api/AssetRequests/<int:asset_req_id>", methods=["PUT"])
def put_asset_request(asset_req_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info("Update Asset Requests Process Started")
        # Check if ID matches
        if data.get("assetReqId") != asset_req_id:
            logger.info("Asset Requests Id Doesn't match")
            return jsonify({"error": "Id doesn't match"}), 400
        # Get existing request
        existing_request = asset_requests.find_one({"assetReqId": asset_req_id})
        if not existing_request:
            logger.info("Asset Request not found")
            return jsonify({"error": "Request not found"}), 404
        current_status = existing_request.get("requestStatus", "Pending")
        new_status = data.get("requestStatusName")
        if current_status in ["Allocated", "Rejected"]:
            return jsonify({"error": f"The Request ID {asset_req_id} has already been Allocated/Rejected and cannot be updated."}), 400
        # Update status
        update_data = {"requestStatus": new_status}
        if new_status == "Allocated":
            # Handle allocation logic
            allocation_exists = asset_allocations.find_one({"assetReqId": asset_req_id})
            if not allocation_exists:
                allocationId = get_next_sequence("allocation")
                allocation_doc = {
                    "allocationId": allocationId,
                    "assetId": data.get("assetId"),
                    "userId": data.get("userId"),
                    "assetReqId": asset_req_id,
                    "allocatedDate": datetime.now().isoformat()
                }
                asset_allocations.insert_one(allocation_doc)
                # Update asset status
                assets.update_one(
                    {"assetId": data.get("assetId")},
                    {"$set": {"assetStatus": "Allocated"}}
                )
        result = asset_requests.update_one(
            {"assetReqId": asset_req_id},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Request not found"}), 404
        logger.info("Updated Asset Requests")
        return jsonify({"message": f"{asset_req_id} has been updated"}), 200
    except Exception as e:
        logger.info(f"Error updating asset request {asset_req_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating request"}), 500
 
@asset_requests_blueprint.route("/api/AssetRequests/<int:asset_req_id>", methods=["DELETE"])
def delete_asset_request(asset_req_id):
    try:
        user_id = get_user_id()
        request_doc = asset_requests.find_one({"assetReqId": asset_req_id})
        if not request_doc:
            return jsonify({"error": f"Request with ID {asset_req_id} not found"}), 404
        if request_doc.get("userId") != user_id:
            return jsonify({"error": "You are not allowed to Delete Request"}), 403
        if request_doc.get("requestStatus") == "Allocated":
            return jsonify({"error": "The Request has already been Allocated. Please raise a ticket in Return Section if the asset is not needed."}), 403
        result = asset_requests.delete_one({"assetReqId": asset_req_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete request"}), 404
        logger.info("Deleted Asset Request")
        return jsonify({"message": "The Request Has Been Successfully Deleted"}), 200
    except Exception as e:
        logger.info(f"Error deleting asset request {asset_req_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting request"}), 500
 
@asset_requests_blueprint.route("/api/AssetRequests/filter-by-month", methods=["GET"])
def filter_asset_requests_by_month():
    try:
        month = request.args.get('monthName')
        if not month:
            return jsonify({"error": "Month name is required."}), 400
        month_num = parse_month_name(month)
        requests = list(asset_requests.find({
            "assetReqDate": {
                "$expr": {"$eq": [{"$month": {"$dateFromString": {"dateString": "$assetReqDate"}}}, month_num]}
            }
        }))
        if not requests:
            return jsonify({"error": f"No requests found for the month of {month}."}), 404
        return jsonify(requests), 200
    except Exception as e:
        logger.info(f"Error filtering by month: {str(e)}")
        return jsonify({"error": "Invalid month name"}), 400
 
@asset_requests_blueprint.route("/api/AssetRequests/filter-by-year", methods=["GET"])
def filter_asset_requests_by_year():
    try:
        year = int(request.args.get('year'))
        if year < 1900 or year > datetime.now().year:
            return jsonify({"error": "Invalid year"}), 400
        requests = list(asset_requests.find({
            "assetReqDate": {
                "$expr": {"$eq": [{"$year": {"$dateFromString": {"dateString": "$assetReqDate"}}}, year]}
            }
        }))
        if not requests:
            return jsonify({"error": f"No requests found for the year {year}"}), 404
        return jsonify(requests), 200
    except Exception as e:
        logger.info(f"Error filtering by year: {str(e)}")
        return jsonify({"error": "Invalid year"}), 400
 
@asset_requests_blueprint.route("/api/AssetRequests/filter-by-month-and-year", methods=["GET"])
def filter_asset_requests_by_month_and_year():
    try:
        month = request.args.get('month')
        year = int(request.args.get('year'))
        if not month:
            return jsonify({"error": "Month name is required"}), 400
        if year < 1900 or year > datetime.now().year:
            return jsonify({"error": "Invalid year"}), 400
        month_num = parse_month_name(month)
        requests = list(asset_requests.find({
            "assetReqDate": {
                "$expr": {
                    "$and": [
                        {"$eq": [{"$month": {"$dateFromString": {"dateString": "$assetReqDate"}}}, month_num]},
                        {"$eq": [{"$year": {"$dateFromString": {"dateString": "$assetReqDate"}}}, year]}
                    ]
                }
            }
        }))
        if not requests:
            return jsonify({"error": f"No requests found for {month} {year}"}), 404
        return jsonify(requests), 200
    except Exception as e:
        logger.info(f"Error filtering by month and year: {str(e)}")
        return jsonify({"error": "Invalid parameters"}), 400
 
@asset_requests_blueprint.route("/api/AssetRequests/filter-by-date-range", methods=["GET"])
def filter_asset_requests_by_date_range():
    try:
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        if not start_date or not end_date:
            return jsonify({"error": "StartDate and endDate are required"}), 400
        start_dt = parser.parse(start_date)
        end_dt = parser.parse(end_date)
        if start_dt > end_dt:
            return jsonify({"error": "Start date cannot be greater than end date"}), 400
        requests = list(asset_requests.find({
            "assetReqDate": {
                "$gte": start_dt.isoformat(),
                "$lte": end_dt.isoformat()
            }
        }))
        if not requests:
            return jsonify({"error": f"No requests found between {start_dt.date()} and {end_dt.date()}"}), 404
        return jsonify(requests), 200
    except Exception as e:
        logger.info(f"Error filtering by date range: {str(e)}")
        return jsonify({"error": "Invalid date format"}), 400
 
@asset_requests_blueprint.route("/api/AssetRequests/Status", methods=["GET"])
def get_asset_requests_by_status():
    try:
        status = request.args.get('status')
        if not status:
            return jsonify({"error": "Status parameter is required"}), 400
        requests = list(asset_requests.find({"requestStatus": status}))
        if not requests:
            return jsonify({"error": f"No requests found with status '{status}'"}), 404
        return jsonify(requests), 200
    except Exception as e:
        logger.info(f"Error filtering by status: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 