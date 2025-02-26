package com.diditakeit.diditakeit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DailyResetScheduler {

    @Autowired
    private TaskRepository taskRepository;

    @Scheduled(cron = "0 0 4 * * ?") // At 4:00 AM every day
    public void resetTasks() {
        List<Task> tasks = taskRepository.findAll();
        for (Task task : tasks) {
            task.setChecked(false);
            task.setAlarmTriggered(false);
            taskRepository.save(task);
        }
    }
}

