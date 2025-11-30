// Global interval variables
let overdueInterval;
let dueTimeInterval;

// Toggle for change document title
let titleBlinkInterval = null;

// Connection status
const dot = document.getElementById('statusDot');
const text = document.getElementById('statusText');

// Connection status Terminal
const dotTerminal = document.getElementById('statusDotTerminal');
const textTerminal = document.getElementById('statusTextTerminal');

// Connection colour
const vividSkyBlue = "#00b9fe";
const greenPrimary = "#4CAF50";

// Session (in-memory) credentials when user clicks “Use”
let sessionTelegram = { botToken: null, chatId: null, toggle: "OFF" };

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

// Preset tasks definitions that's needs adjustment
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
  ],

  work: [
    { time: "10:00", name: "Eye's break" },
    { time: "12:30", name: "OTL" },
    { time: "13:00", name: "Break" },
    { time: "15:30", name: "Eye's break" },
    { time: "17:30", name: "Take that walk!" },
  ],

  work2: [
    { time: "09:10", name: "Emails" },
    { time: "10:30", name: "Coffee break" },
    { time: "11:30", name: "20 20 20 rule" },
    { time: "13:00", name: "Break" },
    { time: "15:30", name: "Eye's break" },
    { time: "16:30", name: "Update Kimble" },
    { time: "17:00", name: "Drink Water" },
    { time: "18:00", name: "Take that walk!" },
  ]
};

// --- Page Title Mode ---
function savePageTitleMode(mode) {
  localStorage.setItem('pageTitleMode', mode);
}

function loadPageTitleMode() {
  return localStorage.getItem('pageTitleMode') || 'blinkingTitle';
}

// On page load, select the radio button saved in localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedMode = loadPageTitleMode();
  const radio = document.querySelector(`input[name="pageTitle"][value="${savedMode}"]`);
  if (radio) {
    radio.checked = true;
  }
});


// Listen for changes to the radio buttons
document.querySelectorAll('input[name="pageTitle"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const selected = e.target.value;
    savePageTitleMode(selected);

    // Stop any active interval immediately if switching modes
    if (titleBlinkInterval) {
      clearInterval(titleBlinkInterval);
      titleBlinkInterval = null;
    }
    document.title = `Did I take it?`;
    checkOverdueTasks(); // immediately apply new mode
  });
});

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
          <input type="checkbox" id="task-${task.id}" ${task.checked ? 'checked' : ''} onchange="toggleTask('${task.id}', this.checked)">
        </div>
        <div>
          <label for="task-${task.id}">
            <span>${task.name} (Due: ${new Date(task.dueTime).toLocaleTimeString()})</span>
          </label>
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
    if (checked) {
      task.alarmTriggered = false;

      // 🔴 Stop blinking immediately when a task is completed
      if (titleBlinkInterval) {
        clearInterval(titleBlinkInterval);
        titleBlinkInterval = null;
      }

      document.title = `Did I take it?`;
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

// Edit a task's name and due time, and mark it as not preset
function editTask(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Prompt for new name; if Cancel is pressed, no change is made.
  const newName = prompt("Edit task name:", task.name);
  if (newName === null) return;

  const currentDueTime = new Date(task.dueTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute:'2-digit',
    hour12: false
  });

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

// Function to send Telegram message for overdue tasks
function sendTelegramMessage(tasks) {
  let raw = localStorage.getItem("telegramDidITakeIt");
  let botToken, chatId, toggle, chatName;
  if (raw) {
    const parsed = JSON.parse(raw);
    botToken = parsed.value1;
    chatId = parsed.value2;
    toggle = parsed.toggle;
    chatName = parsed.chatName || 'there';
  }

  // If persisted were empty, fall back to session creds
  if (!botToken || !chatId) {
    if (sessionTelegram.botToken && sessionTelegram.chatId) {
      botToken = sessionTelegram.botToken;
      chatId = sessionTelegram.chatId;
      toggle = sessionTelegram.toggle;
      chatName = loadChatName() || 'there';
    } else {
      console.warn("No Telegram credentials found (neither saved nor in session).");
      return;
    }
  }

  if (toggle !== "ON") {
    console.log("Telegram notifications are OFF in settings.");
    return;
  }

  let messageText;
  if (Array.isArray(tasks)) {
    if (tasks.length === 0) return;
    const taskList = tasks.map(t => `- ${t.name} (Due: ${new Date(t.dueTime).toLocaleString()})`).join('\n');
    if (tasks.length === 1) {
      const dueTimeStr = new Date(tasks[0].dueTime).toLocaleString();
      messageText = `Hi ${chatName}!, ${tasks[0].name} (Due: ${dueTimeStr})`;
    } else {
      messageText = `Hi ${chatName}! You have overdue tasks:\n${taskList} \n Task to finish: ${tasks.length}`;
    }
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(messageText)}`;

  fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!data.ok) {
          console.error("Failed to send Telegram message. Description:", data.description);
        }
      })
      .catch(error => {
        console.error("Error sending Telegram message (fetch failed):", error);
      });
}

// Check for overdue tasks and trigger the alarm and Telegram message if needed
function checkOverdueTasks() {
  // console.log("checkOverdueTasks called at", new Date().toLocaleTimeString());
  const tasks = getTasks();
  const now = new Date();
  let shouldPlayAlarm = false;
  const overdueTasks = [];

  tasks.forEach(task => {
    const taskDue = new Date(task.dueTime);
    const localTaskDue = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate(), taskDue.getHours(), taskDue.getMinutes(), taskDue.getSeconds());

    // console.log(`Checking task: ${task.name}, Due: ${localTaskDue.toLocaleString()}, Now: ${now.toLocaleString()}, Checked: ${task.checked}, AlarmTriggered: ${task.alarmTriggered}`);

    if (!task.checked && localTaskDue <= now) {
      // console.log(`Task "${task.name}" is overdue.`);
      if (!task.alarmTriggered) {
        // console.log(`Alarm not yet triggered for "${task.name}". Triggering now.`);
        task.alarmTriggered = true;
      }
      overdueTasks.push(task);
      shouldPlayAlarm = true;
    }
  });

  if (overdueTasks.length > 0) {
    sendTelegramMessage(overdueTasks);
    saveTasks(tasks);
    renderTasks();
  }

  if (shouldPlayAlarm) {
    playAlarmSound();
    if (!titleBlinkInterval) {
      const mode = loadPageTitleMode();
      if (mode === 'marquee') {
        marqueeTittle();
      } else if (mode === 'blinkingTitle') {
        blinkingTitle();
      } else {
        // default just sets normal title
        document.title = 'Did I take it?';
      }
    }
  } else {
    // no overdue tasks — stop blinking/marquee
    if (titleBlinkInterval) {
      clearInterval(titleBlinkInterval);
      titleBlinkInterval = null;
    }
    document.title = `Did I take it?`;
  }
}

// Blinking title
function blinkingTitle() {
  let toggle = true;
  titleBlinkInterval = setInterval(() => {
    document.title = toggle ? "You have task to do!" : "⚠️ Let's do it! 🔴🟡🟢";
    toggle = !toggle;
  }, 1600);
}

// Marquee Title
function marqueeTittle() {
  const tasks = getTasks();
  const task = tasks.find((t) => !t.checked && t.alarmTriggered);
  // stop if no unchecked tasks
  if (!task || !task.name) {
    if (titleBlinkInterval) {
      clearInterval(titleBlinkInterval);
      titleBlinkInterval = null;
    }
    document.title = `Did I take it?`;
    return;
  }

  // stop existing interval before starting new one
  if (titleBlinkInterval) {
    clearInterval(titleBlinkInterval);
    titleBlinkInterval = null;
  }

  let title = task.name;
  let position = 0;

  titleBlinkInterval = setInterval(() => {
    document.title = title.substring(position) + " • " + title.substring(0, position);
    position = (position + 1) % title.length;
  }, 300);
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

// Select elements
const container = document.querySelector('.telegram-container');
const inputs = container.querySelectorAll('.inputs input');
const useButton = container.querySelector('.buttons .use');
const saveButton = container.querySelector('.buttons .save');
const toggleButton = container.querySelector('.buttons .off');
const clearButton = document.querySelector('.buttons .clear');

inputs[0].type = "password";
inputs[1].type = "password";

// Function to toggle use button
function updateUseButtonClasses() {
  if (useButton.textContent === "Use") {
    useButton.classList.add("addButton");
    useButton.classList.remove("editButton");
  } else {
    useButton.classList.add("editButton");
    useButton.classList.remove("addButton");
  }
}

// Function to update toggle button classes
function updateToggleButtonClasses() {
  if (toggleButton.textContent === "ON") {
    toggleButton.classList.add("addButton");
    toggleButton.classList.remove("deleteButton");
  } else {
    toggleButton.classList.add("deleteButton");
    toggleButton.classList.remove("addButton");
  }
}

// Function to update save button classes
function updateSaveButtonClasses() {
  if (saveButton.textContent === "Save") {
    saveButton.classList.add("addButton");
    saveButton.classList.remove("editButton");
  } else if (saveButton.textContent === "Update") {
    saveButton.classList.add("editButton");
    saveButton.classList.remove("addButton");
  }
}

// Function to load state from localStorage
function loadState() {
  const savedState = localStorage.getItem("telegramDidITakeIt");
  if (savedState) {
    const { value1, value2, toggle, chatName } = JSON.parse(savedState);
    inputs[0].value = value1 || '';
    inputs[1].value = value2 || '';
    inputs[2].value = chatName || '';
    toggleButton.textContent = toggle || "OFF";
    inputs[0].disabled = true;
    inputs[1].disabled = true;
    inputs[2].disabled = true;
    saveButton.textContent = "Update";

    // Hide chatName input if empty
    if (!chatName) {
      inputs[2].style.display = "none";
    } else {
      inputs[2].style.display = "block";
    }
  } else {
    toggleButton.textContent = "OFF";
    saveButton.textContent = "Save";
    inputs[0].disabled = false;
    inputs[1].disabled = false;
    inputs[2].disabled = false;
    inputs[2].value = '';
  }

  useButton.textContent = "Update";
  updateToggleButtonClasses();
  updateSaveButtonClasses();
  updateUseButtonClasses();
}

// Function to save state to localStorage
function saveState() {
  const value1 = inputs[0].value;
  const value2 = inputs[1].value;
  const toggle = toggleButton.textContent;
  const chatNameInput = document.querySelector('input[placeholder="Chat Name"]');
  const chatName = chatNameInput ? chatNameInput.value : '';
  localStorage.setItem("telegramDidITakeIt", JSON.stringify({ value1, value2, toggle, chatName }));
}

// Function to save state ON OFF to localStorage
function saveStateONOFF() {
  const savedState = localStorage.getItem("telegramDidITakeIt");
  let state = savedState ? JSON.parse(savedState) : {};
  state.toggle = toggleButton.textContent;
  localStorage.setItem("telegramDidITakeIt", JSON.stringify(state));
}

// Load initial state
loadState();

// Event listener for save/update button
saveButton.addEventListener('click', () => {
  if (saveButton.textContent === "Save") {
    const ok = confirm(
        "Storing your bot token & chat ID in localStorage could be insecure.\n" +
        "Press OK to proceed, or Cancel if you’d rather not save."
    );
    if (!ok) return;

    saveState();
    inputs[0].disabled = true;
    inputs[1].disabled = true;
    inputs[2].disabled = true;
    saveButton.textContent = "Update";
    inputs[0].type = "password";
    inputs[1].type = "password";
    inputs[2].type = "text";
  } else {
    inputs[0].disabled = false;
    inputs[1].disabled = false;
    inputs[2].style.display = "block";
    inputs[2].disabled = false;
    saveButton.textContent = "Save";
    inputs[0].type = "password";
    inputs[1].type = "password";
    inputs[2].type = "text";
  }

  updateSaveButtonClasses();
});

// “Use” button logic (session‑only, not persisted)
useButton.addEventListener('click', () => {
  const isUsing = useButton.textContent === "Use";

  if (isUsing) {
    sessionTelegram.botToken = inputs[0].value;
    sessionTelegram.chatId = inputs[1].value;
    sessionTelegram.toggle = toggleButton.textContent;

    inputs[0].disabled = true;
    inputs[1].disabled = true;
    inputs[2].disabled = true;
    useButton.textContent = "Update";
  } else {
    inputs[0].disabled = false;
    inputs[1].disabled = false;
    inputs[2].disabled = false;
    useButton.textContent = "Use";
  }

  updateToggleButtonClasses();
  updateUseButtonClasses();
});

// Event listener for toggle button
toggleButton.addEventListener('click', () => {
  toggleButton.textContent = toggleButton.textContent === "ON" ? "OFF" : "ON";
  updateToggleButtonClasses();
  saveStateONOFF();
});

clearButton.addEventListener('click', () => {
  localStorage.removeItem("telegramDidITakeIt");
  sessionTelegram = { botToken: null, chatId: null, toggle: "OFF" };
  loadState();
});

class TaskBridge {
  constructor() {
    this.serverPort = 3456; // Fixed port for communication
    this.isServerRunning = false;
    this.checkInterval = null;
    this.sendInterval = null;
    this.lastSentTasksJson = '';
    this.lastSendTime = 0;
    this.startServer();
  }

  async startServer() {
    try {
      const response = await fetch(`http://localhost:${this.serverPort}/ping`, {
        // Add timeout and proper cleanup for fetch requests
        signal: AbortSignal.timeout(5000), // 5 second timeout
        cache: 'no-cache' // Prevent caching
      });
      if (response.ok) {
        this.isServerRunning = true;
        this.startSendingTasks();
        console.log('Desktop buddy server detected!');
        dot.style.backgroundColor = greenPrimary;
        text.textContent = 'Connected';
        return;
      }
    } catch (error) {
      // Keep logging but ensure error objects don't accumulate
      console.log('Desktop buddy not running, will retry...');
      dot.style.backgroundColor = vividSkyBlue;
      text.textContent = 'Reconnecting...';
    }

    // CRITICAL FIX: Always clear existing interval before creating new one
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Only create new interval if we don't already have one running
    if (!this.isServerRunning && !this.checkInterval) {
      this.checkInterval = setInterval(() => {
        this.startServer();
      }, 50000);
    }
  }

  async sendTasks(force = false) {
    if (!this.isServerRunning) return;

    const now = Date.now();
    const tasksJson = JSON.stringify(getTasks());

    // Avoid sending if data is identical and sent recently
    if (!force && tasksJson === this.lastSentTasksJson && now - this.lastSendTime < 5000) {
      return;
    }

    this.lastSentTasksJson = tasksJson;
    this.lastSendTime = now;

    try {
      await fetch(`http://localhost:${this.serverPort}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: tasksJson,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000),
        cache: 'no-cache'
      });
    } catch (error) {
      console.log('Failed to send tasks to desktop buddy');
      dot.style.backgroundColor = 'red';
      text.textContent = 'Disconnected';
      this.isServerRunning = false;
    }
  }

  startSendingTasks() {
    // Send immediately when connected
    this.sendTasks(true);

    // CRITICAL FIX: Clear existing interval before creating new one
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }

    // Periodic send for overdue checks
    this.sendInterval = setInterval(() => {
      this.sendTasks();
    }, 30000);

    // CRITICAL FIX: Only add event listeners once to prevent duplicates
    if (!this.eventListenersAdded) {
      // Send whenever tasks are saved (checkbox clicked, etc.)
      const originalSaveTasks = window.saveTasks;
      window.saveTasks = (tasks) => {
        originalSaveTasks(tasks);
        this.sendTasks(true); // force send immediately
      };

      // Detect tab focus (switching back to buddy) & send overdue status instantly
      window.addEventListener('focus', () => {
        this.sendTasks(true);
      });

      this.eventListenersAdded = true;
    }
  }

  // Method to clean up intervals when needed
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }
    this.isServerRunning = false;
  }
}

// CRITICAL FIX: Ensure only one instance exists globally
let taskBridge = null;

// Initialize bridge on page load
document.addEventListener('DOMContentLoaded', () => {
  // Clean up any existing instance first
  if (taskBridge) {
    taskBridge.destroy();
  }
  taskBridge = new TaskBridge();
});

// Clean up when page is unloaded
window.addEventListener('beforeunload', () => {
  if (taskBridge) {
    taskBridge.destroy();
  }
});

let taskBridgeTerminal = null;

// Initialize bridge on page load
document.addEventListener('DOMContentLoaded', () => {
  // Clean up any existing instance first
  if (taskBridgeTerminal) {
    taskBridgeTerminal.destroy();
  }
  taskBridgeTerminal = new TaskBridgeTerminal();
});

// Clean up when page is unloaded
window.addEventListener('beforeunload', () => {
  if (taskBridgeTerminal) {
    taskBridgeTerminal.destroy();
  }
});

class TaskBridgeTerminal {
  constructor() {
    this.serverPort = 2137;
    this.isServerRunning = false;
    this.checkInterval = null;
    this.sendInterval = null;
    this.lastSentTasksJson = '';
    this.lastSendTime = 0;
    this.startServer();
  }

  async startServer() {
    try {
      const response = await fetch(`http://localhost:${this.serverPort}/ping`, {
        // Add timeout and proper cleanup for fetch requests
        signal: AbortSignal.timeout(5000), // 5 second timeout
        cache: 'no-cache' // Prevent caching
      });
      if (response.ok) {
        this.isServerRunning = true;
        this.startSendingTasks();
        console.log('Terminal buddy server detected!');
        dotTerminal.style.backgroundColor = greenPrimary;
        textTerminal.textContent = 'Connected';
        return;
      }
    } catch (error) {
      // Keep logging but ensure error objects don't accumulate
      console.log('Terminal buddy not running, will retry...');
      dotTerminal.style.backgroundColor = vividSkyBlue;
      textTerminal.textContent = 'Reconnecting...';
    }

    // CRITICAL FIX: Always clear existing interval before creating new one
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Only create new interval if we don't already have one running
    if (!this.isServerRunning && !this.checkInterval) {
      this.checkInterval = setInterval(() => {
        this.startServer();
      }, 50000);
    }
  }

  async sendTasks(force = false) {
    if (!this.isServerRunning) return;

    const now = Date.now();
    const tasksJson = JSON.stringify(getTasks());

    // Avoid sending if data is identical and sent recently
    if (!force && tasksJson === this.lastSentTasksJson && now - this.lastSendTime < 5000) {
      return;
    }

    this.lastSentTasksJson = tasksJson;
    this.lastSendTime = now;

    try {
      await fetch(`http://localhost:${this.serverPort}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: tasksJson,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000),
        cache: 'no-cache'
      });
    } catch (error) {
      console.log('Failed to send tasks to Terminal buddy');
      dotTerminal.style.backgroundColor = 'red';
      textTerminal.textContent = 'Disconnected';
      this.isServerRunning = false;
    }
  }

  startSendingTasks() {
    // Send immediately when connected
    this.sendTasks(true);

    // CRITICAL FIX: Clear existing interval before creating new one
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }

    // Periodic send for overdue checks
    this.sendInterval = setInterval(() => {
      this.sendTasks();
    }, 30000);

    // CRITICAL FIX: Only add event listeners once to prevent duplicates
    if (!this.eventListenersAdded) {
      // Send whenever tasks are saved (checkbox clicked, etc.)
      const originalSaveTasks = window.saveTasks;
      window.saveTasks = (tasks) => {
        originalSaveTasks(tasks);
        this.sendTasks(true); // force send immediately
      };

      // Detect tab focus (switching back to buddy) & send overdue status instantly
      window.addEventListener('focus', () => {
        this.sendTasks(true);
      });

      this.eventListenersAdded = true;
    }
  }

  // Method to clean up intervals when needed
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }
    this.isServerRunning = false;
  }
}

// Store the interval ID so we can clear it later
let terminalSyncInterval = null;

// Listen for task updates from terminal
terminalSyncInterval = setInterval(async () => {
  try {
    const response = await fetch('http://localhost:2137/tasks', {
      signal: AbortSignal.timeout(5000),
      cache: 'no-cache'
    });

    if (response.ok) {
      const serverTasks = await response.json();
      if (serverTasks && serverTasks.length > 0) {
        const currentTasks = getTasks();

        // Only update if data has actually changed
        if (JSON.stringify(currentTasks) !== JSON.stringify(serverTasks)) {
          saveTasks(serverTasks);
          renderTasks();
        }
      }
    }
  } catch (error) {
    // Silently fail if server not running
  }
}, 2000); // Check every 2 seconds

// Clean up when page is unloaded
window.addEventListener('beforeunload', () => {
  if (terminalSyncInterval) {
    clearInterval(terminalSyncInterval);
    terminalSyncInterval = null;
  }
});



// BONUS: Add periodic garbage collection hint for browsers that support it
if ('gc' in window) {
  setInterval(() => {
    if (typeof window.gc === 'function') {
      window.gc();
    }
  }, 300000); // Every 5 minutes
}

// --- Sound ON/OFF toggle ---
const soundButton = document.querySelector('#my-popover-settings .settings-button[data-tooltip="Volume ON"]');
const alarmElement = document.getElementById('alarm-sound');
const showSettingsButton  = document.querySelector('#show-settings-button');

// Load initial mute state
let isMuted = localStorage.getItem("soundMuted") === "true";
updateSoundButton();

soundButton.addEventListener('click', () => {
  isMuted = !isMuted;
  localStorage.setItem("soundMuted", isMuted);
  updateSoundButton();
});

function updateSoundButton() {
  const effectiveMute = isMuted || alarmElement.volume === 0;

  if (effectiveMute) {
    soundButton.textContent = "Sound OFF";
    soundButton.dataset.tooltip = "Volume OFF";
    soundButton.classList.add("deleteButton");
    showSettingsButton.classList.add("redCorner");
  } else {
    soundButton.textContent = "Sound ON";
    soundButton.classList.remove("deleteButton");
    showSettingsButton.classList.remove("redCorner");
    soundButton.dataset.tooltip = "Volume ON";
  }
}

// Override alarm play with mute check
function playAlarmSound() {
  if (isMuted) return;
  const alarmSound = document.getElementById('alarm-sound');
  if (alarmSound) {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.play().catch(err => console.warn("Alarm playback prevented:", err));
  }
}

// --- Reset Task Buddy button ---
const resetButton = document.querySelector('#my-popover-settings .settings-button[data-tooltip="Link to download Task Buddy on bottom right (i)"]');
resetButton.addEventListener('click', () => {
  if (taskBridge) {
    taskBridge.destroy();
    taskBridge = new TaskBridge();
    console.log("Task Buddy connection reset.");
  }
});

// --- Reset Buddy Terminal button ---
const resetButtonTerminal = document.querySelector('#my-popover-settings .settings-button[data-tooltip="Buddy Terminal"]');
resetButtonTerminal.addEventListener('click', () => {
  console.log("Buddy Terminal reset.");
  if (taskBridgeTerminal) {
    taskBridgeTerminal.destroy();
    taskBridgeTerminal = new TaskBridgeTerminal();
    console.log("Terminal Buddy connection reset.");
  }
});

// --- Ring sound selection ---
const ringSoundSelect = document.getElementById("ring-sound");

// Load saved ring sound from localStorage
const savedRingSound = localStorage.getItem("ringSound");
if (savedRingSound) {
  ringSoundSelect.value = savedRingSound;
  updateAlarmSource(savedRingSound);
}

ringSoundSelect.addEventListener("change", () => {
  const selected = ringSoundSelect.value;
  localStorage.setItem("ringSound", selected);
  updateAlarmSource(selected);
});

function updateAlarmSource(type) {
  if (!alarmElement) return;
  alarmElement.src = type + ".mp3";
}

// --- Volume Control ---
const volumeControl = document.getElementById("volume-control");
const volumePercent = document.getElementById("volume-percent");

// Load saved volume or default to 1 (full)
let savedVolume = parseFloat(localStorage.getItem("alarmVolume"));
if (isNaN(savedVolume)) savedVolume = 1;

alarmElement.volume = savedVolume;
volumeControl.value = savedVolume;
volumePercent.textContent = Math.round(savedVolume * 100) + "%";

volumeControl.addEventListener("input", () => {
  const newVolume = parseFloat(volumeControl.value);
  alarmElement.volume = newVolume;
  localStorage.setItem("alarmVolume", newVolume);

  // Update percentage display
  volumePercent.textContent = Math.round(newVolume * 100) + "%";

  updateSoundButton(); // keep mute button synced
});

// --- Preview sound button ---
const playSoundButton = document.getElementById("play-sound");

playSoundButton.addEventListener("click", () => {
  if (!isMuted && alarmElement) {
    alarmElement.pause();
    alarmElement.currentTime = 0;
    alarmElement.play().catch(err => console.warn("Playback prevented:", err));
  } else if (isMuted) {
    console.log("Sound is muted, cannot preview.");
  }
});
