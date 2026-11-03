// Интерактивный мини-календарь на месяц с подсвечиванием текущего дня и выбором дат
import { svg } from './icons.js';
import { makeGlider } from './fx.js';
import { $, esc, animOn } from './ui.js';
import { get } from './store.js';
import { t } from './i18n.js';
import { localeTag, weekStart, weekendDays, isoDay } from './region.js';

export function initCalendar() {
  const root = $('calGrid');
  if (!root) return;

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth(); // 0-11
  let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const titleEl = $('calTitle');
  const prevBtn = $('calPrev');
  const nextBtn = $('calNext');
  const todayBtn = $('calToday');
  const infoEl = $('calInfo');

  if (prevBtn) prevBtn.innerHTML = svg('chev');
  if (nextBtn) nextBtn.innerHTML = svg('chev');

  // заголовок недели: названия дней берём у браузера (Intl) и начинаем с выбранного дня
  function updateDaysHead() {
    const head = $('calDaysHead');
    if (!head) return;
    const ws = weekStart(), we = weekendDays(), fmtDay = new Intl.DateTimeFormat(localeTag(), { weekday: 'short' });
    head.innerHTML = Array.from({ length: 7 }, (_, i) => {
      const iso = (ws - 1 + i) % 7 + 1;
      return `<span class="${we.includes(iso) ? 'we' : ''}">${esc(fmtDay.format(new Date(2021, 0, 3 + iso)))}</span>`;
    }).join('');
  }

  const key = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  // под выбранным днём едет «капля», как в переключателе День / Ночь
  const glide = makeGlider(root, '.cday', el => !!selectedDate && el.dataset.d === key(selectedDate));

  function render(dir = 0, anim = false) {
    const loc = localeTag();
    const mStr = new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(new Date(viewYear, viewMonth, 1));
    titleEl.textContent = mStr.charAt(0).toUpperCase() + mStr.slice(1);

    // Дни месяца
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lead = (isoDay(firstDay) - weekStart() + 7) % 7;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Дни предыдущего месяца
    for (let i = lead; i > 0; i--) {
      const d = daysInPrevMonth - i + 1;
      const prevDate = new Date(viewYear, viewMonth - 1, d);
      cells.push({ date: prevDate, dayNum: d, other: true });
    }

    // Дни текущего месяца
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(viewYear, viewMonth, d);
      cells.push({ date: curDate, dayNum: d, other: false });
    }

    // Дни следующего месяца до полной сетки
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d);
      cells.push({ date: nextDate, dayNum: d, other: true });
    }

    const html = cells.map(c => {
      const isToday = c.date.getFullYear() === today.getFullYear() &&
                      c.date.getMonth() === today.getMonth() &&
                      c.date.getDate() === today.getDate();

      const isSel = selectedDate &&
                    c.date.getFullYear() === selectedDate.getFullYear() &&
                    c.date.getMonth() === selectedDate.getMonth() &&
                    c.date.getDate() === selectedDate.getDate();

      const isWe = weekendDays().includes(isoDay(c.date));

      const classes = [
        'cday',
        c.other ? 'other' : '',
        isWe ? 'we' : '',
        isToday ? 'today' : '',
        isSel ? 'sel' : ''
      ].filter(Boolean).join(' ');

      const dateStr = `${c.date.getFullYear()}-${c.date.getMonth()}-${c.date.getDate()}`;
      return `<button type="button" class="${classes}" data-d="${dateStr}">
        <span class="cdn">${c.dayNum}</span>
        ${isToday ? '<span class="cdot"></span>' : ''}
      </button>`;
    }).join('');
    root.querySelectorAll('.cday').forEach(n => n.remove());
    root.insertAdjacentHTML('beforeend', html);
    glide(anim && !dir);

    updateInfo();
    if (dir && animOn()) {
      root.style.setProperty('--sx', dir * 16 + 'px');
      root.classList.remove('swap'); void root.offsetWidth; root.classList.add('swap');
    }
  }

  function updateInfo() {
    if (!infoEl) return;
    if (!selectedDate) {
      infoEl.textContent = '';
      return;
    }

    const loc = localeTag();
    const dow = new Intl.DateTimeFormat(loc, { weekday: 'long' }).format(selectedDate);
    const dNum = selectedDate.getDate();
    const mName = new Intl.DateTimeFormat(loc, { month: 'long' }).format(selectedDate);

    // Разница в днях с сегодняшним
    const msPerDay = 86400000;
    const tZero = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const sZero = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
    const diffDays = Math.round((sZero - tZero) / msPerDay);

    let diffText = '';
    if (diffDays === 0) diffText = t('calToday');
    else if (diffDays === 1) diffText = t('dTomorrow');
    else if (diffDays === -1) diffText = t('dYesterday');
    else if (diffDays > 1) diffText = t('dIn').replace('{n}', diffDays);
    else if (diffDays < -1) diffText = t('dAgo').replace('{n}', Math.abs(diffDays));

    const dateStr = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long' }).format(selectedDate);   // целиком, чтобы месяц склонялся («3 ноября»)
    infoEl.innerHTML = `<b>${dow}</b>, ${dateStr} <span class="tag-diff">${esc(diffText)}</span>`;
  }

  // Переключение месяца
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }
      render(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }
      render(1);
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
      selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      render();
    });
  }

  // Клик по дате
  root.addEventListener('click', e => {
    const btn = e.target.closest('.cday');
    if (!btn || !btn.dataset.d) return;
    const [y, m, d] = btn.dataset.d.split('-').map(Number);
    selectedDate = new Date(y, m, d);
    const sameMonth = m === viewMonth && y === viewYear;
    if (!sameMonth) {
      viewYear = y;
      viewMonth = m;
    }
    render(0, sameMonth);
  });

  updateDaysHead();
  render();

  const refresh = () => { updateDaysHead(); render(); };
  document.addEventListener('gt:lang', refresh);
  document.addEventListener('gt:settings', refresh);
}
