# evaluation/scorer.py

import torch
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
from .nlp_utils import tokenize_and_lemmatize, detect_negations
from .text_preprocessor import TextPreprocessor

preprocessor = TextPreprocessor()

# Load sentence transformer and NLI model
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = SentenceTransformer('all-mpnet-base-v2', device=device)
nli_model = pipeline("text-classification", model="facebook/bart-large-mnli", device=0 if torch.cuda.is_available() else -1)


def detect_contradiction(reference, user_answer):
    """Check if the user answer contradicts the reference using NLI."""
    result = nli_model(f"{reference} </s> {user_answer}")[0]
    label = result['label']
    score = result['score']
    if label == "CONTRADICTION" and score > 0.7:
        return True, score
    return False, score


def detect_keyword_contradiction(user_tokens):
    """Detect mutually exclusive keywords in the user's answer."""
    contradiction_sets = [
        {"loop", "recursion"},
        {"iterative", "recursive"},
        {"stack", "queue"}
    ]
    contradictions = 0
    for pair in contradiction_sets:
        if pair.issubset(set(user_tokens)):
            contradictions += 1
    return contradictions


def get_semantic_similarity(ans1, ans2):
    """Compute semantic similarity with contradiction penalty."""
    ans1_clean = preprocessor.preprocess(ans1)
    ans2_clean = preprocessor.preprocess(ans2)

    emb = model.encode([ans1_clean, ans2_clean], convert_to_tensor=True, normalize_embeddings=True)
    sim = util.pytorch_cos_sim(emb[0], emb[1]).item() * 10  # Scale to 10

    # Apply contradiction penalty
    contradiction, conf = detect_contradiction(ans2_clean, ans1_clean)
    if contradiction:
        sim -= 2  # Mild penalty for contradiction

    # Additional penalty for contradictory keywords
    user_tokens = tokenize_and_lemmatize(ans1_clean)
    keyword_contradictions = detect_keyword_contradiction(user_tokens)
    if keyword_contradictions > 0:
        sim -= keyword_contradictions  # -1 per contradiction

    return round(max(sim, 0), 2)  # Avoid negative score


def get_keyword_overlap(user_answer, reference_keywords):
    user_tokens = tokenize_and_lemmatize(user_answer)
    negated = detect_negations(user_answer)

    keyword_tokens = []
    for kw in reference_keywords:
        keyword_tokens.extend(tokenize_and_lemmatize(kw))

    user_tokens = [token for token in user_tokens if token not in negated]
    matched = set(user_tokens) & set(keyword_tokens)

    return round((len(matched) / len(set(keyword_tokens))) * 10, 2) if keyword_tokens else 0.0


def get_confidence_score(text):
    words = text.split()
    if not words:
        return 0
    avg_len = sum(len(w) for w in words) / len(words)
    return round(min(10, (len(words) / 5) + (avg_len / 2)), 2)


def generate_feedback(semantic, keyword, confidence):
    fb = []
    fb.append("Answer is semantically relevant." if semantic > 7 else
              "Some relevance, but missing key concepts." if semantic > 4 else
              "Answer is not aligned with expected content.")
    
    fb.append("Key terms used appropriately." if keyword >= 5 else
              "Try using more relevant terms.")
    
    if confidence < 5:
        fb.append("Try to speak more fluently and clearly.")
    elif confidence > 8:
        fb.append("Answer feels fluent and confident.")

    return " ".join(fb)
