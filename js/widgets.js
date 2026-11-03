// Блоки: время, дела, заметка.
import { get, set } from './store.js';
import { svg } from './icons.js';
import { isVisible, onVisible } from './layout.js';
import { t } from './i18n.js';
import { fmtTime, localeTag } from './region.js';
import { $, esc, animOn, setRing } from './ui.js';

// ---------- время, приветствие ----------
export function initClock() {
  const tick = () => {
    const d = new Date(), h = d.getHours();
    $('clock').textContent = fmtTime(d);
    $('date').textContent = new Intl.DateTimeFormat(localeTag(), { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
    const hello = h >= 5 && h < 12 ? t('greetMorning') : h >= 12 && h < 18 ? t('greetDay') : h >= 18 && h < 23 ? t('greetEvening') : t('greetNight');
    $('greet').textContent = hello;
  };
  tick();
  setInterval(tick, 1000);
  document.addEventListener('gt:settings', tick);
  document.addEventListener('gt:lang', tick);
}

// ---------- дела ----------
const loadTodos = () => { const v = get('todos', []); return Array.isArray(v) ? v.filter(x => x && typeof x.text === 'string') : []; };
let renderTasksFn = () => {};
export function initTasks() {
  const list = $('todoList');
  $('todoForm').querySelector('.add').innerHTML = svg('plus');

  const render = fx => {
    const items = loadTodos();
    const done = items.filter(t => t.done).length, total = items.length;
    const ring = $('todoRing');
    const p = total ? Math.round(done / total * 100) : 0;
    setRing(ring, p);
    ring.querySelector('span').textContent = `${done}/${total}`;

    const clearBtn = $('todoClearDone');
    if (clearBtn) clearBtn.hidden = done === 0;

    if (!items.length) {
      list.innerHTML = `<li class="empty">${t('tasksEmpty')}</li>`;
      return;
    }
    list.innerHTML = items.map((tItem, i) => `
      <li class="${tItem.done ? 'done' : ''}" data-i="${i}">
        <button type="button" class="chk" aria-label="${t('markDone')}">${tItem.done ? svg('check') : ''}</button>
        <span class="txt" title="${t('taskEditHint')}">${esc(tItem.text)}</span>
        <button type="button" class="del" aria-label="${t('deleteBtn')}">${svg('x')}</button>
      </li>
    `).join('');
    if (fx && animOn()) {
      const li = list.querySelector(`li[data-i="${fx.i}"]`);
      if (li) li.classList.add(fx.type);
    }
  };

  renderTasksFn = () => render();

  list.addEventListener('click', e => {
    const li = e.target.closest('li[data-i]');
    if (!li) return;
    if (list.querySelector('.leaving')) return;
    const i = Number(li.dataset.i), items = loadTodos();
    if (e.target.closest('.del')) {
      const remove = () => { items.splice(i, 1); set('todos', items); render(); };
      if (animOn()) { li.classList.add('leaving'); setTimeout(remove, 200); } else remove();
    } else if (e.target.closest('.chk') || e.target.closest('.txt')) {
      items[i].done = !items[i].done;
      set('todos', items);
      render({ i, type: 'tick' });
    }
  });

  // Быстрое редактирование задачи по двойному клику
  list.addEventListener('dblclick', e => {
    const txtSpan = e.target.closest('.txt');
    if (!txtSpan) return;
    const li = txtSpan.closest('li[data-i]');
    if (!li) return;
    const i = Number(li.dataset.i);
    const items = loadTodos();
    const curText = items[i].text;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'taskEdit';
    input.value = curText;
    txtSpan.replaceWith(input);
    input.focus();

    const saveEdit = () => {
      const v = input.value.trim();
      if (v) items[i].text = v;
      else items.splice(i, 1);
      set('todos', items);
      render();
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
      if (ev.key === 'Escape') { render(); }
    });
  });

  const clearBtn = $('todoClearDone');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const items = loadTodos().filter(t => !t.done);
      set('todos', items);
      render();
    });
  }

  $('todoForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('todoInput').value.trim();
    if (!v) return;
    const all = [...loadTodos(), { text: v, done: false }];
    set('todos', all);
    $('todoInput').value = '';
    render({ i: all.length - 1, type: 'enter' });
  });
  render();
  document.addEventListener('gt:lang', render);
}

// ---------- заметка ----------
export function initNote() {
  const ta = $('noteText');
  ta.value = get('note', '');
  let t = 0;
  ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => set('note', ta.value), 250); });
}

// ---------- синхронизация между несколькими вкладками ----------
window.addEventListener('storage', e => {
  if (!e.key || !e.key.startsWith('gt.')) return;
  if (e.key === 'gt.todos') renderTasksFn();
  if (e.key === 'gt.note' && $('noteText') && document.activeElement !== $('noteText')) {
    $('noteText').value = get('note', '');
  }
});
