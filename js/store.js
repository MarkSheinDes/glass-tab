// Маленькое хранилище настроек в localStorage (ключи начинаются с "gt.").
const P = 'gt.';
export function get(key, def) {
  try { const v = localStorage.getItem(P + key); return v === null ? def : JSON.parse(v); } catch (e) { return def; }
}
export function set(key, value) {
  try { localStorage.setItem(P + key, JSON.stringify(value)); } catch (e) { /* переполнение - не критично */ }
}
export function clearAll() {
  Object.keys(localStorage).filter(k => k.startsWith(P)).forEach(k => localStorage.removeItem(k));
}
