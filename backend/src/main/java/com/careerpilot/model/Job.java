package com.careerpilot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 160)
    private String title;
    @Column(nullable = false, length = 140)
    private String company;
    @Column(nullable = false, length = 120)
    private String location;
    @Column(nullable = false, length = 40)
    private String jobType;
    @Column(nullable = false, length = 40)
    private String experienceLevel;
    @Column(length = 80)
    private String salaryRange;
    @Column(nullable = false, length = 3000)
    private String description;
    @Column(nullable = false, length = 1500)
    private String requiredSkills;
    private Double minCgpa;
    private boolean active = true;
    @ManyToOne(optional = false) @JoinColumn(name = "created_by")
    private AppUser createdBy;
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Job() {}
    public Job(String title, String company, String location, String jobType, String experienceLevel, String salaryRange, String description, String requiredSkills, Double minCgpa, AppUser createdBy) {
        this.title=title; this.company=company; this.location=location; this.jobType=jobType; this.experienceLevel=experienceLevel;
        this.salaryRange=salaryRange; this.description=description; this.requiredSkills=requiredSkills; this.minCgpa=minCgpa; this.createdBy=createdBy; this.active=true;
    }
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }
    public Double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public AppUser getCreatedBy() { return createdBy; }
    public void setCreatedBy(AppUser createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
