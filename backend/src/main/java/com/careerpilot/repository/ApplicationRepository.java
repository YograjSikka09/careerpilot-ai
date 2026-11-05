package com.careerpilot.repository;
import com.careerpilot.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByStudent_IdOrderByAppliedAtDesc(Long studentId);
    List<JobApplication> findByJob_CreatedBy_IdOrderByAppliedAtDesc(Long recruiterId);
    boolean existsByStudent_IdAndJob_Id(Long studentId, Long jobId);
    long countByStudent_Id(Long studentId);
}
