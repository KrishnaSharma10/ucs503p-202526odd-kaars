import requests
import pandas as pd
import google.generativeai as genai

# Fetch job data
url = "https://jsearch.p.rapidapi.com/search"
querystring = {
    "query": "fresher developer jobs in india",
    "page": "1",
    "num_pages": "1",
    "country": "in",
    "date_posted": "all"
}
headers = {
    "x-rapidapi-key": "ca6e7df983mshea70261574373f0p14e269jsn34f065cfd214",
    "x-rapidapi-host": "jsearch.p.rapidapi.com"
}
response = requests.get(url, headers=headers, params=querystring)
data = response.json()

# Extract job data
jobs = data.get("data", [])
df = pd.DataFrame(jobs)

# Columns you want
required_columns = [
    "job_title",
    "employer_name",
    "job_location",
    "job_description",
    "job_apply_link",
]

# Ensure missing columns exist
for col in required_columns:
    if col not in df.columns:
        df[col] = None

# Select final columns
df = df[required_columns]

# Rename columns
df = df.rename(columns={
    "job_title": "job_title",
    "employer_name": "company",
    "job_location": "location",
    "job_description": "description",
    "job_apply_link": "apply_link"
})

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# Function to extract skills using Gemini
def extract_skills(description):
    if pd.isna(description) or not description:
        return ""
    
    try:
        prompt = f"""Extract technical skills, programming languages, frameworks, and tools from this job description. 
        Return ONLY a comma-separated list of skills with no other text or explanation.
        
        Job Description: {description}"""
        
        response = model.generate_content(prompt)
        skills = response.text.strip()
        return skills
    except Exception as e:
        print(f"Error extracting skills: {e}")
        return ""

# Extract skills for each job
print("Extracting skills using Gemini...")
df['skills'] = df['description'].apply(extract_skills)

# Reorder columns to have skills after description
df = df[['job_title', 'company', 'location', 'description', 'skills', 'apply_link']]

# Save to CSV
df.to_csv('cleaned_jobs_30.csv', index=False)
print("Data saved to cleaned_jobs_30.csv")
