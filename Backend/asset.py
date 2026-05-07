from flask import Blueprint, jsonify, request, send_file
from pymongo import MongoClient
from auth import get_user_id, get_user_role
from datetime import datetime
import os
import logging
from dotenv import load_dotenv
from bson.objectid import ObjectId
from dateutil import parser
import io
import base64
 
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
 
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['MaventoryDB']
assets = db['Assets']
categories = db['Categories']
subcategories = db['SubCategories']
 
assets_blueprint = Blueprint('assets', __name__)

def is_admin():
    """Check if user is admin"""
    role = get_user_role()
    return role == "Admin"
 
def serialize_asset_simple(doc):
    """Serialize for simple Asset list"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "AssetId": doc.get('AssetId'),
            "AssetName": doc.get('AssetName'),
            "AssetDescription": doc.get('AssetDescription'),
            "categoryId": doc.get('categoryId'),
            "subCategoryId": doc.get('subCategoryId'),
            "AssetImage": doc.get('AssetImage'),
            "SerialNumber": doc.get('SerialNumber'),
            "Model": doc.get('Model'),
            "ManufacturingDate": doc.get('ManufacturingDate'),
            "Location": doc.get('Location'),
            "Value": doc.get('Value'),
            "Expiry_Date": doc.get('Expiry_Date'),
            "Asset_Status": doc.get('Asset_Status', 'OpenToRequest')
        }
    return None
 
def serialize_asset_dto_class(doc):
    """Serialize for AssetDtoClass with category/subcategory info"""
    if doc:
        doc['_id'] = str(doc['_id']) if doc.get('_id') else None
        return {
            "AssetId": doc.get('AssetId'),
            "AssetName": doc.get('AssetName'),
            "Location": doc.get('Location'),
            "Value": doc.get('Value'),
            "Model": doc.get('Model'),
            "SerialNumber": doc.get('SerialNumber'),
            "categoryName": doc.get('categoryName'),
            "categoryId": doc.get('categoryId'),
            "subCategoryId": doc.get('subCategoryId'),
            "subCategoryName": doc.get('subCategoryName'),
            "AssetStatus": doc.get('Asset_Status', 'OpenToRequest')
        }
    return None
 
@assets_blueprint.route("/api/Assets", methods=["GET"])
def get_assets():
    try:
        logger.info("Fetching all assets")
        assets_list = list(assets.find({}))
        serialized_assets = [serialize_asset_simple(asset) for asset in assets_list]
        return jsonify(serialized_assets), 200
    except Exception as e:
        logger.info(f"Error fetching assets: {str(e)}")
        return jsonify({"error": "An error occurred while fetching assets"}), 500
 
@assets_blueprint.route("/api/Assets/assetall", methods=["GET"])
def get_all_assets():
    try:
        logger.info("Fetching all assets with details")
        # Join with categories and subcategories using aggregation
        pipeline = [
            {"$lookup": {
                "from": "Categories",
                "localField": "categoryId",
                "foreignField": "categoryId",
                "as": "category"
            }},
            {"$unwind": {"path": "$category", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "SubCategories", 
                "localField": "subCategoryId",
                "foreignField": "subCategoryId",
                "as": "subcategory"
            }},
            {"$unwind": {"path": "$subcategory", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "AssetId": 1,
                    "AssetName": 1,
                    "Location": 1,
                    "Value": 1,
                    "Model": 1,
                    "SerialNumber": 1,
                    "categoryName": "$category.categoryName",
                    "categoryId": "$category.categoryId",
                    "subCategoryId": "$subcategory.subCategoryId",
                    "subCategoryName": "$subcategory.subCategoryName",
                    "Asset_Status": {"$ifNull": ["$Asset_Status", "OpenToRequest"]}
                }
            }
        ]
        assets_cursor = assets.aggregate(pipeline)
        assets_list = list(assets_cursor)
        serialized_assets = [serialize_asset_dto_class(asset) for asset in assets_list]
        return jsonify(serialized_assets), 200
    except Exception as e:
        logger.info(f"Error fetching all assets: {str(e)}")
        return jsonify({"error": "An error occurred while fetching all assets"}), 500
 
@assets_blueprint.route("/api/Assets/Details", methods=["GET"])
def get_all_details_of_assets():
    try:
        logger.info("Fetching all assets details")
        # This would require complex aggregation with multiple collections
        # For now, return basic assets with category info
        pipeline = [
            {"$lookup": {
                "from": "Categories",
                "localField": "categoryId",
                "foreignField": "categoryId", 
                "as": "category"
            }},
            {"$unwind": {"path": "$category", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "SubCategories",
                "localField": "subCategoryId",
                "foreignField": "subCategoryId",
                "as": "subcategory"
            }},
            {"$unwind": {"path": "$subcategory", "preserveNullAndEmptyArrays": True}}
        ]
        assets_cursor = assets.aggregate(pipeline)
        assets_list = list(assets_cursor)
        return jsonify(assets_list), 200
    except Exception as e:
        logger.info(f"Error fetching assets details: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@assets_blueprint.route("/api/Assets/ByAssetName/<name>", methods=["GET"])
def get_asset_by_name(name):
    try:
        logger.info(f"Fetching assets by name: {name}")
        assets_list = list(assets.find({
            "AssetName": {"$regex": name, "$options": "i"}
        }))
        if not assets_list:
            logger.info(f"No assets found containing '{name}'")
            return jsonify({"error": f"No assets found containing '{name}'."}), 404
        serialized_assets = [serialize_asset_simple(asset) for asset in assets_list]
        return jsonify(serialized_assets), 200
    except Exception as e:
        logger.info(f"Error fetching assets by name: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@assets_blueprint.route("/api/Assets/PriceRange", methods=["GET"])
def get_assets_by_value():
    try:
        min_price = float(request.args.get('minPrice', 0))
        max_price = float(request.args.get('maxPrice', float('inf')))
        if min_price < 0 or max_price < 0 or min_price > max_price:
            return jsonify({"error": "Invalid price range"}), 400
        logger.info(f"Fetching assets in price range {min_price} to {max_price}")
        assets_list = list(assets.find({
            "Value": {"$gte": min_price, "$lte": max_price}
        }))
        if not assets_list:
            return jsonify({"error": f"No assets found in the price range {min_price} to {max_price}"}), 404
        serialized_assets = [serialize_asset_simple(asset) for asset in assets_list]
        return jsonify(serialized_assets), 200
    except Exception as e:
        logger.info(f"Error fetching assets by price range: {str(e)}")
        return jsonify({"error": "Invalid price range"}), 400
 
@assets_blueprint.route("/api/Assets/ByAssetLocation/<location>", methods=["GET"])
def get_assets_by_location(location):
    try:
        logger.info(f"Fetching assets by location: {location}")
        assets_list = list(assets.find({
            "Location": {"$regex": location, "$options": "i"}
        }))
        if not assets_list:
            logger.info(f"No assets found containing '{location}'")
            return jsonify({"error": f"No assets found containing '{location}'."}), 404
        serialized_assets = [serialize_asset_simple(asset) for asset in assets_list]
        return jsonify(serialized_assets), 200
    except Exception as e:
        logger.info(f"Error fetching assets by location: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@assets_blueprint.route("/api/Assets/Status", methods=["GET"])
def get_assets_by_status():
    try:
        status = request.args.get('status')
        if not status:
            return jsonify({"error": "Status parameter is required"}), 400
        logger.info(f"Fetching assets by status: {status}")
        assets_list = list(assets.find({"Asset_Status": status}))
        if not assets_list:
            logger.info(f"No assets found with status '{status}'")
            return jsonify({"error": f"No assets found with status '{status}'"}), 404
        serialized_assets = [serialize_asset_simple(asset) for asset in assets_list]
        return jsonify(serialized_assets), 200
    except Exception as e:
        logger.info(f"Error fetching assets by status: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@assets_blueprint.route("/api/Assets/<int:asset_id>", methods=["GET"])
def get_asset_by_id(asset_id):
    try:
        logger.info(f"Fetching asset by ID: {asset_id}")
        asset_doc = assets.find_one({"AssetId": asset_id})
        if not asset_doc:
            return jsonify({"error": "Asset not found"}), 404
        serialized_asset = serialize_asset_dto_class(asset_doc)
        return jsonify(serialized_asset), 200
    except Exception as e:
        logger.info(f"Error fetching asset by ID {asset_id}: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
 
@assets_blueprint.route("/api/Assets/<int:asset_id>", methods=["PUT"])
def put_asset(asset_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.get_json()
        logger.info(f"Updating asset {asset_id}")
        if data.get("AssetId") != asset_id:
            return jsonify({"error": "ID mismatch"}), 400
        update_data = {
            "$set": {
                "AssetName": data.get("AssetName"),
                "AssetDescription": data.get("AssetDescription"),
                "categoryId": data.get("categoryId"),
                "subCategoryId": data.get("subCategoryId"),
                "SerialNumber": data.get("SerialNumber"),
                "Model": data.get("Model"),
                "ManufacturingDate": data.get("ManufacturingDate"),
                "Location": data.get("Location"),
                "Value": data.get("Value"),
                "Expiry_Date": data.get("Expiry_Date")
            }
        }
        result = assets.update_one({"AssetId": asset_id}, update_data)
        if result.matched_count == 0:
            return jsonify({"error": "Asset not found"}), 404
        logger.info(f"Updated asset {asset_id}")
        return jsonify({"message": "Asset updated successfully"}), 204
    except Exception as e:
        logger.info(f"Error updating asset {asset_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating asset"}), 500
 
@assets_blueprint.route("/api/Assets/<int:asset_id>", methods=["DELETE"])
def delete_asset(asset_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        logger.info(f"Deleting asset {asset_id}")
        result = assets.delete_one({"AssetId": asset_id})
        if result.deleted_count == 0:
            logger.info(f"Asset with ID {asset_id} not found")
            return jsonify({"error": f"Asset with ID {asset_id} not found"}), 404
        logger.info(f"Deleted asset {asset_id}")
        return jsonify({"message": "Asset deleted successfully"}), 204
    except Exception as e:
        logger.info(f"Error deleting asset {asset_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting asset"}), 500
 
@assets_blueprint.route("/api/Assets", methods=["POST"])
def add_asset():
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        data = request.form.to_dict()
        logger.info("Adding asset process started")
        # Handle file upload if present
        asset_image = None
        if 'AssetImage' in request.files:
            file = request.files['AssetImage']
            if file and file.filename:
                asset_image = file.read()
        asset_doc = {
            "AssetName": data.get("AssetName"),
            "AssetDescription": data.get("AssetDescription"),
            "categoryId": int(data.get("categoryId", 0)),
            "subCategoryId": int(data.get("subCategoryId", 0)),
            "SerialNumber": data.get("SerialNumber"),
            "Model": data.get("Model"),
            "ManufacturingDate": data.get("ManufacturingDate"),
            "Location": data.get("Location"),
            "Value": float(data.get("Value", 0)),
            "Expiry_Date": data.get("Expiry_Date"),
            "Asset_Status": "OpenToRequest",
            "AssetImage": asset_image  # Store as binary
        }
        result = assets.insert_one(asset_doc)
        logger.info(f"Added asset with ID: {result.inserted_id}")
        asset_doc["AssetId"] = asset_doc.get("AssetId", str(result.inserted_id))
        return jsonify(asset_doc), 201
    except Exception as e:
        logger.info(f"Error creating asset: {str(e)}")
        return jsonify({"error": "An error occurred while creating asset"}), 500
 
@assets_blueprint.route("/api/Assets/upload-image/<int:asset_id>", methods=["POST"])
def upload_asset_image(asset_id):
    try:
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png']
        if file.content_type not in allowed_types:
            return jsonify({"error": "Only JPEG or PNG format are allowed"}), 400
        logger.info(f"Uploading image for asset {asset_id}")
        image_data = file.read()
        assets.update_one(
            {"AssetId": asset_id},
            {"$set": {"AssetImage": image_data}}
        )
        logger.info("Asset image uploaded successfully")
        return jsonify({"message": "Image uploaded successfully"}), 200
    except Exception as e:
        logger.info(f"Error uploading asset image: {str(e)}")
        return jsonify({"error": "Failed to upload image"}), 500
 
@assets_blueprint.route("/api/Assets/get-image/<int:asset_id>", methods=["GET"])
def get_asset_image(asset_id):
    try:
        logger.info(f"Fetching asset image for {asset_id}")
        asset = assets.find_one({"AssetId": asset_id})
        if not asset or not asset.get("AssetImage"):
            logger.info("No asset image found")
            return jsonify({"error": "Asset not found or no image available"}), 404
        image_data = asset["AssetImage"]
        return send_file(
            io.BytesIO(image_data),
            mimetype='image/jpeg',
            as_attachment=False
        )
    except Exception as e:
        logger.info(f"Error fetching asset image {asset_id}: {str(e)}")
        return jsonify({"error": "Image not found"}), 404