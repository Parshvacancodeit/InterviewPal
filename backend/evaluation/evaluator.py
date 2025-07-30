import sys
import json
import time
import sys
import os

# Dynamically add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# evaluator.py
from evaluation.scorer import get_semantic_similarity, get_keyword_overlap, get_confidence_score, generate_feedback


def evaluate(data):
    print("🐍 evaluate() received:", data, file=sys.stderr)
    user = data.get("user_answer", "")
    reference = data.get("reference_answer", "")
    keywords = data.get("keywords", [])

    start = time.time()
    semantic = get_semantic_similarity(user, reference)
    keyword = get_keyword_overlap(user, keywords)
    confidence = get_confidence_score(user)

    overall = round(semantic * 0.6 + keyword * 0.2 + confidence * 0.2, 2)
    feedback = generate_feedback(semantic, keyword, confidence)

    result = {
        "score": {
            "semantic": semantic,
            "keyword_overlap": keyword,
            "confidence": confidence,
            "overall": overall
        },
        "feedback": feedback
    }

    return result

if __name__ == "__main__":
    try:
        input_data = json.load(sys.stdin)
        print("🐍 JSON loaded:", input_data, file=sys.stderr)

        result = evaluate(input_data)
        print(json.dumps(result))
    except Exception as e:
        print("🔥 Python Exception:", str(e), file=sys.stderr)
        sys.exit(1)
