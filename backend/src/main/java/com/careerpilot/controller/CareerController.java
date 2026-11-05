package com.careerpilot.controller;

import com.careerpilot.dto.ApiDtos.*;
import com.careerpilot.service.CareerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CareerController {
    private final CareerService service;
    public CareerController(CareerService service) { this.service=service; }

    @GetMapping("/dashboard") public Map<String,Object> dashboard() { return service.dashboard(); }
    @GetMapping("/profile/me") public Map<String,Object> profile() { return service.profile(); }
    @PutMapping("/profile/me") public Map<String,Object> saveProfile(@RequestBody ProfileRequest request) { return service.saveProfile(request); }
    @PostMapping(value = "/profile/resume", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String,Object> uploadResume(@RequestParam("file") org.springframework.web.multipart.MultipartFile file,
                                          @RequestParam(value = "text", required = false) String text) {
        return service.uploadResume(file, text);
    }
    @DeleteMapping("/profile/resume")
    public Map<String,Object> deleteResume() { return service.deleteResume(); }

    @GetMapping("/jobs") public List<Map<String,Object>> jobs(@RequestParam(required=false) String q, @RequestParam(required=false) String location) { return service.listJobs(q,location); }
    @GetMapping("/jobs/{id}") public Map<String,Object> job(@PathVariable Long id) { return service.getJob(id); }
    @PostMapping("/jobs") public Map<String,Object> createJob(@Valid @RequestBody JobRequest request) { return service.createJob(request); }
    @PutMapping("/jobs/{id}") public Map<String,Object> updateJob(@PathVariable Long id,@Valid @RequestBody JobRequest request) { return service.updateJob(id,request); }
    @DeleteMapping("/jobs/{id}") public Map<String,Object> deleteJob(@PathVariable Long id) { service.deleteJob(id); return Map.of("message","Job closed successfully."); }
    @GetMapping("/recruiter/jobs") public List<Map<String,Object>> recruiterJobs() { return service.recruiterJobs(); }

    @GetMapping("/applications") public List<Map<String,Object>> applications() { return service.myApplications(); }
    @PostMapping("/applications") public Map<String,Object> apply(@Valid @RequestBody ApplyRequest request) { return service.apply(request); }
    @PatchMapping("/applications/{id}/status") public Map<String,Object> status(@PathVariable Long id,@Valid @RequestBody StatusRequest request) { return service.updateApplication(id,request); }

    @PostMapping("/analysis/run") public Map<String,Object> analyze(@RequestBody(required=false) AnalyzeRequest request) { return service.analyze(request==null?null:request.confidence()); }
    @GetMapping("/admin/overview") public Map<String,Object> adminOverview() { return service.adminOverview(); }

    @GetMapping("/interview/question") public Map<String,Object> interviewQuestion(@RequestParam(required=false) String role) { return service.interviewQuestion(role); }
    @PostMapping("/interview/evaluate") public Map<String,Object> interviewEvaluate(@Valid @RequestBody InterviewAnswerRequest request) { return service.evaluateInterview(request); }
}
