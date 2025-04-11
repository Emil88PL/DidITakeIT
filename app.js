// Global interval variables
let overdueInterval;
let dueTimeInterval;

// Function to load check frequency from localStorage, default to 1 minute if not set
function loadCheckFrequency() {
  return localStorage.getItem('checkFrequency') || "1";
}

// Function to save check frequency to localStorage
function saveCheckFrequency(frequency) {
  localStorage.setItem('checkFrequency', frequency);
}

// Function to set up intervals based on selected frequency
function setupIntervals() {
  // Clear any existing intervals
  if (overdueInterval) clearInterval(overdueInterval);
  if (dueTimeInterval) clearInterval(dueTimeInterval);

  // Get selected frequency (value in minutes)
  const frequencyDropdown = document.getElementById('check-frequency');
  const frequencyMinutes = parseInt(frequencyDropdown.value, 10);
  const frequencyMs = frequencyMinutes * 60000;

  // Save the selected frequency
  saveCheckFrequency(frequencyDropdown.value);

  // Set new intervals using the selected frequency
  overdueInterval = setInterval(checkOverdueTasks, frequencyMs);
  dueTimeInterval = setInterval(checkDueTime, frequencyMs);
}

// On page load, set the frequency dropdown value from localStorage and initialize intervals
document.addEventListener("DOMContentLoaded", () => {
  const frequencyDropdown = document.getElementById('check-frequency');
  frequencyDropdown.value = loadCheckFrequency();
  setupIntervals();
});

// Listen to changes in the frequency dropdown
document.getElementById('check-frequency').addEventListener('change', setupIntervals);

// Helper: get tasks from localStorage
function getTasks() {
  const tasksJSON = localStorage.getItem('tasks');
  return tasksJSON ? JSON.parse(tasksJSON) : [];
}

// Helper: save tasks to localStorage
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Helper: generate a unique id (using timestamp + random component)
function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 10000).toString();
}

// Preset tasks definitions
const presetTasks = {
  training: [
    { time: "05:00", name: "Wake up" },
    { time: "05:15", name: "Drink 500ml water" },
    { time: "05:30", name: "Dynamic stretching" },
    { time: "05:45", name: "Cardio warm-up" },
    { time: "06:00", name: "Main workout" },
    { time: "07:00", name: "Cool down" },
    { time: "07:15", name: "Protein shake" },
    { time: "07:30", name: "Shower" },
    { time: "08:00", name: "Healthy breakfast" }
  ],

  learning: [
    { time: "09:00", name: "Set daily learning goals" },
    { time: "09:15", name: "Read technical material" },
    { time: "10:15", name: "Take detailed notes" },
    { time: "10:45", name: "Rest eyes - look at distance" },
    { time: "11:00", name: "Practice exercises" },
    { time: "12:00", name: "Lunch break" },
    { time: "13:00", name: "Review morning materials" },
    { time: "14:00", name: "Deep work session" },
    { time: "15:30", name: "Take a walk - process information" }
  ],

  motivational: [
    { time: "06:30", name: "Good morning! You're up and making progress!" },
    { time: "08:30", name: "Great start to the day - keep the momentum!" },
    { time: "10:30", name: "Stay focused, you're doing fantastic work!" },
    { time: "12:30", name: "Halfway through the day - you got this!" },
    { time: "14:30", name: "Your dedication is inspiring!" },
    { time: "16:30", name: "Push through - excellence takes persistence!" },
    { time: "18:30", name: "Reflect on today's wins, big and small" },
    { time: "20:30", name: "Wind down - you've earned your rest" }
  ],

  productivity: [
    { time: "08:30", name: "Plan your day and set priorities" },
    { time: "09:00", name: "Focus on most important task" },
    { time: "10:30", name: "Check and respond to urgent emails" },
    { time: "11:00", name: "Second important task" },
    { time: "12:30", name: "Reflect on morning progress" },
    { time: "13:30", name: "Third important task" },
    { time: "15:00", name: "Quick administrative work" },
    { time: "16:00", name: "Plan for tomorrow" },
    { time: "17:00", name: "Review day's accomplishments" }
  ],

  wellness: [
    { time: "07:00", name: "Morning meditation" },
    { time: "10:00", name: "Hydration check" },
    { time: "12:00", name: "Mindful eating lunch" },
    { time: "14:00", name: "Quick breathing exercise" },
    { time: "15:30", name: "Stretch break" },
    { time: "17:00", name: "Evening walk" },
    { time: "19:00", name: "Screen-free time" },
    { time: "21:00", name: "Evening reflection" },
    { time: "22:00", name: "Sleep preparation routine" }
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
          <button onclick="editTask('${task.id}')" class="editButton">Edit</button>
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
    if (checked) task.alarmTriggered = false;
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

// Edit a task's name and due time, and mark it as not preset
function editTask(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Prompt for new name; if Cancel is pressed, no change is made.
  const newName = prompt("Edit task name:", task.name);
  if (newName === null) return;
  const currentDueTime = new Date(task.dueTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const newDueTime = prompt("Edit task due time (HH:MM):", currentDueTime);
  if (newDueTime === null) return;
  const today = new Date();
  const [hours, minutes] = newDueTime.split(':').map(Number);
  today.setHours(hours, minutes, 0, 0);

  // Update task properties
  task.name = newName;
  task.dueTime = today.toISOString();
  task.isPreset = false;
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
    alarmSound.play().catch(err => console.warn("Alarm playback prevented until user interaction", err));
  }
}

// Reset all tasks at 4 AM (this checks every minute)
function resetTasksAtFourAM() {
  const now = new Date();
  if (now.getUTCHours() === 4 && now.getUTCMinutes() === 0) {
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
  const timeInput = document.getElementById('due-time').value;
  const now = new Date();
  const [hours, minutes] = timeInput.split(':');
  now.setHours(hours, minutes, 0, 0);

  const newTask = {
    id: generateId(),
    name: name,
    dueTime: now.toISOString(),
    checked: false,
    alarmTriggered: false,
    isPreset: false
  };

  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  renderTasks();
  e.target.reset();
});

// Initial render of tasks on page load
renderTasks();
