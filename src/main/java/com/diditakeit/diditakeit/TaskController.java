package com.diditakeit.diditakeit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @PostMapping
    public Task createTask(@RequestBody TaskDTO taskDTO) {
        Task task = new Task();
        task.setName(taskDTO.getName());

        LocalDate today = LocalDate.now();
        // parse taskDTO.getDueTime() instead of taskDTO.getTime()
        LocalTime taskTime = LocalTime.parse(taskDTO.getDueTime());
        task.setDueTime(LocalDateTime.of(today, taskTime));

        task.setChecked(false);
        task.setAlarmTriggered(false);
        return taskRepository.save(task);
    }



    @GetMapping
    public List<Task> getTasks() {
        return taskRepository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setName(updatedTask.getName());
                    task.setDueTime(updatedTask.getDueTime());
                    task.setChecked(updatedTask.isChecked());
                    task.setAlarmTriggered(updatedTask.isAlarmTriggered());
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(task -> {
                    taskRepository.delete(task);
                    ResponseEntity<Void> response = ResponseEntity.ok().build();
                    return response;
                })
                .orElse(ResponseEntity.notFound().build());
    }

}
