import { get, set } from './store.js';
import { svg } from './icons.js';
import { makeGlider } from './fx.js';
import { initLayout } from './layout.js';
import { initDock } from './dock.js';
import { initSearch } from './search.js';
import { initClock, initTasks, initNote } from './widgets.js';
import { initCalendar } from './calendar.js';
import { initSnippets } from './snippets.js';
import { initTimer } from './timer.js';
import { initWelcome } from './welcome.js';
import { refreshWeather, renderWeather, initWeatherSetup } from './weatherui.js';
import { initSettings } from './settings.js';
import { initWallUI, syncWall } from './wallpapers.js';
import { applyI18n } from './i18n.js';
import { $, bindPanel, toast } from './ui.js';
import { t } from './i18n.js';

const root = document.documentElement;

// ---------- тема: Авто (по времени суток) / День / Ночь ----------
const themeSeg = $('themeSeg');
const isNight = () => {
  const pref = get('theme', 'auto'), h = new Date().getHours();
  return pref === 'night' || (pref === 'auto' && (h >= 20 || h < 7));
};
function applyTheme() {
  const night = isNight();
  root.dataset.theme = night ? 'night' : 'day';
  syncWall(night);
}
const themeUpdate = makeGlider(themeSeg, 'button', b => b.dataset.v === get('theme', 'auto'));
themeSeg.addEventListener('click', e => {
  const v = e.target.dataset && e.target.dataset.v;
  if (!v) return;
  set('theme', v);
  themeUpdate(true);
  applyTheme();
});
setInterval(applyTheme, 30000);
document.addEventListener('gt:theme', () => { themeUpdate(true); applyTheme(); });   // тему может сменить мастер первого запуска

// ---------- локализация и сборка ----------
try { applyI18n(); } catch (e) { console.error('applyI18n error:', e); }
document.addEventListener('gt:lang', applyI18n);

const modules = [
  ['layout', initLayout],
  ['clock', initClock],
  ['search', initSearch],
  ['dock', initDock],
  ['tasks', initTasks],
  ['calendar', initCalendar],
  ['snippets', initSnippets],
  ['timer', initTimer],
  ['note', initNote],
  ['wallUI', initWallUI]
];

for (const [name, fn] of modules) {
  try {
    fn();
  } catch (err) {
    console.error(`[GlassTab] Error initializing ${name}:`, err);
  }
}

try {
  bindPanel($('wallBtn'), $('wallPanel'));
  $('wallBtn').innerHTML = svg('image');
} catch (e) { console.error('wallBtn error:', e); }

try {
  initSettings(refreshWeather, () => renderWeather());
} catch (e) { console.error('initSettings error:', e); }

try {
  applyTheme();
} catch (e) { console.error('applyTheme error:', e); }

// пилюля погоды: пока город не задан — по щелчку открывает настройки
$('wxPill').addEventListener('click', e => {
  if (get('city', null)) return;
  e.stopPropagation();   // иначе общий обработчик кликов сразу закроет только что открытые настройки
  if ($('setPanel').hidden) $('setBtn').click();
  setTimeout(() => $('cityInput').focus(), 50);
});

try {
  initWeatherSetup(refreshWeather);
  refreshWeather();
  setInterval(refreshWeather, 15 * 60e3);
} catch (e) { console.error('weather error:', e); }

requestAnimationFrame(() => {
  document.body.classList.add('ready');
});

// первый запуск: карточка с городом и проверкой региональных настроек
try {
  initWelcome(() => { refreshWeather(); document.dispatchEvent(new CustomEvent('gt:settings')); });
} catch (e) { console.error('welcome error:', e); }
