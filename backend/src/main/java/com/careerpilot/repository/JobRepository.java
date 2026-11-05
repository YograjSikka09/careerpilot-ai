package com.careerpilot.repository;
import com.careerpilot.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByActiveTrueOrderByCreatedAtDesc();
    List<Job> findByCreatedBy_IdOrderByCreatedAtDesc(Long userId);
}
