// Расположение блоков: у каждого блока своё место, его можно перетащить куда угодно, скрыть или вернуть.
// Положение хранится так: x - доля ширины рабочей области (0..1), y - пиксели сверху. Нижняя панель привязана к низу окна.
import { get, set } from './store.js';
import { svg } from './icons.js';
import { t } from './i18n.js';
import { $, bindPanel, closePanels, closePopover, setHidden, esc } from './ui.js';

// Колонки сетки как на макете: 12 колонок, зазор 14px при ширине 1180
const G = 14 / 1180, CW = (1 - 11 * G) / 12, left = c => c * (CW + G), wid = n => n * CW + (n - 1) * G;
const ROW1 = 280;
const GAP = 24;

// x, w - доли ширины рабочей области; y - минимальный отступ сверху. Если пользователь блок не двигал,
// его высота считается автоматически (блок встаёт под теми, что над ним), поэтому блоки не налезают друг на друга.
export const WIDGETS = {
  clock:    { name: 'Время и приветствие', icon: 'clock', kind: 'board', x: 0, y: 14, w: null },
  wxpill:   { name: 'Погода одной строкой', icon: 'sun', kind: 'board', x: 0.44, y: 14, w: null },
  theme:    { name: 'Тема: Авто / День / Ночь', icon: 'moon', kind: 'board', x: 0.81, y: 14, w: null },
  search:   { name: 'Умная строка поиска', icon: 'search', kind: 'board', x: 0.15, y: 112, w: 0.7 },
  weather:  { name: 'Погода крупно', icon: 'sun', kind: 'board', x: 0, y: ROW1, w: wid(5) },
  tasks:    { name: 'Дела', icon: 'list', kind: 'board', x: left(5), y: ROW1, w: wid(4) },
  timer:    { name: 'Таймер фокуса', icon: 'clock', kind: 'board', x: left(9), y: ROW1, w: wid(3) },
  calendar: { name: 'Календарь', icon: 'calendar', kind: 'board', x: left(5), y: 0, w: wid(4) },
  snippets: { name: 'Быстрый буфер', icon: 'copy', kind: 'board', x: left(9), y: 0, w: wid(3) },
  note:     { name: 'Заметка', icon: 'note', kind: 'board', x: 0, y: 0, w: wid(5) },
  dock:     { name: 'Нижняя панель', icon: 'grid', kind: 'fixed', x: 0.5, b: 20, w: null }
};

// На чистом старте видны только время, погода-пилюля, тема, поиск и нижняя панель; остальное включается в настройках.
const DEFAULT_HIDDEN = new Set(['weather', 'tasks', 'calendar', 'timer', 'snippets', 'note']);
export const CORE = ['clock', 'wxpill', 'theme', 'search', 'dock'];

let state = get('layout', {});
if (!state || typeof state !== 'object' || Array.isArray(state)) state = {};          // { id: {x, y|b, hidden, z} }
if (state.tzpill) { delete state.tzpill; set('layout', state); }
if (state.sites) { delete state.sites; set('layout', state); }
let zTop = Math.max(10, ...Object.values(state).map(s => s.z || 0));
const els = {};
const subs = new Set();
const board = () => $('board');

export const isVisible = id => state[id] && state[id].hidden != null ? !state[id].hidden : !DEFAULT_HIDDEN.has(id);
export const onVisible = cb => subs.add(cb);
const emit = (id) => subs.forEach(cb => cb(id, isVisible(id)));
const save = () => set('layout', state);

function place(id) {
  const el = els[id], d = WIDGETS[id], s = state[id] || {};
  if (!el || !d) return;
  const x = s.x ?? d.x;
  el.hidden = !isVisible(id);
  el.style.zIndex = s.z || '';
  if (d.kind === 'fixed') {
    el.style.left = (x * 100) + '%';
    el.style.bottom = (s.b ?? d.b) + 'px';
  } else {
    el.style.left = (x * 100) + '%';
    if (s.y != null) el.style.top = s.y + 'px';
    if (d.w) el.style.width = (d.w * 100) + '%';
  }
}

// высота рабочей области - по самому нижнему блоку, чтобы страница прокручивалась до него
function autoPlace() {
  const bw = board() ? board().clientWidth : 0;
  if (!bw) return;
  const placed = [];
  Object.keys(WIDGETS).forEach(id => {
    const d = WIDGETS[id], el = els[id];
    if (d.kind !== 'board' || !el || !isVisible(id)) return;
    const s = state[id] || {};
    const x0 = s.x ?? d.x, x1 = x0 + (d.w ?? el.offsetWidth / bw);
    let top = s.y;
    if (top == null) {
      top = d.y;
      if (id === 'search') top = Math.max(d.y, Math.round(innerHeight * 0.3 - 50));   // на высоком экране строка чуть ниже, как у поисковиков
      placed.forEach(p => { if (p.x0 < x1 - 0.005 && x0 < p.x1 - 0.005) top = Math.max(top, p.bottom + GAP); });
      const px = top + 'px';
      if (el.style.top !== px && !el.classList.contains('dragging')) el.style.top = px;
    }
    placed.push({ x0, x1, bottom: top + el.offsetHeight });
  });
}

export function fit() {
  autoPlace();
  let bottom = 0;
  Object.keys(WIDGETS).forEach(id => {
    const d = WIDGETS[id];
    if (d.kind === 'board' && isVisible(id)) {
      const el = els[id];
      if (el) bottom = Math.max(bottom, el.offsetTop + el.offsetHeight);
    }
  });
  // по умолчанию высота = высоте окна (CSS), поэтому прокрутки нет; растём только если блоки реально не помещаются
  if (board()) {
    const room = innerHeight - (document.body.classList.contains('editing') ? 92 : 0);
    board().style.minHeight = bottom + 130 > room ? (bottom + 130) + 'px' : '';
  }
}

export function setVisible(id, v) {
  state[id] = { ...(state[id] || {}), hidden: !v };
  save(); place(id); fit(); emit(id);
  renderBlocks();
}

// ---- перетаскивание ----
let drag = null;
function onDown(e) {
  if (!document.body.classList.contains('editing')) return;
  if (e.target.closest('.wctl')) return;
  const el = e.currentTarget, id = el.dataset.w, d = WIDGETS[id];
  if (!d) return;
  e.preventDefault();
  el.setPointerCapture(e.pointerId);
  const r = el.getBoundingClientRect(), br = board().getBoundingClientRect();
  drag = { id, el, d, px: e.clientX, py: e.clientY, l0: d.kind === 'fixed' ? r.left + r.width / 2 : r.left - br.left, t0: d.kind === 'fixed' ? innerHeight - r.bottom : r.top - br.top, moved: false };
  el.classList.add('dragging');
  el.style.zIndex = ++zTop;
}
function onMove(e) {
  if (!drag || drag.el !== e.currentTarget) return;
  const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
  if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
  const { el, d } = drag;
  if (d.kind === 'fixed') {
    const half = el.offsetWidth / 2 + 8;
    el.style.left = Math.max(half, Math.min(innerWidth - half, drag.l0 + dx)) + 'px';
    el.style.bottom = Math.max(8, Math.min(innerHeight - 70, drag.t0 - dy)) + 'px';
  } else {
    const bw = board().clientWidth;
    el.style.left = Math.max(-20, Math.min(bw - 80, drag.l0 + dx)) + 'px';
    el.style.top = Math.max(0, drag.t0 + dy) + 'px';
  }
}
function onUp(e) {
  if (!drag || drag.el !== e.currentTarget) return;
  const { id, el, d } = drag;
  el.classList.remove('dragging');
  if (drag.moved) {
    const s = state[id] = { ...(state[id] || {}), z: Number(el.style.zIndex) || zTop };
    if (d.kind === 'fixed') {
      s.x = Math.round(el.offsetLeft / innerWidth * 1000) / 1000;
      s.b = Math.round(parseFloat(el.style.bottom) / 4) * 4;
    } else {
      s.x = Math.round(parseFloat(el.style.left) / board().clientWidth * 200) / 200;     // шаг 0,5% ширины
      s.y = Math.round(parseFloat(el.style.top) / 4) * 4;                                  // шаг 4px
    }
    save(); place(id); fit();
  }
  drag = null;
}

// ---- режим «Настроить» ----
export function setEditing(on) {
  document.body.classList.toggle('editing', on);
  setHidden($('editbar'), !on);
  $('editBtn').classList.toggle('active', on);
  if (on) { closePanels(null); closePopover(); } else { setHidden($('blocksPanel'), true); }
  fit();
}

function getWidgetName(id) {
  return t('w_' + id) || (WIDGETS[id] && WIDGETS[id].name) || id;
}

function renderBlocks() {
  const box = $('blocksList');
  if (!box) return;
  box.innerHTML = Object.entries(WIDGETS).map(([id, d]) => `<button type="button" class="brow ${isVisible(id) ? 'on' : ''}" data-id="${id}"><span class="bic">${svg(d.icon)}</span><span class="bn">${esc(getWidgetName(id))}</span><span class="sw"><i></i></span></button>`).join('');
}

function updateWctlLabels() {
  Object.keys(WIDGETS).forEach(id => {
    const el = els[id];
    if (!el) return;
    const tag = el.querySelector('.wctl .gtag');
    if (tag) tag.innerHTML = `${svg('move')}${esc(getWidgetName(id))}`;
    const hb = el.querySelector('.wctl button');
    if (hb) { hb.title = t('hideBlock'); hb.setAttribute('aria-label', t('hideBlock')); }
  });
}

export function initLayout() {
  Object.keys(WIDGETS).forEach((id, n) => {
    const el = document.querySelector(`[data-w="${id}"]`);
    if (!el) return;
    el.style.setProperty('--i', n);
    els[id] = el;
    el.classList.add('widget', WIDGETS[id].kind === 'fixed' ? 'fixedW' : 'boardW');
    // подпись и кнопка «скрыть» видны только в режиме настройки
    const ctl = document.createElement('div');
    ctl.className = 'wctl';
    ctl.innerHTML = `<span class="gtag">${svg('move')}${esc(getWidgetName(id))}</span><button type="button" aria-label="${esc(t('hideBlock'))}" title="${esc(t('hideBlock'))}">${svg('x')}</button>`;
    ctl.querySelector('button').addEventListener('click', e => { e.stopPropagation(); setVisible(id, false); });
    el.append(ctl);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    place(id);
  });
  if (board()) new ResizeObserver(fit).observe(board());
  Object.values(els).forEach(el => new ResizeObserver(fit).observe(el));
  addEventListener('resize', fit);
  // высоты блоков меняются после отрисовки содержимого и загрузки шрифтов — пересчитываем несколько раз
  addEventListener('load', fit);
  requestAnimationFrame(() => requestAnimationFrame(fit));
  setTimeout(fit, 300);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  $('editBtn').innerHTML = svg('layout');
  $('editBtn').addEventListener('click', () => setEditing(!document.body.classList.contains('editing')));
  $('editDone').addEventListener('click', () => setEditing(false));
  $('layoutReset').addEventListener('click', () => { const keep = {}; Object.keys(WIDGETS).forEach(id => { if (isVisible(id) !== !DEFAULT_HIDDEN.has(id)) keep[id] = { hidden: !isVisible(id) }; }); state = keep; save(); Object.keys(WIDGETS).forEach(id => { place(id); emit(id); }); fit(); renderBlocks(); });
  bindPanel($('blocksBtn'), $('blocksPanel'), renderBlocks);
  $('blocksList').addEventListener('click', e => {
    const b = e.target.closest('.brow');
    if (b) setVisible(b.dataset.id, !isVisible(b.dataset.id));
  });
  renderBlocks();
  fit();
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('editing')) setEditing(false); });
  document.addEventListener('gt:lang', () => {
    renderBlocks();
    updateWctlLabels();
  });
}
