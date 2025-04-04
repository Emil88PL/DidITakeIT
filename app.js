// Helper: get tasks from localStorage
function getTasks() {
  const tasksJSON = localStorage.getItem('tasks');
  return tasksJSON ? JSON.parse(tasksJSON) : [];
}

// Helper: save tasks to localStorage
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Helper: generate a unique id (using timestamp)
function generateId() {
  return Date.now();
}

// Render the task list on the page
function renderTasks() {
  const tasks = getTasks();
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  // Sort tasks by dueTime (earlier due times first)
  tasks.sort((a, b) => new Date(a.dueTime) - new Date(b.dueTime));

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="container">
        <div>
          <input type="checkbox" ${task.checked ? 'checked' : ''} onchange="toggleTask(${task.id}, this.checked)">
        </div>
        <div>
          <span>${task.name} (Due: ${new Date(task.dueTime).toLocaleTimeString()})</span>
        </div>
        <div>
          <button onclick="deleteTask(${task.id})" class="deleteButton">Delete</button>
        </div>
      </div>
      ${task.alarmTriggered ? '<strong style="color:red;"> Unfinished Task!</strong>' : ''}
    `;
    list.appendChild(li);
  });
}

// Toggle a task's checked state
function toggleTask(id, checked) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.checked = checked;
    // If checked, reset the alarm flag.
    if (checked) {
      task.alarmTriggered = false;
    }
    saveTasks(tasks);
    renderTasks();
  }
}

// Delete a task
function deleteTask(id) {
  let tasks = getTasks();
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

// Check for overdue tasks and trigger the alarm if needed
function checkOverdueTasks() {
  const tasks = getTasks();
  const now = new Date();
  now.setHours(now.getHours() - 1);
  let shouldPlayAlarm = false;

  // Mark tasks as overdue (set alarmTriggered to true)
  tasks.forEach(task => {
    if (!task.checked && new Date(task.dueTime) <= now) {
      // Always set alarmTriggered so UI reflects the overdue status
      task.alarmTriggered = true;
      shouldPlayAlarm = true;
      console.log(task.dueTime, "  ", now);
    }
  });

  saveTasks(tasks);
  renderTasks(); // Update UI without playing the alarm

  // If at least one task is overdue, play the alarm sound once
  if (shouldPlayAlarm) {
    const alarmSound = document.getElementById('alarm-sound');
    // Stop the sound if it's playing, reset, and then play it once.
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.play().catch(err => {
      console.warn("Alarm playback prevented until user interaction", err);
    });
  }
}

// Reset all tasks at 4 AM (this checks every minute)
function resetTasksAtFourAM() {
  const now = new Date();
  if (now.getHours() === 4 && now.getMinutes() === 0) {
    const tasks = getTasks();
    tasks.forEach(task => {
      task.checked = false;
      task.alarmTriggered = false;
    });
    saveTasks(tasks);
    renderTasks();
  }
}

function checkDueTime() {
  const tasks = getTasks();
  let changed = false;
  const now = new Date();

  // Today's date at midnight
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  tasks.forEach(task => {
    // Convert dueTime string to a Date object
    const taskDue = new Date(task.dueTime);
    // Create a date object for the task's date (without time)
    const taskDueDate = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());

    // If the task's due date is before today, update it to today (preserving the time)
    if (taskDueDate < today) {
      // Create a new due time for today with the same hour, minute, second, and millisecond
      let newDueTime = new Date(today);
      newDueTime.setHours(taskDue.getHours(), taskDue.getMinutes(), taskDue.getSeconds(), taskDue.getMilliseconds());

      task.dueTime = newDueTime.toISOString();
      // Optionally, reset the alarm flag so the alarm check starts fresh for the new day:
      task.alarmTriggered = false;
      changed = true;
      task.checked = false;
    }
  });

  if (changed) {
    saveTasks(tasks);
    renderTasks();
  }
}

// Set intervals to check for overdue tasks and reset tasks at 4 AM every minute
setInterval(checkOverdueTasks, 60000);
setInterval(resetTasksAtFourAM, 123000);
setInterval(checkDueTime, 30000);

// Handle task form submission
document.getElementById('task-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('task-name').value;
  const timeInput = document.getElementById('due-time').value; // e.g., "14:30"

  // Combine today's date with the provided time
  const today = new Date();
  const [hours, minutes] = timeInput.split(':');
  today.setHours(hours, minutes, 0, 0);

  const newTask = {
    id: generateId(),
    name: name,
    dueTime: today.toISOString(),
    checked: false,
    alarmTriggered: false
  };

  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  renderTasks();
  e.target.reset();
});

// Initial render of tasks on page load
renderTasks();