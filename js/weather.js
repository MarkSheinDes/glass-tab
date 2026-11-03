// Погода из Open-Meteo (бесплатно, без ключа). Город: введённый вручную или по IP.
import { get, set } from './store.js';

import { getLang, t } from './i18n.js';

// код погоды (WMO) -> вид значка; текст берётся из переводов (wmo) в момент показа
const KIND = {
  0: 'clear', 1: 'clear', 2: 'partly', 3: 'cloud', 45: 'fog', 48: 'fog',
  51: 'rain', 53: 'rain', 55: 'rain', 56: 'rain', 57: 'rain', 61: 'rain', 63: 'rain', 65: 'rain', 66: 'rain', 67: 'rain',
  71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow', 80: 'rain', 81: 'rain', 82: 'rain', 85: 'snow', 86: 'snow',
  95: 'storm', 96: 'storm', 99: 'storm'
};
export const wmoText = code => { const m = t('wmo'); return m[code] || m[3]; };
export function describe(code, isDay) {
  const kind = KIND[code] || 'cloud';
  const icon = kind === 'clear' ? (isDay ? 'sun' : 'moon') : kind === 'partly' ? (isDay ? 'partly' : 'partlyNight') : kind;
  return { code, icon };
}

const json = async url => { const r = await fetch(url); if (!r.ok) throw new Error(r.status); return r.json(); };

export async function geocode(name) {
  const r = await json(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=${getLang()}`);
  if (!r.results || !r.results.length) throw new Error('not found');
  const x = r.results[0];
  return { name: x.name, lat: x.latitude, lon: x.longitude, country: x.country || '' };
}

// Город задаёт пользователь (при первом запуске его спрашивают). Определение по IP не используется: никаких данных о пользователе наружу не уходит.
export async function currentPlace() {
  const c = get('city', null);
  if (!c) throw new Error('no city');
  return c;
}

// Возвращает { place, now:{...}, hours:[...], days:[...] }; при ошибке сети отдаёт последние сохранённые данные.
export async function loadWeather() {
  const place = await currentPlace();
  const key = `v2:${place.lat.toFixed(2)},${place.lon.toFixed(2)}`;
  const cache = get('wx', null);
  if (cache && cache.key === key && Date.now() - cache.t < 15 * 60e3) return cache.data;
  try {
    const d = await json('https://api.open-meteo.com/v1/forecast?latitude=' + place.lat + '&longitude=' + place.lon +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day,wind_speed_10m' +
      '&hourly=temperature_2m,precipitation_probability,weather_code,is_day' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=3&timezone=auto&wind_speed_unit=kmh');
    const off = d.utc_offset_seconds || 0;
    const hours = d.hourly.time.map((t, i) => ({
      epoch: Date.parse(t + ':00Z') / 1000 - off, label: t.slice(11, 16),
      temp: d.hourly.temperature_2m[i], rain: d.hourly.precipitation_probability[i] ?? 0,
      ...describe(d.hourly.weather_code[i], d.hourly.is_day[i])
    }));
    const data = {
      place,
      now: { temp: d.current.temperature_2m, feels: d.current.apparent_temperature, humidity: d.current.relative_humidity_2m, wind: d.current.wind_speed_10m, ...describe(d.current.weather_code, d.current.is_day) },
      hours,
      days: d.daily.time.map((date, i) => ({ date, min: d.daily.temperature_2m_min[i], max: d.daily.temperature_2m_max[i], ...describe(d.daily.weather_code[i], 1) }))
    };
    set('wx', { t: Date.now(), key, data });
    return data;
  } catch (e) {
    if (cache && cache.key === key) return cache.data;   // сети нет - показываем старое
    throw e;
  }
}
