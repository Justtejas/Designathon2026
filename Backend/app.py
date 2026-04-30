import base64
import io
import re
import logging
from flask import Flask, request, jsonify, send_from_directory
from auth import get_user_email,get_user_id,auth_bp
from assetallocations import asset_allocations_bp
from asset import assets_blueprint
from assetRequest import asset_requests_blueprint
from audit import audits_blueprint
from category import categories_blueprint
from maintanence import maintenance_logs_blueprint
from returnrequest import return_requests_blueprint
from servicerequest import service_requests_blueprint
from subcategories import subcategories_blueprint
from mongodb import data_blueprint, upload_file_data,get_candidate_files,update_email_status,upload_admin_data
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import os
from groq import Groq
import json
from dotenv import load_dotenv
from datetime import datetime, timezone
from transformers import RobertaTokenizer, RobertaModel
import torch
from sentence_transformers import SentenceTransformer, util
 
# Load models
sentence_model = SentenceTransformer("all-MiniLM-L6-v2")

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
client = Groq(api_key=GROQ_API_KEY)


app = Flask(__name__, static_folder='build', static_url_path='')
for bp in (
    auth_bp,
    data_blueprint,
    asset_allocations_bp,
    assets_blueprint,
    asset_requests_blueprint,
    audits_blueprint,
    categories_blueprint,
    maintenance_logs_blueprint,
    return_requests_blueprint,
    service_requests_blueprint,
    subcategories_blueprint,
):
    app.register_blueprint(bp)

CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})

vectorizer = CountVectorizer()


@app.route('/')
def serve_react_app():
    print("Root route accessed")
    return send_from_directory(app.static_folder, 'index.html')

def send_email(recipient_email, subject, message):
    """Send an email using SMTP with configured credentials."""
    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(message, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        print("Sending Email")
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        server.quit()
        print("Email sent")
        logger.info(f"Email sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_email}: {e}")
        return str(e)

def generate_candidate_email(job_title):
    """Generate a concise and professional email inviting a candidate for an interview."""
    prompt = (
        f"Write the body for direct email inviting the candidate for an interview. "
        f"Include the job title: {job_title} and mention the required skills. "
        f"Start with 'Dear Candidate,', and end with 'Regards, Recruiter'. "
        f"Don't specify a date or place. Say that details will be shared later'. "
        f"Do not include any introductory phrases or additional content; provide only the email body."
    )
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama3-70b-8192"
        )
        email_body = response.choices[0].message.content.strip()
        start_index = email_body.find("Dear Candidate")
        if start_index != -1:
            email_body = email_body[start_index:]
        else:
            logger.warning("The expected greeting was not found in the generated email body.")
        return email_body
    except Exception as e:
        logger.error(f"Groq LLaMA email generation failure: {e}")
        return (
            "Dear Candidate,\n\n"
            "We invite you to interview for the position described. Please contact us for details.\n\nRegards,\nRecruiter"
        )

@app.route("/api/candidate/send_email", methods=["POST"])
def send_candidate_email():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    email_addr = data.get("email")
    job_title = data.get("job_title", "").strip()

    if not job_title:
        return jsonify({"error": "Missing or empty 'job_title'"}), 400

    if not email_addr:
        return jsonify({"error": "Missing email address"}), 400

    # Validate email format
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email_addr):
        return jsonify({"error": "Invalid email format"}), 400

    email_subject = "Interview Invitation"
    email_content = generate_candidate_email(job_title)
    print(email_content)
    # send_result = send_email(email_addr, email_subject, email_content)
    send_result = send_email("suresh1711govind@gmail.com", email_subject, email_content)

    if send_result is True:
        status = "Email sent successfully"
    else:
        status = f"Email sending failed: {send_result}"
    print(status)
    return jsonify({
        "email": email_addr,
        "status": status
    }), 200

def send_email_with_attachments(recipient_email, subject, message, attachments):
    """Send an email using SMTP with configured credentials and attachments."""
    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(message, "plain"))

        for attachment in attachments:
            part = MIMEApplication(base64.b64decode(attachment['file_content']), Name=attachment['filename'])
            part['Content-Disposition'] = f'attachment; filename="{attachment["filename"]}"'
            msg.attach(part)

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        print("Sending Email")
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        server.quit()
        print("Email sent")
        logger.info(f"Email sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_email}: {e}")
        return str(e)

def generate_recruiter_email(candidates,jobTitle):
    
    if candidates == "No files found.":
        prompt = (
            f"Write the body for direct email to the ARRequestor informing them that no suitable candidates were found for the position {jobTitle}. "
            f"Keep the tone professional and polite. "
            f"Start with 'Dear ARRequestor,' and end with 'Regards, Resume Ranker.' "
            f"Do not include any introductory phrases or additional content; provide only the email body."
        )
        
        try:
            response = client.chat.completions.create(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                model="llama3-70b-8192"
            )
            email_body = response.choices[0].message.content.strip()
            start_index = email_body.find("Dear ARRequestor")
            if start_index != -1:
                email_body = email_body[start_index:]
            else:
                logger.warning("The expected greeting was not found in the generated email body.")
            return email_body
        except Exception as e:
            logger.error(f"Groq LLaMA email generation failure: {e}")
            return (
                "Dear ARRequestor,\n\n"
                "After reviewing our database, we couldn't find any suitable candidates "
                "for the position at this time. We'll continue the search and notify "
                "you if promising candidates emerge.\n\n"
                "Regards,\nResume Ranker"
            )
    else:
        candidate_details = "\n".join(
            [f"FileName: {candidate['filename']}, Email: {candidate['email']}" for candidate in candidates]
        )
        prompt = (
            f"Write a direct email body to the ARRequestor summarizing the top 3 candidates for the position {jobTitle}. "
            f"Include the following candidates:\n"
            f"{candidate_details}\n\n"
            f"Find out the candidate's name from the filename"
            f"Start with 'Dear ARRequestor,' and end with 'Regards, Resume Ranker.' "
            f"Ensure the content is concise and does not include any additional explanations or introductory phrases."
        )

        try:
            response = client.chat.completions.create(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                model="llama3-70b-8192"
            )
            email_body = response.choices[0].message.content.strip()
            start_index = email_body.find("Dear ARRequestor")
            if start_index != -1:
                email_body = email_body[start_index:]
            else:
                logger.warning("The expected greeting was not found in the generated email body.")
            return email_body
        
        except Exception as e:
            logger.error(f"Groq LLaMA email generation failure: {e}")
            return (
                "Dear ARRequestor,\n\n"
                "Here are the top candidates for the position:\n"
                f"{candidate_details}\n\n"
                "Regards,\nResume Ranker"
            )

@app.route("/api/recruiter/send_email", methods=["POST"])
def send_recruiter_email():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    recruiter_email = get_user_email()
    candidates = get_candidate_files()
    job_title = data.get("job_title", "").strip()

    if not recruiter_email:
        return jsonify({"error": "Missing recruiter email address"}), 400

    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', recruiter_email):
        return jsonify({"error": "Invalid email format"}), 400

    email_subject = "Top 3 Candidates for Interview"
    email_content = generate_recruiter_email(candidates,job_title)
    print(email_content)
    attachments = []
    for candidate in candidates:
        attachments.append({
            "filename": candidate["filename"],
            "file_content": candidate["file_content"]
        })

    send_result = send_email_with_attachments(recruiter_email, email_subject, email_content, attachments)

    if send_result is True:
        update_email_status(recruiter_email,job_title)
        status = "Email sent successfully"
    else:
        status = f"Email sending failed: {send_result}"
    print(status)
    return jsonify({
        "email": recruiter_email,
        "status": status
    }), 200

@app.route("/api/generate_jd", methods=["POST"])
def generate_jd():
    """Generate a detailed job description for a given job title."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    job_title = data.get("job_title", "").strip()
    if not job_title:
        return jsonify({"error": "Missing or empty 'job_title'"}), 400

    prompt = (
        f"Write a detailed, professional job description for the role titled '{job_title}'. "
        "Include the following sections: Job Summary, Key Responsibilities, Required Skills, "
        "Desirable Skills, Qualifications, Experience, and What We Offer. "
        "Use bullet points for lists but avoid using asterisks. "
        "Ensure the content is well-structured, easy to read, clear, and free of any special characters or formatting.."
        "Do not include any introductory phrases or additional content"
    )
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama3-70b-8192"
        )
        job_description = response.choices[0].message.content.strip()
        print(job_description)
        return jsonify({"job_title": job_title, "job_description": job_description}), 200
    except Exception as e:
        logger.error(f"LLaMA job description generation error: {e}")
        return jsonify({"error": "Failed to generate job description"}), 500

def extract_skills_experience(text):
    if not text:
        raise ValueError("Missing or empty 'input text'")

    prompt = (
        f"Extract the skills and experience from the following text:\n\n"
        f"{text}\n\n"
        "Provide the skills as a list and the experience as a list of statements in the following JSON format:\n"
        "{\n"
        "  \"skills\": [\"skill1\", \"skill2\"],\n"
        "  \"experience\": [\"experience statement 1\", \"experience statement 2\"]\n"
        "}\n"
        "Ensure the output is clear, structured, and follows this format."
        "Do not include any introductory phrases or additional content"
    )

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama3-70b-8192"
        )
        extraction_result = response.choices[0].message.content.strip()
        start_index = extraction_result.find("{")
        end_index = extraction_result.find("}")
        if start_index != -1:
            extraction_result = extraction_result[start_index:end_index+1]
        else:
            logger.warning("The expected format was not found in the result.")
            return {"error": "Failed to extract skills and experience due to unexpected format."}

        structured_result = json.loads(extraction_result)
        return structured_result
    except Exception as e:
        logger.error(f"LLaMA skills and experience extraction error: {e}")
        return {"error": "Failed to extract skills and experience"}

def calculate_overall_similarity(text1, text2):
    try:
        emb1 = sentence_model.encode(text1, convert_to_tensor=True)
        emb2 = sentence_model.encode(text2, convert_to_tensor=True)
        return float(util.pytorch_cos_sim(emb1, emb2).item())
    except Exception as e:
        logger.warning(f"Overall similarity calculation failed: {e}")
        return 0.0
 
def calculate_feature_similarity(text1, text2):
    try:
        text1 = " ".join(text1) if isinstance(text1, list) else text1
        text2 = " ".join(text2) if isinstance(text2, list) else text2
 
        inputs1 = tokenizer(text1, return_tensors="pt", padding=True, truncation=True, max_length=512)
        inputs2 = tokenizer(text2, return_tensors="pt", padding=True, truncation=True, max_length=512)
 
        with torch.no_grad():
            outputs1 = roberta_model(**inputs1)
            outputs2 = roberta_model(**inputs2)
 
        def mean_pooling(token_outputs, attention_mask):
            token_embeddings = token_outputs.last_hidden_state
            input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size())
            return (token_embeddings * input_mask_expanded).sum(1) / input_mask_expanded.sum(1)
 
        emb1 = mean_pooling(outputs1, inputs1["attention_mask"])
        emb2 = mean_pooling(outputs2, inputs2["attention_mask"])
 
        return float(cosine_similarity(emb1.numpy(), emb2.numpy())[0][0])
    except Exception as e:
        logger.warning(f"Feature similarity calculation failed: {e}")
        return 0.0
 
@app.route("/api/process_resumes", methods=["POST"])
def process_resumes():
    """Process resumes: extract info, compute similarity using dual models, return top candidates"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
 
    job_title = data.get("job_title", "").strip()
    job_description = data.get("job_description", "").strip()
    files = data.get("files")
    user_id = get_user_id()
    now_utc = datetime.now(timezone.utc).replace(microsecond=0)
 
    if not job_description:
        return jsonify({"error": "Missing or empty 'job_description'"}), 400
    if not files or not isinstance(files, list) or len(files) == 0:
        return jsonify({"error": "Missing or invalid 'files' list"}), 400
 
    jd_skills_experience = extract_skills_experience(job_description)
    jd_skills = jd_skills_experience.get("skills", [])
    jd_experience = jd_skills_experience.get("experience", [])
 
    profiles = []
 
    for file_entry in files:
        filename = file_entry.get("filename") or "unknown"
        content_base64 = file_entry.get("content")
        profile_response = {
            "filename": filename,
            "similarity_score": None,
            "email": None,
            "email_status": None
        }
 
        if not content_base64:
            profile_response["email_status"] = "Missing file content"
            profiles.append({"response": profile_response})
            continue
 
        try:
            pdf_bytes = base64.b64decode(content_base64, validate=True)
            resume_text = extract_text_from_pdf_bytes(pdf_bytes)
            email_found, _ = extract_contact_info(resume_text)
 
            if not email_found:
                profile_response["email_status"] = "No email found in resume"
                profiles.append({"response": profile_response})
                continue
 
            resume_skills_experience = extract_skills_experience(resume_text)
            resume_skills = resume_skills_experience.get("skills", [])
            resume_experience = resume_skills_experience.get("experience", [])
 
            # Use RoBERTa for feature similarity
            skills_similarity_score = calculate_feature_similarity(jd_skills, resume_skills)
            experience_similarity_score = calculate_feature_similarity(jd_experience, resume_experience)
 
            # Use Sentence Transformers for overall similarity
            overall_similarity_score = calculate_overall_similarity(job_description, resume_text)
 
            combined_similarity_score = (
                0.3 * skills_similarity_score +
                0.2 * experience_similarity_score +
                0.5 * overall_similarity_score
            )
            logger.info(round(float(combined_similarity_score), 3))
            profile_response.update({
                "similarity_score": round(float(combined_similarity_score), 3),
                "email": email_found
            })
 
            profiles.append({
                "response": profile_response,
                "storage": {
                    "user_id": user_id,
                    "filename": filename,
                    "email": email_found,
                    "file_content": content_base64,
                    "Processed at": now_utc
                }
            })
 
        except Exception as e:
            profile_response["email_status"] = f"Processing error: {str(e)}"
            profiles.append({"response": profile_response})
 
    valid_profiles = [p for p in profiles if p.get("response", {}).get("similarity_score") is not None]
    sorted_profiles = sorted(valid_profiles, key=lambda x: x["response"]["similarity_score"], reverse=True)
    top_results = sorted_profiles[:3]
 
    for profile in top_results:
        upload_file_data({
            "user_id": profile["storage"]["user_id"],
            "job_title": job_title,
            "filename": profile["storage"]["filename"],
            "email": profile["storage"]["email"],
            "file_content": profile["storage"]["file_content"],
            "Processed at": profile["storage"]["Processed at"]
        })
 
    candidate_emails = [profile["storage"]["email"] for profile in top_results]
        # Compute metrics
    total_profiles = len(valid_profiles)
    average_score = round(
        sum(p["response"]["similarity_score"] for p in valid_profiles) / total_profiles, 3
    ) if total_profiles > 0 else 0.0
 
    processing_end_time = datetime.now(timezone.utc)
    processing_time_seconds = (processing_end_time - now_utc).total_seconds()
 
    candidate_emails = [profile["storage"]["email"] for profile in top_results]
 
    # Upload admin data with new fields
    upload_admin_data({
        "user_id": get_user_email(),
        "job_title": job_title,
        "job_description": job_description,
        "candidates": candidate_emails,
        "skills": jd_skills,
        "experience": jd_experience,
        "Processed at": now_utc,
        "emailSent": False,
        "average_similarity_score": average_score,
        "total_profiles_processed": total_profiles,
        "processing_time_seconds": processing_time_seconds
    })
 
    return jsonify([p["response"] for p in top_results]), 200

@app.route('/<path:path>', methods=['GET'])
def serve_static_files(path):
    print(f"Static file route accessed with path: {path}")
    try:
        return send_from_directory(app.static_folder, path)
    except FileNotFoundError:
        print("File not found, serving index.html")
        return send_from_directory(app.static_folder, 'index.html')


@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv("PORT", 9093)))