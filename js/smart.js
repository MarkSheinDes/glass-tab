// Умная строка: калькулятор и перевод единиц. Всё считается прямо в браузере, ничего не отправляется в интернет.
import { t, getLang } from './i18n.js';
import { localeTag } from './region.js';

// ---- калькулятор (без eval): + - * / ^ % и скобки ----
function calc(src) {
  let i = 0;
  const s = src.replace(/\s+/g, '').replace(/,/g, '.').replace(/[×x]/gi, '*').replace(/[÷:]/g, '/');
  const peek = () => s[i];
  function num() {
    const m = /^\d*\.?\d+/.exec(s.slice(i));
    if (!m) throw new Error('num');
    i += m[0].length;
    return parseFloat(m[0]);
  }
  function atom() {
    let v;
    if (peek() === '(') { i++; v = expr(); if (peek() !== ')') throw new Error('par'); i++; } else v = num();
    while (peek() === '%') { i++; v /= 100; }
    return v;
  }
  function power() { const b = atom(); if (peek() === '^') { i++; return Math.pow(b, factor()); } return b; }
  function factor() { if (peek() === '-') { i++; return -factor(); } if (peek() === '+') { i++; return factor(); } return power(); }
  function term() { let v = factor(); while (peek() === '*' || peek() === '/') { const op = s[i++]; const r = factor(); v = op === '*' ? v * r : v / r; } return v; }
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const op = s[i++]; const r = term(); v = op === '+' ? v + r : v - r; } return v; }
  const v = expr();
  if (i !== s.length) throw new Error('tail');
  return v;
}

const fmt = (n, max = 2) => new Intl.NumberFormat(localeTag(), { maximumFractionDigits: max }).format(n);

// название единицы с учётом числа (в русском: 1 миля, 2 мили, 5 миль, 3,11 мили)
const unitName = (key, n) => {
  const v = t(key);
  if (!Array.isArray(v)) return v;
  const cat = new Intl.PluralRules(getLang()).select(n);
  return v[cat === 'one' ? 0 : cat === 'many' ? 2 : 1];
};

// единицы (в обе стороны)
const UNITS = [
  { a: /^(км|km|километр\S*)$/i, b: /^(mi|мил\S*|miles?)$/i, an: 'u_km', bn: 'u_mi', k: 0.621371 },
  { a: /^(кг|kg|килограмм\S*)$/i, b: /^(lb|lbs|фунт\S*|pounds?)$/i, an: 'u_kg', bn: 'u_lb', k: 2.20462 },
  { a: /^(м|m|метр\S*|meters?)$/i, b: /^(ft|фут\S*|feet|foot)$/i, an: 'u_m', bn: 'u_ft', k: 3.28084 }
];

// Возвращает null, если это обычный поисковый запрос. Иначе { kind, title, sub, copy? }
export async function smart(raw) {
  const q = raw.trim();
  if (!q) return null;

  // 1. Перевод физических единиц
  const m = /^([\d\s.,]+?)\s*([a-zа-яё]+)\s+(?:в|to|in|->|→|=)\s+([a-zа-яё]+)$/i.exec(q);
  if (m) {
    const val = parseFloat(m[1].replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(val)) {
      for (const u of UNITS) {
        const w = t('inWord');
        if (u.a.test(m[2]) && u.b.test(m[3])) { const r = val * u.k; return { kind: 'convert', title: `${fmt(r)} ${unitName(u.bn, r)}`, sub: `${fmt(val)} ${unitName(u.an, val)} ${w} ${unitName(u.bn, 2)}`, copy: fmt(r) }; }
        if (u.b.test(m[2]) && u.a.test(m[3])) { const r = val / u.k; return { kind: 'convert', title: `${fmt(r)} ${unitName(u.an, r)}`, sub: `${fmt(val)} ${unitName(u.bn, val)} ${w} ${unitName(u.an, 2)}`, copy: fmt(r) }; }
      }
      if (/^(c|°c|цельси\S*)$/i.test(m[2]) && /^(f|°f|фаренгейт\S*)$/i.test(m[3])) { const v = val * 9 / 5 + 32; return { kind: 'convert', title: `${fmt(v, 1)} °F`, sub: `${fmt(val)} °C ${t('inWord')} °F`, copy: fmt(v, 1) }; }
      if (/^(f|°f|фаренгейт\S*)$/i.test(m[2]) && /^(c|°c|цельси\S*)$/i.test(m[3])) { const v = (val - 32) * 5 / 9; return { kind: 'convert', title: `${fmt(v, 1)} °C`, sub: `${fmt(val)} °F ${t('inWord')} °C`, copy: fmt(v, 1) }; }
    }
  }

  // 2. Калькулятор: есть цифры и хотя бы одна операция
  if (/^[\d\s.,+\-*/×÷:()%^x]+$/i.test(q) && /\d/.test(q) && /[+\-*/×÷^%x:]/i.test(q.replace(/^\s*-/, ''))) {
    try {
      const v = calc(q);
      if (isFinite(v)) return { kind: 'calc', title: `= ${fmt(v, 8)}`, sub: q.replace(/\s+/g, ' '), copy: String(v) };
    } catch (e) { /* не выражение - обычный запрос */ }
  }

  return null;
}
