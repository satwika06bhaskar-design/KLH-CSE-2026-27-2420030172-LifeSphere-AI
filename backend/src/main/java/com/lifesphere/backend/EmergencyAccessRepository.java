package com.lifesphere.backend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmergencyAccessRepository
        extends JpaRepository<EmergencyAccess, Long> {

    List<EmergencyAccess> findByUserId(Long userId);

    Optional<EmergencyAccess> findByAccessCode(String accessCode);

    Optional<EmergencyAccess> findByIdAndUserId(
            Long id,
            Long userId);
}