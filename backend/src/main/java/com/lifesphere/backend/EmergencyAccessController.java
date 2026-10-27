package com.lifesphere.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency-access")
public class EmergencyAccessController {

    private final EmergencyAccessRepository emergencyAccessRepository;
    private final UserRepository userRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    public EmergencyAccessController(
            EmergencyAccessRepository emergencyAccessRepository,
            UserRepository userRepository) {

        this.emergencyAccessRepository = emergencyAccessRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE EMERGENCY ACCESS
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createEmergencyAccess(
            @RequestBody EmergencyAccessRequest request,
            Authentication authentication) {

        if (request.getContactName() == null ||
                request.getContactName().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Contact name is required."));
        }

        if (request.getContactEmail() == null ||
                request.getContactEmail().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Contact email is required."));
        }

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "User not found."));
        }

        String accessCode = generateAccessCode();

        EmergencyAccess emergencyAccess = new EmergencyAccess(
                user,
                request.getContactName().trim(),
                request.getContactEmail().trim(),
                accessCode,
                LocalDateTime.now());

        EmergencyAccess saved = emergencyAccessRepository.save(
                emergencyAccess);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(saved));
    }

    // =====================================================
    // GET USER'S EMERGENCY CONTACTS
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getEmergencyAccess(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "User not found."));
        }

        List<EmergencyAccessResponse> response = emergencyAccessRepository
                .findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // REVOKE EMERGENCY ACCESS
    // =====================================================

    @PutMapping("/{id}/revoke")
    public ResponseEntity<?> revokeEmergencyAccess(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "User not found."));
        }

        EmergencyAccess emergencyAccess = emergencyAccessRepository
                .findByIdAndUserId(
                        id,
                        user.getId())
                .orElse(null);

        if (emergencyAccess == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Emergency access not found."));
        }

        emergencyAccess.setActive(false);

        EmergencyAccess updated = emergencyAccessRepository.save(
                emergencyAccess);

        return ResponseEntity.ok(
                toResponse(updated));
    }

    // =====================================================
    // DELETE EMERGENCY ACCESS
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmergencyAccess(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "User not found."));
        }

        EmergencyAccess emergencyAccess = emergencyAccessRepository
                .findByIdAndUserId(
                        id,
                        user.getId())
                .orElse(null);

        if (emergencyAccess == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Emergency access not found."));
        }

        emergencyAccessRepository.delete(
                emergencyAccess);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Emergency access deleted successfully."));
    }

    // =====================================================
    // ACCESS USING CODE
    // =====================================================

    @GetMapping("/access/{accessCode}")
    public ResponseEntity<?> accessEmergencyData(
            @PathVariable String accessCode) {

        EmergencyAccess emergencyAccess = emergencyAccessRepository
                .findByAccessCode(accessCode)
                .orElse(null);

        if (emergencyAccess == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Invalid emergency access code."));
        }

        if (!emergencyAccess.isActive()) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "This emergency access has been revoked."));
        }

        User user = emergencyAccess.getUser();

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Emergency access granted.",
                        "userName",
                        user.getName(),
                        "contactName",
                        emergencyAccess.getContactName(),
                        "accessCode",
                        emergencyAccess.getAccessCode()));
    }

    // =====================================================
    // GENERATE ACCESS CODE
    // =====================================================

    private String generateAccessCode() {

        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        StringBuilder code = new StringBuilder();

        do {

            code.setLength(0);

            for (int i = 0; i < 10; i++) {

                int index = secureRandom.nextInt(
                        characters.length());

                code.append(
                        characters.charAt(index));
            }

        } while (emergencyAccessRepository
                .findByAccessCode(code.toString())
                .isPresent());

        return code.toString();
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    private EmergencyAccessResponse toResponse(
            EmergencyAccess emergencyAccess) {

        return new EmergencyAccessResponse(
                emergencyAccess.getId(),
                emergencyAccess.getContactName(),
                emergencyAccess.getContactEmail(),
                emergencyAccess.getAccessCode(),
                emergencyAccess.isActive(),
                emergencyAccess.getCreatedAt());
    }

    // =====================================================
    // REQUEST DTO
    // =====================================================

    static class EmergencyAccessRequest {

        private String contactName;
        private String contactEmail;

        public EmergencyAccessRequest() {
        }

        public String getContactName() {
            return contactName;
        }

        public void setContactName(String contactName) {
            this.contactName = contactName;
        }

        public String getContactEmail() {
            return contactEmail;
        }

        public void setContactEmail(String contactEmail) {
            this.contactEmail = contactEmail;
        }
    }

    // =====================================================
    // RESPONSE DTO
    // =====================================================

    static class EmergencyAccessResponse {

        private Long id;
        private String contactName;
        private String contactEmail;
        private String accessCode;
        private boolean active;
        private LocalDateTime createdAt;

        public EmergencyAccessResponse(
                Long id,
                String contactName,
                String contactEmail,
                String accessCode,
                boolean active,
                LocalDateTime createdAt) {

            this.id = id;
            this.contactName = contactName;
            this.contactEmail = contactEmail;
            this.accessCode = accessCode;
            this.active = active;
            this.createdAt = createdAt;
        }

        public Long getId() {
            return id;
        }

        public String getContactName() {
            return contactName;
        }

        public String getContactEmail() {
            return contactEmail;
        }

        public String getAccessCode() {
            return accessCode;
        }

        public boolean isActive() {
            return active;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
    }
}