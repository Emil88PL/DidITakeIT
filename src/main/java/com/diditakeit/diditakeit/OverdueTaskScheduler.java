package com.diditakeit.diditakeit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class OverdueTaskScheduler {


    private final TaskRepository taskRepository;

    public OverdueTaskScheduler(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

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

    @Scheduled(cron = "0 0 0 * * ?") // Runs at midnight every day
    public void updateTaskDueTimes() {
        List<Task> tasks = taskRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Task task : tasks) {
            LocalDate taskDueDate = task.getDueTime().toLocalDate();
            if (taskDueDate.isBefore(today)) {
                // Preserve the time part and update the date to today
                LocalTime taskTime = task.getDueTime().toLocalTime();
                task.setDueTime(LocalDateTime.of(today, taskTime));
                // Optionally reset alarm triggered flag
                task.setAlarmTriggered(false);
                task.setChecked(false);
                taskRepository.save(task);
            }
        }
    }

}

