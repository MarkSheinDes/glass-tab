# Публикация Glass Tab в Chrome Web Store: пошагово

Все тексты для копирования лежат в `store/listing.md`, картинки в `store/images`, пакет: `dist/GlassTab-1.0.0.zip`.
Кабинет: https://chrome.google.com/webstore/devconsole (войдите в аккаунт, в котором платили взнос $5).
Названия кнопок в магазине могут чуть отличаться: ориентируйтесь на смысл.

## 0. Что должно быть под рукой
- `dist/GlassTab-1.0.0.zip` (Chrome / Edge). Для Firefox отдельный: `dist/GlassTab-1.0.0-firefox.zip`.
- Из `store/images`: `screenshot-1.png`…`screenshot-5.png`, `promo-small-440x280.png`, `promo-marquee-1400x560.png`. (Скриншотов нужно от 1 до 5; шестой, `screenshot-6.png`, не загружайте.)
- Политика: https://marksheindes.github.io/glass-tab/privacy.html

## 1. Новый элемент
1. Кнопка **«Add new item»** (Добавить элемент) → перетащите `GlassTab-1.0.0.zip` → **Upload**.
2. Если магазин ругается на манифест, скопируйте текст ошибки и пришлите мне.

## 2. Вкладка «Store listing» (Описание)
- **Description (описание):** вставьте «Подробное описание — EN» из `listing.md`.
- **Category:** Productivity.
- **Language:** English (основной язык). Затем **«Add language» → Russian** и вставьте русские название, краткое и подробное описание из `listing.md` (необязательно, но полезно).
- **Icon:** обычно берётся из пакета (128×128).
- **Screenshots:** загрузите `screenshot-1.png` … `screenshot-5.png`.
- **Small promo tile:** `promo-small-440x280.png`. **Marquee:** `promo-marquee-1400x560.png` (необязательно).
- **Homepage URL / Support URL (если спросит):** https://github.com/MarkSheinDes/glass-tab

## 3. Вкладка «Privacy» (Конфиденциальность)
1. **Single purpose description:**
   `Replaces the browser's New Tab page with a customizable dashboard (search, weather, tasks, calendar, notes, focus timer).`
2. **Permission justification** (по каждому пункту, что спросит; раньше был ещё пункт про доступ к хостам, в версии 1.0.0 его уже нет):
   - `bookmarks` (необязательное разрешение): `Requested only when the user clicks “Bookmarks” in the dock, to display their bookmarks list. Read-only; nothing is sent or modified.`
3. **Remote code:** `No, I am not using remote code`.
4. **Data usage:** отметьте **Location** (пользователь вводит название города, оно отправляется погодному сервису; мы его не собираем и не храним у себя). Остальные категории не отмечайте. Затем поставьте три галочки (данные не продаются, не используются не по назначению, не используются для кредитных решений).
5. **Privacy policy URL:** https://marksheindes.github.io/glass-tab/privacy.html

## 4. Вкладка «Distribution» (Распространение)
- **Visibility:** Public. **Regions:** All regions.
- **Payments / Pricing:** бесплатно.

## 5. Отправка
1. Вверху нажмите **«Submit for review»** (Отправить на проверку). Если магазин пишет, чего не хватает, исправьте (красные пункты в левом меню).
2. Выберите публиковать сразу после проверки (по умолчанию).
3. Проверка занимает от нескольких часов до нескольких дней. Письмо придёт на почту аккаунта.

## 6. Если отклонили
Пришлите мне письмо с причиной целиком. Чаще всего причины: разрешения, описание или политика конфиденциальности. Исправим и отправим обновление версии 1.0.1.

## Edge Add-ons (бесплатно, тот же zip)
https://partner.microsoft.com/dashboard/microsoftedge → «Create new extension» → загрузить тот же `GlassTab-1.0.0.zip` → заполнить те же тексты, категория Productivity, политика та же. Edge не просит оплаты.

## Firefox (по желанию)
https://addons.mozilla.org/developers/ → «Submit a New Add-on» → загрузить `GlassTab-1.0.0-firefox.zip`. Firefox может попросить исходный код: он открытый, ссылка https://github.com/MarkSheinDes/glass-tab.
