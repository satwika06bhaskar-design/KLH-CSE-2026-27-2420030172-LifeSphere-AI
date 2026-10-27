package com.lifesphere.backend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReminderRepository
        extends JpaRepository<Reminder, Long> {

    List<Reminder> findByUserIdOrderByReminderTimeAsc(Long userId);

    List<Reminder> findByUserEmailOrderByReminderTimeAsc(String email);
}