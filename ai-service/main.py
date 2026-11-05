from typing import List
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="CareerPilot AI Matching Service", version="1.0.0")

class JobInput(BaseModel):
    jobId: int
    title: str = ""
    requiredSkills: str = ""
    description: str = ""

class MatchRequest(BaseModel):
    skills: List[str] = Field(default_factory=list)
    jobs: List[JobInput] = Field(default_factory=list)

@app.get("/health")
def health():
    return {"status": "ok", "engine": "TF-IDF + cosine similarity"}

@app.post("/match")
def match(payload: MatchRequest):
    if not payload.jobs:
        return {"matches": []}
    profile_text = " ".join(payload.skills).strip() or "no declared skills"
    documents = [profile_text] + [f"{job.title} {job.requiredSkills} {job.description}" for job in payload.jobs]
    matrix = TfidfVectorizer(ngram_range=(1, 2), stop_words="english").fit_transform(documents)
    similarities = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    results = []
    for job, similarity in zip(payload.jobs, similarities):
        # The score is an explainable similarity signal, not a probability of being hired.
        score = round(float(similarity) * 100)
        results.append({"jobId": job.jobId, "score": max(0, min(99, score))})
    return {"matches": results}
