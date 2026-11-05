# Architecture & data design

## High-level architecture

```mermaid
flowchart LR
  Student[Student Browser] --> UI[Tailwind + JavaScript UI]
  Recruiter[Recruiter Browser] --> UI
  Admin[Admin Browser] --> UI
  UI --> API[Spring Boot REST API]
  API --> Auth[JWT + Role Authorization]
  API --> Service[Career Services]
  Service --> DB[(MySQL / H2)]
  Service --> Match[Python FastAPI AI Service]
  Match --> TFIDF[TF-IDF + Cosine Similarity]
  Service --> Fallback[Explainable Java Skill Matcher]
```

The browser and REST API are served from the same Spring Boot application. The Python matching service is optional. If it is unavailable, the Java matching fallback keeps the core workflow available.

## Logical modules

- Identity: account registration, login, password hashing, JWT and role checks.
- Student profile: education, skills, resume text, links and confidence self-rating.
- Job management: recruiter-owned job creation, editing, closing and public listing.
- Applications: student submissions, duplicate prevention and recruiter status updates.
- Career intelligence: skill matching, readiness estimate, ATS-style feedback, risk signals and roadmap.
- Interview studio: role-based question prompts and structured practice feedback.
- Administration: platform-level counts and active-job overview.

## Database entities

```mermaid
erDiagram
  APP_USER ||--o| STUDENT_PROFILE : has
  APP_USER ||--o{ JOB : posts
  APP_USER ||--o{ JOB_APPLICATION : submits
  JOB ||--o{ JOB_APPLICATION : receives
  APP_USER {
    bigint id PK
    string full_name
    string email UK
    string password_hash
    string user_role
    boolean enabled
    datetime created_at
  }
  STUDENT_PROFILE {
    bigint id PK
    bigint user_id FK
    string headline
    string education
    string skills
    text resume_text
    integer confidence
  }
  JOB {
    bigint id PK
    bigint created_by FK
    string title
    string company
    string location
    string required_skills
    text description
    boolean active
  }
  JOB_APPLICATION {
    bigint id PK
    bigint student_id FK
    bigint job_id FK
    string status
    text cover_note
    datetime applied_at
  }
```

The JPA model creates and updates tables for the demo. A production implementation should introduce Flyway/Liquibase migrations, explicit indexes and reviewed retention rules.

## Main application lifecycle

1. User registers or signs in. The API verifies the password hash and returns a signed JWT.
2. The browser sends the JWT with protected API requests.
3. The API resolves the current user and checks the user's role and ownership before privileged actions.
4. Students maintain their profile, explore open jobs and submit applications.
5. Recruiters manage their own postings and advance the status of applications received for those postings.
6. Career analysis compares a student's skills and resume text with active job requirements. TF-IDF matching is used when the Python service is online; otherwise the Java skill-coverage matcher runs.
7. The result includes matching signals, missing skills, resume suggestions, risk notes and a suggested learning sequence.

## Important design boundaries

- Match scores are relevance signals, not hiring probabilities.
- Resume/ATS feedback and interview feedback are heuristic demo features, not validated hiring assessments.
- Recruiter access is limited to applications for jobs they own. Admin has platform-wide aggregate access.
- A student can apply only once to a given job and can only see their own applications.
