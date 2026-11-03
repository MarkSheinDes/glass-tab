// 30 градиентных обоев (рисуются кодом), отдельные для дня и для ночи, плавная смена и «живое» движение пятен.
import { get, set } from './store.js';
import { makeGlider } from './fx.js';
import { t, getLang } from './i18n.js';
import { idbGet, idbPut, idbDel } from './idb.js';
import { toast } from './ui.js';

// [название, тон ('dark'|'light': по нему подбирается цвет текста), фон, 4 пятна]
export const P = [
  ['Полночь', 'dark', '#0b0d14', ['#3b4cca', '#7a3fb0', '#0e7490', '#1e3a8a']],
  ['Аврора', 'dark', '#07120f', ['#10b981', '#0ea5e9', '#6d28d9', '#064e3b']],
  ['Закат', 'dark', '#140a14', ['#f97316', '#db2777', '#7c3aed', '#b91c1c']],
  ['Океан', 'dark', '#04121f', ['#0369a1', '#06b6d4', '#1d4ed8', '#0f766e']],
  ['Лес', 'dark', '#07110a', ['#15803d', '#65a30d', '#0f766e', '#14532d']],
  ['Ночная лаванда', 'dark', '#100c1c', ['#8b5cf6', '#c084fc', '#4f46e5', '#be185d']],
  ['Рубин', 'dark', '#14070a', ['#be123c', '#f43f5e', '#7e22ce', '#9f1239']],
  ['Золотой час', 'dark', '#140e05', ['#f59e0b', '#ea580c', '#ca8a04', '#92400e']],
  ['Графит', 'dark', '#0c0d10', ['#475569', '#64748b', '#334155', '#1e293b']],
  ['Неон', 'dark', '#080614', ['#22d3ee', '#e879f9', '#6366f1', '#10b981']],
  ['Бирюза', 'dark', '#041514', ['#14b8a6', '#22d3ee', '#0d9488', '#155e75']],
  ['Сакура ночью', 'dark', '#150a12', ['#ec4899', '#f9a8d4', '#a855f7', '#831843']],
  ['Космос', 'dark', '#05050f', ['#4338ca', '#7c3aed', '#1d4ed8', '#581c87']],
  ['Мята', 'dark', '#07130f', ['#34d399', '#2dd4bf', '#059669', '#0e7490']],
  ['Янтарь', 'dark', '#130d07', ['#d97706', '#b45309', '#dc2626', '#78350f']],
  ['Индиго', 'dark', '#070a18', ['#4f46e5', '#3b82f6', '#6366f1', '#1e1b4b']],
  ['Малина', 'dark', '#14060f', ['#db2777', '#c026d3', '#9333ea', '#701a75']],
  ['Туман', 'dark', '#0d1117', ['#6b7280', '#94a3b8', '#475569', '#1f2937']],
  ['Изумруд', 'dark', '#04120c', ['#059669', '#10b981', '#047857', '#064e3b']],
  ['Вишня', 'dark', '#12060a', ['#9f1239', '#e11d48', '#7f1d1d', '#4c0519']],
  ['Рассвет', 'light', '#fdf2e9', ['#fbbf24', '#fb7185', '#c4b5fd', '#fdba74']],
  ['Небо', 'light', '#e8f1fb', ['#7dd3fc', '#93c5fd', '#c4b5fd', '#a5f3fc']],
  ['Персик', 'light', '#fff1ec', ['#fdba74', '#fca5a5', '#fcd34d', '#f9a8d4']],
  ['Лаванда', 'light', '#f1ecfb', ['#c4b5fd', '#f0abfc', '#a5b4fc', '#ddd6fe']],
  ['Свежая мята', 'light', '#eafaf3', ['#6ee7b7', '#7dd3fc', '#bef264', '#99f6e4']],
  ['Сахар', 'light', '#fdeef4', ['#f9a8d4', '#fda4af', '#d8b4fe', '#fbcfe8']],
  ['Лимон', 'light', '#fbfbe8', ['#fde047', '#bef264', '#86efac', '#fef08a']],
  ['Лёд', 'light', '#eef6fb', ['#bae6fd', '#e0f2fe', '#c7d2fe', '#a5f3fc']],
  ['Песок', 'light', '#f7f1e8', ['#e7c9a0', '#fdba74', '#d6d3d1', '#fde68a']],
  ['Облако', 'light', '#eef0f4', ['#cbd5e1', '#e2e8f0', '#c7d2fe', '#ddd6fe']]
];
const NAMES_EN = ['Midnight', 'Aurora', 'Sunset', 'Ocean', 'Forest', 'Night lavender', 'Ruby', 'Golden hour', 'Graphite', 'Neon',
  'Turquoise', 'Night sakura', 'Cosmos', 'Mint', 'Amber', 'Indigo', 'Raspberry', 'Mist', 'Emerald', 'Cherry',
  'Dawn', 'Sky', 'Peach', 'Lavender', 'Fresh mint', 'Candy', 'Lemon', 'Ice', 'Sand', 'Cloud'];
const wallName = i => getLang() === 'ru' ? P[i][0] : NAMES_EN[i];
const POS = [
  [[15, 10], [90, 25], [40, 105], [75, 80]],
  [[85, 8], [10, 40], [60, 100], [20, 85]],
  [[50, 0], [100, 60], [0, 70], [70, 100]],
  [[10, 90], [80, 15], [95, 85], [35, 20]]
];
const blobs = (i, from, to) => {
  const [, tone, , c] = P[i], pos = POS[i % POS.length], a = tone === 'dark' ? '99' : 'aa';
  return c.slice(from, to).map((col, k) => { k += from; return `radial-gradient(ellipse ${k % 2 ? 62 : 75}% ${k % 2 ? 60 : 70}% at ${pos[k][0]}% ${pos[k][1]}%, ${col}${a}, transparent 70%)`; }).join(',');
};
const mesh = i => blobs(i, 0, 4) + ',' + P[i][2];
const hex = h => [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16));

const DEFAULT = { day: 21, night: 0 };   // «Небо» и «Полночь»
const validWall = (v, d) => v === 'custom' || (Number.isInteger(v) && v >= 0 && v < P.length) ? v : d;   // испорченное значение -> обои по умолчанию
let sel = { day: validWall(get('wallDay', DEFAULT.day), DEFAULT.day), night: validWall(get('wallNight', DEFAULT.night), DEFAULT.night) };
let current = -1, tab = 'day', themeKey = 'day';

const root = document.documentElement;
const layer = () => document.getElementById('wall');

// свои обои: сама картинка лежит в IndexedDB, а тон и средний цвет — в localStorage
const meta = key => get('wallMeta.' + key, null);
const baseOf = key => sel[key] === 'custom' ? ((meta(key) || {}).color || '#222') : P[sel[key]][2];
function save() {
  set('wallDay', sel.day); set('wallNight', sel.night);
  set('baseDay', baseOf('day')); set('baseNight', baseOf('night'));   // для boot.js: цвет до загрузки
}
let customUrl = null;

// Свои обои: плавно проявляются поверх прежних, как и градиентные
async function showCustom(key) {
  const id = 'custom:' + key + ':' + get('wallVer.' + key, 0);
  if (id === current) return;
  current = id;
  const blob = await idbGet('wall.' + key).catch(() => null);
  if (current !== id) return;
  if (!blob) { sel[key] = DEFAULT[key]; save(); current = -1; show(sel[key]); marks(); return; }
  const url = URL.createObjectURL(blob), m = meta(key) || { tone: 'dark' };
  const set_ = document.createElement('div');
  set_.className = 'wset in img';
  set_.innerHTML = '<div class="wa"></div>';
  set_.children[0].style.backgroundImage = `url(${url})`;
  const olds = [...layer().querySelectorAll('.wset')], oldUrl = customUrl;
  customUrl = url;
  layer().append(set_);
  requestAnimationFrame(() => requestAnimationFrame(() => set_.classList.remove('in')));
  setTimeout(() => { olds.forEach(o => o.remove()); if (oldUrl) URL.revokeObjectURL(oldUrl); }, 1100);
  root.dataset.tone = m.tone;
  root.style.setProperty('--tint', 'transparent');
  root.style.background = '';
}

// Показать обои i (плавно проявляются поверх прежних)
function show(i) {
  if (i === 'custom') return showCustom(themeKey);
  if (i === current) return;
  current = i;
  const set_ = document.createElement('div');
  set_.className = 'wset in';
  set_.innerHTML = '<div class="wa"></div><div class="wb"></div>';
  set_.children[0].style.background = blobs(i, 0, 2) + ',' + P[i][2];
  set_.children[1].style.background = blobs(i, 2, 4);
  const olds = [...layer().querySelectorAll('.wset')];
  layer().append(set_);
  requestAnimationFrame(() => requestAnimationFrame(() => set_.classList.remove('in')));
  setTimeout(() => olds.forEach(o => o.remove()), 1100);
  root.dataset.tone = P[i][1];
  const [r, g, b] = hex(P[i][3][0]);
  root.style.setProperty('--tint', `rgba(${r},${g},${b},${P[i][1] === 'dark' ? 0.18 : 0.22})`);
  root.style.background = '';
}

export function syncWall(night) {
  themeKey = night ? 'night' : 'day';
  tab = themeKey;
  show(sel[themeKey]);
  marks();
}

let tiles = [], customTile = null, updateTabs = () => {};
function marks() {
  tiles.forEach((t, i) => t.classList.toggle('on', i === sel[tab]));
  if (customTile) {
    const has = !!meta(tab);
    customTile.hidden = !has;
    customTile.classList.toggle('on', sel[tab] === 'custom');
    document.querySelector('#wallPanel [data-a="remove"]').hidden = !has;
  }
  document.querySelectorAll('#wallTabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  updateTabs(true);
}
function choose(i) {
  sel[tab] = i;
  save();
  if (tab === themeKey) show(i);
  marks();
}
// уменьшаем фото до разумного размера и считаем средний цвет и «тон» (светлое/тёмное) — от него зависит цвет текста
async function processImage(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 2560 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  const s = document.createElement('canvas'); s.width = s.height = 16;
  const sx = s.getContext('2d'); sx.drawImage(bmp, 0, 0, 16, 16);
  const px = sx.getImageData(0, 0, 16, 16).data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
  const n = px.length / 4; r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.86));
  if (bmp.close) bmp.close();
  return { blob, color: `rgb(${r},${g},${b})`, tone: lum < 0.55 ? 'dark' : 'light' };
}
async function upload(file) {
  if (!file || !file.type.startsWith('image/')) { toast(t('wallErr')); return false; }
  try {
    const key = tab, out = await processImage(file);
    await idbPut('wall.' + key, out.blob);
    set('wallMeta.' + key, { tone: out.tone, color: out.color });
    set('wallVer.' + key, get('wallVer.' + key, 0) + 1);
    setCustomThumb(out.blob);
    choose('custom');
    return true;
  } catch (e) { toast(t('wallErr')); return false; }
}
async function setCustomThumb(blob) {
  if (!blob) blob = await idbGet('wall.' + tab).catch(() => null);
  if (!customTile) return;
  if (customTile._u) URL.revokeObjectURL(customTile._u);
  customTile._u = blob ? URL.createObjectURL(blob) : '';
  customTile.style.background = blob ? `center / cover url(${customTile._u})` : '';
}
async function removeCustom() {
  const key = tab;
  await idbDel('wall.' + key).catch(() => {});
  set('wallMeta.' + key, null);
  if (sel[key] === 'custom') choose(DEFAULT[key]); else { save(); marks(); }
  setCustomThumb(null);
}

export function setAnim(on) {
  document.body.dataset.anim = on ? 'on' : 'off';
  set('anim', on);
  const b = document.querySelector('#wallPanel [data-a="anim"]');
  if (b) b.textContent = t(on ? 'wallAnimOn' : 'wallAnimOff');
  const c = document.getElementById('animCheck');
  if (c) c.checked = on;
}

export function initWallUI() {
  const grid = document.getElementById('wallGrid');
  tiles = P.map((p, i) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'wtile';
    t.title = wallName(i);
    t.style.background = mesh(i);
    t.addEventListener('click', () => choose(i));
    grid.append(t);
    return t;
  });
  customTile = document.createElement('button');
  customTile.type = 'button'; customTile.className = 'wtile custom'; customTile.hidden = true;
  customTile.addEventListener('click', () => choose('custom'));
  grid.prepend(customTile);
  const file = document.createElement('input');
  file.type = 'file'; file.accept = 'image/*'; file.hidden = true;
  file.addEventListener('change', () => { upload(file.files[0]); file.value = ''; });
  document.body.append(file);
  const panel = document.getElementById('wallPanel');
  updateTabs = makeGlider(document.getElementById('wallTabs'), 'button', b => b.dataset.t === tab);
  panel.addEventListener('click', e => {
    const a = e.target.dataset?.a, t = e.target.dataset?.t;
    if (t) { tab = t; marks(); setCustomThumb(); }
    if (a === 'anim') setAnim(document.body.dataset.anim !== 'on');
    if (a === 'random') choose(Math.floor(Math.random() * P.length));
    if (a === 'upload') file.click();
    if (a === 'remove') removeCustom();
  });
  document.getElementById('wallBtn').addEventListener('click', () => { tab = themeKey; marks(); setCustomThumb(); });
  setAnim(get('anim', true));
  save();
  marks();

  document.addEventListener('gt:lang', () => {
    tiles.forEach((tl, i) => { tl.title = wallName(i); });
    const on = document.body.dataset.anim === 'on';
    const b = document.querySelector('#wallPanel [data-a="anim"]');
    if (b) b.textContent = t(on ? 'wallAnimOn' : 'wallAnimOff');
  });
}

// ---- для мастера первого запуска ----
export const wallPresets = night => night ? [0, 1, 2, 3, 9, 12] : [21, 20, 24, 23, 25, 29];
export const wallMesh = i => mesh(i);
export const wallLabel = i => wallName(i);
export const activeTheme = () => themeKey;
export const selectedWall = () => sel[themeKey];
export function pickWall(i) { tab = themeKey; choose(i); }
export function uploadWall(file) { tab = themeKey; return upload(file); }
