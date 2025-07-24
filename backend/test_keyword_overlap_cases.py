import re
import spacy

# Load SpaCy English model
nlp = spacy.load("en_core_web_sm")

# Stopwords from SpaCy
STOP_WORDS = nlp.Defaults.stop_words

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

def keyword_overlap(user_answer, reference_keywords):
    user_tokens = tokenize_and_lemmatize(user_answer)
    negated = detect_negations(user_answer)

    # ✅ Process each keyword individually (so "testing" → "test")
    keyword_tokens = []
    for kw in reference_keywords:
        keyword_tokens.extend(tokenize_and_lemmatize(kw))

    user_tokens = [token for token in user_tokens if token not in negated]

    matched = set(user_tokens) & set(keyword_tokens)

    return len(matched), len(keyword_tokens), matched, user_tokens, keyword_tokens, negated


def run_tests():
    test_cases = [
        {
            "user_answer": "Python's libraries like pandas help process data efficiently.",
            "keywords": ['python', 'pandas', 'numpy', 'data', 'processing'],
            "expected_score": 0.6
        },
        {
            "user_answer": "no react does not have router.",
            "keywords": ['react', 'router'],
            "expected_score": 0.0
        },
        {
            "user_answer": "React is great for frontend UI development.",
            "keywords": ['react', 'javascript', 'ui', 'frontend'],
            "expected_score": 0.75
        },
        {
            "user_answer": "Algorithms are crucial for efficient engineering but data structures are less important here.",
            "keywords": ['algorithms', 'data', 'structures', 'software', 'engineering'],
            "expected_score": 0.8
        },
        {
            "user_answer": "AWS and Azure provide cloud infrastructure but scalability is not their main focus.",
            "keywords": ['cloud', 'aws', 'azure', 'infrastructure', 'scalable'],
            "expected_score": 0.8
        },
        {
            "user_answer": "Debugging is essential, testing comes next, deployment is final in software development.",
            "keywords": ['testing', 'deployment', 'debugging', 'software', 'lifecycle'],
            "expected_score": 0.8
        },
    ]

    print("🧪 Running Test Cases...\n")
    for i, test in enumerate(test_cases, 1):
        matched, total, matched_tokens, user_tokens, keyword_tokens, negated = keyword_overlap(
            test["user_answer"], test["keywords"]
        )
        score = round(matched / total, 2) if total > 0 else 0.0
        expected = test["expected_score"]

        result = "✅ PASSED" if abs(score - expected) <= 0.05 else "❌ FAILED"

        print(f"--- Test {i} ---")
        print(f"🧠 User Answer: {test['user_answer']}")
        print(f"🎯 Keywords: {test['keywords']}")
        print(f"📊 Score: {score} | Expected: {expected}")
        print(f"✅ Matched: {matched_tokens}")
        print(f"⛔ Negated: {negated}")
        print(f"{result}\n")

# 🔥 Run tests here
if __name__ == "__main__":
    run_tests()
