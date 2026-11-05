package com.careerpilot.repository;
import com.careerpilot.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser_Id(Long userId);
}
