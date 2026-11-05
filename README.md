# CareerPilot AI 🚀

> **AI-powered skill-to-job matching and career management platform for students and recruiters.**

CareerPilot AI helps students understand their career readiness, discover matching opportunities, close skill gaps, and practice interviews — while giving recruiters a streamlined hiring workspace.

---

## ✨ Features

### For Students
- 🎯 **AI Job Matching** — TF-IDF cosine similarity matching with explainable local fallback
- 📊 **Career Readiness Score** — Based on profile completeness, skills, resume quality
- 🔍 **Skill Gap Analysis** — Compare your skills against job requirements
- 🗺️ **Career Roadmap** — Personalized week-by-week learning plan
- 📄 **ATS Resume Analysis** — Resume scoring + improvement suggestions
- 🎤 **Interview Studio** — Practice questions with automated keyword feedback
- 📋 **Application Tracker** — Track every application and its current status
- 🧑‍💼 **Full Profile Management** — Resume text, skills, education, GitHub, LinkedIn

### For Recruiters
- 📢 **Job Posting Management** — Create, edit, and close job listings
- 👥 **Applicant Pipeline** — View candidates and move them through hiring stages
- 🏷️ **Application Status Updates** — APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → OFFERED/REJECTED

### For Admins
- 📈 **Platform Overview** — Users, jobs, applications at a glance
- 🔧 **Full access** to all data

---

## 🏗️ Architecture

```
careerpilot-ai/
├── backend/                  # Spring Boot 4.1.2 (Java 21)
│   ├── src/main/java/com/careerpilot/
│   │   ├── CareerPilotApplication.java
│   │   ├── config/           # SecurityConfig, DataSeeder
│   │   ├── controller/       # AuthController, CareerController, ApiExceptionHandler
│   │   ├── dto/              # ApiDtos (records)
│   │   ├── model/            # AppUser, StudentProfile, Job, JobApplication, enums
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/         # JwtService, JwtAuthenticationFilter
│   │   └── service/          # CareerService, AiMatchingClient
│   └── src/main/resources/
│       ├── application.properties          # H2 (local dev)
│       ├── application-mysql.properties    # MySQL (production)
│       └── static/
│           ├── index.html    # Single-page app shell (Tailwind CSS)
│           └── app.js        # Vanilla JS SPA (~260 lines)
├── ai-service/               # Python FastAPI TF-IDF service
│   ├── main.py               # /health and /match endpoints
│   └── requirements.txt
├── docker-compose.yml        # MySQL + Backend + AI service
├── run-local.sh              # Quick local start (H2)
└── run-mysql.sh              # MySQL mode start
```

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 21, Spring Boot 4.1.2, Spring Security, Spring Data JPA |
| Database | H2 (local dev), MySQL 8 (production) |
| Auth | JWT (custom HS256, no external library) |
| Password | BCrypt |
| Frontend | Vanilla JS SPA, Tailwind CSS CDN, Chart.js |
| AI Service | Python 3.13, FastAPI, scikit-learn (TF-IDF) |
| Container | Docker, Docker Compose |

---

## 📋 Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Java | 21+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Python | 3.9+ | `python3 --version` |
| pip | any | `pip3 --version` |

**Optional (for Docker/MySQL mode):**
- Docker Desktop

---

## ⚡ Quick Start (H2 — No external DB needed)

### 1. Clone the project
```bash
cd /path/to/careerpilot-ai
```

### 2. Start the backend (H2 auto-creates database)
```bash
cd backend
mvn spring-boot:run -o
```
Backend starts on **http://localhost:8080** in ~3 seconds.

### 3. Start the AI service (optional — backend falls back gracefully)
```bash
# In a new terminal
cd ai-service
pip3 install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001
```
AI service starts on **http://localhost:8001**.

### 4. Open in browser
Navigate to **http://localhost:8080**

---

## 🐳 Docker / MySQL Mode

```bash
docker-compose up --build
```

This starts:
- MySQL 8 container
- CareerPilot AI backend (connected to MySQL)
- Python AI service

Backend: http://localhost:8080  
AI service: http://localhost:8001

---

## 🔑 Demo Credentials

> All demo accounts use the same password: **`CareerPilot@123`**

| Role | Email | Password |
|------|-------|----------|
| Student | `student@careerpilot.ai` | `CareerPilot@123` |
| Recruiter | `recruiter@careerpilot.ai` | `CareerPilot@123` |
| Admin | `admin@careerpilot.ai` | `CareerPilot@123` |

Demo data is seeded automatically on first startup (`app.seed.enabled=true`).  
To disable seeding: set env var `SEED_DATA=false`.

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend + Backend | http://localhost:8080 |
| H2 Console | http://localhost:8080/h2-console |
| Health check | http://localhost:8080/actuator/health |
| AI service | http://localhost:8001 |
| AI health | http://localhost:8001/health |

### H2 Console Settings
- JDBC URL: `jdbc:h2:file:./data/careerpilot`
- Username: `sa`
- Password: *(empty)*

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register student or recruiter |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user info |

### Student
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard` | Bearer | Role-specific dashboard data |
| GET | `/api/profile/me` | Bearer (STUDENT) | Get student profile |
| PUT | `/api/profile/me` | Bearer (STUDENT) | Update student profile |
| GET | `/api/jobs` | Bearer | List all active jobs (with filters) |
| POST | `/api/applications` | Bearer (STUDENT) | Apply to a job |
| GET | `/api/applications` | Bearer | Student's applications |
| POST | `/api/analysis/run` | Bearer (STUDENT) | Run AI career analysis |
| GET | `/api/interview/question` | Bearer | Get practice interview question |
| POST | `/api/interview/evaluate` | Bearer | Evaluate interview answer |

### Recruiter
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/jobs` | Bearer (RECRUITER) | Create job posting |
| PUT | `/api/jobs/{id}` | Bearer (RECRUITER) | Update job posting |
| DELETE | `/api/jobs/{id}` | Bearer (RECRUITER) | Close job posting |
| GET | `/api/recruiter/jobs` | Bearer (RECRUITER) | List own job postings |
| GET | `/api/applications` | Bearer (RECRUITER) | View all applicants |
| PATCH | `/api/applications/{id}/status` | Bearer (RECRUITER) | Update application status |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/overview` | Bearer (ADMIN) | Platform statistics |

### AI Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| POST | `/match` | TF-IDF job matching |

---

## 🗄️ Database Configuration

### Local Development (H2)
Default `application.properties` uses:
```properties
spring.datasource.url=jdbc:h2:file:./data/careerpilot
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
```
Database file is created at `backend/data/careerpilot.mv.db`.

### MySQL Production
Activate with profile `mysql`:
```bash
mvn spring-boot:run -Dspring.profiles.active=mysql
```
Or set env vars:
```bash
export DB_URL=jdbc:mysql://localhost:3306/careerpilot?useSSL=false
export DB_USERNAME=careerpilot
export DB_PASSWORD=your_password
export DB_DRIVER=com.mysql.cj.jdbc.Driver
```

---

## 🔐 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Backend server port |
| `DB_URL` | `jdbc:h2:file:./data/careerpilot` | JDBC URL |
| `DB_USERNAME` | `sa` | Database username |
| `DB_PASSWORD` | *(empty)* | Database password |
| `DB_DRIVER` | `org.h2.Driver` | JDBC driver class |
| `DDL_AUTO` | `update` | Hibernate DDL strategy |
| `JWT_SECRET` | *(dev default)* | JWT signing secret — **change in production!** |
| `JWT_EXPIRATION_HOURS` | `24` | Token validity in hours |
| `AI_SERVICE_URL` | `http://localhost:8001` | Python AI service URL |
| `SEED_DATA` | `true` | Enable demo data seeding |

---

## 🛠️ Troubleshooting

### H2 "Feature not supported: AUTO_SERVER=TRUE" error
**Fixed.** The old URL `jdbc:h2:file:./data/careerpilot;AUTO_SERVER=TRUE;DB_CLOSE_ON_EXIT=FALSE` has been replaced with the simple `jdbc:h2:file:./data/careerpilot`. H2 2.x removed `AUTO_SERVER` support in combination with file-based DBs.

### Port 8080 already in use
```bash
# Find and kill the process using port 8080
lsof -i :8080
kill -9 <PID>
```

### Maven can't download plugins (no network)
Run in offline mode if all dependencies are already cached:
```bash
mvn spring-boot:run -o
```

### AI service not found
The backend falls back to a local explainable matching engine automatically if the AI service is offline. The analysis will work but will show "Explainable local matching" instead of "TF-IDF semantic matching service".

### Python pip blocked by OS
On macOS with Homebrew Python 3.13+:
```bash
pip3 install --break-system-packages -r ai-service/requirements.txt
```

---

## ⚠️ Known Limitations

1. **Resume file upload** — Only `.txt` and `.md` files are supported. PDF/DOCX parsing is not implemented; users paste text manually.
2. **Interview feedback** — Uses keyword matching, not an LLM. It's clearly labeled as automated practice, not real interview evaluation.
3. **AI matching engine** — Uses TF-IDF cosine similarity, not an LLM or embedding model. Scores are directional signals, not hiring predictions.
4. **Admin user management** — The admin dashboard shows statistics and recent jobs. Full CRUD user management UI is not implemented in the frontend (available via API).
5. **No email notifications** — Application status changes are visible in the dashboard but no email is sent.
6. **No file storage** — Resume text is stored in the database as plain text; no actual file is stored.
7. **H2 single-instance** — `AUTO_SERVER=TRUE` was removed, so H2 only supports one JVM connection at a time (fine for development).

---

## 🚀 Exact Commands to Start the Project

```bash
# Terminal 1: Backend (required)
cd /path/to/careerpilot-ai/backend
mvn spring-boot:run -o
# App available at http://localhost:8080

# Terminal 2: AI Service (optional — improves matching accuracy)
cd /path/to/careerpilot-ai/ai-service
pip3 install -r requirements.txt    # First time only
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001
# AI service at http://localhost:8001
```
