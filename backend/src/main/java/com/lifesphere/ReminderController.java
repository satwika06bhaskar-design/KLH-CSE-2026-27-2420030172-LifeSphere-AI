package com.lifesphere.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderRepository reminderRepository;
    private final UserRepository userRepository;

    public ReminderController(
            ReminderRepository reminderRepository,
            UserRepository userRepository) {

        this.reminderRepository = reminderRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET ALL REMINDERS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getReminders(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required.");
        }

        String email = authentication.getName();

        List<Reminder> reminders =
                reminderRepository
                        .findByUserEmailOrderByReminderTimeAsc(email);

        List<ReminderResponse> response =
                reminders.stream()
                        .map(ReminderResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // CREATE REMINDER
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createReminder(
            @RequestBody ReminderRequest request,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required.");
        }

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }

        if (request == null ||
                request.getTitle() == null ||
                request.getTitle().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Reminder title is required.");
        }

        if (request.getReminderTime() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Reminder time is required.");
        }

        Reminder reminder = new Reminder(
                request.getTitle().trim(),
                request.getDescription(),
                request.getReminderTime(),
                false,
                user
        );

        Reminder savedReminder =
                reminderRepository.save(reminder);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ReminderResponse(savedReminder));
    }

    // =========================================================
    // UPDATE REMINDER
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReminder(
            @PathVariable Long id,
            @RequestBody ReminderRequest request,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required.");
        }

        String email = authentication.getName();

        Reminder reminder =
                reminderRepository
                        .findById(id)
                        .orElse(null);

        if (reminder == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Reminder not found.");
        }

        if (reminder.getUser() == null ||
                reminder.getUser().getEmail() == null ||
                !reminder.getUser()
                        .getEmail()
                        .equals(email)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to modify this reminder.");
        }

        if (request.getTitle() != null &&
                !request.getTitle().trim().isEmpty()) {

            reminder.setTitle(
                    request.getTitle().trim()
            );
        }

        if (request.getDescription() != null) {

            reminder.setDescription(
                    request.getDescription()
            );
        }

        if (request.getReminderTime() != null) {

            reminder.setReminderTime(
                    request.getReminderTime()
            );
        }

        Reminder updatedReminder =
                reminderRepository.save(reminder);

        return ResponseEntity.ok(
                new ReminderResponse(updatedReminder)
        );
    }

    // =========================================================
    // COMPLETE / UNCOMPLETE REMINDER
    // =========================================================

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> toggleCompleted(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required.");
        }

        String email = authentication.getName();

        Reminder reminder =
                reminderRepository
                        .findById(id)
                        .orElse(null);

        if (reminder == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Reminder not found.");
        }

        if (reminder.getUser() == null ||
                reminder.getUser().getEmail() == null ||
                !reminder.getUser()
                        .getEmail()
                        .equals(email)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to modify this reminder.");
        }

        reminder.setCompleted(
                !reminder.isCompleted()
        );

        Reminder updatedReminder =
                reminderRepository.save(reminder);

        return ResponseEntity.ok(
                new ReminderResponse(updatedReminder)
        );
    }

    // =========================================================
    // DELETE REMINDER
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReminder(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required.");
        }

        String email = authentication.getName();

        Reminder reminder =
                reminderRepository
                        .findById(id)
                        .orElse(null);

        if (reminder == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Reminder not found.");
        }

        if (reminder.getUser() == null ||
                reminder.getUser().getEmail() == null ||
                !reminder.getUser()
                        .getEmail()
                        .equals(email)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to delete this reminder.");
        }

        reminderRepository.delete(reminder);

        return ResponseEntity.ok(
                "Reminder deleted successfully."
        );
    }

    // =========================================================
    // REMINDER RESPONSE DTO
    // =========================================================

    public static class ReminderResponse {

        private Long id;
        private String title;
        private String description;
        private LocalDateTime reminderTime;
        private boolean completed;

        public ReminderResponse(Reminder reminder) {
            this.id = reminder.getId();
            this.title = reminder.getTitle();
            this.description = reminder.getDescription();
            this.reminderTime = reminder.getReminderTime();
            this.completed = reminder.isCompleted();
        }

        public Long getId() {
            return id;
        }

        public String getTitle() {
            return title;
        }

        public String getDescription() {
            return description;
        }

        public LocalDateTime getReminderTime() {
            return reminderTime;
        }

        public boolean isCompleted() {
            return completed;
        }
    }

    // =========================================================
    // REQUEST DTO
    // =========================================================

    public static class ReminderRequest {

        private String title;
        private String description;
        private LocalDateTime reminderTime;

        public ReminderRequest() {
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDateTime getReminderTime() {
            return reminderTime;
        }

        public void setReminderTime(
                LocalDateTime reminderTime) {

            this.reminderTime = reminderTime;
        }
    }
}