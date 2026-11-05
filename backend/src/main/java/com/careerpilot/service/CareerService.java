package com.careerpilot.service;

import com.careerpilot.dto.ApiDtos.*;
import com.careerpilot.model.*;
import com.careerpilot.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CareerService {
    private final UserRepository users;
    private final ProfileRepository profiles;
    private final JobRepository jobs;
    private final ApplicationRepository applications;
    private final PasswordEncoder passwordEncoder;
    private final AiMatchingClient aiMatchingClient;
    @org.springframework.beans.factory.annotation.Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public CareerService(UserRepository users, ProfileRepository profiles, JobRepository jobs,
                         ApplicationRepository applications, PasswordEncoder passwordEncoder,
                         AiMatchingClient aiMatchingClient) {
        this.users=users; this.profiles=profiles; this.jobs=jobs; this.applications=applications;
        this.passwordEncoder=passwordEncoder; this.aiMatchingClient=aiMatchingClient;
    }

    public AppUser currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication() == null ? null : SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) throw new IllegalStateException("Please sign in again.");
        return users.findByEmailIgnoreCase(principal.toString()).orElseThrow(() -> new IllegalStateException("Account not found."));
    }

    public Map<String,Object> register(RegisterRequest req, com.careerpilot.security.JwtService jwt) {
        String email=req.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) throw new IllegalArgumentException("An account with this email already exists.");
        Role role;
        try { role = Role.valueOf(req.role() == null ? "STUDENT" : req.role().trim().toUpperCase(Locale.ROOT)); }
        catch (Exception ex) { role = Role.STUDENT; }
        if (role == Role.ADMIN) throw new IllegalArgumentException("Administrator accounts are provisioned by the platform.");
        AppUser user=users.save(new AppUser(req.fullName().trim(), email, passwordEncoder.encode(req.password()), role));
        if (role == Role.STUDENT) profiles.save(new StudentProfile(user));
        return authResponse(user, jwt.create(user.getEmail(), user.getRole().name()), "Account created successfully.");
    }

    public Map<String,Object> login(LoginRequest req, com.careerpilot.security.JwtService jwt) {
        AppUser user=users.findByEmailIgnoreCase(req.email().trim()).orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
        if (!user.isEnabled() || !passwordEncoder.matches(req.password(), user.getPasswordHash())) throw new IllegalArgumentException("Invalid email or password.");
        return authResponse(user, jwt.create(user.getEmail(), user.getRole().name()), "Welcome back.");
    }

    public Map<String,Object> authResponse(AppUser user, String token, String message) {
        Map<String,Object> out=new LinkedHashMap<>(); out.put("token",token); out.put("message",message); out.put("user", userSummary(user)); return out;
    }
    public Map<String,Object> userSummary(AppUser u) {
        return Map.of("id",u.getId(),"fullName",u.getFullName(),"email",u.getEmail(),"role",u.getRole().name());
    }

    public Map<String,Object> profile() { AppUser user=currentUser(); requireRole(user,Role.STUDENT); return profileMap(ensureProfile(user)); }
    public Map<String,Object> saveProfile(ProfileRequest req) {
        AppUser user=currentUser(); requireRole(user, Role.STUDENT);
        StudentProfile p=ensureProfile(user);
        p.setHeadline(clean(req.headline())); p.setUniversity(clean(req.university())); p.setDegree(clean(req.degree()));
        p.setGraduationYear(req.graduationYear()); p.setCgpa(req.cgpa()); p.setLocation(clean(req.location()));
        p.setSkills(clean(req.skills())); p.setResumeText(clean(req.resumeText())); p.setGithubUrl(clean(req.githubUrl()));
        p.setLinkedinUrl(clean(req.linkedinUrl())); p.setBio(clean(req.bio()));
        if (req.confidence()!=null) p.setConfidence(Math.max(0,Math.min(100,req.confidence())));
        return profileMap(profiles.save(p));
    }
    public Map<String,Object> uploadResume(MultipartFile file, String clientText) {
        AppUser user=currentUser(); requireRole(user, Role.STUDENT);
        if (file==null || file.isEmpty()) throw new IllegalArgumentException("Please select a valid resume file.");
        String name = file.getOriginalFilename();
        if (name==null || name.isBlank()) name = "resume.pdf";
        String lower = name.toLowerCase(Locale.ROOT);
        if (!lower.endsWith(".pdf") && !lower.endsWith(".docx") && !lower.endsWith(".txt") && !lower.endsWith(".md")) {
            throw new IllegalArgumentException("Unsupported format. Please upload a PDF, DOCX, or TXT file.");
        }
        if (file.getSize() > 10 * 1024 * 1024) throw new IllegalArgumentException("Resume file size exceeds the 10MB limit.");
        StudentProfile p=ensureProfile(user);
        p.setResumeFileName(name);
        p.setResumeFileSize(file.getSize());
        p.setResumeUploadedAt(LocalDateTime.now());
        try {
            java.nio.file.Path dirPath = java.nio.file.Paths.get(uploadDir, "resumes");
            if (!java.nio.file.Files.exists(dirPath)) {
                java.nio.file.Files.createDirectories(dirPath);
            }
            String safeName = user.getId() + "_" + System.currentTimeMillis() + "_" + name.replaceAll("[^a-zA-Z0-9._-]", "_");
            java.nio.file.Files.write(dirPath.resolve(safeName), file.getBytes());
        } catch (Exception ex) {
            // Note: Host filesystem is ephemeral; text & metadata are stored persistently in DB
            System.err.println("Notice: Could not write upload to disk: " + ex.getMessage());
        }
        String text = clientText;
        if (text==null || text.isBlank()) {
            try {
                byte[] bytes = file.getBytes();
                if (lower.endsWith(".txt") || lower.endsWith(".md")) {
                    text = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                } else {
                    StringBuilder sb = new StringBuilder();
                    String raw = new String(bytes, java.nio.charset.StandardCharsets.ISO_8859_1);
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\(([\\w\\s.,;:@\\-+*#/]{2,})\\)").matcher(raw);
                    while (m.find()) sb.append(m.group(1)).append(" ");
                    text = sb.toString().trim();
                    if (text.length() < 25) text = "Resume: " + name + " (PDF Document, " + (file.getSize()/1024) + " KB)";
                }
            } catch (Exception ex) { text = "Resume: " + name; }
        }
        if (text != null && text.length() > 9900) text = text.substring(0, 9900);
        p.setResumeText(clean(text));
        profiles.save(p);
        Map<String,Object> out = new LinkedHashMap<>();
        out.put("fileName", name);
        out.put("fileSize", file.getSize());
        out.put("uploadedAt", p.getResumeUploadedAt());
        out.put("resumeText", p.getResumeText());
        out.put("message", "Resume uploaded and processed successfully.");
        return out;
    }
    public Map<String,Object> deleteResume() {
        AppUser user=currentUser(); requireRole(user, Role.STUDENT);
        StudentProfile p=ensureProfile(user);
        p.setResumeFileName(null);
        p.setResumeFileSize(null);
        p.setResumeUploadedAt(null);
        p.setResumeText(null);
        profiles.save(p);
        return Map.of("message","Resume removed successfully.");
    }
    private StudentProfile ensureProfile(AppUser user) {
        return profiles.findByUser_Id(user.getId()).orElseGet(() -> profiles.save(new StudentProfile(user)));
    }
    private Map<String,Object> profileMap(StudentProfile p) {
        AppUser u=p.getUser(); Map<String,Object> m=new LinkedHashMap<>();
        m.put("id",p.getId()); m.put("fullName",u.getFullName()); m.put("email",u.getEmail()); m.put("headline",p.getHeadline());
        m.put("university",p.getUniversity()); m.put("degree",p.getDegree()); m.put("graduationYear",p.getGraduationYear());
        m.put("cgpa",p.getCgpa()); m.put("location",p.getLocation()); m.put("skills",p.getSkills()); m.put("resumeText",p.getResumeText());
        m.put("resumeFileName",p.getResumeFileName()); m.put("resumeFileSize",p.getResumeFileSize()); m.put("resumeUploadedAt",p.getResumeUploadedAt());
        m.put("githubUrl",p.getGithubUrl()); m.put("linkedinUrl",p.getLinkedinUrl()); m.put("bio",p.getBio()); m.put("confidence",p.getConfidence());
        return m;
    }

    public List<Map<String,Object>> listJobs(String query, String location) {
        String q=query==null?"":query.toLowerCase(Locale.ROOT).trim();
        String loc=location==null?"":location.toLowerCase(Locale.ROOT).trim();
        return jobs.findByActiveTrueOrderByCreatedAtDesc().stream()
            .filter(j -> q.isBlank() || (j.getTitle()+" "+j.getCompany()+" "+j.getDescription()+" "+j.getRequiredSkills()).toLowerCase(Locale.ROOT).contains(q))
            .filter(j -> loc.isBlank() || j.getLocation().toLowerCase(Locale.ROOT).contains(loc))
            .map(j -> jobMap(j,null)).toList();
    }
    public Map<String,Object> getJob(Long id) { return jobMap(findJob(id),null); }
    public Map<String,Object> createJob(JobRequest req) {
        AppUser actor=currentUser(); requireAnyRole(actor, Role.RECRUITER, Role.ADMIN);
        Job job=new Job(req.title().trim(),req.company().trim(),req.location().trim(),valueOr(req.jobType(),"Full-time"),
            valueOr(req.experienceLevel(),"Entry level"),clean(req.salaryRange()),req.description().trim(),req.requiredSkills().trim(),req.minCgpa(),actor);
        return jobMap(jobs.save(job),null);
    }
    public Map<String,Object> updateJob(Long id, JobRequest req) {
        AppUser actor=currentUser(); Job job=findJob(id); assertJobOwner(actor,job);
        job.setTitle(req.title().trim()); job.setCompany(req.company().trim()); job.setLocation(req.location().trim());
        job.setJobType(valueOr(req.jobType(),"Full-time")); job.setExperienceLevel(valueOr(req.experienceLevel(),"Entry level"));
        job.setSalaryRange(clean(req.salaryRange())); job.setDescription(req.description().trim()); job.setRequiredSkills(req.requiredSkills().trim()); job.setMinCgpa(req.minCgpa());
        return jobMap(jobs.save(job),null);
    }
    public void deleteJob(Long id) { AppUser actor=currentUser(); Job job=findJob(id); assertJobOwner(actor,job); job.setActive(false); jobs.save(job); }
    public List<Map<String,Object>> recruiterJobs() {
        AppUser actor=currentUser(); requireAnyRole(actor,Role.RECRUITER,Role.ADMIN);
        return (actor.getRole()==Role.ADMIN ? jobs.findAll() : jobs.findByCreatedBy_IdOrderByCreatedAtDesc(actor.getId())).stream().map(j->jobMap(j,null)).toList();
    }

    public Map<String,Object> apply(ApplyRequest req) {
        AppUser student=currentUser(); requireRole(student,Role.STUDENT);
        Job job=findJob(req.jobId()); if (!job.isActive()) throw new IllegalArgumentException("This job is no longer accepting applications.");
        if (applications.existsByStudent_IdAndJob_Id(student.getId(),job.getId())) throw new IllegalArgumentException("You have already applied to this job.");
        StudentProfile p=ensureProfile(student);
        if (job.getMinCgpa()!=null && (p.getCgpa()==null || p.getCgpa()<job.getMinCgpa())) throw new IllegalArgumentException("Your current CGPA does not meet this job's stated eligibility criteria.");
        JobApplication app=applications.save(new JobApplication(student,job,clean(req.coverNote())));
        return applicationMap(app);
    }
    public List<Map<String,Object>> myApplications() {
        AppUser actor=currentUser(); List<JobApplication> list;
        if (actor.getRole()==Role.STUDENT) list=applications.findByStudent_IdOrderByAppliedAtDesc(actor.getId());
        else if (actor.getRole()==Role.RECRUITER) list=applications.findByJob_CreatedBy_IdOrderByAppliedAtDesc(actor.getId());
        else list=applications.findAll();
        return list.stream().map(this::applicationMap).toList();
    }
    public Map<String,Object> updateApplication(Long id, StatusRequest req) {
        AppUser actor=currentUser(); requireAnyRole(actor,Role.RECRUITER,Role.ADMIN);
        JobApplication app=applications.findById(id).orElseThrow(()->new IllegalArgumentException("Application not found."));
        assertJobOwner(actor,app.getJob());
        try { app.setStatus(ApplicationStatus.valueOf(req.status().trim().toUpperCase(Locale.ROOT))); }
        catch (Exception ex) { throw new IllegalArgumentException("Unsupported application status."); }
        return applicationMap(applications.save(app));
    }

    public Map<String,Object> analyze(Integer requestedConfidence) {
        AppUser user=currentUser(); requireRole(user,Role.STUDENT); StudentProfile p=ensureProfile(user);
        int confidence=requestedConfidence==null?(p.getConfidence()==null?70:p.getConfidence()):Math.max(0,Math.min(100,requestedConfidence));
        List<String> skills=splitSkills(p.getSkills());
        List<Job> activeJobs=jobs.findByActiveTrueOrderByCreatedAtDesc();
        Map<Long,Integer> aiScores=aiMatchingClient.score(skills,activeJobs);
        List<Map<String,Object>> matches=activeJobs.stream().map(j -> {
            int score=aiScores.getOrDefault(j.getId(),localScore(skills,j));
            return jobMap(j,score);
        }).sorted((a,b)->Integer.compare((Integer)b.get("matchScore"),(Integer)a.get("matchScore"))).limit(8).toList();
        int best=matches.isEmpty()?0:(Integer)matches.get(0).get("matchScore");
        int readiness=Math.min(98, Math.max(12, (int)Math.round((skills.size()*7.0) + (p.getResumeText()!=null && p.getResumeText().length()>100?18:0) + (p.getGithubUrl()!=null?6:0) + (p.getUniversity()!=null?5:0))));
        int ats=atsScore(p.getResumeText(),skills);
        List<String> roleSkills=matches.isEmpty()?List.of("Java","SQL","REST APIs","Git","Testing"):splitSkills(String.valueOf(matches.get(0).get("requiredSkills")));
        List<String> missing=roleSkills.stream().filter(s->skills.stream().noneMatch(h->sameSkill(h,s))).limit(8).toList();
        List<String> risks=new ArrayList<>();
        if (p.getResumeText()==null || p.getResumeText().isBlank()) risks.add("Add resume content so your profile can be evaluated against role requirements.");
        if (p.getGithubUrl()==null || p.getGithubUrl().isBlank()) risks.add("Add a GitHub portfolio with 2–3 documented projects.");
        if (skills.size()<5) risks.add("Your profile lists fewer than five skills; add skills you can confidently demonstrate.");
        if (missing.size()>0) risks.add("Your top role match is missing " + missing.size() + " relevant skills: " + String.join(", ",missing.subList(0,Math.min(3,missing.size()))) + ".");
        if (ats<65) risks.add("Improve resume structure and include measurable project outcomes and role keywords.");
        List<Map<String,Object>> roadmap=new ArrayList<>();
        int week=1;
        for(String skill:missing) { roadmap.add(Map.of("week",week,"title","Build strength in "+skill,"detail","Complete one focused learning module and build a small demonstrable feature.","duration","5–7 days")); week++; if(week>4) break; }
        roadmap.add(Map.of("week",week,"title","Publish a portfolio project","detail","Document the problem, architecture, screenshots, testing and live demo.","duration","1 week"));
        roadmap.add(Map.of("week",week+1,"title","Practice role-specific interviews","detail","Explain trade-offs, solve coding exercises and rehearse project walkthroughs.","duration","Ongoing"));
        Map<String,Object> result=new LinkedHashMap<>();
        result.put("readinessScore",readiness); result.put("atsScore",ats); result.put("confidence",confidence);
        result.put("readinessGap",readiness-confidence); result.put("bestMatch",matches.isEmpty()?null:matches.get(0));
        result.put("matches",matches); result.put("missingSkills",missing); result.put("riskFactors",risks); result.put("roadmap",roadmap);
        result.put("atsIssues",atsIssues(p.getResumeText(),skills));
        result.put("atsGrade",ats>=85?"A":ats>=70?"B":ats>=55?"C":"D");
        result.put("applyVerdict",readiness>=70 && ats>=65?"Ready to explore suitable roles":"Strengthen your profile before prioritizing applications");
        result.put("smartAlerts",risks);
        result.put("aiEngine",aiScores.isEmpty()?"Explainable local matching":"TF-IDF semantic matching service");
        result.put("disclaimer","Scores are guidance based on the information supplied, not a hiring decision or a guarantee of employment.");
        p.setConfidence(confidence); profiles.save(p);
        return result;
    }

    public Map<String,Object> dashboard() {
        AppUser u=currentUser(); Map<String,Object> data=new LinkedHashMap<>(); data.put("user",userSummary(u));
        data.put("activeJobs",jobs.findByActiveTrueOrderByCreatedAtDesc().size());
        if (u.getRole()==Role.STUDENT) {
            StudentProfile p=ensureProfile(u); List<JobApplication> mine=applications.findByStudent_IdOrderByAppliedAtDesc(u.getId());
            int readiness=p.getSkills()==null||p.getSkills().isBlank()?18:Math.min(96,12+splitSkills(p.getSkills()).size()*8);
            data.put("applications",mine.size()); data.put("interviews",mine.stream().filter(a->a.getStatus()==ApplicationStatus.INTERVIEW||a.getStatus()==ApplicationStatus.SHORTLISTED).count());
            data.put("profileCompletion",profileCompletion(p)); data.put("readinessScore",readiness);
            data.put("recentApplications",mine.stream().limit(4).map(this::applicationMap).toList());
            data.put("topJobs",jobs.findByActiveTrueOrderByCreatedAtDesc().stream().limit(4).map(j->jobMap(j,localScore(splitSkills(p.getSkills()),j))).toList());
        } else if (u.getRole()==Role.RECRUITER) {
            List<Job> own=jobs.findByCreatedBy_IdOrderByCreatedAtDesc(u.getId());
            List<JobApplication> apps=applications.findByJob_CreatedBy_IdOrderByAppliedAtDesc(u.getId());
            data.put("myJobs",own.size()); data.put("applications",apps.size());
            data.put("shortlisted",apps.stream().filter(a->a.getStatus()==ApplicationStatus.SHORTLISTED||a.getStatus()==ApplicationStatus.INTERVIEW).count());
            data.put("recentApplications",apps.stream().limit(6).map(this::applicationMap).toList());
        } else {
            data.put("users",users.count()); data.put("students",users.findAll().stream().filter(x->x.getRole()==Role.STUDENT).count());
            data.put("recruiters",users.findAll().stream().filter(x->x.getRole()==Role.RECRUITER).count()); data.put("applications",applications.count());
        }
        return data;
    }

    public Map<String,Object> adminOverview() {
        AppUser actor=currentUser(); requireRole(actor,Role.ADMIN);
        List<AppUser> all=users.findAll();
        return Map.of("totalUsers",all.size(),"students",all.stream().filter(u->u.getRole()==Role.STUDENT).count(),
            "recruiters",all.stream().filter(u->u.getRole()==Role.RECRUITER).count(),"activeJobs",jobs.findByActiveTrueOrderByCreatedAtDesc().size(),
            "applications",applications.count(),"recentJobs",jobs.findByActiveTrueOrderByCreatedAtDesc().stream().limit(5).map(j->jobMap(j,null)).toList());
    }

    public Map<String,Object> interviewQuestion(String role) {
        String chosen=valueOr(role,"Software Engineer");
        List<Map<String,String>> bank=List.of(
            Map.of("question","Explain the difference between an interface and an abstract class in Java. When would you choose each?","topic","Java & OOP","keywords","interface,abstract class,contract,multiple implementation,shared state"),
            Map.of("question","How would you design a REST API for a job application workflow?","topic","Backend & APIs","keywords","resource,http methods,status codes,validation,authorization,pagination"),
            Map.of("question","What is the difference between SQL indexing and database normalization?","topic","Databases","keywords","index,query performance,normalization,duplicate data,trade-off"),
            Map.of("question","Walk me through a project where you solved a difficult engineering problem.","topic","Project deep dive","keywords","problem,approach,trade-off,testing,impact,learning"),
            Map.of("question","How would you prevent unauthorized users from viewing another student's application?","topic","Security","keywords","authentication,authorization,ownership,role-based access,server-side validation")
        );
        int index=Math.floorMod(chosen.toLowerCase(Locale.ROOT).hashCode(),bank.size());
        Map<String,Object> out=new LinkedHashMap<>(bank.get(index)); out.put("role",chosen); out.put("questionId",index+1); return out;
    }
    public Map<String,Object> evaluateInterview(InterviewAnswerRequest req) {
        String normalized=req.answer().toLowerCase(Locale.ROOT); String[] keywords=req.question().toLowerCase(Locale.ROOT).contains("interface")
            ?new String[]{"interface","abstract class","contract","implementation","inheritance","shared"}
            :new String[]{"problem","approach","trade-off","testing","validation","security","performance","impact","example","design","http","api","database"};
        List<String> hit=new ArrayList<>(); for(String k:keywords) if(normalized.contains(k)) hit.add(k);
        int score=Math.min(96,Math.max(28,35+hit.size()*9+Math.min(10,req.answer().length()/120)));
        List<String> missing=Arrays.stream(keywords).filter(k->!hit.contains(k)).limit(5).toList();
        return Map.of("score",score,"level",score>=80?"Strong response":score>=60?"Good foundation":"Needs more structure",
            "strengths",hit,"improvements",missing,"feedback",score>=80?"Good coverage. Make the answer even stronger by adding one concrete example and explaining the trade-offs.":"Use a clear structure: define the concept, explain how it works, give a practical example, and mention one trade-off.",
            "disclaimer","Automated practice feedback is indicative; it is not a formal interview evaluation.");
    }

    private int profileCompletion(StudentProfile p) {
        int fields=0; if(has(p.getHeadline()))fields++; if(has(p.getUniversity()))fields++; if(has(p.getDegree()))fields++;
        if(has(p.getSkills()))fields++; if(has(p.getResumeText()))fields++; if(has(p.getGithubUrl()))fields++; if(has(p.getLocation()))fields++;
        return (int)Math.round(fields/7.0*100);
    }
    private int atsScore(String resume,List<String> skills) {
        if (resume==null||resume.isBlank()) return 0;
        String text=resume.toLowerCase(Locale.ROOT); int score=25;
        for(String marker:List.of("education","experience","project","skills","github","linkedin","certification")) if(text.contains(marker)) score+=7;
        if(text.matches("(?s).*\\b(20\\d{2}|19\\d{2})\\b.*")) score+=4;
        if(text.contains("%")||text.contains("increased")||text.contains("reduced")||text.contains("built")) score+=7;
        for(String skill:skills) if(text.contains(skill.toLowerCase(Locale.ROOT))) score++;
        return Math.min(100,score);
    }
    private List<String> atsIssues(String resume,List<String> skills) {
        List<String> issues=new ArrayList<>(); String text=resume==null?"":resume.toLowerCase(Locale.ROOT);
        if(text.isBlank()) return List.of("Resume text has not been added yet.");
        for(String s:List.of("education","experience","projects","skills")) if(!text.contains(s)) issues.add("Consider adding a clearly labeled "+s+" section.");
        if(!(text.contains("built")||text.contains("developed")||text.contains("implemented"))) issues.add("Use action verbs to describe what you personally delivered.");
        if(!(text.contains("%")||text.contains("users")||text.contains("seconds")||text.contains("reduced")||text.contains("increased"))) issues.add("Add measurable outcomes to project or experience bullets where truthful.");
        if(issues.isEmpty()) issues.add("Your resume has the basic sections. Tailor keywords to each target job.");
        return issues;
    }
    private int localScore(List<String> candidateSkills,Job job) {
        List<String> required=splitSkills(job.getRequiredSkills());
        if(required.isEmpty()) return 35;
        long matched=required.stream().filter(r->candidateSkills.stream().anyMatch(s->sameSkill(s,r))).count();
        int coverage=(int)Math.round(100.0*matched/required.size());
        String candidateText=String.join(" ",candidateSkills).toLowerCase(Locale.ROOT);
        String title=job.getTitle().toLowerCase(Locale.ROOT);
        int titleBonus=Arrays.stream(title.split("\\W+")).filter(w->w.length()>3&&candidateText.contains(w)).findAny().isPresent()?7:0;
        return Math.min(99,Math.max(8,(int)Math.round(coverage*0.9)+titleBonus));
    }
    private boolean sameSkill(String a,String b) {
        String x=normalizeSkill(a),y=normalizeSkill(b); if(x.equals(y)||x.contains(y)||y.contains(x)) return true;
        Map<String,Set<String>> synonyms=Map.of("javascript",Set.of("js","javascript"),"typescript",Set.of("ts","typescript"),
            "postgresql",Set.of("postgres","postgresql"),"amazon web services",Set.of("aws","amazon web services"),
            "spring boot",Set.of("spring","spring boot"),"machine learning",Set.of("ml","machine learning"),
            "artificial intelligence",Set.of("ai","artificial intelligence"));
        for(Set<String> set:synonyms.values()) if(set.contains(x)&&set.contains(y)) return true;
        return false;
    }
    private String normalizeSkill(String s) { return s==null?"":s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9+#.]","").trim(); }
    private List<String> splitSkills(String raw) {
        if(raw==null||raw.isBlank()) return new ArrayList<>();
        return Arrays.stream(raw.split("[,;\\n|]")).map(String::trim).filter(s->!s.isBlank()).distinct().toList();
    }
    private Map<String,Object> jobMap(Job j,Integer score) {
        Map<String,Object> m=new LinkedHashMap<>(); m.put("id",j.getId()); m.put("title",j.getTitle()); m.put("company",j.getCompany());
        m.put("location",j.getLocation()); m.put("jobType",j.getJobType()); m.put("experienceLevel",j.getExperienceLevel());
        m.put("salaryRange",j.getSalaryRange()); m.put("description",j.getDescription()); m.put("requiredSkills",j.getRequiredSkills());
        m.put("minCgpa",j.getMinCgpa()); m.put("active",j.isActive()); m.put("createdAt",j.getCreatedAt());
        m.put("recruiter",j.getCreatedBy()==null?"CareerPilot Team":j.getCreatedBy().getFullName());
        if(score!=null) m.put("matchScore",score); return m;
    }
    private Map<String,Object> applicationMap(JobApplication a) {
        return Map.of("id",a.getId(),"status",a.getStatus().name(),"coverNote",a.getCoverNote()==null?"":a.getCoverNote(),
            "appliedAt",a.getAppliedAt(),"job",jobMap(a.getJob(),null),"student",Map.of("id",a.getStudent().getId(),"fullName",a.getStudent().getFullName(),"email",a.getStudent().getEmail()));
    }
    private Job findJob(Long id) { return jobs.findById(id).orElseThrow(()->new IllegalArgumentException("Job not found.")); }
    private void assertJobOwner(AppUser actor,Job job) { if(actor.getRole()!=Role.ADMIN && (job.getCreatedBy()==null || !job.getCreatedBy().getId().equals(actor.getId()))) throw new org.springframework.security.access.AccessDeniedException("You can only manage jobs posted by your account."); }
    private void requireRole(AppUser user,Role role) { if(user.getRole()!=role) throw new org.springframework.security.access.AccessDeniedException("This action is not available for your account role."); }
    private void requireAnyRole(AppUser user,Role...roles) { if(Arrays.stream(roles).noneMatch(r->r==user.getRole())) throw new org.springframework.security.access.AccessDeniedException("This action is not available for your account role."); }
    private static String clean(String s) { return s==null||s.isBlank()?null:s.trim(); }
    private static String valueOr(String s,String fallback) { return s==null||s.isBlank()?fallback:s.trim(); }
    private static boolean has(String s) { return s!=null&&!s.isBlank(); }
}
