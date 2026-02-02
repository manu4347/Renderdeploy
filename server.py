import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ---- MongoDB connection ----
MONGO_URI = os.getenv("MONGO_URI")  # put this in .env
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "vignan_lara")
MONGO_COLLECTION = os.getenv("MONGO_MESSAGES_COLLECTION", "contact_messages")

mongo_client = MongoClient(MONGO_URI) if MONGO_URI else None
db = mongo_client[MONGO_DB_NAME] if mongo_client else None
messages_col = db[MONGO_COLLECTION] if db else None

data_store = []  # if you still want simple in-memory data

# ---- SERVE FRONTEND FROM ROOT ----
@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(".", filename)

# ---- SIMPLE DEMO API (optional) ----
@app.route("/api/data", methods=["GET"])
def get_data():
    return jsonify({"data": data_store, "count": len(data_store)})

@app.route("/api/data", methods=["POST"])
def add_data():
    data_store.append(request.json)
    return jsonify({"success": True}), 201

# ---- CONTACT MESSAGES -> MongoDB ----
@app.route("/api/messages", methods=["POST"])
def save_message():
    if not messages_col:
        # Mongo not configured; accept but don't persist
        return jsonify({"success": False, "error": "MongoDB not configured"}), 500

    payload = request.get_json(force=True) or {}
    name = payload.get("name", "").strip()
    email = payload.get("email", "").strip()
    subject = payload.get("subject", "").strip()
    message = payload.get("message", "").strip()

    if not (name and email and subject and message):
        return jsonify({"success": False, "error": "All fields are required"}), 400

    doc = {
        "name": name,
        "email": email,
        "subject": subject,
        "message": message,
        "created_at": datetime.utcnow(),
    }
    result = messages_col.insert_one(doc)
    return jsonify({"success": True, "id": str(result.inserted_id)}), 201

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "project": "vignan lara",
        "mongo": bool(messages_col),
    })

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 10000)),
        debug=False
    )
