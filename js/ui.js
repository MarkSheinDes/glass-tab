// Общие мелочи интерфейса: выезжающие панели, всплывающее меню, уведомление, запрос разрешений браузера.
export const $ = id => document.getElementById(id);
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---- плавное появление/скрытие (скрытие ждёт анимацию выхода) ----
export const animOn = () => document.body.dataset.anim !== 'off' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
export function setHidden(el, hide) {
  clearTimeout(el._ht);
  if (!hide) { el.classList.remove('out'); el.hidden = false; return; }
  if (el.hidden) return;
  if (!animOn()) { el.hidden = true; return; }
  el.classList.add('out');
  el._ht = setTimeout(() => { el.hidden = true; el.classList.remove('out'); }, 180);
}
const isOpen = el => !el.hidden && !el.classList.contains('out');

// ---- панели (одновременно открыта одна) ----
const PANELS = [];
export function closePanels(except) {
  PANELS.forEach(p => { if (p.panel !== except && isOpen(p.panel)) { setHidden(p.panel, true); p.btn && p.btn.classList.remove('active'); } });
}
export function bindPanel(btn, panel, onOpen) {
  PANELS.push({ btn, panel });
  if (btn) btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !isOpen(panel);
    closePanels(panel);
    closePopover();
    setHidden(panel, !open);
    btn.classList.toggle('active', open);
    if (open && onOpen) onOpen();
  });
  return panel;
}
export function openPanel(panel, onOpen) { closePanels(panel); setHidden(panel, false); if (onOpen) onOpen(); }
document.addEventListener('click', e => {
  if (!document.body.contains(e.target)) return;
  PANELS.forEach(p => {
    if (isOpen(p.panel) && !p.panel.contains(e.target) && !(p.btn && p.btn.contains(e.target)) && !e.target.closest('.keepopen') && !e.target.closest('#pop')) {
      setHidden(p.panel, true);
      p.btn && p.btn.classList.remove('active');
    }
  });
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closePanels(null); closePopover(); } });

// ---- всплывающее меню у кнопки ----
let popAnchor = null;
export function closePopover() {
  setHidden($('pop'), true);
  if (popAnchor) popAnchor.classList.remove('active');
  popAnchor = null;
  document.querySelectorAll('.dbtn.active, .glass-select.active').forEach(b => b.classList.remove('active'));
}
export function popover(anchor, html, mount) {
  const p = $('pop');
  if (popAnchor === anchor && isOpen(p)) { closePopover(); return; }
  const parentPanel = anchor ? anchor.closest('.panel') : null;
  closePanels(parentPanel);
  p.innerHTML = html;
  setHidden(p, false);
  popAnchor = anchor;
  anchor.classList.add('active');

  const r = anchor.getBoundingClientRect();
  const isSelect = anchor.classList.contains('glass-select');
  p.style.minWidth = isSelect ? r.width + 'px' : '';
  // высоту меню ограничиваем свободным местом: длинный список (закладки) прокручивается внутри, а не уезжает за край окна
  p.style.maxHeight = '';
  const natural = p.offsetHeight;
  const below = r.bottom + natural + 20 < innerHeight || r.top < innerHeight / 2;
  p.style.maxHeight = Math.max(160, Math.min(innerHeight * 0.8, (below ? innerHeight - r.bottom : r.top) - 24)) + 'px';
  const pw = p.offsetWidth, ph = p.offsetHeight;
  const alignRight = anchor && (anchor.id === 'engBtn' || anchor.classList.contains('eng'));
  const leftPos = alignRight ? (r.right - pw) : (isSelect ? r.left : r.left + r.width / 2 - pw / 2);
  p.style.left = Math.max(10, Math.min(innerWidth - pw - 10, leftPos)) + 'px';
  // если меню открыто над кнопкой, прижимаем его низом к кнопке: раскрытые папки растут вверх, а не наезжают на неё
  if (below) { p.style.top = (r.bottom + 8) + 'px'; p.style.bottom = ''; }
  else { p.style.top = ''; p.style.bottom = (innerHeight - r.top + 8) + 'px'; }
  p.style.transformOrigin = below ? (alignRight ? 'top right' : 'top center') : (alignRight ? 'bottom right' : 'bottom center');
  if (mount) mount(p);
}
document.addEventListener('click', e => {
  const p = $('pop');
  if (isOpen(p) && !p.contains(e.target) && !(popAnchor && popAnchor.contains(e.target))) closePopover();
});

// ---- уведомление ----
let tt = 0;
export function toast(msg, ms = 2600) {
  const t = $('toast');
  t.textContent = msg;
  setHidden(t, false);
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(tt);
  tt = setTimeout(() => { t.classList.remove('show'); setHidden(t, true); }, ms);
}

// ---- свой диалог подтверждения (вместо системного confirm) ----
export function confirmDialog(message, okLabel, cancelLabel) {
  return new Promise(res => {
    const m = document.createElement('div');
    m.className = 'modal keepopen';
    m.innerHTML = `<div class="dialog card" role="alertdialog" aria-modal="true"><p></p><div class="dlgBtns"><button type="button" class="mini" data-r="0"></button><button type="button" class="mini on danger" data-r="1"></button></div></div>`;
    m.querySelector('p').textContent = message;
    const [no, yes] = m.querySelectorAll('button');
    no.textContent = cancelLabel; yes.textContent = okLabel;
    const done = v => {
      document.removeEventListener('keydown', onKey, true);
      m.classList.add('out');
      setTimeout(() => m.remove(), animOn() ? 180 : 0);
      res(v);
    };
    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); done(false); }
    };
    document.addEventListener('keydown', onKey, true);
    m.addEventListener('click', e => { if (e.target === m) done(false); else if (e.target.dataset.r) done(e.target.dataset.r === '1'); });
    document.body.append(m);
    no.focus();
  });
}

// ---- разрешения браузера (запрашиваются только когда пользователь сам включил блок) ----
const perms = () => (typeof chrome !== 'undefined' && chrome.permissions) || null;
export const hasPerm = list => new Promise(res => { const p = perms(); if (!p) return res(false); try { p.contains({ permissions: list }, r => res(!!r)); } catch (e) { res(false); } });
export const askPerm = list => new Promise(res => { const p = perms(); if (!p) return res(false); try { p.request({ permissions: list }, r => res(!!r)); } catch (e) { res(false); } });
export const inExtension = () => typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;

// ---- кольцо прогресса: один общий вид для дел и таймера ----
export function setRing(el, pct) {
  if (!el.querySelector('svg')) {
    el.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="46" pathLength="100"/><circle class="bar" cx="50" cy="50" r="46" pathLength="100"/></svg>');
  }
  el.querySelector('.bar').style.strokeDashoffset = 100 - Math.max(0, Math.min(100, pct));
}
