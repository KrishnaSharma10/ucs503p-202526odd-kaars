from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import docx
import pandas as pd
import json
import re
import google.generativeai as genai
import tempfile
import os
from typing import List
from pydantic import BaseModel

# ---------- CONFIG ----------
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI(title="Resume Matcher API")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DATA INPUT MODEL ----------
class SkillsInput(BaseModel):
    skills: List[str]

# ---------- UTILITIES ----------
def extract_text_from_resume(file_path: str):
    text = ""
    if file_path.endswith(".pdf"):
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

    elif file_path.endswith(".docx"):
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"

    return text.strip()


def parse_resume_with_gemini(resume_text):
    prompt = f"""
    Extract only the skills from the following resume.
    Return only a JSON array of strings.

    Resume:
    {resume_text}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except:
        return []


def calculate_skill_match_score(resume_skills, job_skills):
    if not job_skills or not resume_skills:
        return {"score": 0, "reason": "No skills to compare"}

    resume_set = set([s.lower().strip() for s in resume_skills])
    job_set = set([s.lower().strip() for s in job_skills])

    exact = resume_set.intersection(job_set)

    partial = set()
    for r in resume_set:
        for j in job_set:
            if r not in exact and j not in exact:
                if r in j or j in r:
                    partial.add(j)

    total_matches = len(exact) + len(partial) * 0.5
    score = int((total_matches / len(job_set)) * 100)

    if score >= 80:
        reason = f"Excellent match: {list(exact)[:3]}"
    elif score >= 60:
        reason = f"Good match: {list(exact)[:3]}"
    elif score >= 40:
        reason = f"Moderate match: {list(exact)[:3]}"
    else:
        reason = "Weak match"

    return {"score": score, "reason": reason}

# ---------- LOAD JOB DATA ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "cleaned_jobs_30.csv")

try:
    df_jobs = pd.read_csv(csv_path)
    df_jobs["skills_clean"] = df_jobs["skills_clean"].fillna("")
    df_jobs["skills_list"] = df_jobs["skills_clean"].str.lower().str.split(r',\s*')
    print("✓ Loaded job CSV successfully")
except Exception as e:
    print("✗ Failed to load CSV:", e)
    df_jobs = pd.DataFrame()

# ---------- ROUTES ----------
@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload resume and extract skills"""
    try:
        ext = os.path.splitext(file.filename)[1]

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        resume_text = extract_text_from_resume(tmp_path)
        os.unlink(tmp_path)

        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text")

        skills = parse_resume_with_gemini(resume_text)

        if not skills:
            raise HTTPException(status_code=400, detail="No skills found")

        return {"skills": skills}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/match_jobs")
async def match_jobs(data: SkillsInput):
    """Match resume skills using string matching"""
    resume_skills = data.skills
    print("📌 Skills Received:", resume_skills)

    if df_jobs.empty:
        raise HTTPException(status_code=500, detail="Job database not loaded")

    scores = []
    reasons = []

    for _, row in df_jobs.iterrows():
        result = calculate_skill_match_score(resume_skills, row["skills_list"])
        scores.append(result["score"])
        reasons.append(result["reason"])

    df_jobs["score"] = scores
    df_jobs["reason"] = reasons

    top_matches = df_jobs.sort_values(by="score", ascending=False).head(10)

    jobs = []
    for _, row in top_matches.iterrows():
        jobs.append({
            "job_title": row["job_title"],
            "company": row["company_name"],
            "location": row["location"],
            "skills": row["skills_list"],
            "reason": row["reason"],
            "score": int(row["score"]),
            "apply_link": row.get("apply_link", "") or ""
        })

    return jobs


@app.get("/")
def home():
    return {"message": "Resume Matcher API Running 🚀"}
