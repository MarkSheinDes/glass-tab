// Региональные привычки: формат времени, градусы, скорость ветра, начало недели, поисковики по умолчанию.
// Всё определяется по региону браузера и меняется в настройках; сохранённый выбор пользователя главнее.
import { get } from './store.js';
import { getLang } from './i18n.js';

export function region() {
  const fallback = getLang() === 'ru' ? 'RU' : 'US';
  try { return new Intl.Locale(navigator.language || 'en-US').maximize().region || fallback; } catch (e) { return fallback; }
}

// тег для Intl: язык интерфейса + регион браузера (например en-GB или ru-RU)
export function localeTag() {
  const tag = `${getLang()}-${region()}`;
  try { return Intl.DateTimeFormat.supportedLocalesOf([tag]).length ? tag : getLang(); } catch (e) { return getLang(); }
}

const weekInfo = () => {
  try {
    const l = new Intl.Locale(navigator.language || 'en-US').maximize();
    return (l.getWeekInfo ? l.getWeekInfo() : l.weekInfo) || null;
  } catch (e) { return null; }
};

// ---------- время: 12 или 24 часа ----------
export const hour12 = () => {
  const v = get('time', null);
  if (v === '12') return true;
  if (v === '24') return false;
  try { return !!new Intl.DateTimeFormat(navigator.language || localeTag(), { hour: 'numeric' }).resolvedOptions().hour12; } catch (e) { return false; }   // как привыкли в системе/браузере
};
export const timeSetting = () => hour12() ? '12' : '24';
export const fmtTime = (date, withSeconds = false) => new Intl.DateTimeFormat(localeTag(), {
  hour: hour12() ? 'numeric' : '2-digit', minute: '2-digit', ...(withSeconds ? { second: '2-digit' } : {}), hour12: hour12()
}).format(date);

// ---------- градусы и ветер ----------
const F_REGIONS = new Set(['US', 'BS', 'BZ', 'KY', 'PW', 'LR', 'FM', 'MH']);
export const tempUnit = () => get('units', null) || (F_REGIONS.has(region()) ? 'f' : 'c');

const MPH = new Set(['US', 'GB', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW']);
const MS = new Set(['RU', 'BY', 'KZ', 'UA', 'FI', 'SE', 'NO', 'DK', 'IS', 'PL']);
export const windUnit = () => get('wind', null) || (MPH.has(region()) ? 'mph' : MS.has(region()) ? 'ms' : 'kmh');
export function fmtWind(kmh, unit = windUnit()) {
  const v = unit === 'mph' ? kmh / 1.609344 : unit === 'ms' ? kmh / 3.6 : kmh;
  return Math.round(v || 0);
}

// ---------- неделя ----------
// 1 = понедельник … 7 = воскресенье
const SUN_FIRST = new Set('AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'.split(' '));
const SAT_FIRST = new Set('AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' '));
export function weekStart() {
  const v = Number(get('weekStart', 0));
  if (v) return v;
  const wi = weekInfo();
  if (wi && wi.firstDay) return wi.firstDay;
  const r = region();
  return SUN_FIRST.has(r) ? 7 : SAT_FIRST.has(r) ? 6 : 1;
}
export function weekendDays() {
  const wi = weekInfo();
  if (wi && Array.isArray(wi.weekend)) return wi.weekend;
  return SAT_FIRST.has(region()) && region() !== 'AE' ? [5, 6] : [6, 7];
}
export const isoDay = d => d.getDay() || 7;

// ---------- поисковики по регионам ----------
export const REGION_ENGINES = {
  RU: { enable: ['yandex'], main: 'yandex' }, BY: { enable: ['yandex'], main: 'yandex' }, KZ: { enable: ['yandex'], main: 'yandex' },
  CN: { enable: ['baidu', 'bing'], main: 'baidu' },
  KR: { enable: ['naver'], main: 'naver' },
  JP: { enable: ['yahoojp'], main: 'google' }
};

// 'HH:MM' из прогноза (время города) -> строка в выбранном формате; Intl не нужен, часовой пояс не трогаем
export function fmtHourLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  if (!hour12()) return hhmm;
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${new Intl.DateTimeFormat(localeTag(), { hour: 'numeric', hour12: true }).formatToParts(new Date(2000, 0, 1, h)).find(p => p.type === 'dayPeriod')?.value || (h < 12 ? 'AM' : 'PM')}`;
}
