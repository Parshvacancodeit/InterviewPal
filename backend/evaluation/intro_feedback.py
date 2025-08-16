import re
import sys
import json

def normalize(text):
    return text.lower()

def extract_university(text):
    # Capture "Indus University", "XYZ College", case-insensitive
    uni_match = re.search(r"(?i)\b(?:at|from)\s+([A-Z][a-zA-Z\s]+(?:University|College))\b", text)
    if uni_match:
        return uni_match.group(1).strip()
    return None

def extract_course(text):
    course_keywords = [
        "computer science", "cse", "btech", "b.tech", "bachelor of technology", "bachelors",
        "mtech", "m.tech", "master of technology", "information technology", "it",
        "electronics", "ece", "mechanical", "civil", "ai", "artificial intelligence",
        "data science", "ml", "machine learning", "nlp", "software engineering"
    ]
    for word in course_keywords:
        if word in text.lower():
            return word.title()
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
        "machine learning": "Machine Learning",
        "frontend": "Frontend",
        "backend": "Backend",
        "data analysis": "Data Analysis",
        "sql": "SQL",
        "django": "Django"
    }
    skills = []
    text_lower = text.lower()
    for k, v in skill_map.items():
        if re.search(rf"\b{k}\b", text_lower):
            skills.append(v)
    return list(set(skills))

def extract_goals(text):
    patterns = [
        r"(?:aim to|goal is to|my aim is to|want to|i want to)\s+([^.]+?)(?:\.|$| and my skills|,)",
        r"(?:aspire to|hope to)\s+([^.]+?)(?:\.|$| and my skills|,)"
    ]
    goals = []
    for pat in patterns:
        matches = re.findall(pat, text.lower())
        for m in matches:
            goal = m.strip().capitalize()
            if goal and goal not in goals:
                goals.append(goal)
    return goals if goals else None

def extract_experience(text):
    # Optional: Capture phrases like "worked at X", "internship at Y"
    exp_match = re.findall(r"(?:worked|interned|experience at|currently at)\s+([A-Z][a-zA-Z\s&]+)", text)
    return list(set(exp_match)) if exp_match else None

def generate_intro_feedback(text, user_name=None):
    text = normalize(text)
    
    parsed = {
        "name": user_name,
        "university": extract_university(text),
        "course": extract_course(text),
        "skills": extract_skills(text),
        "goals": extract_goals(text),
        "experience": extract_experience(text),
        "missing": []
    }

    for field in ["university", "course", "goals"]:
        if not parsed[field]:
            parsed["missing"].append(field)

    feedback = []
    if parsed["name"]:
        feedback.append(f" Hey {parsed['name']}, it's truly delightful to meet you!")
    if parsed["university"]:
        feedback.append(f"Pursuing studies at {parsed['university']} is inspiring.")
    if parsed["course"]:
        feedback.append(f"Studying {parsed['course']} shows your dedication to learning.")
    if parsed["skills"]:
        feedback.append(f"Your skills in {', '.join(parsed['skills'])} are genuinely impressive.")
    if parsed["experience"]:
        feedback.append(f"You also have experience at {', '.join(parsed['experience'])}, which adds great value.")
    if parsed["goals"]:
        feedback.append(f"I admire your ambitions: {', '.join(parsed['goals'])}. Keep chasing them! 🚀")
    if parsed["missing"]:
        feedback.append(f"It would be wonderful if you could also share your {' and '.join(parsed['missing'])} next time!")

    return {
        "parsed": parsed,
        "message": " ".join(feedback)
    }

if __name__ == '__main__':
    input_text = sys.argv[1]
    session_name = sys.argv[2] if len(sys.argv) > 2 else None
    result = generate_intro_feedback(input_text, user_name=session_name)
    print(json.dumps(result))
