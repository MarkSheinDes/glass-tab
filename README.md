# Glass Tab

A calm, glass-style new tab page for Chrome, Edge, Brave and Firefox.
Smart search (calculator and unit converter), weather, tasks, calendar, focus timer, notes, quick clipboard, 30 wallpapers or your own picture, a customizable dock. English and Russian.

Not supported: Opera and Yandex Browser — they block extensions from replacing the new tab page.

**Privacy first:** no accounts, no analytics, no ads. Everything you create stays in your browser. See the [privacy policy](https://marksheindes.github.io/glass-tab/privacy.html).

## Install from source
1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose this folder.

## Build store packages
```
python tools/pack.py
```
creates `dist/GlassTab-<version>.zip` (Chrome / Edge) and `dist/GlassTab-<version>-firefox.zip`.

## Project layout
- `newtab.html`, `css/`, `js/` — the extension (plain HTML/CSS/JS, no build step, no dependencies)
- `_locales/` — extension name and description (en, ru)
- `store/` — store listing texts and images
- `docs/` — privacy policy (GitHub Pages)
- `tools/pack.py` — packaging script

## License
[MIT](LICENSE)

---

# Glass Tab (по-русски)

Спокойная новая вкладка в стиле стекла для Chrome, Edge, Brave и Firefox: умный поиск с калькулятором и конвертером единиц, погода, дела, календарь, таймер фокуса, заметки, быстрый буфер, 30 обоев или своя картинка, настраиваемая нижняя панель. Интерфейс на английском и русском.

Не поддерживаются Opera и Яндекс Браузер: они не позволяют расширениям заменять страницу новой вкладки.

Конфиденциальность: без аккаунтов, аналитики и рекламы, все данные остаются в вашем браузере.

Установка из исходников: `chrome://extensions` → «Режим разработчика» → «Загрузить распакованное» → выбрать эту папку. Лицензия MIT.
