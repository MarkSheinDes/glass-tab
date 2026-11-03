// Таймер фокуса (Pomodoro): 25 минут работы, 5 — короткий перерыв, 15 — длинный.
// Состояние хранится в localStorage (время окончания), поэтому таймер не сбивается при открытии новой вкладки.
import { get, set } from './store.js';
import { svg } from './icons.js';
import { makeGlider } from './fx.js';
import { t } from './i18n.js';
import { $, toast, setRing } from './ui.js';

const MODES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const today = () => new Date().toISOString().slice(0, 10);

function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext, ctx = new Ctx(), now = ctx.currentTime;
    [660, 880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now + i * 0.22);
      g.gain.exponentialRampToValueAtTime(0.22, now + i * 0.22 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.22 + 0.9);
      o.connect(g); g.connect(ctx.destination);
      o.start(now + i * 0.22); o.stop(now + i * 0.22 + 1);
    });
    setTimeout(() => ctx.close(), 2500);
  } catch (e) { /* звук не критичен */ }
}

export function initTimer() {
  const ring = $('timerRing'), time = $('timerTime'), label = $('timerLabel'), main = $('timerMain'), reset = $('timerReset'), count = $('timerCount'), seg = $('timerSeg');
  if (!ring) return;

  // состояние из хранилища может оказаться испорченным — приводим к допустимому виду
  const sane = v => {
    const o = v && typeof v === 'object' ? { ...v } : {};
    if (!MODES[o.mode]) o.mode = 'focus';
    if (!Number.isFinite(o.left) || o.left < 0 || o.left > MODES[o.mode]) o.left = MODES[o.mode];
    o.endAt = Number.isFinite(o.endAt) ? o.endAt : 0;
    o.running = !!o.running && o.endAt > 0;
    o.done = Number.isFinite(o.done) ? o.done : 0;
    o.day = typeof o.day === 'string' ? o.day : today();
    return o;
  };
  let s = sane(get('timer', null));
  if (s.day !== today()) { s.done = 0; s.day = today(); }
  const save = () => set('timer', s);
  const remaining = () => s.running ? Math.max(0, Math.round((s.endAt - Date.now()) / 1000)) : s.left;
  const fmt = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');

  const glide = makeGlider(seg, 'button', b => b.dataset.m === s.mode);

  function render() {
    const left = remaining(), total = MODES[s.mode];
    time.textContent = fmt(left);
    setRing(ring, (1 - left / total) * 100);
    ring.classList.toggle('run', s.running);
    main.innerHTML = svg(s.running ? 'pause' : 'start');
    main.setAttribute('aria-label', t(s.running ? 'timerPause' : 'timerStart'));
    label.textContent = t('timer_' + s.mode);
    count.textContent = t('timerToday') + ' ' + s.done;
    document.title = s.running ? fmt(left) + ' · ' + t('timer_' + s.mode) : t('newTabTitle');
  }

  function setMode(m) {
    s = { ...s, mode: m, running: false, left: MODES[m], endAt: 0 };
    save(); glide(true); render();
  }

  function finish() {
    const wasFocus = s.mode === 'focus';
    if (wasFocus) s.done++;
    const next = wasFocus ? (s.done % 4 === 0 ? 'long' : 'short') : 'focus';
    s = { ...s, mode: next, running: false, left: MODES[next], endAt: 0 };
    save(); glide(true); render();
    chime();
    toast(t(wasFocus ? 'timerDoneFocus' : 'timerDoneBreak'), 6000);
  }

  function tick() {
    if (s.running && remaining() <= 0) finish(); else render();
  }

  main.addEventListener('click', () => {
    if (s.running) s = { ...s, running: false, left: remaining(), endAt: 0 };
    else s = { ...s, running: true, endAt: Date.now() + s.left * 1000 };
    save(); render();
  });
  reset.addEventListener('click', () => setMode(s.mode));
  seg.addEventListener('click', e => { const m = e.target.dataset && e.target.dataset.m; if (m && m !== s.mode) setMode(m); });
  reset.innerHTML = svg('refresh');

  setInterval(tick, 500);
  document.addEventListener('gt:lang', render);
  // таймер, запущенный в другой вкладке, подхватываем
  window.addEventListener('storage', e => { if (e.key === 'gt.timer') { s = sane(get('timer', s)); glide(false); render(); } });
  tick();
  glide(false);
}
