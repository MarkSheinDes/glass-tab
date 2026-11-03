// Панель «Настройки»: язык, город, температура, поисковые системы, читаемость, режим для слабых ПК, мои сайты, сброс.
import { get, set, clearAll } from './store.js';
import { svg } from './icons.js';
import { geocode, currentPlace } from './weather.js';
import { shortcuts, saveShortcuts, services, saveServices } from './dock.js';
import { makeGlider } from './fx.js';
import { getEngines, saveEngines } from './search.js';
import { getLang, setLang, t } from './i18n.js';
import { idbClear } from './idb.js';
import { tempUnit, windUnit, timeSetting, weekStart } from './region.js';
import { iconsOn } from './dock.js';
import { openWelcome } from './welcome.js';
import { WIDGETS, isVisible, setVisible, onVisible } from './layout.js';
import { DONATE_URL, PRIVACY_URL, CRYPTO } from './config.js';
import { $, esc, bindPanel, confirmDialog, popover, toast } from './ui.js';

export function initSettings(onWeather, onUnits) {
  const changed = () => document.dispatchEvent(new CustomEvent('gt:settings'));

  // язык интерфейса (RU / EN)
  const langSeg = $('langSeg');
  let langUpd = () => {};
  if (langSeg) {
    langUpd = makeGlider(langSeg, 'button', b => b.dataset.v === getLang());
    langSeg.addEventListener('click', e => {
      const v = e.target.dataset && e.target.dataset.v;
      if (v && v !== getLang()) {
        setLang(v);
        langUpd(true);
        showPlace();
      }
    });
  }

  // какие блоки показывать (на чистом старте включены только основные)
  const widgetChecks = $('widgetChecks');
  const buildWidgets = () => {
    widgetChecks.innerHTML = Object.keys(WIDGETS).map(id => `<label class="ck"><input type="checkbox" value="${id}" ${isVisible(id) ? 'checked' : ''}><span>${esc(t('w_' + id))}</span></label>`).join('');
  };
  widgetChecks.addEventListener('change', e => { if (e.target.value) setVisible(e.target.value, e.target.checked); });
  onVisible(buildWidgets);
  buildWidgets();

  // поисковые системы
  const engList = $('engList');
  const renderEngineSettings = () => {
    if (!engList) return;
    const engines = getEngines();
    engList.innerHTML = '';
    engines.forEach(eng => {
      const item = document.createElement('div');
      item.className = 'engItem' + (eng.enabled ? ' on' : '');
      const ch = eng.ch || (eng.name ? eng.name[0].toUpperCase() : 'S');
      item.innerHTML = `
        <span class="sw"><i></i></span>
        <span class="badge">${esc(ch)}</span>
        <span class="engTitle">${esc(eng.name)}</span>
        ${engines.length > 1 ? `<button type="button" class="engDel" title="${esc(t('deleteBtn'))}" aria-label="${esc(t('deleteBtn'))}">${svg('x')}</button>` : ''}
      `;
      item.addEventListener('click', e => {
        e.stopPropagation();
        if (e.target.closest('.engDel')) {
          // удалить можно любой поисковик, но один должен остаться; встроенные запоминаем, чтобы они не вернулись
          const all = getEngines().filter(x => x.id !== eng.id);
          if (!all.length) return;
          if (!eng.custom) set('enginesRemoved', [...new Set([...get('enginesRemoved', []), eng.id])]);
          if (!all.some(x => x.enabled)) all[0].enabled = true;
          saveEngines(all);
          renderEngineSettings();
          return;
        }
        const all = getEngines();
        const cur = all.find(x => x.id === eng.id);
        if (!cur) return;
        const enabledCount = all.filter(x => x.enabled).length;
        if (cur.enabled && enabledCount <= 1) return; // минимум один поисковик должен оставаться
        cur.enabled = !cur.enabled;
        item.classList.toggle('on', cur.enabled);
        saveEngines(all);
      });
      engList.appendChild(item);
    });
  };

  const newEngAdd = $('newEngAdd');
  if (newEngAdd) {
    newEngAdd.addEventListener('click', e => {
      e.stopPropagation();
      const nameInput = $('newEngName');
      const urlInput = $('newEngUrl');
      const name = nameInput.value.trim();
      let url = urlInput.value.trim();
      if (!name || !url) return;
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      const all = getEngines();
      const id = 'custom_' + Date.now();
      const ch = name[0].toUpperCase();
      all.push({ id, name, ch, url, enabled: true, custom: true });
      saveEngines(all);
      nameInput.value = '';
      urlInput.value = '';
      renderEngineSettings();
    });
  }
  renderEngineSettings();

  const note = $('cityNote');
  const showPlace = async () => {
    try {
      const p = await currentPlace();
      note.textContent = t('cityNow') + p.name + (p.country ? ', ' + p.country : '');
    } catch (e) {
      note.textContent = t('wxAskCity');
    }
  };
  $('cityForm').addEventListener('submit', async e => {
    e.preventDefault();
    const v = $('cityInput').value.trim();
    if (!v) return;
    note.textContent = t('citySearching');
    try {
      set('city', await geocode(v));
      $('cityInput').value = '';
      await showPlace();
      onWeather();
    } catch (err) {
      note.textContent = t('cityNotFound');
    }
  });

  // температура, ветер, время, начало недели: по умолчанию подбираются по региону, выбор пользователя главнее
  const segs = [];
  const bindSeg = (id, getVal, save, after) => {
    const el = $(id);
    const upd = makeGlider(el, 'button', b => b.dataset.v === String(getVal()));
    el.addEventListener('click', e => {
      const v = e.target.dataset && e.target.dataset.v;
      if (!v) return;
      save(v); upd(true); changed(); if (after) after();
    });
    segs.push(upd);
  };
  bindSeg('unitSeg', tempUnit, v => set('units', v), onUnits);
  bindSeg('windSeg', windUnit, v => set('wind', v));
  bindSeg('timeSeg', timeSetting, v => set('time', v));
  bindSeg('weekSeg', weekStart, v => set('weekStart', Number(v)));

  // значки сайтов в нижней панели (через сервис Google)
  const iconsCheck = $('iconsCheck');
  iconsCheck.checked = iconsOn();
  iconsCheck.addEventListener('change', () => { set('favicons', iconsCheck.checked); changed(); });

  // оформление и читаемость (высокая контрастность)
  const contrastCheck = $('contrastCheck');
  if (contrastCheck) {
    const isHigh = get('contrast', false);
    contrastCheck.checked = isHigh;
    if (isHigh) document.documentElement.dataset.contrast = 'high';
    contrastCheck.addEventListener('change', () => {
      const on = contrastCheck.checked;
      set('contrast', on);
      if (on) document.documentElement.dataset.contrast = 'high';
      else delete document.documentElement.dataset.contrast;
    });
  }

  // производительность для слабых ПК (без размытия блюра)
  const perfCheck = $('perfCheck');
  if (perfCheck) {
    const isLow = get('perf', false);
    perfCheck.checked = isLow;
    if (isLow) document.documentElement.dataset.perf = 'low';
    perfCheck.addEventListener('change', () => {
      const on = perfCheck.checked;
      set('perf', on);
      if (on) document.documentElement.dataset.perf = 'low';
      else delete document.documentElement.dataset.perf;
    });
  }

  // анимации интерфейса
  const animCheck = $('animCheck');
  if (animCheck) {
    animCheck.checked = get('anim', true);
    animCheck.addEventListener('change', () => {
      const on = animCheck.checked;
      set('anim', on);
      document.body.dataset.anim = on ? 'on' : 'off';
      const b = document.querySelector('#wallPanel [data-a="anim"]');
      if (b) b.textContent = t(on ? 'wallAnimOn' : 'wallAnimOff');
    });
  }

  // мои сайты
  // редактор списков «название + адрес»: мои сайты (плитки) и меню «Сервисы»
  const listEditor = (box, addBtn, getList, save, max = Infinity) => {
    const sync = () => { addBtn.hidden = box.querySelectorAll('.srow').length >= max; };
    const persist = () => { save([...box.querySelectorAll('.srow')].map(r => ({ name: r.querySelector('.n').value.trim(), url: r.querySelector('.u').value.trim() })).filter(x => x.url)); sync(); };
    const row = (s = { name: '', url: '' }) => {
      const r = document.createElement('div');
      r.className = 'srow';
      r.innerHTML = `<input class="n" placeholder="${esc(t('siteNamePlaceholder'))}" value="${esc(s.name)}"><input class="u" placeholder="${esc(t('siteUrlPlaceholder'))}" value="${esc(s.url)}"><button type="button" aria-label="${esc(t('deleteBtn'))}">${svg('x')}</button>`;
      r.querySelector('button').onclick = () => { r.remove(); persist(); };
      r.addEventListener('input', persist);
      return r;
    };
    addBtn.addEventListener('click', () => { const r = row(); box.append(r); r.querySelector('.n').focus(); sync(); });
    return () => { box.innerHTML = ''; getList().forEach(s => box.append(row(s))); sync(); };
  };
  const buildSites = listEditor($('shortList'), $('shortAdd'), shortcuts, saveShortcuts, 10);   // в панели помещается 10 плиток
  const buildServs = listEditor($('servList'), $('servAdd'), services, saveServices);
  const build = () => { buildSites(); buildServs(); };
  $('servReset').addEventListener('click', () => { saveServices(null); buildServs(); });
  $('rerunSetup').addEventListener('click', () => {
    $('setPanel').hidden = true; $('setBtn').classList.remove('active');
    openWelcome(() => { document.dispatchEvent(new CustomEvent('gt:settings')); onWeather(); });
  });
  $('resetAll').addEventListener('click', async () => { if (await confirmDialog(t('resetConfirm'), t('resetDo'), t('cancelBtn'))) { clearAll(); await idbClear().catch(() => {}); location.reload(); } });

  // о расширении: версия, поддержка, политика конфиденциальности
  const ver = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest().version : '';
  $('verTxt').textContent = 'Glass Tab' + (ver ? ' v' + ver : '');
  // поддержка проекта: ссылка на карту/СБП и/или криптокошелёк
  const copyText = async text => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove(); return ok;
    }
  };
  if (DONATE_URL || CRYPTO.address) $('donateBtn').hidden = false;
  $('donateBtn').addEventListener('click', e => {
    e.stopPropagation();
    if (DONATE_URL && !CRYPTO.address) { window.open(DONATE_URL, '_blank', 'noopener'); return; }
    const html = `<div class="menu donate">
      ${DONATE_URL ? `<a class="mi" href="${esc(DONATE_URL)}" target="_blank" rel="noopener">${svg('link')}<span>${esc(t('donateCard'))}</span></a>` : ''}
      ${CRYPTO.address ? `<div class="cryptoBox"><div class="cb-title">${esc(CRYPTO.coin)} · ${esc(CRYPTO.network)}</div><div class="cb-addr">${esc(CRYPTO.address)}</div><button type="button" class="mini on" id="cbCopy">${esc(t('donateCopy'))}</button><div class="cb-warn">${esc(t('donateWarn'))}</div></div>` : ''}
    </div>`;
    popover($('donateBtn'), html, p => {
      const b = p.querySelector('#cbCopy');
      if (b) b.addEventListener('click', async ev => { ev.stopPropagation(); toast(t((await copyText(CRYPTO.address)) ? 'donateCopied' : 'copyFailToast')); });
    });
  });
  if (PRIVACY_URL) { $('privacyLink').href = PRIVACY_URL; $('privacyLink').hidden = false; }

  $('setBtn').innerHTML = svg('sliders');
  bindPanel($('setBtn'), $('setPanel'), () => {
    build();
    buildWidgets();
    showPlace();
    renderEngineSettings();
    langUpd(false);
    segs.forEach(u => u(false));
    iconsCheck.checked = iconsOn();
  });

  document.addEventListener('gt:lang', () => {
    buildWidgets();
    build();
    showPlace();
    renderEngineSettings();
  });
}
