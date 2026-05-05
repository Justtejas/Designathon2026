from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from auth import get_user_id, get_user_role
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
categories = db['Categories']
assets = db['Assets']
subcategories = db['SubCategories']
 
categories_blueprint = Blueprint('categories', __name__)

def is_admin():
    """Check if user is admin"""
    role = get_user_role()
    return role == "Admin"
 
def serialize_category_simple(doc):
    """Serialize basic category"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "CategoryId": doc.get('CategoryId'),
            "CategoryName": doc.get('CategoryName')
        }
    return None
 
def serialize_category_detailed(doc):
    """Serialize category with assets and subcategories"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "CategoryId": doc.get('CategoryId'),
            "CategoryName": doc.get('CategoryName'),
            "Assets": doc.get('Assets', []),
            "SubCategories": doc.get('SubCategories', [])
        }
    return None
 
@categories_blueprint.route("/api/Categories/all-categories", methods=["GET"])
def get_all_categories():
    try:
        logger.info("Fetching all categories")
        categories_list = list(categories.find({}))
        if not categories_list:
            logger.warning("No categories available")
            return jsonify({"error": "No categories available"}), 404
        serialized_categories = [serialize_category_simple(cat) for cat in categories_list]
        return jsonify(serialized_categories), 200
    except Exception as e:
        logger.error(f"Error fetching all categories: {str(e)}")
        return jsonify({"error": "An error occurred while fetching categories"}), 500
 
@categories_blueprint.route("/api/Categories/category-names", methods=["GET"])
def get_category_names():
    try:
        logger.info("Fetching all category names")
        category_names = categories.distinct("CategoryName")
        if not category_names:
            return jsonify({"error": "No categories available"}), 404
        return jsonify(category_names), 200
    except Exception as e:
        logger.error(f"Error fetching category names: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@categories_blueprint.route("/api/Categories/<int:category_id>", methods=["GET"])
def get_category_by_id(category_id):
    try:
        logger.info(f"Fetching category by ID: {category_id}")
        # Use aggregation to include assets and subcategories
        pipeline = [
            {"$match": {"CategoryId": category_id}},
            {"$lookup": {
                "from": "Assets",
                "localField": "CategoryId",
                "foreignField": "CategoryId",
                "as": "Assets"
            }},
            {"$lookup": {
                "from": "SubCategories",
                "localField": "CategoryId",
                "foreignField": "CategoryId",
                "as": "SubCategories"
            }}
        ]
        category_cursor = categories.aggregate(pipeline)
        category_list = list(category_cursor)
        if not category_list:
            return jsonify({"error": "Category not found"}), 404
        serialized_category = serialize_category_detailed(category_list[0])
        return jsonify(serialized_category), 200
    except Exception as e:
        logger.error(f"Error fetching category {category_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@categories_blueprint.route("/api/Categories/<int:category_id>", methods=["PUT"])
def put_category(category_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info(f"Updating category {category_id}")
        if not data.get("CategoryName"):
            return jsonify({"error": "CategoryName is required"}), 400
        result = categories.update_one(
            {"CategoryId": category_id},
            {"$set": {"CategoryName": data.get("CategoryName")}}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Category not found"}), 404
        logger.info(f"Updated category {category_id}")
        return jsonify({"message": "Category updated successfully"}), 200
    except Exception as e:
        logger.error(f"Error updating category {category_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating category"}), 500
 
@categories_blueprint.route("/api/Categories", methods=["POST"])
def post_category():
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info("Creating new category")
        if not data.get("CategoryName"):
            return jsonify({"error": "CategoryName is required"}), 400
        category_doc = {
            "CategoryId": data.get("CategoryId"),
            "CategoryName": data.get("CategoryName")
        }
        # Check if category already exists
        existing_category = categories.find_one({"CategoryId": category_doc["CategoryId"]})
        if existing_category:
            return jsonify({"error": "Category ID already exists"}), 409
        result = categories.insert_one(category_doc)
        logger.info(f"Created category with ID: {result.inserted_id}")
        category_doc["_id"] = str(result.inserted_id)
        return jsonify(category_doc), 201
    except Exception as e:
        logger.error(f"Error creating category: {str(e)}")
        return jsonify({"error": "An error occurred while creating category"}), 500
 
@categories_blueprint.route("/api/Categories/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Deleting category {category_id}")
        category_doc = categories.find_one({"CategoryId": category_id})
        if not category_doc:
            return jsonify({"error": f"Category with ID {category_id} not found"}), 404
        result = categories.delete_one({"CategoryId": category_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete category"}), 404
        logger.info(f"Deleted category {category_id}")
        return jsonify({"message": "Category deleted successfully"}), 204
    except Exception as e:
        logger.error(f"Error deleting category {category_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting category"}), 500