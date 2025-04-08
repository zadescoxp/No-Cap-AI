from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from model.textModel import text_model
from config import deep_dive, summarizer
import requests
from bs4 import BeautifulSoup
from model.imageModel import image_model
import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import PyPDF2
import io
import base64
from PIL import Image

app = Flask(__name__)
CORS(app)
cred = credentials.Certificate("firebase-admin-sdk.json")
firebase_admin.initialize_app(cred)
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

ALLOWED_EXTENSIONS = {'txt', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def verify_firebase_token(func):
    @wraps(func)  # ✅ preserves function name and metadata
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return (
                jsonify(
                    {
                        "error": "Unauthorized",
                        "details": "Missing or invalid Authorization header",
                    }
                ),
                401,
            )

        id_token = auth_header.split(" ")[1]

        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token
            return func(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": "Unauthorized", "details": str(e)}), 401

    return wrapper
    
@app.route("/mode/text", methods=["POST"])
@verify_firebase_token
def text_mode():
    data = request.get_json()
    text = data.get("text", "")
    
    try:
        label, score = text_model(text)
    except Exception as e:
        return jsonify({"error": "Model error", "details": str(e)}), 500
    return jsonify({"label": label, "score": score}), 200

@app.route("/mode/deep_dive", methods=["POST"])
@verify_firebase_token
def deep_dive_search():
    data = request.get_json()
    text = data.get("text", "")
    
    try:
        response = deep_dive(text)
    except Exception as e:
        return jsonify({"error": "Model error", "details": str(e)}), 500

    return jsonify({"response": response}), 200

@app.route("/mode/website", methods=["POST"])
@verify_firebase_token
def website_mode():
    data = request.get_json()
    url = data.get("url", "")
    
    if not url.startswith(('http://', 'https://')):
        return jsonify({"error": "Invalid URL format"}), 400
        
    try:
        
        response = requests.get(url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        h1_text = soup.find('h1')
        print(h1_text)
        if not h1_text:
            return jsonify({"error": "No h1 element found"}), 404
            
        label, score = text_model(h1_text.text)
        return jsonify({"label": label, "score": score}), 200
            
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch website", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Model error", "details": str(e)}), 500
    
@app.route("/mode/image_mode", methods=["POST"])
@verify_firebase_token
def image_mode():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400
        
    try:
        
        # Decode base64 image
        image_data = data['image'].split(',')[1]  # Remove data:image/jpeg;base64, prefix
        image_bytes = base64.b64decode(image_data)
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            image_bytes,
            folder=f"user_images/",
            resource_type="image"
        )
        image_url = upload_result['secure_url']
        print(f"Image URL: {image_url}")
        
        # Process image through model
        human_score, machine_score = image_model(image_url)
        
        return jsonify({
            "human": human_score,
            "machine": machine_score,
            "image_url": image_url
        }), 200
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({"error": "Processing failed", "details": str(e)}), 500

@app.route("/mode/file", methods=["POST"])
@verify_firebase_token
def file_mode():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400
        
    try:
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(file)
            text = summarizer(text)
        else:  # txt file
            text = file.read()
            try:
                text = text.decode('utf-8')
            except UnicodeDecodeError:
                text = text.decode('utf-16')            
        # First summarize the text
        text = summarizer(text)
        # Then evaluate with text model    
        label, score = text_model(text)
        return jsonify({"label": label, "score": score}), 200
        
    except Exception as e:
        print(e)
        return jsonify({"error": "Processing failed", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)