import re
import sys
import json
import sys
print("🐍 All args:", sys.argv, file=sys.stderr)


def normalize(text):
    return text.lower()

def extract_university(text):
    uni_match = re.search(r"(from|at)\s+([a-zA-Z ,]*university|[a-zA-Z ,]*college)", text)
    if uni_match:
        return uni_match.group(2).strip().title()
    return None

def extract_course(text):
    course_keywords = [
        "computer science", "cse", "btech", "b.tech", "bachelors", "mtech", "m.tech",
        "information technology", "it", "ece", "electronics", "mechanical", "civil"
    ]
    for word in course_keywords:
        if word in text:
            return word.upper()
    return None

def extract_skills(text):
    skill_map = {
        "react": "React",
        "react js": "React",
        "js": "JavaScript",
        "javascript": "JavaScript",
        "python": "Python",
        "web development": "Web Development",
        "nlp": "Natural Language Processing",
        "ai": "Artificial Intelligence",
        "ml": "Machine Learning",
        "frontend": "Frontend",
        "backend": "Backend",
    }
    skills = []
    for k, v in skill_map.items():
        if k in text:
            skills.append(v)
    return list(set(skills))

def extract_goals(text):
    match = re.search(r"(aim to|goal is to|goal is|my aim is to|want to|i want to)\s+([^.]+)", text)
    if match:
        return match.group(2).strip().capitalize()
    return None

def generate_intro_feedback(text, user_name=None):
    text = normalize(text)
    
    parsed = {
        "name": user_name,  # Use session-provided name only
        "university": extract_university(text),
        "course": extract_course(text),
        "skills": extract_skills(text),
        "goals": extract_goals(text),
        "missing": []
    }

    # Check missing fields except name
    for field in ["university", "course", "goals"]:
        if not parsed[field]:
            parsed["missing"].append(field)

    feedback = []
    if parsed["name"]:
        feedback.append(f"Nice to meet you, {parsed['name']}!")
    if parsed["university"]:
        feedback.append(f"Great that you're from {parsed['university']}.")
    if parsed["course"]:
        feedback.append(f"Studying {parsed['course']} sounds interesting.")
    if parsed["skills"]:
        feedback.append(f"Skills like {', '.join(parsed['skills'])} are very valuable.")
    if parsed["goals"]:
        feedback.append(f"Ambition is key – aiming to {parsed['goals']} is impressive!")

    if parsed["missing"]:
        feedback.append(f"You could also mention your {' and '.join(parsed['missing'])} next time!")

    return {
        "parsed": parsed,
        "message": " ".join(feedback)
    }

if __name__ == '__main__':
    input_text = sys.argv[1]
    session_name = sys.argv[2] if len(sys.argv) > 2 else None
    result = generate_intro_feedback(input_text, user_name=session_name)
    print("🐍 Name received in Python:", session_name, file=sys.stderr)

    print(json.dumps(result))
