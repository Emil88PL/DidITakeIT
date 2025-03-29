package com.diditakeit.diditakeit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCheckedFalseAndDueTimeBefore(LocalDateTime time);
    List<Task> findAllByOrderByDueTimeAsc();

}

