import spacy

class TextPreprocessor:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.stopwords = self.nlp.Defaults.stop_words

    def preprocess(self, text, remove_stopwords=True, lemmatize=True):
        """
        Full preprocessing pipeline:
        - Lowercase
        - Remove stopwords (optional)
        - Lemmatize (optional)
        - Remove punctuation and numbers
        - Return cleaned string
        """
        doc = self.nlp(text.lower())
        tokens = []

        for token in doc:
            if not token.is_alpha:
                continue
            if remove_stopwords and token.text in self.stopwords:
                continue
            lemma = token.lemma_.lower() if lemmatize else token.text.lower()
            tokens.append(lemma)

        return " ".join(tokens)

    def tokenize(self, text):
        """Returns raw tokens without any cleaning."""
        return [token.text for token in self.nlp(text)]

    def lemmatize(self, text):
        """Returns list of lemmatized tokens."""
        return [token.lemma_ for token in self.nlp(text)]

    def get_negated_tokens(self, text):
        """Detects negated tokens in a sentence."""
        doc = self.nlp(text)
        negated = set()

        for token in doc:
            if token.dep_ == "neg":
                negated.add(token.head.lemma_.lower())
                for child in token.head.children:
                    if child != token:
                        negated.add(child.lemma_.lower())

        return negated
