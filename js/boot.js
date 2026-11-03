// Выполняется до отрисовки: ставит тему, контраст, режим экономии и цвет фона, чтобы при открытии вкладки не было вспышки.
(() => {
  try {
    const read = (k, d) => { try { const v = localStorage.getItem('gt.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
    const pref = read('theme', 'auto');
    const h = new Date().getHours();
    const night = pref === 'night' || (pref === 'auto' && (h >= 20 || h < 7));
    const root = document.documentElement;
    root.dataset.theme = night ? 'night' : 'day';
    root.dataset.tone = night ? 'dark' : 'light';
    if (read('contrast', false)) root.dataset.contrast = 'high';
    if (read('perf', false)) root.dataset.perf = 'low';
    const anim = read('anim', true);
    document.addEventListener('DOMContentLoaded', () => {
      document.body.dataset.anim = anim ? 'on' : 'off';
    });
    const base = read(night ? 'baseNight' : 'baseDay', '');
    if (base) root.style.background = base;
  } catch (e) { /* без localStorage просто покажем стандартный вид */ }
})();
