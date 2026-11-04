// Модуль локализации Glass Tab: поддержка переключения языков RU и EN
import { get, set } from './store.js';

export const TRANSLATIONS = {
  ru: {
    newTabTitle: 'Новая вкладка',
    langLbl: 'Язык интерфейса',

    themeAuto: 'Авто',
    themeDay: 'День',
    themeNight: 'Ночь',

    searchPlaceholder: 'Искать в интернете или ввести адрес…',
    clickToCopy: 'Нажмите, чтобы скопировать',
    copiedToast: 'Скопировано: ',
    copyFailToast: 'Не удалось скопировать',
    chip1: '5 км в мили',
    chip2: '25 C в F',
    chip3: '(25+17)*3',
    chip4: 'Кафе рядом',
    chip5: 'Спросить нейросеть',

    weather: 'Погода',
    weatherLoading: 'загрузка…',
    feelsLike: 'Ощущается как',
    minTemp: 'мин',
    maxTemp: 'макс',
    now: 'Сейчас',
    humidity: 'Влажность',
    wind: 'Ветер',
    kmh: 'км/ч',
    precip: 'Осадки',
    today: 'Сегодня',
    wxSetCity: 'Укажите город',
    wxAskCity: 'Где вы находитесь? Введите город — покажем погоду',
    noData: 'нет данных',
    weatherNice: 'Погода спокойная — хорошего дня!',
    weatherRain: 'Скоро возможны осадки — возьмите зонт.',
    weatherFreeze: 'На улице мороз — оденьтесь теплее.',
    weatherCool: 'Прохладно — пригодится куртка.',
    weatherHot: 'Жарко — не забудьте воду.',
    weatherWind: 'Сильный ветер — будьте осторожны.',

    tasksTitle: 'Дела на сегодня',
    clearDone: 'Очистить готовые',
    clearDoneTitle: 'Удалить завершённые дела',
    taskPlaceholder: 'Добавить дело…',
    taskAdd: 'Добавить',
    tasksEmpty: 'Все дела сделаны — можно выдохнуть',
    taskEditHint: 'Двойной клик для редактирования',
    deleteBtn: 'Удалить',
    markDone: 'Отметить',

    calToday: 'Сегодня',
    calPrevTitle: 'Предыдущий месяц',
    calNextTitle: 'Следующий месяц',


    snipTitle: 'Быстрый буфер',
    snipAdd: 'Добавить сниппет',
    snipNote: 'Нажмите на строку, чтобы скопировать',
    snipEmpty: 'Буфер пуст. Добавьте частые фразы или ссылки.',
    snipPrompt: 'Введите текст:',


    noteTitle: 'Заметка',
    notePlaceholder: 'Быстрая заметка — сохраняется сама',


    dockBookmarks: 'Закладки',
    dockServices: 'Сервисы',
    dockAI: 'Нейросети',
    bookmarksNote: 'Закладки доступны, когда Glass Tab установлен как расширение.',

    wallTitle: 'Обои',
    wallDay: 'День',
    wallNight: 'Ночь',
    wallAnimOn: 'Анимация: вкл',
    wallAnimOff: 'Анимация: выкл',
    wallRandom: 'Случайные',
    wallUpload: 'Своя картинка',
    wallRemove: 'Убрать картинку',
    wallErr: 'Не удалось открыть картинку',

    editBarTitle: 'Режим настройки',
    editBarHint: 'Перетаскивайте блоки мышью, × скрывает блок',
    editBlocksBtn: 'Блоки',
    editResetBtn: 'Сбросить расположение',
    editDoneBtn: 'Готово',
    editBtnTitle: 'Настроить расположение',
    wallBtnTitle: 'Обои',
    setBtnTitle: 'Настройки',
    blocksPanelTitle: 'Блоки на экране',

    w_clock: 'Время и приветствие',
    w_wxpill: 'Погода одной строкой',
    w_theme: 'Тема: Авто / День / Ночь',
    w_search: 'Умная строка поиска',
    w_weather: 'Погода крупно',
    w_tasks: 'Дела',
    w_calendar: 'Календарь',
    w_snippets: 'Быстрый буфер',
    w_note: 'Заметка',
    w_dock: 'Нижняя панель',

    settingsTitle: 'Настройки',
    cityLabel: 'Город для погоды',
    cityPlaceholder: 'Например, Берлин',
    citySearchBtn: 'Найти',
    citySearching: 'Ищу…',
    cityNotFound: 'Город не найден. Проверьте название.',
    cityNow: 'Сейчас: ',
    tempLabel: 'Температура',


    appearanceLabel: 'Оформление и читаемость',
    contrastCheck: 'Повышенная контрастность',
    perfLabel: 'Производительность (для слабых ПК)',
    perfCheck: 'Режим экономии (без размытия)',
    animCheck: 'Анимации интерфейса',


    sitesLabel: 'Мои сайты (плитки в нижней панели)',
    siteNamePlaceholder: 'Название',
    siteUrlPlaceholder: 'Адрес сайта',
    siteAddBtn: '+ Добавить сайт',
    resetAllBtn: 'Сбросить все настройки',
    resetConfirm: 'Сбросить все настройки (расположение блоков, обои, город, дела, заметку)?',
    resetDo: 'Сбросить',
    timerTitle: 'Таймер фокуса',
    timerFocusBtn: 'Фокус',
    timerShortBtn: 'Перерыв',
    timerLongBtn: 'Длинный',
    timer_focus: 'Фокус',
    timer_short: 'Перерыв',
    timer_long: 'Длинный перерыв',
    timerStart: 'Старт',
    timerPause: 'Пауза',
    timerReset: 'Сбросить',
    timerToday: 'Сессий сегодня:',
    timerDoneFocus: 'Сессия завершена — время отдохнуть',
    timerDoneBreak: 'Перерыв закончился — пора за работу',
    windLabel: 'Скорость ветра',
    timeLabel: 'Формат времени',
    weekLabel: 'Неделя начинается с',
    wkMon: 'Пн', wkSun: 'Вс', wkSat: 'Сб',
    mph: 'миль/ч', ms: 'м/с',
    iconsCheck: 'Значки сайтов в панели',
    welcomeTitle: 'Добро пожаловать в Glass Tab',
    welcomeSub: 'Всё уже подобрано под ваш регион — проверьте и укажите город для погоды. Всё можно изменить позже в настройках.',
    servicesLabel: 'Меню «Сервисы» (нижняя панель)',
    servicesAdd: '+ Добавить сервис',
    servicesReset: 'Вернуть сервисы Google',
    pinAddTitle: 'Добавить сайт в панель',
    addBtn: 'Добавить',
    wizNext: 'Далее',
    wizBack: 'Назад',
    wz2Title: 'Что показывать на экране?',
    wz2Sub: 'Начните с чистого экрана или добавьте блоки. Это можно менять в любой момент.',
    preset_min: 'Минимум', presetHint_min: 'Поиск, время и погода',
    preset_prod: 'Продуктивность', presetHint_prod: 'Дела, календарь, таймер, заметка',
    preset_all: 'Всё', presetHint_all: 'Все блоки',
    wz3Title: 'Как это должно выглядеть?',
    wz3Sub: 'Выберите тему и обои — или загрузите свою картинку.',
    rerunSetup: 'Пройти настройку заново',
    welcomeDone: 'Готово',
    welcomeSkip: 'Пропустить',
    widgetsLabel: 'Блоки на экране',
    w_timer: 'Таймер фокуса',
    donateCard: 'Картой или через СБП (CloudTips)',
    donateCopy: 'Скопировать адрес',
    donateCopied: 'Адрес скопирован',
    donateWarn: 'Отправляйте только USDT в сети Tron (TRC20). Переводы в других сетях будут потеряны.',
    donateBtn: 'Поддержать проект',
    privacyLink: 'Политика конфиденциальности',
    cancelBtn: 'Отмена',

    inWord: 'в',
    u_km: 'км', u_mi: ['миля', 'мили', 'миль'], u_kg: 'кг', u_lb: ['фунт', 'фунта', 'фунтов'], u_m: 'м', u_ft: ['фут', 'фута', 'футов'],
    bmPerm: 'Чтобы показать закладки, браузер спросит разрешение «Читать и изменять закладки». Расширение только показывает список и ничего не меняет.',
    bmAllow: 'Разрешить',
    bmEmpty: 'Закладок пока нет.',
    bmFolder: 'Папка',
    hideBlock: 'Скрыть блок',
    snipDefaults: [
      { title: 'Email', text: 'my-email@example.com' },
      { title: 'Телефон', text: '+7 (999) 000-00-00' },
      { title: 'Шаблон ответа', text: 'Здравствуйте! Спасибо за обращение, скоро вернусь с ответом.' }
    ],
    snipNew: 'Новый сниппет',
    snipTitlePh: 'Название (например, ИНН)',
    snipTextPh: 'Текст для копирования',
    snipSave: 'Сохранить',
    snipAdded: 'Сниппет добавлен: ',
    dTomorrow: 'Завтра',
    dYesterday: 'Вчера',
    dIn: 'Через {n} дн.',
    dAgo: '{n} дн. назад',
    ariaTheme: 'Тема',
    ariaDock: 'Нижняя панель',
    tipFirst: 'Совет: кнопка внизу справа включает режим настройки — блоки можно двигать и скрывать',
    wmo: { 0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Пасмурно', 45: 'Туман', 48: 'Изморозь', 51: 'Лёгкая морось', 53: 'Морось', 55: 'Сильная морось', 56: 'Ледяная морось', 57: 'Ледяная морось', 61: 'Небольшой дождь', 63: 'Дождь', 65: 'Сильный дождь', 66: 'Ледяной дождь', 67: 'Ледяной дождь', 71: 'Небольшой снег', 73: 'Снег', 75: 'Сильный снег', 77: 'Снежная крупа', 80: 'Ливень', 81: 'Сильный ливень', 82: 'Очень сильный ливень', 85: 'Снегопад', 86: 'Сильный снегопад', 95: 'Гроза', 96: 'Гроза с градом', 99: 'Сильная гроза с градом' },
    greetMorning: 'Доброе утро!',
    greetDay: 'Добрый день!',
    greetEvening: 'Добрый вечер!',
    greetNight: 'Доброй ночи!'
  },
  en: {
    newTabTitle: 'New Tab',
    langLbl: 'Interface language',

    themeAuto: 'Auto',
    themeDay: 'Day',
    themeNight: 'Night',

    searchPlaceholder: 'Search the web or enter address…',
    clickToCopy: 'Click to copy',
    copiedToast: 'Copied: ',
    copyFailToast: 'Failed to copy',
    chip1: '5 km to miles',
    chip2: '72 F to C',
    chip3: '(25+17)*3',
    chip4: 'Cafes nearby',
    chip5: 'Ask AI',

    weather: 'Weather',
    weatherLoading: 'loading…',
    feelsLike: 'Feels like',
    minTemp: 'min',
    maxTemp: 'max',
    now: 'Now',
    humidity: 'Humidity',
    wind: 'Wind',
    kmh: 'km/h',
    precip: 'Precipitation',
    today: 'Today',
    wxSetCity: 'Set your city',
    wxAskCity: 'Where are you? Enter your city to see the forecast',
    noData: 'no data',
    weatherNice: 'Pleasant weather — have a great day!',
    weatherRain: 'Rain is possible soon — take an umbrella.',
    weatherFreeze: 'Freezing cold — dress warmly.',
    weatherCool: 'Chilly — a jacket will come in handy.',
    weatherHot: 'Hot outside — stay hydrated.',
    weatherWind: 'Strong wind — stay safe.',

    tasksTitle: "Today's Tasks",
    clearDone: 'Clear completed',
    clearDoneTitle: 'Clear completed tasks',
    taskPlaceholder: 'Add a task…',
    taskAdd: 'Add',
    tasksEmpty: 'All tasks completed — take a breath',
    taskEditHint: 'Double-click to edit',
    deleteBtn: 'Delete',
    markDone: 'Mark done',

    calToday: 'Today',
    calPrevTitle: 'Previous month',
    calNextTitle: 'Next month',


    snipTitle: 'Quick Clipboard',
    snipAdd: 'Add snippet',
    snipNote: 'Click a row to copy',
    snipEmpty: 'Clipboard is empty. Add a snippet above.',
    snipPrompt: 'Enter text:',


    noteTitle: 'Notes',
    notePlaceholder: 'Quick note — saves automatically',


    dockBookmarks: 'Bookmarks',
    dockServices: 'Services',
    dockAI: 'AI Tools',
    bookmarksNote: 'Bookmarks are available when Glass Tab is installed as an extension.',

    wallTitle: 'Wallpapers',
    wallDay: 'Day',
    wallNight: 'Night',
    wallAnimOn: 'Animation: on',
    wallAnimOff: 'Animation: off',
    wallRandom: 'Random',
    wallUpload: 'Upload image',
    wallRemove: 'Remove image',
    wallErr: 'Couldn’t open that image',

    editBarTitle: 'Edit Mode',
    editBarHint: 'Drag widgets with the mouse, × hides a widget',
    editBlocksBtn: 'Widgets',
    editResetBtn: 'Reset layout',
    editDoneBtn: 'Done',
    editBtnTitle: 'Customize layout',
    wallBtnTitle: 'Wallpapers',
    setBtnTitle: 'Settings',
    blocksPanelTitle: 'Widgets on Screen',

    w_clock: 'Clock & Greeting',
    w_wxpill: 'Weather pill',
    w_theme: 'Theme: Auto / Day / Night',
    w_search: 'Search bar',
    w_weather: 'Weather forecast',
    w_tasks: 'Tasks',
    w_calendar: 'Calendar',
    w_snippets: 'Quick clipboard',
    w_note: 'Notes',
    w_dock: 'Bottom dock',

    settingsTitle: 'Settings',
    cityLabel: 'Weather City',
    cityPlaceholder: 'e.g. Berlin',
    citySearchBtn: 'Find',
    citySearching: 'Searching…',
    cityNotFound: 'City not found. Check the spelling.',
    cityNow: 'Current: ',
    tempLabel: 'Temperature',


    appearanceLabel: 'Appearance & Accessibility',
    contrastCheck: 'High contrast',
    perfLabel: 'Performance (low-spec PCs)',
    perfCheck: 'Power saver (no blur)',
    animCheck: 'Interface animations',


    sitesLabel: 'My Sites (bottom dock tiles)',
    siteNamePlaceholder: 'Name',
    siteUrlPlaceholder: 'Site address',
    siteAddBtn: '+ Add website',
    resetAllBtn: 'Reset all settings',
    resetConfirm: 'Reset all settings (widgets layout, wallpaper, city, tasks, notes)?',
    resetDo: 'Reset',
    timerTitle: 'Focus timer',
    timerFocusBtn: 'Focus',
    timerShortBtn: 'Break',
    timerLongBtn: 'Long',
    timer_focus: 'Focus',
    timer_short: 'Break',
    timer_long: 'Long break',
    timerStart: 'Start',
    timerPause: 'Pause',
    timerReset: 'Reset',
    timerToday: 'Sessions today:',
    timerDoneFocus: 'Session complete — time for a break',
    timerDoneBreak: 'Break is over — back to work',
    windLabel: 'Wind speed',
    timeLabel: 'Time format',
    weekLabel: 'Week starts on',
    wkMon: 'Mon', wkSun: 'Sun', wkSat: 'Sat',
    mph: 'mph', ms: 'm/s',
    iconsCheck: 'Site icons in the dock',
    welcomeTitle: 'Welcome to Glass Tab',
    welcomeSub: 'Everything is already set for your region — check it and add your city for the weather. You can change it all later in Settings.',
    servicesLabel: 'Services menu (dock)',
    servicesAdd: '+ Add service',
    servicesReset: 'Reset to Google services',
    pinAddTitle: 'Add a site to the dock',
    addBtn: 'Add',
    wizNext: 'Next',
    wizBack: 'Back',
    wz2Title: 'What should be on screen?',
    wz2Sub: 'Start clean or add widgets. You can change this any time.',
    preset_min: 'Minimal', presetHint_min: 'Search, time and weather',
    preset_prod: 'Productivity', presetHint_prod: 'Tasks, calendar, timer, notes',
    preset_all: 'Everything', presetHint_all: 'All widgets',
    wz3Title: 'How should it look?',
    wz3Sub: 'Pick a theme and a wallpaper — or upload your own picture.',
    rerunSetup: 'Run setup again',
    welcomeDone: 'Done',
    welcomeSkip: 'Skip',
    widgetsLabel: 'Widgets on screen',
    w_timer: 'Focus timer',
    donateCard: 'Card or bank transfer (CloudTips)',
    donateCopy: 'Copy address',
    donateCopied: 'Address copied',
    donateWarn: 'Send only USDT on the Tron network (TRC20). Funds sent on other networks will be lost.',
    donateBtn: 'Support the project',
    privacyLink: 'Privacy policy',
    cancelBtn: 'Cancel',

    inWord: 'to',
    u_km: 'km', u_mi: 'mi', u_kg: 'kg', u_lb: 'lb', u_m: 'm', u_ft: 'ft',
    bmPerm: 'To show your bookmarks, the browser will ask for the “Read and change bookmarks” permission. The extension only displays the list and changes nothing.',
    bmAllow: 'Allow',
    bmEmpty: 'No bookmarks yet.',
    bmFolder: 'Folder',
    hideBlock: 'Hide widget',
    snipDefaults: [
      { title: 'Email', text: 'my-email@example.com' },
      { title: 'Phone', text: '+1 (555) 000-0000' },
      { title: 'Reply template', text: 'Hello! Thanks for reaching out — I’ll get back to you shortly.' }
    ],
    snipNew: 'New snippet',
    snipTitlePh: 'Title (e.g. Email)',
    snipTextPh: 'Text to copy',
    snipSave: 'Save',
    snipAdded: 'Snippet added: ',
    dTomorrow: 'Tomorrow',
    dYesterday: 'Yesterday',
    dIn: 'In {n} d.',
    dAgo: '{n} d. ago',
    ariaTheme: 'Theme',
    ariaDock: 'Bottom dock',
    tipFirst: 'Tip: the button at the bottom right turns on edit mode — drag widgets around or hide them',
    wmo: { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Showers', 81: 'Heavy showers', 82: 'Violent showers', 85: 'Snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm with hail' },
    greetMorning: 'Good morning!',
    greetDay: 'Good afternoon!',
    greetEvening: 'Good evening!',
    greetNight: 'Good night!'
  }
};

// Основной язык — английский; русский включается сам, если браузер на русском (и родственных), или вручную в настройках.
const detectLang = () => /^(ru|uk|be|kk)\b/i.test(navigator.language || '') ? 'ru' : 'en';
export function getLang() {
  return get('lang', null) || detectLang();
}

export function setLang(lang) {
  set('lang', lang);
  document.documentElement.lang = lang;
  applyI18n();
  document.dispatchEvent(new CustomEvent('gt:lang', { detail: { lang } }));
}

export function t(key) {
  const lang = getLang();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS.en && TRANSLATIONS.en[key]) || key;
}

export function applyI18n() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.title = t('newTabTitle');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (key) el.placeholder = t(key);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    if (key) el.setAttribute('aria-label', t(key));
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (key) {
      const val = t(key);
      el.title = val;
      if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', val);
    }
  });
}
