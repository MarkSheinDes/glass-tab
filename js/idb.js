// Крошечное хранилище для больших файлов (свои обои) в IndexedDB: localStorage для картинок слишком мал.
const DB = 'glasstab', STORE = 'blobs';

function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function run(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, mode), req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); res(req && req.result); };
    tx.onerror = tx.onabort = () => { db.close(); rej(tx.error); };
  });
}
export const idbGet = key => run('readonly', s => s.get(key));
export const idbPut = (key, blob) => run('readwrite', s => s.put(blob, key));
export const idbDel = key => run('readwrite', s => s.delete(key));
export const idbClear = () => run('readwrite', s => s.clear());
