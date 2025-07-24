# evaluation/nlp_utils.py

import spacy

nlp = spacy.load("en_core_web_sm")
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
