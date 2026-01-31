# Flask Backend for Vignan
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Sample data storage (use database in production)
data_store = []

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({'data': data_store, 'count': len(data_store)})

@app.route('/api/data', methods=['POST'])
def add_data():
    new_data = request.json
    data_store.append(new_data)
    return jsonify({'success': True, 'message': 'Data added successfully'}), 201

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'project': 'Vignan'})

if __name__ == '__main__':
    print('🚀 Backend running on http://localhost:5000')
    app.run(debug=True, port=5000)
