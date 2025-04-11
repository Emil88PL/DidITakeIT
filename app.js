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
  return Date.now().toString() + Math.floor(Math.random() * 10000).toString();
}

// Preset tasks definitions
const presetTasks = {
  training: [
    { id: "0", time: "05:00", name: "woke up" },
    { id: "1",time: "05:30", name: "train" },
    { id: "2",time: "06:00", name: "drink water" }
  ],
  learning: [
    { time: "06:00", name: "read a book" },
    { time: "07:00", name: "take a break - rest eyes" },
    { time: "08:00", name: "keep reading you doing great!" }
  ],
  motivational: [
    { time: "06:30", name: "Good morning you doing great!" },
    { time: "07:30", name: "Keep up! everything is fine!" },
    { time: "09:30", name: "You doing Great!" }
  ]
};


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
          <input type="checkbox" ${task.checked ? 'checked' : ''} onchange="toggleTask('${task.id}', this.checked)">
        </div>
        <div>
          <span>${task.name} (Due: ${new Date(task.dueTime).toLocaleTimeString()})</span>
        </div>
        <div>
          <button onclick="deleteTask('${task.id}')" class="deleteButton">Delete</button>
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
  let shouldPlayAlarm = false;

  tasks.forEach(task => {
    const taskDue = new Date(task.dueTime);
    // Create a new date object that represents the due time in the user's local time zone.
    const localTaskDue = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate(), taskDue.getHours(), taskDue.getMinutes(), taskDue.getSeconds());

    if (!task.checked && localTaskDue <= now) {
      task.alarmTriggered = true;
      shouldPlayAlarm = true;
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

// Reset all tasks at 4 AM (this checks every minute)
function resetTasksAtFourAM() {
  const now = new Date();
  if (now.getUTCHours() === 4 && now.getUTCMinutes() === 0) { // Use UTC hours and minutes
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

  // Today's date at midnight UTC
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  tasks.forEach(task => {
    // Convert dueTime string to a Date object
    const taskDue = new Date(task.dueTime);
    // Create a date object for the task's date (without time)
    const taskDueDate = new Date(Date.UTC(taskDue.getUTCFullYear(), taskDue.getUTCMonth(), taskDue.getUTCDate()));

    // If the task's due date is before today, update it to today (preserving the time)
    if (taskDueDate < today) {
      // Create a new due time for today with the same hour, minute, second, and millisecond
      let newDueTime = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      newDueTime.setUTCHours(taskDue.getUTCHours(), taskDue.getUTCMinutes(), taskDue.getUTCSeconds(), taskDue.getUTCMilliseconds());

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

// Event listener for the preset drop-down
document.getElementById('preset-select').addEventListener('change', function(e) {
  const newPreset = e.target.value;
  let tasks = getTasks();

  // Remove all tasks that were added by a preset (identified by isPreset property)
  tasks = tasks.filter(task => !task.isPreset);

  // Only add preset tasks if a valid preset is selected (non-empty value)
  if (newPreset && presetTasks[newPreset]) {
    presetTasks[newPreset].forEach(item => {
      // Create a date for today with the preset task time
      const today = new Date();
      // Split time string "HH:MM" into hours and minutes
      const [hours, minutes] = item.time.split(':').map(Number);
      const dueTimeDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0, 0);

      // Create the preset task and mark it with isPreset and presetType
      tasks.push({
        id: generateId(),
        name: item.name,
        dueTime: dueTimeDate.toISOString(),
        checked: false,
        alarmTriggered: false,
        isPreset: true,
        presetType: newPreset
      });
    });
  }

  saveTasks(tasks);
  renderTasks();
});

// Handle task form submission (manual task addition)
document.getElementById('task-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('task-name').value;
  const timeInput = document.getElementById('due-time').value; // e.g., "14:30"

  // Combine today's date with the provided time
  const now = new Date();
  const [hours, minutes] = timeInput.split(':');
  now.setHours(hours, minutes, 0, 0);

  const newTask = {
    id: generateId(),
    name: name,
    dueTime: now.toISOString(),
    checked: false,
    alarmTriggered: false,
    isPreset: false // this task is manually added
  };

  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  renderTasks();
  e.target.reset();
});

// Initial render of tasks on page load
renderTasks();
