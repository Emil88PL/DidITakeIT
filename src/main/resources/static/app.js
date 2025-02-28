const API_URL = 'http://localhost:8080/tasks';

document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('task-name').value;
  const timeInput = document.getElementById('due-time').value; // e.g., "14:30"

  const newTask = { name: name, time: timeInput };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask)
  });

  if(response.ok) {
    loadTasks();
    e.target.reset();
  }
});


async function loadTasks() {
  const response = await fetch(API_URL);
  const tasks = await response.json();
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

    // Play alarm sound if the task's alarm is triggered
    if (task.alarmTriggered) {
      document.getElementById('alarm-sound').play();
    }
  });
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  loadTasks();
}

async function toggleTask(id, checked) {
  // First, get the task (for a more robust implementation, maintain a local state or include task id in the DOM)
  const response = await fetch(`${API_URL}`);
  const tasks = await response.json();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.checked = checked;
  // Reset alarm if the task is now checked
  if (checked) task.alarmTriggered = false;

  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });

  loadTasks();
}

// Periodically refresh tasks to check for any alarms (e.g., every 30 seconds)
setInterval(loadTasks, 30000);

// Initial load
loadTasks();
