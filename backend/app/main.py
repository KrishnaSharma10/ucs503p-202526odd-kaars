from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
import tempfile, re, json, os, pdfplumber, docx
import google.generativeai as genai

app = FastAPI()

# CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # TEMP – loosened to make sure it works first
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LOAD DATA
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "cleaned_jobs_30.csv")

df_jobs = pd.read_csv(csv_path)
df_jobs['skills_list'] = df_jobs['skills_clean'].fillna('').str.lower().str.split(r',\s*')

# RESUME ENDPOINT
@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    return {"skills": ["python", "c++"]}   # TEMP to test endpoint works

# MATCH ENDPOINT — RAW LIST INPUT
@app.post("/match_jobs")
async def match_jobs(resume_skills: List[str]):
    print("Received:", resume_skills)
    return {"ok": True, "received": resume_skills}

@app.get("/")
def home():
    return {"message": "live"}
