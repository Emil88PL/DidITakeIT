package com.diditakeit.diditakeit;

public class TaskDTO {
    private String name;
    // time in "HH:mm" format, e.g., "14:30"
    private String dueTime;

    // Getters and setters
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getDueTime() {
        return dueTime;
    }
    public void setTime(String time) {
        this.dueTime = time;
    }
}
