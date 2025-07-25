from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load questions from data folder
@app.post("/start")
async def start_interview(request: Request):
    body = await request.json()
    tech = body.get("tech")
    difficulty = body.get("difficulty")

    q_path = os.path.join("data", "questions.json")
    with open(q_path, "r") as f:
        all_questions = json.load(f)

    filtered = [
        q for q in all_questions
        if q["tech"] == tech and q["difficulty"] == difficulty
    ][:10]

    return {"questions": filtered}
