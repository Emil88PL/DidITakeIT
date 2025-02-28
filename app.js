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

    // Play alarm sound if needed (this simple example may play repeatedly until reset)
    if (task.alarmTriggered) {
      document.getElementById('alarm-sound').play();
    }
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
  let changed = false;

  tasks.forEach(task => {
    // Only check tasks that are unchecked and whose due time has passed
    if (!task.checked && new Date(task.dueTime) <= now && !task.alarmTriggered) {
      task.alarmTriggered = true;
      changed = true;
    }
  });
  if (changed) {
    saveTasks(tasks);
    renderTasks();
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

// Set intervals to check for overdue tasks and reset tasks at 4 AM every minute
setInterval(checkOverdueTasks, 60000);
setInterval(resetTasksAtFourAM, 60000);

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
