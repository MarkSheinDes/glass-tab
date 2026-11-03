// Эффекты: «переливание» выбора, блик за курсором, волна в доке, жидкий глайдер в «Моих сайтах».
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isLowPerf = () => document.documentElement.dataset.perf === 'low';
export const isAnimOff = () => document.body?.dataset.anim === 'off';

// Под выбранным пунктом лежит светлая «капля». При смене выбора она растягивается к новому пункту и стягивается в него.
export function makeGlider(container, itemSel, isSelected) {
  const g = document.createElement('span');
  g.className = 'glide';
  container.prepend(g);
  let last = null;
  function update(animate) {
    const items = [...container.querySelectorAll(itemSel)];
    const sel = items.find(isSelected);
    items.forEach(i => i.classList.toggle('on', i === sel));
    if (!sel || !sel.offsetWidth) { g.style.opacity = 0; return; }
    const r = { l: sel.offsetLeft, t: sel.offsetTop, w: sel.offsetWidth, h: sel.offsetHeight };
    g.style.opacity = 1;
    g.style.top = r.t + 'px';
    g.style.height = r.h + 'px';
    if (last && animate && !reduced && !isLowPerf() && !isAnimOff() && (last.l !== r.l || last.w !== r.w || last.t !== r.t)) {
      // капля растягивается в сторону нового места и стягивается в него (и по горизонтали, и по вертикали)
      const left = Math.min(last.l, r.l), right = Math.max(last.l + last.w, r.l + r.w);
      const top = Math.min(last.t, r.t), bottom = Math.max(last.t + last.h, r.t + r.h);
      g.animate([
        { left: last.l + 'px', width: last.w + 'px', top: last.t + 'px', height: last.h + 'px' },
        { left: left + 'px', width: (right - left) + 'px', top: top + 'px', height: (bottom - top) + 'px', offset: 0.45 },
        { left: r.l + 'px', width: r.w + 'px', top: r.t + 'px', height: r.h + 'px' }
      ], { duration: 320, easing: 'cubic-bezier(.3,.8,.25,1)' });
    }
    g.style.left = r.l + 'px';
    g.style.width = r.w + 'px';
    last = r;
  }
  new ResizeObserver(() => update(false)).observe(container);
  update(false);
  return update;
}

// Эффект увеличения плиток в доке при наведении курсора (macOS Dock Wave с динамическим раздвижением)
export function initDockWave(dockEl) {
  if (!dockEl) return;
  const tilesWrap = dockEl.querySelector('.tiles');
  if (!tilesWrap) return;

  const SPREAD = 85;
  const MAX_SCALE = 0.32;
  let rafId = 0;
  let mouseX = -9999;
  let isInside = false;

  let baseW = 50;
  let baseGap = 10;
  let origCenters = [];

  function measure() {
    const tiles = [...tilesWrap.querySelectorAll('.tile')];
    if (!tiles.length) return;
    baseW = tiles[0].offsetWidth || 50;
    if (tiles.length > 1) {
      baseGap = Math.max(10, tiles[1].offsetLeft - tiles[0].offsetLeft - baseW);
    } else {
      baseGap = 10;
    }
    origCenters = tiles.map(t => t.offsetLeft + baseW / 2);
  }

  function update() {
    rafId = 0;
    const tiles = [...tilesWrap.querySelectorAll('.tile')];
    const n = tiles.length;
    if (!n) return;

    if (!isInside || reduced || isLowPerf() || isAnimOff()) {
      tiles.forEach(t => {
        t.style.transition = 'transform .22s cubic-bezier(.34,1.4,.64,1)';
        t.style.transform = '';
      });
      setTimeout(() => {
        tiles.forEach(t => { t.style.transition = ''; });
      }, 250);
      return;
    }

    if (!origCenters.length || origCenters.length !== n) {
      measure();
    }

    const wrapRect = tilesWrap.getBoundingClientRect();
    const relX = mouseX - wrapRect.left;

    // Если курсор ушёл далеко за пределы блока плиток по горизонтали
    if (relX < -50 || relX > wrapRect.width + 50) {
      tiles.forEach(t => {
        t.style.transition = 'transform .22s cubic-bezier(.34,1.4,.64,1)';
        t.style.transform = '';
      });
      return;
    }

    // Масштаб для каждой плитки по плавной косинусной кривой
    const scales = origCenters.map(center => {
      const dist = Math.abs(relX - center);
      if (dist >= SPREAD) return 1;
      const norm = dist / SPREAD;
      const cosine = 0.5 * (1 + Math.cos(norm * Math.PI));
      return 1 + MAX_SCALE * cosine;
    });

    // Раздвигаем плитки в стороны, чтобы расстояние между краями всегда строго сохранялось
    const scaledWidths = scales.map(s => baseW * s);
    const totalScaled = scaledWidths.reduce((a, b) => a + b, 0) + (n - 1) * baseGap;
    const unscaledTotal = n * baseW + (n - 1) * baseGap;
    const deltaW = totalScaled - unscaledTotal;
    let currentX = -deltaW / 2;

    tiles.forEach((tile, i) => {
      const newCenter = currentX + scaledWidths[i] / 2;
      const tx = newCenter - origCenters[i];
      const lift = (scales[i] - 1) * -10;
      tile.style.transition = 'none';
      tile.style.transform = `translate3d(${tx.toFixed(2)}px, ${lift.toFixed(2)}px, 0) scale(${scales[i].toFixed(3)})`;
      currentX += scaledWidths[i] + baseGap;
    });
  }

  dockEl.addEventListener('pointerenter', e => {
    isInside = true;
    measure();
    mouseX = e.clientX;
    if (!rafId) rafId = requestAnimationFrame(update);
  });

  dockEl.addEventListener('pointermove', e => {
    isInside = true;
    mouseX = e.clientX;
    if (!rafId) rafId = requestAnimationFrame(update);
  });

  dockEl.addEventListener('pointerleave', () => {
    isInside = false;
    mouseX = -9999;
    if (!rafId) rafId = requestAnimationFrame(update);
  });
}
