package com.diditakeit.diditakeit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class TaskScheduler {

    @Autowired
    private TaskRepository taskRepository;

    @Scheduled(fixedRate = 60000) // runs every minute
    public void checkOverdueTasks() {
        LocalDateTime now = LocalDateTime.now();
        List<Task> overdueTasks = taskRepository.findByCheckedFalseAndDueTimeBefore(now);
        for (Task task : overdueTasks) {
            // Mark as alarm triggered (and add any additional alarm logic here)
            task.setAlarmTriggered(true);
            taskRepository.save(task);

            // Optionally, you might want to send a push notification or update a message queue for real-time updates.
        }
    }
}

