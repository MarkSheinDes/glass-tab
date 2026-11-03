// Показ погоды: строка в шапке и крупный блок с графиком суток.
import { get, set } from './store.js';
import { svg } from './icons.js';
import { loadWeather, wmoText, geocode } from './weather.js';
import { t } from './i18n.js';
import { localeTag, tempUnit, windUnit, fmtWind, fmtHourLabel } from './region.js';
import { $, toast } from './ui.js';

let last = null;
const f2 = (c, f) => Math.round(f ? c * 9 / 5 + 32 : c) + '°';

// плавная кривая через точки
function smooth(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function advice(n, hours) {
  const rain = Math.max(0, ...hours.slice(0, 12).map(h => h.rain));
  if (rain >= 50) return ['umbrella', t('weatherRain')];
  if (n.temp <= -5) return ['therm', t('weatherFreeze')];
  if (n.temp <= 5) return ['therm', t('weatherCool')];
  if (n.temp >= 28) return ['drop', t('weatherHot')];
  if (n.wind >= 35) return ['wind', t('weatherWind')];
  return ['sun', t('weatherNice')];
}

export function renderWeather(data) {
  if (data) last = data;
  data = last;
  if (!data) return;
  const f = tempUnit() === 'f';
  const n = data.now;
  $('pillIcon').innerHTML = svg(n.icon);
  $('pillTemp').textContent = f2(n.temp, f);
  $('pillCity').textContent = data.place.name;

  $('wxHeadIcon').innerHTML = svg(n.icon);
  $('wxHead').textContent = t('weather') + ' · ' + data.place.name;
  $('wxBigIcon').innerHTML = svg(n.icon);
  $('wxTemp').textContent = f2(n.temp, f);
  $('wxText').textContent = wmoText(n.code);
  const today = data.days[0];
  $('wxFeels').textContent = `${t('feelsLike')} ${f2(n.feels, f)} · ${t('minTemp')} ${f2(today.min, f)} / ${t('maxTemp')} ${f2(today.max, f)}`;

  // график ближайших 24 часов
  const nowSec = Date.now() / 1000;
  const hrs = data.hours.filter(h => h.epoch >= nowSec - 1800).slice(0, 25);
  if (hrs.length > 3) {
    const tVal = hrs.map(h => h.temp), lo = Math.min(...tVal), hi = Math.max(...tVal), span = Math.max(1, hi - lo);
    const pts = hrs.map((h, i) => [i / (hrs.length - 1) * 400, 66 - (h.temp - lo) / span * 46]);
    const line = smooth(pts);
    $('spark').innerHTML = `<defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".45"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>` +
      `<path d="${line} L400 80 L0 80Z" fill="url(#sg)"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>` +
      `<circle cx="${pts[0][0] + 4}" cy="${pts[0][1]}" r="4.5" fill="var(--accent)"/>`;
    const at = k => hrs[Math.min(hrs.length - 1, k)];
    $('sparkLabels').innerHTML = [t('now'), ...[6, 12, 18, 24].map(k => fmtHourLabel(at(k).label))].map(x => `<span>${x}</span>`).join('');
  }
  const rain6 = Math.max(0, ...data.hours.filter(h => h.epoch >= nowSec - 1800).slice(0, 6).map(h => h.rain));
  $('wxFacts').innerHTML = `<span class="chip">${svg('drop')}${t('humidity')} ${Math.round(n.humidity)}%</span><span class="chip">${svg('wind')}${t('wind')} ${fmtWind(n.wind)} ${t(windUnit() === 'mph' ? 'mph' : windUnit() === 'ms' ? 'ms' : 'kmh')}</span><span class="chip">${svg('umbrella')}${t('precip')} ${Math.round(rain6)}%</span>`;
  const loc = localeTag();
  const wd = new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short' });
  $('wxDays').innerHTML = data.days.map((d, i) => `<div class="day"><span>${i === 0 ? t('today') : wd.format(new Date(d.date + 'T12:00:00'))}</span><span class="dc">${svg(d.icon)}${wmoText(d.code)}</span><strong>${f2(d.min, f)} … ${f2(d.max, f)}</strong></div>`).join('');
  const [ai, at] = advice(n, data.hours.filter(h => h.epoch >= nowSec - 1800));
  $('wxAdvice').innerHTML = svg(ai) + `<span>${at}</span>`;
}

const setup = () => $('wxSetup');

export async function refreshWeather() {
  try {
    renderWeather(await loadWeather());
    setup().hidden = true;
    $('wxPill').classList.remove('askCity');
    document.querySelector('.w-wx').classList.remove('needCity');
  } catch (e) {
    const noCity = !get('city', null);
    const msg = noCity ? t('wxSetCity') : t('noData');
    $('wxText').textContent = noCity ? t('wxAskCity') : msg; $('wxTemp').textContent = '–'; $('pillTemp').textContent = ''; $('pillCity').textContent = msg;
    $('wxFeels').textContent = '';
    $('wxBigIcon').innerHTML = svg('cloud'); $('pillIcon').innerHTML = svg('cloud');
    setup().hidden = !noCity;
    $('wxPill').classList.toggle('askCity', noCity);
    document.querySelector('.w-wx').classList.toggle('needCity', noCity);
  }
}

// форма «Где вы?» в блоке погоды (показывается, пока город не задан)
export function initWeatherSetup(onDone) {
  setup().addEventListener('submit', async e => {
    e.preventDefault();
    const v = $('wxCityInput').value.trim();
    if (!v) return;
    try {
      set('city', await geocode(v));
      $('wxCityInput').value = '';
      onDone();
    } catch (err) { toast(t('cityNotFound')); }
  });
}

document.addEventListener('gt:settings', () => { if (last) renderWeather(last); });
document.addEventListener('gt:lang', () => {
  if (last) renderWeather(last);
  else refreshWeather();
});
