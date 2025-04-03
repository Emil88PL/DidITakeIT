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
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  // Sort tasks by due time (earlier times first)
  tasks.sort((a, b) => timeToMinutes(a.dueTime) - timeToMinutes(b.dueTime));

  tasks.forEach(task => {
    const [hours, minutes] = task.dueTime.split(':');
    const dueDateTime = new Date(today);
    dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="container">
        <div>
          <input type="checkbox" ${task.checked ? 'checked' : ''} onchange="toggleTask(${task.id}, this.checked)">
        </div>
        <div>
          <span>${task.name} (Due: ${dueDateTime.toLocaleTimeString()})</span>
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

// Helper: convert "HH:MM" to minutes since midnight
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function updateTasks() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const tasks = getTasks();
  let shouldPlayAlarm = false;


  tasks.forEach(task => {
    const taskDueMinutes = timeToMinutes(task.dueTime);

    // If current time is past the due time and task is not checked, mark alarm as triggered
    if (currentMinutes > taskDueMinutes && !task.checked) {
      task.alarmTriggered = true;
      shouldPlayAlarm = true;
    } else {
      task.alarmTriggered = false;
    }
  });

  saveTasks(tasks);
  renderTasks();

  if (shouldPlayAlarm) {
    const alarmSound = document.getElementById('alarm-sound');
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.play().catch(err => {
      console.warn("Alarm playback prevented until user interaction", err);
    });
  }
}

// Example: update tasks every 30 seconds
setInterval(updateTasks, 30000);

// Handle task form submission
document.getElementById('task-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('task-name').value;
  const timeInput = document.getElementById('due-time').value; // e.g., "14:30"
  const newTask = {
    id: generateId(),
    name: name,
    dueTime: timeInput, // Store as "HH:MM"
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