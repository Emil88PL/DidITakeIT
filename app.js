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
  tasks.sort((a, b) => new Date(a.dueTime) - new Date(b.dueTime));
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

// Unified function to update task states
function updateTasks() {
  const tasks = getTasks();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let shouldPlayAlarm = false;

  if (now.getHours() === 4 && now.getMinutes() === 0) {
    tasks.forEach(task => {
      task.checked = false;
      task.alarmTriggered = false;
    });
  }

  tasks.forEach(task => {
    const taskDue = new Date(task.dueTime);
    const taskDueDate = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
    if (taskDueDate < today) {
      let newDueTime = new Date(today);
      newDueTime.setHours(taskDue.getHours(), taskDue.getMinutes(), taskDue.getSeconds(), taskDue.getMilliseconds());
      task.dueTime = newDueTime.toISOString();
      task.checked = false;
    }
    if (!task.checked && new Date(task.dueTime) <= now) {
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

// Set a single interval to update tasks every 30 seconds
setInterval(updateTasks, 30000);

// Handle task form submission
document.getElementById('task-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('task-name').value;
  const timeInput = document.getElementById('due-time').value; // e.g., "14:30"
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