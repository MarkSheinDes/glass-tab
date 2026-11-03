// Умная строка поиска: поиск, ответы (калькулятор, валюты, единицы), быстрые подсказки.
import { get, set } from './store.js';
import { svg } from './icons.js';
import { smart } from './smart.js';
import { t, getLang } from './i18n.js';
import { region, REGION_ENGINES } from './region.js';
import { $, esc, toast, popover, closePopover } from './ui.js';

// Набор по умолчанию зависит от региона: Яндекс — для русского, Baidu — Китай, Naver — Корея, Yahoo! JAPAN — Япония
export const defaultEngines = () => {
  const ru = getLang() === 'ru', reg = REGION_ENGINES[region()] || { enable: [] };
  const on = id => reg.enable.includes(id) || (id === 'yandex' && ru);
  return [
    { id: 'google', name: 'Google', ch: 'G', url: 'https://www.google.com/search?q=', enabled: region() !== 'CN', custom: false },
    { id: 'yandex', name: ru ? 'Яндекс' : 'Yandex', ch: ru ? 'Я' : 'Y', url: 'https://yandex.ru/search/?text=', enabled: on('yandex'), custom: false },
    { id: 'brave', name: 'Brave', ch: 'B', url: 'https://search.brave.com/search?q=', enabled: true, custom: false },
    { id: 'duck', name: 'DuckDuckGo', ch: 'D', url: 'https://duckduckgo.com/?q=', enabled: !ru, custom: false },
    { id: 'bing', name: 'Bing', ch: 'B', url: 'https://www.bing.com/search?q=', enabled: on('bing'), custom: false },
    { id: 'baidu', name: 'Baidu', ch: '百', url: 'https://www.baidu.com/s?wd=', enabled: on('baidu'), custom: false },
    { id: 'naver', name: 'Naver', ch: 'N', url: 'https://search.naver.com/search.naver?query=', enabled: on('naver'), custom: false },
    { id: 'yahoojp', name: 'Yahoo! JAPAN', ch: 'Y', url: 'https://search.yahoo.co.jp/search?p=', enabled: on('yahoojp'), custom: false },
    { id: 'ecosia', name: 'Ecosia', ch: 'E', url: 'https://www.ecosia.org/search?q=', enabled: false, custom: false },
    { id: 'startpage', name: 'Startpage', ch: 'S', url: 'https://www.startpage.com/do/search?q=', enabled: false, custom: false }
  ];
};

export function getEngines() {
  const saved = get('searchEngines', null), removed = get('enginesRemoved', []), defs = defaultEngines().filter(d => !removed.includes(d.id));
  if (!Array.isArray(saved) || !saved.length) return defs;
  // новые поисковики из обновлений появляются в списке выключенными (кроме тех, что человек сам удалил)
  const named = saved.map(s => { const d = !s.custom && defs.find(x => x.id === s.id); return d ? { ...s, name: d.name, ch: d.ch } : s; });   // названия встроенных — на текущем языке
  return [...named, ...defs.filter(d => !saved.some(s => s.id === d.id)).map(d => ({ ...d, enabled: false }))];
}

export function saveEngines(list) {
  set('searchEngines', list);
  renderEngine();
  document.dispatchEvent(new CustomEvent('gt:engines'));
}

export function getActiveEngine() {
  const list = getEngines();
  const enabled = list.filter(e => e.enabled);
  const curId = get('engine', null) || (REGION_ENGINES[region()] || {}).main || 'google';
  const found = enabled.find(e => e.id === curId);
  if (found) return found;
  if (enabled.length) return enabled[0];
  return list[0] || defaultEngines()[0];
}

const looksLikeUrl = q => /^(https?:\/\/\S+|[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?)$/i.test(q);

let current = null, seq = 0;

export function renderEngine() {
  const cur = getActiveEngine();
  const ch = cur.ch || (cur.name ? cur.name[0].toUpperCase() : 'S');
  $('engBtn').innerHTML = `<span class="badge">${esc(ch)}</span><span>${esc(cur.name)}</span>${svg('chev')}`;
}

function showAnswer(a) {
  const box = $('answer');
  current = a;
  if (!a) { box.hidden = true; return; }
  const icon = a.kind === 'convert' ? 'trend' : a.kind === 'calc' ? 'tool' : 'refresh';
  const hint = a.copy ? t('clickToCopy') : '';
  box.innerHTML = `<span class="aic">${svg(icon)}</span><div class="at"><b>${esc(a.title)}</b><small>${esc(a.sub)}</small></div><span class="ah">${hint}</span>`;
  box.classList.toggle('click', !!a.copy);
  box.hidden = false;
}

function goSearch(q) {
  if (looksLikeUrl(q)) {
    location.href = /^https?:/i.test(q) ? q : 'https://' + q;
  } else {
    const cur = getActiveEngine();
    let url = cur.url || 'https://www.google.com/search?q=';
    if (url.includes('%s')) {
      location.href = url.replace('%s', encodeURIComponent(q));
    } else {
      location.href = url + encodeURIComponent(q);
    }
  }
}

export function initSearch() {
  $('searchForm').querySelector('.sIco').innerHTML = svg('search');
  renderEngine();

  $('engBtn').addEventListener('click', e => {
    e.stopPropagation();
    const engines = getEngines().filter(eng => eng.enabled);
    const active = getActiveEngine();
    const html = '<div class="menu selectMenu">' + engines.map(eng => {
      const isSel = eng.id === active.id;
      const ch = eng.ch || (eng.name ? eng.name[0].toUpperCase() : 'S');
      return `<button type="button" class="mi ${isSel ? 'on' : ''}" data-e="${esc(eng.id)}"><span class="badge">${esc(ch)}</span><span>${esc(eng.name)}</span>${isSel ? svg('check') : ''}</button>`;
    }).join('') + '</div>';
    popover($('engBtn'), html, p => p.querySelectorAll('[data-e]').forEach(b => b.addEventListener('click', () => {
      set('engine', b.dataset.e);
      renderEngine();
      closePopover();
      $('q').focus();
    })));
  });

  document.addEventListener('gt:engines', renderEngine);
  document.addEventListener('gt:lang', renderEngine);

  let timer = 0;
  $('q').addEventListener('input', () => {
    clearTimeout(timer);
    const my = ++seq;
    timer = setTimeout(async () => { const a = await smart($('q').value); if (my === seq) showAnswer(a); }, 140);
  });
  $('answer').addEventListener('click', async () => {
    if (current && current.copy) {
      try {
        await navigator.clipboard.writeText(current.copy);
        toast(t('copiedToast') + current.copy);
      } catch (e) {
        toast(t('copyFailToast'));
      }
    }
  });
  $('searchForm').addEventListener('submit', async e => {
    e.preventDefault();
    const q = $('q').value.trim();
    if (!q) return;
    goSearch(q);
  });

  // быстрые подсказки под строкой
  const fill = text => { $('q').value = text; $('q').focus(); $('q').dispatchEvent(new Event('input')); };
  const getQuick = () => [
    ['tool', t('chip1'), () => fill(t('chip1'))],
    ['therm', t('chip2'), () => fill(t('chip2'))],
    ['trend', t('chip3'), () => fill(t('chip3'))],
    ['pin', t('chip4'), () => { location.href = 'https://www.google.com/maps/search/' + encodeURIComponent(t('chip4')); }],
    ['spark', t('chip5'), () => { location.href = 'https://chatgpt.com'; }]
  ];
  let quick = getQuick();
  const renderQuick = () => {
    quick = getQuick();
    $('quick').innerHTML = quick.map(([i, l], n) => `<button type="button" class="chip" data-n="${n}">${svg(i)}${esc(l)}</button>`).join('');
  };
  renderQuick();
  $('quick').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (b) quick[b.dataset.n][2](); });
  document.addEventListener('gt:lang', renderQuick);

  // «/» - быстрый переход в строку поиска
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !document.body.classList.contains('editing')) { e.preventDefault(); $('q').focus(); }
    if (e.key === 'Escape' && document.activeElement === $('q')) { $('q').blur(); }
  });
}
