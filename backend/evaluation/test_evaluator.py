# unified_evaluator_test.py
import json
import spacy
import torch
import time
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
import re
import contractions

# Load NLP model
nlp = spacy.load("en_core_web_sm")
STOP_WORDS = nlp.Defaults.stop_words

# === Text Preprocessor ===
class TextPreprocessor:
    def __init__(self):
        self.nlp = nlp
        self.stopwords = STOP_WORDS

    def expand_contractions(self, text):
        return contractions.fix(text)

    def preprocess(self, text, remove_stopwords=True, lemmatize=True):
        # DEBUG: Contraction expansion printing
        original = text
        text = self.expand_contractions(text)  # NEW
        if text != original:
            print(f"[Contraction Expanded] '{original}' → '{text}'")
        
        text = re.sub(r'\s+', ' ', text.strip().lower())
        doc = self.nlp(text)
        tokens = []

        for token in doc:
            if not token.is_alpha:
                continue
            if remove_stopwords and token.text in self.stopwords:
                continue
            lemma = token.lemma_.lower() if lemmatize else token.text.lower()
            tokens.append(lemma)

        return " ".join(tokens)

# === NLP Utils ===
def tokenize_and_lemmatize(text):
    return [
        token.lemma_.lower()
        for token in nlp(text)
        if token.is_alpha and token.lemma_.lower() not in STOP_WORDS
    ]

def detect_negations(text):
    doc = nlp(text)
    negated = set()

    for token in doc:
        if token.dep_ == "neg":
            negated.add(token.head.lemma_.lower())
            for child in token.head.children:
                if child != token:
                    negated.add(child.lemma_.lower())
    return negated

# === Model Loading ===
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Device set to use {device}")
model = SentenceTransformer('all-mpnet-base-v2', device=device)
nli_model = pipeline("text-classification", model="facebook/bart-large-mnli", device=0 if torch.cuda.is_available() else -1)
preprocessor = TextPreprocessor()

# === Scorer Functions ===
def detect_contradiction(reference, user_answer):
    result = nli_model(f"{reference} </s> {user_answer}")[0]
    label = result['label']
    score = result['score']
    if label == "CONTRADICTION" and score > 0.7:
        return True, score
    return False, score

def detect_keyword_contradiction(user_tokens):
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
    ans1_clean = preprocessor.preprocess(ans1)
    ans2_clean = preprocessor.preprocess(ans2)

    emb = model.encode([ans1_clean, ans2_clean], convert_to_tensor=True, normalize_embeddings=True)
    sim = util.pytorch_cos_sim(emb[0], emb[1]).item() * 10

    contradiction, conf = detect_contradiction(ans2_clean, ans1_clean)
    if contradiction:
        sim -= 3  # 🔧 stronger penalty

    user_tokens = tokenize_and_lemmatize(ans1_clean)
    keyword_contradictions = detect_keyword_contradiction(user_tokens)
    if keyword_contradictions > 0:
        sim -= keyword_contradictions

    return round(max(sim, 0), 2)

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
    return round(min(10, (len(words) / 4) + (avg_len / 1.5)), 2)

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

# === Evaluation Logic ===
def evaluate(user_answer, reference_answer, keywords):
    semantic = get_semantic_similarity(user_answer, reference_answer)
    keyword = get_keyword_overlap(user_answer, keywords)
    confidence = get_confidence_score(user_answer)

    overall = round(semantic * 0.6 + keyword * 0.2 + confidence * 0.2, 2)
    feedback = generate_feedback(semantic, keyword, confidence)

    return {
        "score": {
            "semantic": semantic,
            "keyword_overlap": keyword,
            "confidence": confidence,
            "overall": overall
        },
        "feedback": feedback
    }

# === Test Cases ===
if __name__ == "__main__":
    test_cases = [
        {
            "user_answer": "A loop repeats a block of code until a condition is false.",
            "reference_answer": "Looping means executing code repeatedly based on a condition.",
            "keywords": ["loop", "condition", "repeat"]
        },
        {
            "user_answer": "Recursion is a function calling itself until a base condition is met.",
            "reference_answer": "Recursive functions call themselves to solve smaller problems.",
            "keywords": ["recursion", "function", "base case"]
        },
        {
            "user_answer": "A queue works on FIFO while a stack uses LIFO approach.",
            "reference_answer": "Queue and stack are linear data structures with different access.",
            "keywords": ["queue", "stack", "FIFO", "LIFO"]
        },
        {
            "user_answer": "A while loop executes repeatedly until the condition becomes false.",
            "reference_answer": "Looping means executing repeatedly based on a condition.",
            "keywords": ["while", "loop", "condition", "repetition"]
        },
        {
            "user_answer": "Its like cooking pavbhaji in the old town of nevada where we contunously dunk in the goals and eat donuts",
            "reference_answer": "Looping refers to repeated execution of code.",
            "keywords": ["loop", "repetition"]
        }
    ]

    for case in test_cases:
        print("="*10)
        print(f"User Answer     : {case['user_answer']}")
        print(f"Reference Answer: {case['reference_answer']}")
        print(f"Keywords        : {case['keywords']}")
        print("="*10)
        result = evaluate(case['user_answer'], case['reference_answer'], case['keywords'])
        print("🧪 Result:")
        print(json.dumps(result, indent=2))
        print("\n")
