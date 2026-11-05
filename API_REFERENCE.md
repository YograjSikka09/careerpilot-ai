# API reference

Base URL: `http://localhost:8080/api`

For protected routes, send `Authorization: Bearer <JWT>`.

## Authentication

`POST /auth/register`
```json
{"fullName":"Yograj Sikka","email":"yograj@example.com","password":"ChangeMe123!","role":"STUDENT"}
```

`POST /auth/login`
```json
{"email":"student@careerpilot.ai","password":"CareerPilot@123"}
```

## Profile

`PUT /profile/me`
```json
{
  "headline":"Computer Science Student | Java Developer",
  "university":"Example University",
  "degree":"B.Tech Computer Science",
  "graduationYear":2027,
  "cgpa":8.2,
  "location":"Pune, India",
  "skills":"Java, Spring Boot, MySQL, REST APIs, Git",
  "resumeText":"EDUCATION... PROJECTS... EXPERIENCE...",
  "githubUrl":"https://github.com/example",
  "linkedinUrl":"https://www.linkedin.com/in/example",
  "bio":"Interested in backend engineering.",
  "confidence":72
}
```

## Jobs

`POST /jobs` (Recruiter/Admin)
```json
{
  "title":"Java Developer Intern",
  "company":"Example Labs",
  "location":"Bengaluru / Hybrid",
  "jobType":"Internship",
  "experienceLevel":"Entry level",
  "salaryRange":"₹20k–30k / month",
  "description":"Build and test REST APIs.",
  "requiredSkills":"Java, Spring Boot, SQL, Git",
  "minCgpa":7.0
}
```

`GET /jobs?q=java&location=Bengaluru`

`POST /applications`
```json
{"jobId":1,"coverNote":"I am interested in this role."}
```

`PATCH /applications/1/status`
```json
{"status":"SHORTLISTED"}
```

`POST /analysis/run`
```json
{"confidence":72}
```

`POST /interview/evaluate`
```json
{
  "role":"Software Engineer",
  "question":"How would you design a REST API for a job application workflow?",
  "answer":"I would model applications as a resource, validate the request, enforce ownership and return appropriate HTTP status codes."
}
```
