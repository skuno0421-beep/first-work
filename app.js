let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let filter = 'all';

const input = document.getElementById('todo-input');
const dueInput = document.getElementById('due-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');
const remaining = document.getElementById('remaining');
const clearBtn = document.getElementById('clear-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function render() {
  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<li class="empty-msg">タスクがありません</li>';
  } else {
    list.innerHTML = filtered.map(t => {
      const dueLabel = t.due ? formatDue(t.due, t.done) : '';
      return `
      <li class="todo-item ${t.done ? 'completed' : ''}" data-id="${t.id}">
        <input type="checkbox" ${t.done ? 'checked' : ''}>
        <div class="todo-body">
          <span class="todo-text" title="ダブルクリックで編集">${escapeHtml(t.text)}</span>
          ${dueLabel}
        </div>
        <button class="edit-btn" title="名前を変更">✎</button>
        <button class="delete-btn" title="削除">✕</button>
      </li>`;
    }).join('');
  }

  const activeCount = todos.filter(t => !t.done).length;
  remaining.textContent = `${activeCount} 件の未完了タスク`;
}

function startEdit(item) {
  if (item.classList.contains('editing')) return;
  const id = Number(item.dataset.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  item.classList.add('editing');
  const span = item.querySelector('.todo-text');
  const original = todo.text;

  span.innerHTML = `<input class="edit-input" type="text" value="${escapeHtml(original)}" maxlength="100">`;
  const editInput = span.querySelector('.edit-input');
  editInput.focus();
  editInput.select();

  function commit() {
    const newText = editInput.value.trim();
    if (newText && newText !== original) {
      todo.text = newText;
      save();
    }
    render();
  }

  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') render();
  });
  editInput.addEventListener('blur', commit);
}

function formatDue(dateStr, done) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  const diff = Math.round((due - today) / 86400000);
  let cls = 'due-label';
  let label = `📅 ${dateStr.replace(/-/g, '/')}`;
  if (!done) {
    if (diff < 0) { cls += ' due-overdue'; label += ' (期限切れ)'; }
    else if (diff === 0) { cls += ' due-today'; label += ' (今日)'; }
    else if (diff <= 3) { cls += ' due-soon'; }
  }
  return `<span class="${cls}">${label}</span>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  todos.unshift({ id: Date.now(), text, done: false, due: dueInput.value || null });
  input.value = '';
  dueInput.value = '';
  save();
  render();
}

addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });

list.addEventListener('change', e => {
  if (e.target.type !== 'checkbox') return;
  const id = Number(e.target.closest('.todo-item').dataset.id);
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.done = e.target.checked; save(); render(); }
});

list.addEventListener('click', e => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  if (e.target.classList.contains('delete-btn')) {
    todos = todos.filter(t => t.id !== Number(item.dataset.id));
    save();
    render();
  } else if (e.target.classList.contains('edit-btn')) {
    startEdit(item);
  }
});

list.addEventListener('dblclick', e => {
  const item = e.target.closest('.todo-item');
  if (item && e.target.classList.contains('todo-text')) startEdit(item);
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

clearBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save();
  render();
});

render();
