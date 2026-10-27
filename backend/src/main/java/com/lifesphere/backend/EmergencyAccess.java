package com.lifesphere.backend;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_access")
public class EmergencyAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String contactName;

    @Column(nullable = false)
    private String contactEmail;

    @Column(nullable = false, unique = true)
    private String accessCode;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public EmergencyAccess() {
    }

    public EmergencyAccess(
            User user,
            String contactName,
            String contactEmail,
            String accessCode,
            LocalDateTime createdAt) {

        this.user = user;
        this.contactName = contactName;
        this.contactEmail = contactEmail;
        this.accessCode = accessCode;
        this.active = true;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public void setAccessCode(String accessCode) {
        this.accessCode = accessCode;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}