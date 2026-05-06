import logging
from flask import Flask, send_from_directory
from auth import auth_bp,create_admin
from assetallocations import asset_allocations_bp
from asset import assets_blueprint
from assetRequest import asset_requests_blueprint
from audit import audits_blueprint
from category import categories_blueprint
from maintanence import maintenance_logs_blueprint
from returnrequest import return_requests_blueprint
from servicerequest import service_requests_blueprint
from subcategories import subcategories_blueprint
from flask_cors import CORS
import os
from groq import Groq
from dotenv import load_dotenv

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


@app.route('/')
def serve_react_app():
    print("Root route accessed")
    return send_from_directory(app.static_folder, 'index.html')

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
    print("File not found, serving index.html")
    print("Error:"+e)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    create_admin()
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv("PORT", 9093)))