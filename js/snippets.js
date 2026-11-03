// Быстрый буфер / Сниппеты для мгновенного копирования частых данных (Email, телефон, шаблоны) в один клик
import { svg } from './icons.js';
import { $, esc, toast, popover, closePopover } from './ui.js';
import { get, set } from './store.js';
import { t } from './i18n.js';

const defaultSnippets = () => t('snipDefaults').map((x, i) => ({ id: String(i + 1), ...x }));

export function initSnippets() {
  const box = $('snipList');
  const addBtn = $('snipAddBtn');
  if (!box) return;

  const load = () => get('snippets', null) || defaultSnippets();
  const save = list => set('snippets', list);

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
    return Promise.resolve();
  }

  function render() {
    const list = load();
    if (!list.length) {
      box.innerHTML = `<div class="muted snip-empty">${esc(t('snipEmpty'))}</div>`;
      return;
    }

    box.innerHTML = list.map(s => `
      <div class="snip-card" data-id="${s.id}">
        <div class="snip-body">
          <b class="snip-title">${esc(s.title)}</b>
          <div class="snip-val">${esc(s.text)}</div>
        </div>
        <button type="button" class="snip-del" title="${esc(t('deleteBtn'))}" aria-label="${esc(t('deleteBtn'))}">${svg('x')}</button>
        <span class="snip-ico">${svg('copy')}</span>
      </div>
    `).join('');
  }

  // Клик по карточке — копирование
  box.addEventListener('click', async e => {
    const delBtn = e.target.closest('.snip-del');
    if (delBtn) {
      e.stopPropagation();
      const card = delBtn.closest('.snip-card');
      const id = card.dataset.id;
      const list = load().filter(s => s.id !== id);
      save(list);
      render();
      return;
    }

    const card = e.target.closest('.snip-card');
    if (!card) return;
    const id = card.dataset.id;
    const item = load().find(s => s.id === id);
    if (!item) return;

    try {
      await copyText(item.text);
      card.classList.add('copied');
      const ico = card.querySelector('.snip-ico');
      if (ico) ico.innerHTML = svg('check');
      toast(`${t('copiedToast')}${item.title}`);
      setTimeout(() => {
        card.classList.remove('copied');
        if (ico) ico.innerHTML = svg('copy');
      }, 1400);
    } catch (err) {
      toast(t('copyFailToast'));
    }
  });

  // Кнопка добавления сниппета
  if (addBtn) {
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      const html = `
        <form class="menu snip-form" id="snipForm">
          <div class="snip-head">${esc(t('snipNew'))}</div>
          <input class="snip-inp" id="snipTitleInp" placeholder="${esc(t('snipTitlePh'))}" required autocomplete="off">
          <textarea class="snip-ta" id="snipTextInp" placeholder="${esc(t('snipTextPh'))}" required rows="3"></textarea>
          <div class="snip-actions">
            <button type="button" class="mini" id="snipCancel">${esc(t('cancelBtn'))}</button>
            <button type="submit" class="mini on">${esc(t('snipSave'))}</button>
          </div>
        </form>
      `;

      popover(addBtn, html, p => {
        const form = p.querySelector('#snipForm');
        const titleInp = p.querySelector('#snipTitleInp');
        const textInp = p.querySelector('#snipTextInp');
        titleInp.focus();
        p.querySelector('#snipCancel').addEventListener('click', closePopover);

        form.addEventListener('submit', ev => {
          ev.preventDefault();
          const tVal = titleInp.value.trim();
          const v = textInp.value.trim();
          if (!tVal || !v) return;

          const list = load();
          list.push({ id: String(Date.now()), title: tVal, text: v });
          save(list);
          render();
          closePopover();
          toast(t('snipAdded') + tVal);
        });
      });
    });
  }

  if (addBtn) addBtn.innerHTML = svg('plus');
  render();
  document.addEventListener('gt:lang', render);
}
