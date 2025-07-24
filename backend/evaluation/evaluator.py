# evaluation/evaluator.py

import json
import time
from .scorer import get_semantic_similarity, get_keyword_overlap, get_confidence_score, generate_feedback

def evaluate_from_file(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)

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

    print(json.dumps(result, indent=2))
    print(f"\n⏱️ Took {round(time.time() - start, 2)} seconds")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python3 -m evaluation.evaluator test_inputs/test1.json")
    else:
        evaluate_from_file(sys.argv[1])
