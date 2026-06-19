import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

# Get API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env file")

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="AI Study Planner")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Request Model
# -------------------------
class StudyPlannerRequest(BaseModel):
    subject: str
    exam_date: str
    hours_per_day: int
    current_level: str


# -------------------------
# Response Model
# -------------------------
class StudyPlannerResponse(BaseModel):
    data: str


# -------------------------
# Home
# -------------------------
@app.get("/")
def home():
    return {"message": "AI Study Planner API Running"}


# -------------------------
# Generate Study Plan
# -------------------------
@app.post("/generate", response_model=StudyPlannerResponse)
def generate_study_plan(request: StudyPlannerRequest):

    prompt = f"""
You are an expert study planner.

Create a personalized study plan using the following details.

Subject: {request.subject}

Exam Date: {request.exam_date}

Hours Available Per Day: {request.hours_per_day}

Current Knowledge Level: {request.current_level}

Requirements:
- Divide preparation into weekly phases.
- Include daily study schedule.
- Suggest revision days.
- Include mock tests.
- Give productivity tips.
- Use bullet points.
- Make the plan neat and easy to read.
"""

    try:

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_completion_tokens=1000
        )

        if not completion.choices:
            raise HTTPException(
                status_code=500,
                detail="No response received from Groq."
            )

        return {
            "data": completion.choices[0].message.content
        }

    except Exception as e:
        print("Groq Error:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )