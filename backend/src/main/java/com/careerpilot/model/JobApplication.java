package com.careerpilot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "job_id"}))
public class JobApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "student_id")
    private AppUser student;
    @ManyToOne(optional = false) @JoinColumn(name = "job_id")
    private Job job;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.APPLIED;
    @Column(length = 2000)
    private String coverNote;
    @Column(nullable = false)
    private LocalDateTime appliedAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public JobApplication() {}
    public JobApplication(AppUser student, Job job, String coverNote) { this.student=student; this.job=job; this.coverNote=coverNote; }
    @PreUpdate public void touch() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public AppUser getStudent() { return student; }
    public Job getJob() { return job; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public String getCoverNote() { return coverNote; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
}
