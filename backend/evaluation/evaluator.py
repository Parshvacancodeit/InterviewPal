# evaluation/evaluator.py

import sys
import json
from sentence_transformers import SentenceTransformer, util
import language_tool_python
import torch

# Load models once globally
model = SentenceTransformer('all-MiniLM-L6-v2')
tool = language_tool_python.LanguageTool('en-US')


def get_semantic_similarity(ans1, ans2):
    embeddings = model.encode([ans1, ans2], convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(embeddings[0], embeddings[1])
    return round(similarity.item() * 10, 2)  # scale to 0–10


def get_grammar_score(text):
    matches = tool.check(text)
    errors = len(matches)
    length = len(text.split())
    if length == 0:
        return 0
    score = max(0, 10 - (errors / length * 10))  # simple inverse scale
    return round(score, 2)


def get_confidence_score(text):
    words = text.split()
    if not words:
        return 0
    avg_word_len = sum(len(w) for w in words) / len(words)
    score = min(10, (len(words) / 5) + (avg_word_len / 2))  # rough fluency proxy
    return round(score, 2)


def generate_feedback(similarity, grammar, confidence):
    feedback = []
    if similarity > 7:
        feedback.append("Your answer was relevant and covered key ideas.")
    elif similarity > 4:
        feedback.append("Your answer was somewhat relevant but missed key points.")
    else:
        feedback.append("Your answer lacked alignment with the expected content.")

    if grammar < 6:
        feedback.append("Watch out for grammar mistakes.")
    elif grammar < 8:
        feedback.append("Minor grammar issues present.")

    if confidence < 5:
        feedback.append("Try to answer more fluently and clearly.")
    elif confidence > 8:
        feedback.append("Your answer was fluent and confident.")

    return " ".join(feedback)


def main():
    # Read JSON from stdin (for CLI testing or Node.js piping)
    data = json.load(sys.stdin)
    user_answer = data.get("user_answer", "")
    reference_answer = data.get("reference_answer", "")

    semantic_score = get_semantic_similarity(user_answer, reference_answer)  # /10
    grammar_score = get_grammar_score(user_answer)                           # /10
    confidence_score = get_confidence_score(user_answer)                     # /10

    # Weighted overall score
    overall_score = round(
        semantic_score * 0.6 +
        confidence_score * 0.3 +
        grammar_score * 0.1, 2
    )

    feedback = generate_feedback(semantic_score, grammar_score, confidence_score)

    output = {
        "score": {
            "semantic": semantic_score,
            "grammar": grammar_score,
            "confidence": confidence_score,
            "overall": overall_score
        },
        "feedback": feedback
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
