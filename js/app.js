const themeToggleBtn = document.getElementById('theme-toggle');

/** Applies the saved theme on page load. */
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
    themeToggleBtn.textContent = '☀️';
  } else {
    themeToggleBtn.textContent = '🌙';
  }
}

/** Toggles between light and dark mode and persists the choice. */
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

themeToggleBtn.addEventListener('click', toggleTheme);
initTheme();

/* =============================================
   1. GREETING & LIVE CLOCK
   ============================================= */

const greetingEl     = document.getElementById('greeting');
const clockEl        = document.getElementById('current-time');
const dateEl         = document.getElementById('current-date');
const editNameBtn    = document.getElementById('edit-name-btn');
const nameInputRow   = document.getElementById('name-input-row');
const nameInput      = document.getElementById('name-input');
const nameSaveBtn    = document.getElementById('name-save-btn');
const nameCancelBtn  = document.getElementById('name-cancel-btn');

/**
 * Returns a greeting based on the hour (0–23).
 * @param {number} hour
 * @returns {string}
 */
function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

/** Loads saved name from localStorage. */
function loadName() {
  return localStorage.getItem('userName') || '';
}

/** Saves name to localStorage. */
function saveName(name) {
  localStorage.setItem('userName', name);
}

/** Builds greeting text, appending name if available. */
function buildGreeting(hour) {
  const base = getGreeting(hour);
  const name = loadName();
  return name ? `${base}, ${name} 👋` : `${base} 👋`;
}

/** Formats a Date to a readable date string. */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

/** Formats a Date to HH:MM:SS. */
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Updates the clock, date, and greeting every second. */
function updateClock() {
  const now = new Date();
  clockEl.textContent    = formatTime(now);
  dateEl.textContent     = formatDate(now);
  greetingEl.textContent = buildGreeting(now.getHours());
}

updateClock();
setInterval(updateClock, 1000);

/* --- Name editing --- */

/** Opens the inline name editor. */
function openNameEdit() {
  nameInput.value = loadName();
  nameInputRow.classList.remove('hidden');
  nameInput.focus();
  nameInput.select();
}

/** Saves the name and closes the editor. */
function saveNameEdit() {
  const name = nameInput.value.trim();
  saveName(name);
  nameInputRow.classList.add('hidden');
  updateClock(); // refresh greeting immediately
}

/** Cancels editing without saving. */
function cancelNameEdit() {
  nameInputRow.classList.add('hidden');
}

// If no name saved yet, open the editor automatically on first load
if (!loadName()) openNameEdit();

editNameBtn.addEventListener('click', openNameEdit);
nameSaveBtn.addEventListener('click', saveNameEdit);
nameCancelBtn.addEventListener('click', cancelNameEdit);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  saveNameEdit();
  if (e.key === 'Escape') cancelNameEdit();
});


/* =============================================
   2. FOCUS TIMER (configurable)
   ============================================= */

// --- DOM refs ---
const timerDisplayEl    = document.getElementById('timer-display');
const btnStart          = document.getElementById('timer-start');
const btnStop           = document.getElementById('timer-stop');
const btnReset          = document.getElementById('timer-reset');
const timerSettingsBtn  = document.getElementById('timer-settings-btn');
const timerSettingsPanel= document.getElementById('timer-settings-panel');
const timerSettingsSave = document.getElementById('timer-settings-save');
const timerSettingsCancel= document.getElementById('timer-settings-cancel');
const setFocusInput     = document.getElementById('set-focus');
const setBreakInput     = document.getElementById('set-break');
const setLongBreakInput = document.getElementById('set-longbreak');
const modeButtons       = document.querySelectorAll('.timer-mode-btn');

// --- Default durations (minutes) ---
const DEFAULT_DURATIONS = { focus: 25, break: 5, longbreak: 15 };

/** Loads timer settings from localStorage. */
function loadTimerSettings() {
  try {
    return JSON.parse(localStorage.getItem('timerSettings')) || { ...DEFAULT_DURATIONS };
  } catch {
    return { ...DEFAULT_DURATIONS };
  }
}

/** Saves timer settings to localStorage. */
function saveTimerSettings(settings) {
  localStorage.setItem('timerSettings', JSON.stringify(settings));
}

// Active mode: 'focus' | 'break' | 'longbreak'
let activeMode    = 'focus';
let timerInterval = null;
let timerRunning  = false;

/** Returns duration in seconds for the given mode. */
function getDuration(mode) {
  const settings = loadTimerSettings();
  return (settings[mode] || DEFAULT_DURATIONS[mode]) * 60;
}

let timeRemaining = getDuration('focus');

/** Converts seconds to MM:SS string. */
function formatTimer(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/** Renders current time remaining to the display. */
function renderTimer() {
  timerDisplayEl.textContent = formatTimer(timeRemaining);
}

/** Starts the countdown. */
function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerDisplayEl.classList.add('running');
  timerDisplayEl.classList.remove('finished');

  timerInterval = setInterval(() => {
    timeRemaining--;
    renderTimer();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplayEl.classList.remove('running');
      timerDisplayEl.classList.add('finished');
      timerDisplayEl.textContent = 'Done! 🎉';
    }
  }, 1000);
}

/** Pauses the countdown. */
function stopTimer() {
  clearInterval(timerInterval);
  timerRunning  = false;
  timerDisplayEl.classList.remove('running');
}

/** Resets the timer to the current mode's duration. */
function resetTimer() {
  stopTimer();
  timeRemaining = getDuration(activeMode);
  timerDisplayEl.classList.remove('running', 'finished');
  renderTimer();
}

/** Switches to a different mode and resets. */
function switchMode(mode) {
  stopTimer();
  activeMode    = mode;
  timeRemaining = getDuration(mode);
  timerDisplayEl.classList.remove('running', 'finished');
  renderTimer();

  modeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

// Mode tab click
modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

// Timer controls
btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click',  stopTimer);
btnReset.addEventListener('click', resetTimer);

// --- Settings panel ---

/** Opens the settings panel and fills current values. */
function openTimerSettings() {
  const s = loadTimerSettings();
  setFocusInput.value     = s.focus     || DEFAULT_DURATIONS.focus;
  setBreakInput.value     = s.break     || DEFAULT_DURATIONS.break;
  setLongBreakInput.value = s.longbreak || DEFAULT_DURATIONS.longbreak;
  timerSettingsPanel.classList.remove('hidden');
}

/** Validates, saves settings, resets current mode timer, closes panel. */
function saveSettings() {
  const focus     = parseInt(setFocusInput.value,     10);
  const brk       = parseInt(setBreakInput.value,     10);
  const longbreak = parseInt(setLongBreakInput.value, 10);

  if (!focus || !brk || !longbreak || focus < 1 || brk < 1 || longbreak < 1) {
    alert('Please enter valid durations (minimum 1 minute).');
    return;
  }

  saveTimerSettings({ focus, break: brk, longbreak });
  closeTimerSettings();
  resetTimer(); // apply new duration immediately
}

/** Closes the settings panel without saving. */
function closeTimerSettings() {
  timerSettingsPanel.classList.add('hidden');
}

timerSettingsBtn.addEventListener('click', () => {
  timerSettingsPanel.classList.contains('hidden')
    ? openTimerSettings()
    : closeTimerSettings();
});
timerSettingsSave.addEventListener('click',   saveSettings);
timerSettingsCancel.addEventListener('click', closeTimerSettings);

// Initial render
renderTimer();


/* =============================================
   3. TO-DO LIST
   ============================================= */

const todoInput  = document.getElementById('todo-input');
const btnTodoAdd = document.getElementById('todo-add');
const todoListEl = document.getElementById('todo-list');
const sortSelect = document.getElementById('sort-select');

// Edit modal elements
const editModal     = document.getElementById('edit-modal');
const editInput     = document.getElementById('edit-input');
const btnEditSave   = document.getElementById('edit-save');
const btnEditCancel = document.getElementById('edit-cancel');

let editingTaskId = null;

/** Loads tasks from localStorage. */
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem('tasks')) || [];
  } catch {
    return [];
  }
}

/** Saves tasks to localStorage. */
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

/** Loads the saved sort preference. */
function loadSort() {
  return localStorage.getItem('taskSort') || 'default';
}

/** Saves the sort preference. */
function saveSort(value) {
  localStorage.setItem('taskSort', value);
}

/** Generates a unique ID string. */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Returns a sorted copy of tasks without mutating the original.
 * @param {Array} tasks
 * @param {string} mode - 'default' | 'az' | 'za' | 'active' | 'done'
 * @returns {Array}
 */
function sortTasks(tasks, mode) {
  const copy = [...tasks];
  switch (mode) {
    case 'az':
      return copy.sort((a, b) => a.text.localeCompare(b.text));
    case 'za':
      return copy.sort((a, b) => b.text.localeCompare(a.text));
    case 'active':
      return copy.sort((a, b) => Number(a.done) - Number(b.done));
    case 'done':
      return copy.sort((a, b) => Number(b.done) - Number(a.done));
    default:
      return copy; // preserve insertion order
  }
}

/** Renders the full task list, applying current sort. */
function renderTasks() {
  const raw    = loadTasks();
  const mode   = sortSelect.value;
  const tasks  = sortTasks(raw, mode);

  todoListEl.innerHTML = '';

  if (tasks.length === 0) {
    todoListEl.innerHTML = '<p class="empty-state">No tasks yet. Add one above!</p>';
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <input
        type="checkbox"
        class="todo-checkbox"
        ${task.done ? 'checked' : ''}
        aria-label="Mark task as done"
      />
      <span class="todo-text">${escapeHtml(task.text)}</span>
      <div class="todo-actions">
        <button class="btn btn-edit-task btn-icon-ghost" aria-label="Edit task">✏️</button>
        <button class="btn btn-danger btn-delete" aria-label="Delete task">Delete</button>
      </div>
    `;

    li.querySelector('.todo-checkbox').addEventListener('change', (e) => {
      toggleTask(task.id, e.target.checked);
    });

    li.querySelector('.btn-edit-task').addEventListener('click', () => {
      openEditModal(task.id, task.text);
    });

    li.querySelector('.btn-delete').addEventListener('click', () => {
      deleteTask(task.id);
    });

    todoListEl.appendChild(li);
  });
}

/** Adds a new task. */
function addTask() {
  const text = todoInput.value.trim();
  if (!text) return;

  const tasks = loadTasks();
  tasks.push({ id: generateId(), text, done: false });
  saveTasks(tasks);
  todoInput.value = '';
  renderTasks();
}

/** Toggles the done state of a task. */
function toggleTask(id, done) {
  const tasks = loadTasks().map((t) => t.id === id ? { ...t, done } : t);
  saveTasks(tasks);
  renderTasks();
}

/** Deletes a task by ID. */
function deleteTask(id) {
  const tasks = loadTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

/** Opens the edit modal. */
function openEditModal(id, currentText) {
  editingTaskId   = id;
  editInput.value = currentText;
  editModal.classList.remove('hidden');
  editInput.focus();
}

/** Saves edits from the modal. */
function saveEditedTask() {
  const newText = editInput.value.trim();
  if (!newText || !editingTaskId) return;

  const tasks = loadTasks().map((t) =>
    t.id === editingTaskId ? { ...t, text: newText } : t
  );
  saveTasks(tasks);
  closeEditModal();
  renderTasks();
}

/** Closes the edit modal. */
function closeEditModal() {
  editModal.classList.add('hidden');
  editingTaskId   = null;
  editInput.value = '';
}

btnTodoAdd.addEventListener('click', addTask);
todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

btnEditSave.addEventListener('click', saveEditedTask);
btnEditCancel.addEventListener('click', closeEditModal);
editInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  saveEditedTask();
  if (e.key === 'Escape') closeEditModal();
});
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

// Sort dropdown — persist choice and re-render
sortSelect.value = loadSort();
sortSelect.addEventListener('change', () => {
  saveSort(sortSelect.value);
  renderTasks();
});

renderTasks();


/* =============================================
   4. QUICK LINKS
   ============================================= */

const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput  = document.getElementById('link-url-input');
const btnLinkAdd    = document.getElementById('link-add');
const linksListEl   = document.getElementById('links-list');

/** Loads quick links from localStorage. */
function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem('quickLinks')) || [];
  } catch {
    return [];
  }
}

/** Saves quick links to localStorage. */
function saveLinks(links) {
  localStorage.setItem('quickLinks', JSON.stringify(links));
}

/** Renders all quick link chips. */
function renderLinks() {
  const links = loadLinks();
  linksListEl.innerHTML = '';

  if (links.length === 0) {
    linksListEl.innerHTML = '<p class="empty-state">No links yet. Add one above!</p>';
    return;
  }

  links.forEach((link) => {
    const anchor = document.createElement('a');
    anchor.href      = link.url;
    anchor.target    = '_blank';
    anchor.rel       = 'noopener noreferrer';
    anchor.className = 'link-chip';
    anchor.setAttribute('aria-label', `Open ${link.name}`);

    // Nama link
    const label = document.createElement('span');
    label.className   = 'link-chip-name';
    label.textContent = link.name;

    // URL sebagai keterangan — potong supaya tidak terlalu panjang
    const urlDisplay = link.url
      .replace(/^https?:\/\//, '')  // buang protokol
      .replace(/\/$/, '');          // buang trailing slash
    const desc = document.createElement('span');
    desc.className   = 'link-chip-url';
    desc.textContent = urlDisplay.length > 30 ? urlDisplay.slice(0, 30) + '…' : urlDisplay;

    // Tombol hapus
    const deleteBtn = document.createElement('button');
    deleteBtn.className   = 'link-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', `Remove ${link.name}`);
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      deleteLink(link.id);
    });

    const textWrap = document.createElement('div');
    textWrap.className = 'link-chip-text';
    textWrap.appendChild(label);
    textWrap.appendChild(desc);

    anchor.appendChild(textWrap);
    anchor.appendChild(deleteBtn);
    linksListEl.appendChild(anchor);
  });
}

/** Adds a new quick link. */
function addLink() {
  const name = linkNameInput.value.trim();
  const url  = linkUrlInput.value.trim();

  if (!name || !url) {
    alert('Please enter both a label and a URL.');
    return;
  }

  const fullUrl = /^https?:\/\//i.test(url) ? url : 'https://' + url;

  const links = loadLinks();
  links.push({ id: generateId(), name, url: fullUrl });
  saveLinks(links);

  linkNameInput.value = '';
  linkUrlInput.value  = '';
  renderLinks();
}

/** Removes a quick link by ID. */
function deleteLink(id) {
  const links = loadLinks().filter((l) => l.id !== id);
  saveLinks(links);
  renderLinks();
}

btnLinkAdd.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addLink();
});
linkNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') linkUrlInput.focus();
});

renderLinks();


/* =============================================
   UTILITY
   ============================================= */

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
