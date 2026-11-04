// Умная строка поиска: поиск, ответы (калькулятор, валюты, единицы), быстрые подсказки.
import { svg } from './icons.js';
import { smart } from './smart.js';
import { t } from './i18n.js';
import { $, esc, toast } from './ui.js';

const looksLikeUrl = q => /^(https?:\/\/\S+|[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?)$/i.test(q);

let current = null, seq = 0;

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

// Обычный запрос уходит в поисковик, выбранный самим человеком в браузере (Search API)
function goSearch(q) {
  if (looksLikeUrl(q)) {
    location.href = /^https?:/i.test(q) ? q : 'https://' + q;
    return;
  }
  const api = (globalThis.browser || globalThis.chrome).search;
  if (api && api.query) api.query({ text: q, disposition: 'CURRENT_TAB' });
  else if (api && api.search) api.search({ query: q, disposition: 'CURRENT_TAB' });
}

export function initSearch() {
  $('searchForm').querySelector('.sIco').innerHTML = svg('search');
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
