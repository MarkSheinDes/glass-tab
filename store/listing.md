# Glass Tab — тексты для карточки в магазине

Копируйте блоки в соответствующие поля Chrome Web Store / Edge Add-ons.
Всё, что в [квадратных скобках], нужно заменить на своё.

## Название (Name, до 45 символов)
- EN: `Glass Tab — Liquid Glass New Tab`
- RU: `Glass Tab — стеклянная новая вкладка`

## Краткое описание (Summary, до 132 символов)
- EN: `Glass-style new tab: smart search with calculator and unit converter, weather, tasks, calendar, focus timer, notes.`
- RU: `Новая вкладка в стиле стекла: умный поиск с калькулятором и единицами, погода, дела, календарь, таймер фокуса, заметки.`

## Подробное описание — EN
Glass Tab turns every new tab into a calm, beautiful glass-style dashboard.

✦ Smart search bar — type a calculation like (25+17)*3, "5 km to miles" or "72 F to C" and get the answer instantly. Searches go through the search engine you chose in your browser.
✦ Weather — current conditions, 24-hour temperature graph, 3-day forecast and a short tip. Celsius or Fahrenheit.
✦ Tasks — a to-do list with a progress ring.
✦ Calendar — month view with today highlighted.
✦ Quick clipboard — click a saved snippet to copy it.
✦ Focus timer — Pomodoro: 25-minute sessions, short and long breaks, with a soft chime.
✦ Notes — a scratchpad that saves automatically.
✦ Bottom dock — your favorite sites with icons, bookmarks, services and AI tools.
✦ 30 hand-tuned animated wallpapers or your own picture, separate for day and night; automatic day/night theme.
✦ Clean by default: only search, clock, weather and the dock. Turn on the widgets you need in Settings.
✦ Make it yours — drag widgets anywhere, hide what you don't need, switch between English and Russian.
✦ Fast on any PC — a power-saver mode turns off blur and effects for older computers; high-contrast mode for readability.

Privacy first: no accounts, no tracking, no ads. Your tasks, notes and settings never leave your browser. The only network requests are the weather (Open-Meteo) and site icons — see the privacy policy.

Works in Chrome, Edge, Brave and Firefox. Not supported in Opera and Yandex Browser: they do not let extensions replace the new tab page.

Free and open source (MIT). If you enjoy it, you can support the project from the settings panel.

## Подробное описание — RU
Glass Tab превращает каждую новую вкладку в спокойную и красивую панель в стиле стекла.

✦ Умная строка поиска — введите (25+17)*3, «5 км в мили» или «25 C в F» и сразу получите ответ. Выбирайте любимую поисковую систему или добавьте свою.
✦ Погода — сейчас, график на 24 часа, прогноз на 3 дня и короткий совет. °C или °F.
✦ Дела — список задач с кольцом прогресса.
✦ Календарь — месяц с подсветкой сегодняшнего дня.
✦ Быстрый буфер — щёлкните по сохранённому тексту, и он скопируется.
✦ Таймер фокуса — Pomodoro: 25 минут работы, короткие и длинные перерывы, мягкий сигнал.
✦ Заметка — блокнот с автосохранением.
✦ Нижняя панель — любимые сайты с иконками, закладки, сервисы и нейросети.
✦ 30 живых обоев или своя картинка, отдельно для дня и ночи; автоматическая смена темы.
✦ По умолчанию чисто: только поиск, время, погода и нижняя панель. Нужные блоки включаются в настройках.
✦ Настройте под себя — перетаскивайте блоки, скрывайте лишнее, переключайте русский и английский.
✦ Быстро на любом ПК — режим экономии отключает размытие и эффекты; режим повышенной контрастности.

Конфиденциальность прежде всего: без аккаунтов, слежки и рекламы. Дела, заметки и настройки не покидают ваш браузер. Единственные сетевые запросы — погода (Open-Meteo) и значки сайтов; подробности в политике конфиденциальности.

Работает в Chrome, Edge, Brave и Firefox. Не поддерживается в Opera и Яндекс Браузере: они не позволяют расширениям заменять страницу новой вкладки.

Бесплатно, код открыт (MIT). Если нравится, поддержать проект можно в настройках.

## Категория
Productivity (Продуктивность)

## Единственное назначение (Single purpose)
Replaces the browser's New Tab page with a customizable dashboard (search, weather, tasks, calendar, focus timer, notes).

## Обоснование разрешений (Permission justification)
- `chrome_url_overrides.newtab` — это и есть основная функция: заменяет страницу новой вкладки.
- `search` — отправляет запрос из строки поиска в поисковик, выбранный пользователем в браузере (Search API). Ничего не читает и не меняет.
- Optional `bookmarks` — запрашивается только по нажатию «Закладки»; показывает список закладок, ничего не изменяет.

## Раздел «Конфиденциальность» (Privacy practices)
- Удалённый код: **нет** (весь код внутри пакета).
- Собираемые данные: **ничего не собирается**. Отметьте галочку, что данные не продаются, не используются не по назначению и не используются для кредитных решений.
- Категории данных: отметьте только «Location» (город вводит сам пользователь, он отправляется погодному сервису; у нас не хранится). Остальные не отмечайте. Подробно: `store/publish-guide.md`.
- URL политики конфиденциальности: https://marksheindes.github.io/glass-tab/privacy.html

## Картинки (папка store/images)
- `screenshot-1..5.png` — 1280×800, для магазина.
- `promo-small-440x280.png` — маленький рекламный баннер (обязателен в Chrome Web Store).
- `promo-marquee-1400x560.png` — большой баннер (необязателен).
- Иконка 128×128 уже в расширении.

## Куда публиковать
1. Chrome Web Store (разовый взнос $5): https://chrome.google.com/webstore/devconsole
2. Microsoft Edge Add-ons (бесплатно, тот же zip): https://partner.microsoft.com/dashboard/microsoftedge
3. Firefox (AMO, бесплатно): загрузите `GlassTab-<версия>-firefox.zip`: https://addons.mozilla.org/developers/ (в нём уже есть идентификатор расширения и отметка «данные не собираются»).
Оба zip собираются командой `python tools/pack.py` → `dist/` (`GlassTab-<версия>.zip` для Chrome/Edge и `...-firefox.zip` для Firefox).
