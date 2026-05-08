from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from auth import get_next_sequence, get_user_role
from datetime import datetime
import os
import logging
from dotenv import load_dotenv
from bson.objectid import ObjectId
 
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
 
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['MaventoryDB']
subcategories = db['SubCategories']
categories = db['Categories']
 
subcategories_blueprint = Blueprint('subcategories', __name__)
 
def is_admin():
    """Check if user is admin"""
    return get_user_role() == "Admin"
 
def serialize_subcategory(doc):
    """Serialize subcategory document"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "subCategoryId": doc.get('subCategoryId'),
            "subCategoryName": doc.get('subCategoryName'),
            "categoryId": doc.get('categoryId'),
            "Quantity": doc.get('Quantity', 0)
        }
    return None
 
@subcategories_blueprint.route("/api/SubCategories", methods=["GET"])
def get_subcategories():
    try:
        category_id = int(request.args.get('categoryId', 0))
        logger.info(f"Fetching subcategories for category: {category_id}")
        if category_id == 0:
            # If no categoryId, return all (fallback)
            subcats_list = list(subcategories.find({}))
        else:
            # Filter by categoryId
            subcats_list = list(subcategories.find({"categoryId": category_id}))
            print(subcats_list)
        if not subcats_list:
            return jsonify([]), 200
        serialized_subcats = [serialize_subcategory(sc) for sc in subcats_list]
        return jsonify(serialized_subcats), 200
    except Exception as e:
        logger.info(f"Error fetching subcategories: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@subcategories_blueprint.route("/api/SubCategories/by-Quantity", methods=["GET"])
def get_subcategories_by_Quantity():
    try:
        Quantity = int(request.args.get('Quantity', 0))
        logger.info(f"Fetching subcategories with Quantity >= {Quantity}")
        subcats_list = list(subcategories.find({"Quantity": {"$gte": Quantity}}))
        if not subcats_list:
            return jsonify({"error": "No subcategories found with the specified Quantity"}), 404
        serialized_subcats = [serialize_subcategory(sc) for sc in subcats_list]
        return jsonify(serialized_subcats), 200
    except ValueError:
        return jsonify({"error": "Invalid Quantity parameter"}), 400
    except Exception as e:
        logger.info(f"Error fetching subcategories by Quantity: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@subcategories_blueprint.route("/api/SubCategories/by-category-name", methods=["GET"])
def get_subcategories_by_category_name():
    try:
        category_name = request.args.get('categoryName', '').strip()
        if not category_name:
            return jsonify({"error": "categoryName parameter is required"}), 400
        logger.info(f"Fetching subcategories for category: {category_name}")
        # First find category ID by name
        category = categories.find_one({"categoryName": {"$regex": category_name, "$options": "i"}})
        if not category:
            return jsonify({"error": "No subcategories found for the specified category"}), 404
        category_id = category.get("categoryId")
        subcats_list = list(subcategories.find({"categoryId": category_id}))
        if not subcats_list:
            return jsonify({"error": "No subcategories found for the specified category"}), 404
        serialized_subcats = [serialize_subcategory(sc) for sc in subcats_list]
        return jsonify(serialized_subcats), 200
    except Exception as e:
        logger.info(f"Error fetching subcategories by category name: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@subcategories_blueprint.route("/api/SubCategories/<int:subcategory_id>", methods=["PUT"])
def put_subcategory(subcategory_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info(f"Updating subcategory {subcategory_id}")
        if data.get("subCategoryId") != subcategory_id:
            return jsonify({"error": "Not Found"}), 400
        # Check if subcategory exists
        existing_subcat = subcategories.find_one({"subCategoryId": subcategory_id})
        if not existing_subcat:
            return jsonify({"error": "Id Not Found"}), 404
        update_data = {
            "$set": {
                "subCategoryName": data.get("subCategoryName"),
                "categoryId": data.get("categoryId"),
                "Quantity": data.get("Quantity", 0)
            }
        }
        result = subcategories.update_one({"subCategoryId": subcategory_id}, update_data)
        if result.matched_count == 0:
            return jsonify({"error": "Id Not Found"}), 404
        logger.info(f"Updated subcategory {subcategory_id}")
        return jsonify({"message": "Updation Success"}), 200
    except Exception as e:
        logger.info(f"Error updating subcategory {subcategory_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating subcategory"}), 500
 
@subcategories_blueprint.route("/api/SubCategories", methods=["POST"])
def post_subcategory():
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info("Creating new subcategory")
        subCategoryId = get_next_sequence("subcategories")
        subcategory_doc = {
            "subCategoryId": subCategoryId,
            "subCategoryName": data.get("subCategoryName"),
            "categoryId": data.get("categoryId"),
            "Quantity": data.get("Quantity", 0)
        }
        # Check for duplicate subCategoryId
        existing = subcategories.find_one({"subCategoryId": subcategory_doc["subCategoryId"]})
        if existing:
            return jsonify({"error": "SubCategory ID already exists"}), 409
        result = subcategories.insert_one(subcategory_doc)
        logger.info(f"Created subcategory with ID {subCategoryId}: {result.inserted_id}")
        subcategory_doc["_id"] = str(result.inserted_id)
        return jsonify(subcategory_doc), 201
    except Exception as e:
        logger.info(f"Error creating subcategory: {str(e)}")
        return jsonify({"error": "An error occurred while creating subcategory"}), 500
 
@subcategories_blueprint.route("/api/SubCategories/<int:subcategory_id>", methods=["DELETE"])
def delete_subcategory(subcategory_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Deleting subcategory {subcategory_id}")
        result = subcategories.delete_one({"subCategoryId": subcategory_id})
        if result.deleted_count == 0:
            logger.warning(f"Subcategory {subcategory_id} not found")
            return jsonify({"error": f"SubCategory with ID {subcategory_id} not found"}), 404
        logger.info(f"Deleted subcategory {subcategory_id}")
        return jsonify({"message": "Subcategory deleted successfully"}), 204
    except Exception as e:
        logger.info(f"Error deleting subcategory {subcategory_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting subcategory"}), 500