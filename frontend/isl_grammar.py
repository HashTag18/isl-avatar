import spacy
import json
import sys

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# ─────────────────────────────────────────
# ISL GRAMMAR RULES
# ─────────────────────────────────────────

# Words to remove (articles, prepositions etc.)
STOP_SIGNS = {"the", "a", "an", "is", "are", "was", "were", "be", "been",
              "being", "to", "of", "in", "on", "at", "for", "with", "by"}

# Tense markers for ISL
TENSE_MARKERS = {
    "past":    "PAST",
    "present": "NOW",
    "future":  "FUTURE"
}

def detect_tense(doc):
    """Detect sentence tense from spaCy doc."""
    for token in doc:
        if token.tag_ in ("VBD", "VBN"):   # past tense verb
            return "past"
        if token.tag_ in ("MD",):           # modal (will, shall)
            if token.text.lower() in ("will", "shall", "going"):
                return "future"
    return "present"

def detect_question(doc):
    """Check if sentence is a question."""
    text = doc.text.strip()
    if text.endswith("?"):
        return True
    if doc[0].text.lower() in ("do", "does", "did", "is", "are", "was",
                                "were", "will", "can", "could", "would",
                                "should", "have", "has", "what", "where",
                                "when", "why", "who", "how"):
        return True
    return False

def detect_negation(doc):
    """Check if sentence has negation."""
    for token in doc:
        if token.dep_ == "neg" or token.text.lower() in ("not", "no",
                                                           "never", "don't",
                                                           "doesn't", "didn't",
                                                           "can't", "won't"):
            return True
    return False

def english_to_isl(text):
    """
    Convert English sentence to ISL gloss sequence.
    English: Subject-Verb-Object (SVO)
    ISL:     Subject-Object-Verb (SOV)
    """
    doc = nlp(text.strip())

    # Detect sentence features
    tense    = detect_tense(doc)
    question = detect_question(doc)
    negation = detect_negation(doc)

    # Extract subject, object, verb
    subject = []
    verb    = []
    obj     = []
    other   = []

    for token in doc:
        word = token.text.upper()

        # Skip stop words and punctuation
        if token.text.lower() in STOP_SIGNS:
            continue
        if token.is_punct:
            continue
        if token.text.lower() in ("not", "n't", "no", "never"):
            continue  # handled as negation marker separately

        # Categorize by dependency role
        if token.dep_ in ("nsubj", "nsubjpass"):
            subject.append(word)
        elif token.dep_ in ("dobj", "obj", "pobj", "attr", "dative"):
            obj.append(word)
        elif token.pos_ in ("VERB", "AUX") and token.dep_ != "aux":
            # Lemmatize verb for cleaner gloss
            verb.append(token.lemma_.upper())
        elif token.dep_ not in ("aux", "auxpass", "det", "prep"):
            other.append(word)

    # Build ISL gloss: Subject → Object → Other → Verb
    isl_tokens = subject + obj + other + verb

    # Add tense marker at start (ISL convention)
    if tense != "present":
        isl_tokens = [TENSE_MARKERS[tense]] + isl_tokens

    # Add negation marker at end (ISL convention)
    if negation:
        isl_tokens.append("NOT")

    # Add question marker at end (ISL convention)
    if question:
        isl_tokens.append("?")

    return {
        "success":    True,
        "original":   text,
        "isl_gloss":  isl_tokens,
        "isl_string": " ".join(isl_tokens),
        "tense":      tense,
        "is_question": question,
        "is_negation": negation
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Interactive mode for testing
        print("ISL Grammar Engine — type sentences to convert")
        print("Type 'quit' to exit\n")
        while True:
            text = input("English: ").strip()
            if text.lower() == "quit":
                break
            result = english_to_isl(text)
            print(f"ISL:     {result['isl_string']}")
            print(f"Tense:   {result['tense']}")
            print(f"Question:{result['is_question']}")
            print(f"Negation:{result['is_negation']}")
            print()
    else:
        text = " ".join(sys.argv[1:])
        result = english_to_isl(text)
        print(json.dumps(result))