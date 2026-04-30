from flask import Blueprint, jsonify, send_file
from pymongo import MongoClient
from Backend.old_auth import get_user_id,get_user_email
import io
import base64
from datetime import datetime
from bson.objectid import ObjectId
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['ResumeRankingDB']
collection = db['History']
adminHistory = db['RecruiterData']

data_blueprint = Blueprint('data_handler', __name__)

@data_blueprint.route("/api/files/<filename>/download-pdf", methods=["GET"])
def download_file_as_pdf(filename):
    try:
        user_id = get_user_id()
        
        document = collection.find_one({"user_id": user_id, "filename": filename})
        
        if not document or "file_content" not in document:
            logger.warning(f"File not found for download or does not belong to user {user_id}: {filename}")
            return jsonify({"error": "File not found or does not belong to you"}), 404
        
        file_data = base64.b64decode(document["file_content"])
        
        output_buffer = io.BytesIO()
        output_buffer.write(file_data)
        output_buffer.seek(0)
        if not filename.lower().endswith('.pdf'):
            filename = f"{os.path.splitext(filename)[0]}.pdf"
        logger.info(f"File downloaded as PDF by user {user_id}: {filename}")
        return send_file(
            output_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
    except Exception as e:
        logger.error(f"Error downloading file {filename} as PDF for user {user_id}: {str(e)}")
        return jsonify({"error": "An error occurred while downloading the file as PDF"}), 500

def get_candidate_files():
    try:
        user_id = get_user_id()
        documents = list(collection.find({"user_id": user_id}))
        
        if not documents:
            logger.info(f"No files found for user: {user_id}")
            return "No files found."

        serialized_documents = [serialize_document(doc) for doc in documents]
        logger.info(f"Files retrieved for user: {user_id}")
        return serialized_documents
    except Exception as e:
        logger.error(f"Error retrieving files for user {user_id}: {str(e)}")
        return "An error occurred while retrieving files."

@data_blueprint.route("/api/files/recruiter", methods=["GET"])
def get_all_files():
    try:
        documents = list(adminHistory.find({}))
        
        if not documents:
            logger.info("No files found in adminHistory.")
            return jsonify({"message": "No files found."}), 404

        serialized_documents = [serialize_document(doc) for doc in documents]
        logger.info("Files retrieved for Recruiter.")
        return jsonify(serialized_documents), 200
    except Exception as e:
        logger.error(f"Error retrieving files for recruiter: {str(e)}")
        return jsonify({"error": "An error occurred while retrieving files."}), 500

def serialize_document(doc):
    doc['_id'] = str(doc['_id'])
    return doc

from datetime import datetime

def update_email_status(user_id, job_title):
    
    try:
        result = adminHistory.update_many(
            {
                "user_id": user_id,
                "job_title": job_title
            },
            {
                "$set": {
                    "emailSent": True,
                    "email_sent_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            }
        )
        
        if result.matched_count == 0:
            logger.warning(f"No matching documents found for user_id: {user_id} and job_title: {job_title}")
            return False
        
        if result.modified_count == 0:
            logger.warning(f"Matching documents found but nothing to update (emailSent may already be True)")
            return True
        
        logger.info(f"Updated emailSent to True for {result.modified_count} documents (user_id: {user_id}, job_title: {job_title})")
        return True
    
    except Exception as e:
        logger.error(f"Failed to update emailSent status: {str(e)}")
        return False


def upload_file_data(doc):
    today = datetime.today()
    if 'Processed at' in doc:
        processed_at = doc['Processed at']
        if isinstance(processed_at, datetime):
            doc['Processed at'] = processed_at.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(processed_at, str):
            try:
                processed_at_time = datetime.strptime(processed_at, "%H:%M:%S.%f").time()
                processed_at_datetime = datetime.combine(today, processed_at_time)
                doc['Processed at'] = processed_at_datetime.strftime("%Y-%m-%d %H:%M:%S")
            except Exception as e:
                logger.warning(f"Error parsing 'Processed at': {str(e)}")
    existing_docs = collection.find({"user_id": doc["user_id"]})
    for existing_doc in existing_docs:
        if existing_doc["Processed at"] != doc["Processed at"]:
            collection.delete_one({"_id": existing_doc["_id"]})
    result = collection.insert_one(doc)
    logger.info(f"File data uploaded with ID: {result.inserted_id}")
    return result.inserted_id

def upload_admin_data(doc):
    today = datetime.today()
    if 'Processed at' in doc:
        processed_at = doc['Processed at']
        if isinstance(processed_at, datetime):
            doc['Processed at'] = processed_at.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(processed_at, str):
            try:
                processed_at_time = datetime.strptime(processed_at, "%H:%M:%S.%f").time()
                processed_at_datetime = datetime.combine(today, processed_at_time)
                doc['Processed at'] = processed_at_datetime.strftime("%Y-%m-%d %H:%M:%S")
            except Exception as e:
                logger.warning(f"Error parsing 'Processed at': {str(e)}")
    result = adminHistory.insert_one(doc)
    logger.info(f"File data uploaded with ID: {result.inserted_id}")
    return result.inserted_id
