# asset_allocations_api.py
from flask import Blueprint, jsonify, request
from pymongo import MongoClient, DESCENDING
from bson import ObjectId
from datetime import datetime, date
import os
import logging
from dotenv import load_dotenv

# --- Environment & Logging ---
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Auth helpers (expected from your auth module) ---
try:
    from auth import get_user_id, get_user_role
except Exception:
    # Fallbacks if not provided: use headers for local/testing
    def get_user_id():
        uid = request.headers.get("X-User-Id")
        return int(uid) if uid and uid.isdigit() else None

    def get_user_role():
        return request.headers.get("X-User-Role", "User")

# --- MongoDB Client & Collection ---
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")


client = MongoClient(MONGODB_URI)
db = client['MaventoryDB']
users = db['Users']
assets = db['Assets']
allocations_col = db['AssetAllocations']

# --- Blueprint ---
asset_allocations_bp = Blueprint("asset_allocations", __name__, url_prefix="/api/AssetAllocations")

# --- Utilities ---
def serialize_id(value):
    if isinstance(value, ObjectId):
        return str(value)
    return value

def serialize_dates(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value

def serialize_document(doc):
    if not doc:
        return doc
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out[k] = serialize_id(v)
        else:
            out[k] = serialize_dates(v)
    return out

def serialize_list(docs):
    return [serialize_document(d) for d in docs]

def parse_month_name(month_str):
    try:
        return datetime.strptime(month_str.strip(), "%B").month
    except Exception:
        raise ValueError("Invalid month name")

def parse_iso_date(datestr):
    # Accept YYYY-MM-DD or full ISO 8601
    try:
        if len(datestr) == 10:
            return datetime.strptime(datestr, "%Y-%m-%d")
        return datetime.fromisoformat(datestr)
    except Exception:
        raise ValueError("Invalid date format. Expected YYYY-MM-DD or ISO 8601.")

def current_year():
    return datetime.now().year

def to_allocation_dto(doc):
    # Mirrors AllocationDto
    return {
        "userId": doc.get("userId"),
        "assetName": doc.get("assetName"),
        "assetId": doc.get("assetId"),
        "categoryName": doc.get("categoryName"),
        "categoryId": doc.get("categoryId"),
        "Value": doc.get("Value"),
        "Model": doc.get("Model"),
        "allocatedDate": serialize_dates(doc.get("allocatedDate")),
    }

def to_allocation_class_dto(doc):
    # Mirrors AllocationClassDto
    existing_user = users.find_one({"userId": doc.get('userId')})
    existing_asset = assets.find_one({"assetId": doc.get('assetId')})
    return {
        "allocationId": doc.get("allocationId"),
        "assetName": existing_asset.get("assetName"),
        "assetId": doc.get("assetId"),
        "userId": doc.get("userId"),
        "userName": existing_user.get("userName"),
        "assetReqId": doc.get("assetReqId"),
        "allocatedDate": serialize_dates(doc.get("allocatedDate")),
    }

def find_by_id_or_allocation_id(id_str):
    """
    Accepts either a Mongo ObjectId (24 hex chars) or an integer allocationId.
    Returns the matching document or None.
    """
    # Try ObjectId
    try:
        if ObjectId.is_valid(id_str):
            doc = allocations_col.find_one({"_id": ObjectId(id_str)})
            if doc:
                return doc
    except Exception:
        pass
    # Try integer allocationId
    try:
        alloc_id = int(id_str)
        doc = allocations_col.find_one({"allocationId": alloc_id})
        return doc
    except Exception:
        return None

# --- Routes ---

# GET: /api/AssetAllocations/user/{userId}
# Returns AllocationDto[]
@asset_allocations_bp.route("/user/<int:user_id>", methods=["GET"])
def get_allocations_by_user_id(user_id):
    try:
        docs = list(allocations_col.find({"userId": user_id}))
        if not docs:
            return jsonify({"message": "Not Found"}), 404
        dtos = [to_allocation_dto(d) for d in docs]
        return jsonify(dtos), 200
    except Exception as e:
        logger.info(f"Error fetching allocations for user {user_id}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# GET: /api/AssetAllocations (auth required)
# Admin: AllocationClassDto[] (all)
# Non-admin: user's raw allocations; 404 if none
@asset_allocations_bp.route("", methods=["GET"])
def get_asset_allocations():
    try:
        uid = get_user_id()
        role = get_user_role()
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        if role == "Admin":
            cursor = allocations_col.find({}).sort("allocatedDate", DESCENDING)
            docs = list(cursor)
            dtos = [to_allocation_class_dto(d) for d in docs]
            return jsonify(dtos), 200
        else:
            docs = list(
                allocations_col.find({"userId": uid})
                .sort("allocatedDate", DESCENDING)
            )
            if not docs:
                return jsonify({"error": f"No Allocation can be found for the User {uid}"}), 404
            # Controller returns entity list here; we mirror by returning raw docs
            return jsonify(serialize_list(docs)), 200
    except Exception as e:
        logger.info(f"Error in get_asset_allocations: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# GET: /api/AssetAllocations/filter-by-month?month=January
# Returns entity list or 404; 400 on invalid month
@asset_allocations_bp.route("/filter-by-month", methods=["GET"])
def filter_by_month():
    month = request.args.get("month", "").strip()
    if not month:
        return jsonify({"error": "Month name is required."}), 400
    try:
        month_num = parse_month_name(month)
        docs = list(allocations_col.find({
            "$expr": {"$eq": [{"$month": "$allocatedDate"}, month_num]}
        }))
        if not docs:
            return jsonify({"error": f"No allocations found for the month of {month}."}), 404
        return jsonify(serialize_list(docs)), 200
    except ValueError:
        return jsonify({"error": "Invalid month name. Please provide a valid month name (e.g., January, February)."}), 400
    except Exception as e:
        logger.info(f"Error filtering by month {month}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# GET: /api/AssetAllocations/filter-by-year?year=2024
@asset_allocations_bp.route("/filter-by-year", methods=["GET"])
def filter_by_year():
    year_str = request.args.get("year")
    try:
        year = int(year_str) if year_str is not None else None
    except Exception:
        return jsonify({"error": "Invalid year. Please provide a valid year."}), 400

    if not year or year < 1900 or year > current_year():
        return jsonify({"error": "Invalid year. Please provide a valid year."}), 400

    try:
        docs = list(allocations_col.find({
            "$expr": {"$eq": [{"$year": "$allocatedDate"}, year]}
        }))
        if not docs:
            return jsonify({"error": f"No allocations found for the year {year}."}), 404
        return jsonify(serialize_list(docs)), 200
    except Exception as e:
        logger.info(f"Error filtering by year {year}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# GET: /api/AssetAllocations/filter-by-month-and-year?month=January&year=2024
@asset_allocations_bp.route("/filter-by-month-and-year", methods=["GET"])
def filter_by_month_and_year():
    month = request.args.get("month", "").strip()
    year_str = request.args.get("year")
    if not month:
        return jsonify({"error": "Month name is required."}), 400
    try:
        year = int(year_str) if year_str is not None else None
    except Exception:
        return jsonify({"error": "Invalid year. Please provide a valid year."}), 400
    if not year or year < 1900 or year > current_year():
        return jsonify({"error": "Invalid year. Please provide a valid year."}), 400
    try:
        month_num = parse_month_name(month)
        docs = list(allocations_col.find({
            "$expr": {
                "$and": [
                    {"$eq": [{"$month": "$allocatedDate"}, month_num]},
                    {"$eq": [{"$year": "$allocatedDate"}, year]}
                ]
            }
        }))
        if not docs:
            return jsonify({"error": f"No allocations found for the month of {month} in the year {year}."}), 404
        return jsonify(serialize_list(docs)), 200
    except ValueError:
        return jsonify({"error": "Invalid month name. Please provide a valid month name (e.g., January, February)."}), 400
    except Exception as e:
        logger.info(f"Error filtering by month/year {month}/{year}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# GET: /api/AssetAllocations/filter-by-date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
@asset_allocations_bp.route("/filter-by-date-range", methods=["GET"])
def filter_by_date_range():
    start_str = request.args.get("startDate")
    end_str = request.args.get("endDate")
    if not start_str or not end_str:
        return jsonify({"error": "startDate and endDate are required."}), 400
    try:
        start_dt = parse_iso_date(start_str)
        end_dt = parse_iso_date(end_str)
        if start_dt > end_dt:
            return jsonify({"error": "Start date cannot be greater than end date."}), 400

        docs = list(allocations_col.find({
            "allocatedDate": {"$gte": start_dt, "$lte": end_dt}
        }))

        if not docs:
            return jsonify({"error": f"No allocations found between {start_dt.strftime('%Y-%m-%d')} and {end_dt.strftime('%Y-%m-%d')}."}), 404
        return jsonify(serialize_list(docs)), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.info(f"Error filtering by date range {start_str} - {end_str}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# GET: /api/AssetAllocations/{id} (auth required)
# Returns AllocationClassDto
@asset_allocations_bp.route("/<id>", methods=["GET"])
def get_asset_allocation_by_id(id):
    try:
        uid = get_user_id()
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc = find_by_id_or_allocation_id(id)
        if not doc:
            return jsonify({"error": "Not Found"}), 404

        dto = to_allocation_class_dto(doc)
        return jsonify(dto), 200
    except Exception as e:
        logger.info(f"Error retrieving allocation by id {id}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500