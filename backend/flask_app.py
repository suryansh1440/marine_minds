from flask import Flask, request, jsonify
from flask_cors import CORS
from services.crewai_service import run_crewai_pipeline
from socket_manager import socket_manager
from netcdf_processor import process_netcdf
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import traceback

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]}}, supports_credentials=True)

# Initialize Socket.IO
socket_manager.init_app(app)

# Configure upload settings
UPLOAD_FOLDER = 'temp'
ALLOWED_EXTENSIONS = {'nc', 'netcdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.post("/api/ask")
def analyze_with_crewai():
    data = request.get_json(silent=True) or {}
    query = data.get("query")

    if not isinstance(query, str) or not query.strip():
        return jsonify({"error": "Request JSON must include non-empty 'query' string"}), 400

    try:
        result = run_crewai_pipeline(query, verbose=False)
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

@app.route("/upload-netcdf/", methods=['POST'])
def upload_netcdf():
    """
    Upload and process a NetCDF file containing ARGO float data.
    """
    file_location = None
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        
        # If user does not select file, browser might submit an empty part
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file and allowed_file(file.filename):
            # Create temp directory if it doesn't exist
            os.makedirs("temp", exist_ok=True)
            
            # Secure the filename and create file path
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = secure_filename(file.filename)
            file_location = os.path.join(app.config['UPLOAD_FOLDER'], f"{timestamp}_{filename}")
            
            # Save uploaded file
            file.save(file_location)
            
            # Process the NetCDF file
            # Make sure process_netcdf is compatible with Flask
            process_netcdf(file_location)
            
            return jsonify({
                "message": "NetCDF file processed successfully.",
                "filename": filename
            }), 200
        else:
            return jsonify({"error": "Invalid file type. Only .nc or .netcdf files are allowed."}), 400
        
    except Exception as e:
        # Clean up on error
        if file_location and os.path.exists(file_location):
            os.remove(file_location)
        app.logger.error(f"Error processing file: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500
    finally:
        # Clean up temporary file
        if file_location and os.path.exists(file_location):
            try:
                os.remove(file_location)
            except Exception as e:
                app.logger.error(f"Error cleaning up file: {str(e)}")

if __name__ == "__main__":
    socket_manager.run_app(app, host="0.0.0.0", port=9000, debug=False)