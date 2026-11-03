// Мастер первого запуска из трёх шагов: 1) город и региональные настройки, 2) какие блоки показывать, 3) тема и обои (можно свою картинку).
// На любом шаге можно пропустить; запустить заново — в настройках.
import { get, set } from './store.js';
import { makeGlider } from './fx.js';
import { svg } from './icons.js';
import { geocode } from './weather.js';
import { t } from './i18n.js';
import { tempUnit, timeSetting } from './region.js';
import { isVisible, setVisible } from './layout.js';
import { wallPresets, wallMesh, wallLabel, activeTheme, selectedWall, pickWall, uploadWall } from './wallpapers.js';
import { esc, toast, setHidden } from './ui.js';

const OPTIONAL = ['weather', 'tasks', 'calendar', 'timer', 'snippets', 'note'];
const PRESETS = { min: [], prod: ['tasks', 'calendar', 'timer', 'note'], all: OPTIONAL };
const STEPS = 3;

export function initWelcome(onDone) {
  if (get('welcomed', false)) return;
  if (get('city', null)) { set('welcomed', true); return; }   // город уже задан (обновление со старой версии)
  openWelcome(onDone);
}

export function openWelcome(onDone = () => {}) {
  if (document.querySelector('.welcome')) return;
  const m = document.createElement('div');
  m.className = 'modal keepopen';
  m.innerHTML = `<div class="dialog card welcome" role="dialog" aria-modal="true" aria-labelledby="wlTitle"><div class="wlHead"><h2 id="wlTitle"></h2><div class="wlDots" aria-hidden="true"></div></div><p class="wlSub"></p><div class="wlBody"></div><div class="wlFoot"></div></div>`;
  document.body.append(m);
  const $ = sel => m.querySelector(sel);
  const state = { step: 0, units: tempUnit(), time: timeSetting(), custom: '' };

  const file = document.createElement('input');
  file.type = 'file'; file.accept = 'image/*'; file.hidden = true;
  m.append(file);

  const close = () => { set('welcomed', true); setHidden(m, true); setTimeout(() => m.remove(), 260); document.removeEventListener('keydown', onKey, true); };
  const finish = () => { close(); onDone(); setTimeout(() => toast(t('tipFirst'), 7000), 700); };
  const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); onDone(); } };
  document.addEventListener('keydown', onKey, true);

  // ---- шаг 1: город, градусы, время ----
  function stepCity() {
    $('.wlBody').innerHTML = `
      <label class="lbl">${esc(t('cityLabel'))}</label>
      <div class="field"><input id="wlCity" placeholder="${esc(t('cityPlaceholder'))}" autocomplete="off" value="${esc(state.cityText || '')}"></div>
      <div class="note" id="wlNote">${state.cityOk ? esc(t('cityNow') + state.cityOk) : ''}</div>
      <div class="wlRow">
        <div><label class="lbl">${esc(t('tempLabel'))}</label><div class="seg small" id="wlTemp"><button type="button" data-v="c">°C</button><button type="button" data-v="f">°F</button></div></div>
        <div><label class="lbl">${esc(t('timeLabel'))}</label><div class="seg small" id="wlTime"><button type="button" data-v="12">12 h</button><button type="button" data-v="24">24 h</button></div></div>
      </div>`;
    const bind = (id, key) => {
      const el = $('#' + id), upd = makeGlider(el, 'button', b => b.dataset.v === state[key]);
      el.addEventListener('click', e => { const v = e.target.dataset && e.target.dataset.v; if (v) { state[key] = v; upd(true); } });
      requestAnimationFrame(() => upd(false));
    };
    bind('wlTemp', 'units'); bind('wlTime', 'time');
    setTimeout(() => { const i = $('#wlCity'); if (i) i.focus(); }, 80);
  }
  async function leaveCity() {
    const v = $('#wlCity').value.trim();
    state.cityText = v;
    if (v && v !== state.cityOk) {
      $('#wlNote').textContent = t('citySearching');
      try { const c = await geocode(v); set('city', c); state.cityOk = v; }
      catch (e) { $('#wlNote').textContent = t('cityNotFound'); return false; }
    }
    set('units', state.units); set('time', state.time);   // сохраняем только то, что человек подтвердил
    document.dispatchEvent(new CustomEvent('gt:settings'));
    return true;
  }

  // ---- шаг 2: блоки на экране ----
  const chosen = () => OPTIONAL.filter(isVisible);
  const presetOf = () => Object.keys(PRESETS).find(k => PRESETS[k].length === chosen().length && PRESETS[k].every(id => chosen().includes(id))) || '';
  function stepWidgets() {
    $('.wlBody').innerHTML = `
      <div class="wlPresets">${['min', 'prod', 'all'].map(k => `<button type="button" class="wlPreset" data-p="${k}"><b>${esc(t('preset_' + k))}</b><span>${esc(t('presetHint_' + k))}</span></button>`).join('')}</div>
      <div class="checks" id="wlWidgets">${OPTIONAL.map(id => `<label class="ck"><input type="checkbox" value="${id}"><span>${esc(t('w_' + id))}</span></label>`).join('')}</div>`;
    const sync = () => {
      const p = presetOf();
      m.querySelectorAll('.wlPreset').forEach(b => b.classList.toggle('on', b.dataset.p === p));
      m.querySelectorAll('#wlWidgets input').forEach(i => { i.checked = isVisible(i.value); });
    };
    $('.wlPresets').addEventListener('click', e => {
      const b = e.target.closest('.wlPreset'); if (!b) return;
      OPTIONAL.forEach(id => setVisible(id, PRESETS[b.dataset.p].includes(id)));
      sync();
    });
    $('#wlWidgets').addEventListener('change', e => { setVisible(e.target.value, e.target.checked); sync(); });
    sync();
  }

  // ---- шаг 3: тема и обои ----
  function stepLook() {
    $('.wlBody').innerHTML = `
      <div class="seg small" id="wlTheme"><button type="button" data-v="auto">${esc(t('themeAuto'))}</button><button type="button" data-v="day">${esc(t('themeDay'))}</button><button type="button" data-v="night">${esc(t('themeNight'))}</button></div>
      <div class="wlWalls" id="wlWalls"></div>
      <button type="button" class="mini wide" id="wlUpload">${svg('upload')} ${esc(t('wallUpload'))}</button>`;
    const el = $('#wlTheme'), upd = makeGlider(el, 'button', b => b.dataset.v === get('theme', 'auto'));
    requestAnimationFrame(() => upd(false));
    const drawWalls = () => {
      const sel = selectedWall();
      $('#wlWalls').innerHTML = (state.custom ? `<button type="button" class="wtile custom ${sel === 'custom' ? 'on' : ''}" data-w="custom" style="background:center / cover url(${state.custom})" title="${esc(t('wallUpload'))}"></button>` : '')
        + wallPresets(activeTheme() === 'night').map(i => `<button type="button" class="wtile ${sel === i ? 'on' : ''}" data-w="${i}" style="background:${wallMesh(i)}" title="${esc(wallLabel(i))}"></button>`).join('');
    };
    drawWalls();
    el.addEventListener('click', e => {
      const v = e.target.dataset && e.target.dataset.v; if (!v) return;
      set('theme', v); upd(true);
      document.dispatchEvent(new CustomEvent('gt:theme'));   // main.js применит тему
      state.custom = '';
      drawWalls();
    });
    $('#wlWalls').addEventListener('click', e => {
      const b = e.target.closest('.wtile'); if (!b) return;
      if (b.dataset.w !== 'custom') pickWall(Number(b.dataset.w)); else pickWall('custom');
      drawWalls();
    });
    $('#wlUpload').addEventListener('click', () => file.click());
    file.onchange = async () => {
      const f = file.files[0]; file.value = '';
      if (!f) return;
      if (await uploadWall(f)) { state.custom = URL.createObjectURL(f); drawWalls(); }
    };
  }

  // ---- каркас: заголовок, точки, кнопки ----
  const META = [
    { title: 'welcomeTitle', sub: 'welcomeSub', build: stepCity },
    { title: 'wz2Title', sub: 'wz2Sub', build: stepWidgets },
    { title: 'wz3Title', sub: 'wz3Sub', build: stepLook }
  ];
  async function go(n) {
    if (n > state.step && state.step === 0 && !(await leaveCity())) return;
    state.step = Math.max(0, Math.min(STEPS - 1, n));
    const s = META[state.step];
    $('#wlTitle').textContent = t(s.title);
    $('.wlSub').textContent = t(s.sub);
    $('.wlDots').innerHTML = META.map((_, i) => `<i class="${i === state.step ? 'on' : i < state.step ? 'past' : ''}"></i>`).join('');
    s.build();
    const last = state.step === STEPS - 1;
    $('.wlFoot').innerHTML = `<button type="button" class="mini" id="wlSkip">${esc(t('welcomeSkip'))}</button><span class="sp"></span>`
      + (state.step ? `<button type="button" class="mini" id="wlBack">${esc(t('wizBack'))}</button>` : '')
      + `<button type="button" class="mini on" id="wlNext">${esc(t(last ? 'welcomeDone' : 'wizNext'))}</button>`;
    $('#wlSkip').onclick = () => { close(); onDone(); };
    if ($('#wlBack')) $('#wlBack').onclick = () => go(state.step - 1);
    $('#wlNext').onclick = () => last ? finish() : go(state.step + 1);
  }
  m.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'wlCity') { e.preventDefault(); $('#wlNext').click(); } });
  go(0);
}
