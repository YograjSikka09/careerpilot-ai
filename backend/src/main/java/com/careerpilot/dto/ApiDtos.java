package com.careerpilot.dto;

import jakarta.validation.constraints.*;

public final class ApiDtos {
    private ApiDtos() {}
    public record RegisterRequest(@NotBlank @Size(max=120) String fullName, @Email @NotBlank String email,
                                  @NotBlank @Size(min=8,max=100) String password, String role) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record ProfileRequest(String headline, String university, String degree, Integer graduationYear,
                                 Double cgpa, String location, String skills, String resumeText,
                                 String githubUrl, String linkedinUrl, String bio, Integer confidence) {}
    public record JobRequest(@NotBlank String title, @NotBlank String company, @NotBlank String location,
                             String jobType, String experienceLevel, String salaryRange,
                             @NotBlank String description, @NotBlank String requiredSkills, Double minCgpa) {}
    public record ApplyRequest(@NotNull Long jobId, String coverNote) {}
    public record StatusRequest(@NotBlank String status) {}
    public record AnalyzeRequest(Integer confidence) {}
    public record InterviewAnswerRequest(@NotBlank String role, @NotBlank String question,
                                         @NotBlank @Size(min=10,max=5000) String answer) {}
}
