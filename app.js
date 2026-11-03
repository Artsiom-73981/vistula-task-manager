let config = null;
let editingId = null;

const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-description');
const submitBtn = document.getElementById('task-submit');
const cancelBtn = document.getElementById('task-cancel');
const taskList = document.getElementById('task-list');
const statusMessage = document.getElementById('status-message');

function showMessage(text, isError) {
  statusMessage.textContent = text;
  statusMessage.className = isError ? 'error' : '';
}

function apiUrl(query) {
  return `${config.supabaseUrl}/rest/v1/${config.tableName}${query || ''}`;
}

async function request(method, query, body) {
  const options = {
    method,
    headers: {
      apikey: config.supabasePublishableKey,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(apiUrl(query), options);
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.message) msg = data.message;
    } catch (e) {}
    throw new Error(msg);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function getTasks() {
  return request('GET', '?select=*&order=id.asc');
}

async function getTask(id) {
  const rows = await request('GET', `?id=eq.${id}&select=*`);
  return rows[0];
}

function createTask(task) {
  return request('POST', '', task);
}

function saveTask(task) {
  return request('PUT', `?id=eq.${task.id}`, task);
}

function deleteTask(id) {
  return request('DELETE', `?id=eq.${id}`);
}

function renderTasks(tasks) {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.textContent = 'No tasks yet.';
    return;
  }

  tasks.forEach(task => {
    const item = document.createElement('div');
    item.className = 'task-item' + (task.completed ? ' done' : '');
    item.dataset.id = task.id;

    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.title;

    const desc = document.createElement('p');
    desc.className = 'task-description';
    desc.textContent = task.description || '';

    const status = document.createElement('span');
    status.className = 'task-status';
    status.textContent = task.completed ? 'Completed' : 'Not completed';

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-task';
    toggleBtn.textContent = task.completed ? 'Mark incomplete' : 'Mark complete';
    toggleBtn.addEventListener('click', () => onToggle(task.id));

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-task';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => onEdit(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-task';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => onDelete(task.id));

    actions.append(toggleBtn, editBtn, deleteBtn);
    item.append(title, desc, status, actions);
    taskList.appendChild(item);
  });
}

async function loadTasks() {
  try {
    const tasks = await getTasks();
    renderTasks(tasks);
  } catch (err) {
    showMessage('Could not load tasks: ' + err.message, true);
  }
}

function resetForm() {
  editingId = null;
  form.reset();
  submitBtn.textContent = 'Add task';
  cancelBtn.hidden = true;
}

async function onSubmit(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title) {
    showMessage('Title is required.', true);
    return;
  }

  submitBtn.disabled = true;
  try {
    if (editingId === null) {
      await createTask({ title, description, completed: false });
      showMessage('Task added.');
    } else {
      const current = await getTask(editingId);
      if (!current) throw new Error('task not found');
      await saveTask({ ...current, title, description });
      showMessage('Task updated.');
    }
    resetForm();
    await loadTasks();
  } catch (err) {
    showMessage('Could not save task: ' + err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
}

async function onEdit(id) {
  try {
    const task = await getTask(id);
    if (!task) throw new Error('task not found');
    editingId = task.id;
    titleInput.value = task.title;
    descInput.value = task.description || '';
    submitBtn.textContent = 'Save changes';
    cancelBtn.hidden = false;
    titleInput.focus();
  } catch (err) {
    showMessage('Could not load task: ' + err.message, true);
  }
}

async function onToggle(id) {
  try {
    const task = await getTask(id);
    if (!task) throw new Error('task not found');
    await saveTask({ ...task, completed: !task.completed });
    showMessage('Status changed.');
    await loadTasks();
  } catch (err) {
    showMessage('Could not change status: ' + err.message, true);
  }
}

async function onDelete(id) {
  if (!confirm('Delete this task?')) return;
  try {
    await deleteTask(id);
    if (editingId === id) resetForm();
    showMessage('Task deleted.');
    await loadTasks();
  } catch (err) {
    showMessage('Could not delete task: ' + err.message, true);
  }
}

async function init() {
  try {
    const res = await fetch('config.json');
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    config = await res.json();
  } catch (err) {
    showMessage('Could not load config.json: ' + err.message, true);
    return;
  }

  form.addEventListener('submit', onSubmit);
  cancelBtn.addEventListener('click', resetForm);
  loadTasks();
}

init();
