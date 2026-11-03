// Нижняя панель: закладки, мои сайты, сервисы, нейросети. Фирменные цвета и фавиконки в стиле Apple / Liquid Glass.
import { get, set } from './store.js';
import { svg } from './icons.js';
import { initDockWave } from './fx.js';
import { t, getLang } from './i18n.js';
import { region } from './region.js';
import { $, esc, popover, closePopover, hasPerm, askPerm, inExtension } from './ui.js';

// Для старта — один короткий набор для всех стран; остальное человек добавляет сам (плитка «+» в конце панели)
export const DEFAULT_SHORTCUTS = [
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { name: 'GitHub', url: 'https://github.com' }
];
export const defaultShortcuts = () => DEFAULT_SHORTCUTS;

// Фирменные цветные подложки (стиль Apple / Liquid Glass)
const BRANDS = [
  { re: /youtube|youtu\.be/, bg: 'linear-gradient(145deg, rgba(239, 68, 68, 0.48), rgba(185, 28, 28, 0.30))', edge: 'rgba(248, 113, 113, 0.60)', glow: 'rgba(239, 68, 68, 0.35)' },
  { re: /t\.me|telegram/, bg: 'linear-gradient(145deg, rgba(56, 189, 248, 0.48), rgba(14, 165, 233, 0.30))', edge: 'rgba(125, 211, 252, 0.60)', glow: 'rgba(14, 165, 233, 0.35)' },
  { re: /яндекс|ya\.ru/, bg: 'linear-gradient(145deg, rgba(251, 146, 60, 0.48), rgba(220, 38, 38, 0.30))', edge: 'rgba(253, 186, 116, 0.60)', glow: 'rgba(245, 158, 11, 0.35)' },
  { re: /maps|карты|2gis|2гис/, bg: 'linear-gradient(145deg, rgba(16, 185, 129, 0.48), rgba(5, 150, 105, 0.30))', edge: 'rgba(52, 211, 153, 0.60)', glow: 'rgba(16, 185, 129, 0.35)' },
  { re: /mail|gmail|почт/, bg: 'linear-gradient(145deg, rgba(244, 63, 94, 0.48), rgba(225, 29, 72, 0.30))', edge: 'rgba(251, 113, 133, 0.60)', glow: 'rgba(244, 63, 94, 0.35)' },
  { re: /github|gitlab/, bg: 'linear-gradient(145deg, rgba(99, 102, 241, 0.48), rgba(49, 46, 129, 0.35))', edge: 'rgba(165, 180, 252, 0.60)', glow: 'rgba(99, 102, 241, 0.35)' },
  { re: /dzen|дзен/, bg: 'linear-gradient(145deg, rgba(249, 115, 22, 0.48), rgba(217, 119, 6, 0.30))', edge: 'rgba(253, 186, 116, 0.60)', glow: 'rgba(249, 115, 22, 0.35)' },
  { re: /vk\.com|vkontakte/, bg: 'linear-gradient(145deg, rgba(37, 99, 235, 0.50), rgba(29, 78, 216, 0.32))', edge: 'rgba(96, 165, 250, 0.60)', glow: 'rgba(37, 99, 235, 0.35)' },
  { re: /music|музык|spotify/, bg: 'linear-gradient(145deg, rgba(34, 197, 94, 0.48), rgba(16, 185, 129, 0.30))', edge: 'rgba(74, 222, 128, 0.60)', glow: 'rgba(34, 197, 94, 0.35)' },
  { re: /chatgpt|openai/, bg: 'linear-gradient(145deg, rgba(20, 184, 166, 0.48), rgba(13, 148, 136, 0.30))', edge: 'rgba(45, 212, 191, 0.60)', glow: 'rgba(20, 184, 166, 0.35)' },
  { re: /claude|anthropic/, bg: 'linear-gradient(145deg, rgba(217, 119, 6, 0.48), rgba(180, 83, 9, 0.30))', edge: 'rgba(245, 158, 11, 0.60)', glow: 'rgba(217, 119, 6, 0.35)' },
  { re: /discord/, bg: 'linear-gradient(145deg, rgba(99, 102, 241, 0.50), rgba(79, 70, 229, 0.32))', edge: 'rgba(165, 180, 252, 0.60)', glow: 'rgba(99, 102, 241, 0.35)' },
  { re: /twitch/, bg: 'linear-gradient(145deg, rgba(168, 85, 247, 0.50), rgba(126, 34, 206, 0.32))', edge: 'rgba(216, 180, 254, 0.60)', glow: 'rgba(168, 85, 247, 0.35)' },
  { re: /kinopoisk|кинопоиск/, bg: 'linear-gradient(145deg, rgba(249, 115, 22, 0.50), rgba(194, 65, 12, 0.32))', edge: 'rgba(251, 146, 60, 0.60)', glow: 'rgba(249, 115, 22, 0.35)' },
  { re: /wildberries|ozon/, bg: 'linear-gradient(145deg, rgba(217, 70, 239, 0.50), rgba(147, 51, 234, 0.32))', edge: 'rgba(240, 171, 252, 0.60)', glow: 'rgba(217, 70, 239, 0.35)' }
];

const PALETTE = [
  { bg: 'linear-gradient(145deg, rgba(59, 130, 246, 0.45), rgba(29, 78, 216, 0.28))', edge: 'rgba(147, 197, 253, 0.60)', glow: 'rgba(59, 130, 246, 0.35)' },
  { bg: 'linear-gradient(145deg, rgba(168, 85, 247, 0.45), rgba(126, 34, 206, 0.28))', edge: 'rgba(216, 180, 254, 0.60)', glow: 'rgba(168, 85, 247, 0.35)' },
  { bg: 'linear-gradient(145deg, rgba(236, 72, 153, 0.45), rgba(190, 24, 93, 0.28))', edge: 'rgba(249, 168, 212, 0.60)', glow: 'rgba(236, 72, 153, 0.35)' },
  { bg: 'linear-gradient(145deg, rgba(20, 184, 166, 0.45), rgba(13, 148, 136, 0.28))', edge: 'rgba(94, 234, 212, 0.60)', glow: 'rgba(20, 184, 166, 0.35)' },
  { bg: 'linear-gradient(145deg, rgba(245, 158, 11, 0.45), rgba(180, 83, 9, 0.28))', edge: 'rgba(252, 211, 77, 0.60)', glow: 'rgba(245, 158, 11, 0.35)' },
  { bg: 'linear-gradient(145deg, rgba(16, 185, 129, 0.45), rgba(5, 150, 105, 0.28))', edge: 'rgba(110, 231, 183, 0.60)', glow: 'rgba(16, 185, 129, 0.35)' },
  { bg: 'linear-gradient(145deg, rgba(244, 63, 94, 0.45), rgba(190, 18, 60, 0.28))', edge: 'rgba(253, 164, 175, 0.60)', glow: 'rgba(244, 63, 94, 0.35)' },
  { bg: 'linear-gradient(145deg, rgba(99, 102, 241, 0.45), rgba(67, 56, 202, 0.28))', edge: 'rgba(165, 180, 252, 0.60)', glow: 'rgba(99, 102, 241, 0.35)' }
];

export function getBrandTheme(name, url) {
  const hay = `${url} ${name}`.toLowerCase();
  const hit = BRANDS.find(b => b.re.test(hay));
  if (hit) return hit;
  let hash = 0;
  for (let i = 0; i < hay.length; i++) hash = (hash * 31 + hay.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

// [регулярка по адресу и названию, значок]; первое совпадение выигрывает
const RULES = [
  [/youtube|youtu\.be/, 'play'], [/t\.me|telegram/, 'send'], [/whatsapp|wa\.me/, 'phone'], [/discord/, 'chat'],
  [/perplexity|chatgpt|openai|claude|gemini|grok|deepseek|copilot|qwen|нейро|\bai\b/, 'spark'],
  [/speed|fast\.com|bolt|быстр/, 'bolt'], [/telemost|телемост|meet\.|zoom/, 'video'], [/ok\.ru|vk\.com|odnoklassniki/, 'users'],
  [/maps|карты|2gis|2гис/, 'pin'], [/disk|диск|drive/, 'cloudUp'], [/music|музык/, 'music'], [/calendar|календар/, 'calendar'],
  [/translate|перевод/, 'translate'], [/photos|фото/, 'image'], [/docs\.|документ/, 'file'], [/myaccount|аккаунт|account/, 'user'], [/github|gitlab|stackoverflow/, 'code'], [/mail|gmail|почт/, 'mail']
];

export const shortcuts = () => { const v = get('shortcuts', null); return Array.isArray(v) ? v.filter(x => x && typeof x.url === 'string') : defaultShortcuts(); };
export const saveShortcuts = list => { set('shortcuts', list); renderDock(); document.dispatchEvent(new CustomEvent('gt:shortcuts')); };
export const normalize = u => /^(javascript|data|vbscript):/i.test(u.trim()) ? '#' : /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : 'https://' + u;

// значки сайтов грузятся через сервис Google; там, где он недоступен (Китай), по умолчанию выключены — остаются буквы и значки
export const iconsOn = () => get('favicons', null) ?? (region() !== 'CN');

export function tileMark(name, url) {
  const norm = normalize(url);
  let domain = '';
  try { domain = new URL(norm).hostname; } catch (e) {}

  const hay = `${url} ${name}`.toLowerCase();
  const hit = RULES.find(([re]) => re.test(hay));
  const clean = (name || '').trim().replace(/^яндекс[\s.\-_]*/i, '');
  const letter = ((clean || name || 'Я')[0] || 'Я').toUpperCase();
  const fallback = hit ? svg(hit[1]) : `<span class="letter">${letter}</span>`;

  if (domain && domain.includes('.') && iconsOn()) {
    const fav = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(norm)}`;
    return `<span class="tile-icon-wrap"><img class="fav" src="${fav}" alt="" loading="lazy"><span class="fb">${fallback}</span></span>`;
  }
  return `<span class="tile-icon-wrap"><span class="fb">${fallback}</span></span>`;
}

export function renderDock() {
  const box = $('dockTiles');
  box.innerHTML = '';
  shortcuts().slice(0, 10).forEach(s => {
    const a = document.createElement('a');
    a.className = 'tile';
    a.href = normalize(s.url);
    a.title = s.name;
    const b = getBrandTheme(s.name, s.url);
    a.style.background = b.bg;
    a.style.borderColor = b.edge;
    a.style.setProperty('--tile-glow', b.glow);
    a.innerHTML = tileMark(s.name, s.url);
    // inline-обработчики запрещены в расширениях, поэтому слушатели вешаем здесь
    const fav = a.querySelector('.fav');
    if (fav) {
      fav.addEventListener('load', () => fav.classList.add('loaded'));
      fav.addEventListener('error', () => fav.remove());
    }
    box.append(a);
  });
  if (shortcuts().length < 10) {
    const add = document.createElement('button');
    add.type = 'button'; add.className = 'tile addTile';
    add.title = t('pinAddTitle'); add.setAttribute('aria-label', t('pinAddTitle'));
    add.innerHTML = svg('plus');
    box.append(add);
  }
}

// быстрое добавление сайта в панель
function openAddPin(anchor) {
  popover(anchor, `<form class="menu snip-form" id="pinForm">
      <div class="snip-head">${esc(t('pinAddTitle'))}</div>
      <input class="snip-inp" id="pinName" placeholder="${esc(t('siteNamePlaceholder'))}" autocomplete="off">
      <input class="snip-inp" id="pinUrl" placeholder="${esc(t('siteUrlPlaceholder'))}" required autocomplete="off">
      <div class="snip-actions"><button type="button" class="mini" id="pinCancel">${esc(t('cancelBtn'))}</button><button type="submit" class="mini on">${esc(t('addBtn'))}</button></div>
    </form>`, p => {
    p.querySelector('#pinUrl').focus();
    p.querySelector('#pinCancel').addEventListener('click', closePopover);
    p.querySelector('#pinForm').addEventListener('submit', ev => {
      ev.preventDefault();
      const url = p.querySelector('#pinUrl').value.trim();
      if (!url) return;
      let name = p.querySelector('#pinName').value.trim();
      if (!name) { try { name = new URL(normalize(url)).hostname.replace(/^www\./, ''); } catch (err) { name = url; } }
      saveShortcuts([...shortcuts(), { name, url }]);
      closePopover();
    });
  });
}

// Меню «Сервисы»: по умолчанию только сервисы Google. Список лежит в самом расширении (ничего не загружается из интернета)
// и его можно менять в настройках. [название ru, название en, адрес, значок]
const GOOGLE_SERVICES = [
  ['Аккаунт', 'Account', 'https://myaccount.google.com', 'user'], ['Поиск', 'Search', 'https://www.google.com', 'search'], ['YouTube', 'YouTube', 'https://www.youtube.com', 'play'],
  ['Gmail', 'Gmail', 'https://mail.google.com', 'mail'], ['YT Music', 'YT Music', 'https://music.youtube.com', 'music'], ['Карты', 'Maps', 'https://maps.google.com', 'pin'],
  ['Диск', 'Drive', 'https://drive.google.com', 'cloudUp'], ['Фото', 'Photos', 'https://photos.google.com', 'image'], ['Переводчик', 'Translate', 'https://translate.google.com', 'translate'],
  ['Календарь', 'Calendar', 'https://calendar.google.com', 'calendar'], ['Meet', 'Meet', 'https://meet.google.com', 'video'], ['Документы', 'Docs', 'https://docs.google.com', 'file']
];
export const defaultServices = () => GOOGLE_SERVICES.map(([ru, en, url, icon]) => ({ name: getLang() === 'ru' ? ru : en, url, icon }));
export const services = () => { const v = get('services', null); return Array.isArray(v) && v.length ? v.filter(x => x && typeof x.url === 'string') : defaultServices(); };
export const saveServices = list => set('services', list);
const iconFor = (name, url) => { const hay = `${url} ${name}`.toLowerCase(), hit = RULES.find(([re]) => re.test(hay)); return hit ? hit[1] : 'globe'; };

const AI = [
  ['ChatGPT', 'https://chatgpt.com'], ['Claude', 'https://claude.ai/new'], ['Gemini', 'https://gemini.google.com/app'],
  ['Perplexity', 'https://www.perplexity.ai'], ['DeepSeek', 'https://chat.deepseek.com'], ['Grok', 'https://grok.com'], ['Copilot', 'https://copilot.microsoft.com']
];

// закладки браузера (нужно разрешение - просим только когда пользователь нажал кнопку)
function bmHtml(nodes) {
  return nodes.map(n => n.children
    ? `<details class="bmf"><summary>${svg('folder')}${esc(n.title || t('bmFolder'))}</summary><div>${bmHtml(n.children)}</div></details>`
    : `<a class="mi" href="${esc(n.url)}">${svg('link')}<span>${esc(n.title || n.url)}</span></a>`).join('');
}
async function openBookmarks(anchor) {
  if (!inExtension()) { popover(anchor, `<div class="menu note">${t('bookmarksNote')}</div>`); return; }
  if (!(await hasPerm(['bookmarks']))) {
    popover(anchor, `<div class="menu"><p class="note">${esc(t('bmPerm'))}</p><button type="button" class="mini wide on" id="askBm">${esc(t('bmAllow'))}</button></div>`, p => {
      p.querySelector('#askBm').addEventListener('click', async () => { if (await askPerm(['bookmarks'])) { if (chrome.bookmarks) { $('pop').hidden = true; openBookmarks(anchor); } else location.reload(); } });
    });
    return;
  }
  chrome.bookmarks.getTree(tree => {
    const root = (tree[0] && tree[0].children) || [];
    const bar = root.find(c => /bar|панел/i.test(c.title)) || root[0];
    const rest = root.filter(c => c !== bar);
    const items = [...((bar && bar.children) || []), ...rest.filter(c => c.children && c.children.length).map(c => ({ title: c.title, children: c.children }))];
    popover(anchor, '<div class="menu bm">' + (items.length ? bmHtml(items) : `<p class="note">${esc(t('bmEmpty'))}</p>`) + '</div>');
  });
}

function renderDockButtons() {
  $('bmBtn').innerHTML = svg('bookmark') + `<span>${t('dockBookmarks')}</span>` + svg('chev');
  $('appsBtn').innerHTML = svg('grid') + `<span>${t('dockServices')}</span>` + svg('chev');
  $('aiBtn').innerHTML = svg('spark') + `<span>${t('dockAI')}</span>` + svg('chev');
}

export function initDock() {
  renderDock();
  initDockWave($('dock'));
  renderDockButtons();
  $('dockTiles').addEventListener('click', e => { const b = e.target.closest('.addTile'); if (b) { e.stopPropagation(); openAddPin(b); } });
  $('bmBtn').addEventListener('click', e => { e.stopPropagation(); openBookmarks($('bmBtn')); });
  $('appsBtn').addEventListener('click', e => {
    e.stopPropagation();
    popover($('appsBtn'), '<div class="menu appsGrid">' + services().map(sv => `<a href="${esc(normalize(sv.url))}">${svg(sv.icon || iconFor(sv.name, sv.url))}<span>${esc(sv.name)}</span></a>`).join('') + '</div>');
  });
  $('aiBtn').addEventListener('click', e => { e.stopPropagation(); popover($('aiBtn'), '<div class="menu">' + AI.map(([n, u]) => `<a class="mi" href="${u}"><span class="badge">${n[0]}</span>${n}</a>`).join('') + '</div>'); });
  document.addEventListener('gt:lang', () => { renderDockButtons(); renderDock(); });
  document.addEventListener('gt:settings', renderDock);
}
