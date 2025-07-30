from flask import Flask, request, jsonify
from flask_cors import CORS
from evaluation.evaluator import evaluate  # ✅ Correct import path

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route("/evaluate", methods=["POST"])
def evaluate_api():
    data = request.json
    print("📥 Received Evaluation Payload:", data)
    
    result = evaluate(data)
    return jsonify(result)
if __name__ == "__main__":
    app.run(debug=True, port=5050)
