(function () {
    if (document.getElementById('hyde-chat-host')) return;

    // --- 1. ПАРАМЕТРИ ТА КЕШУВАННЯ ---
    let CLIENT_ID = 'unknown_client';
    let THEME_COLOR = '#0291C0'; // Дефолтний колір (якщо база не відповість)
    let CHAT_TITLE_CUSTOM = null;

    const currentScript = document.currentScript || document.querySelector('script[src*="chat.js"]');
    if (currentScript) {
        CLIENT_ID = currentScript.getAttribute('data-client-id') || CLIENT_ID;
    }

    // --- 2. СТВОРЕННЯ SHADOW DOM ---
    const host = document.createElement('div');
    host.id = 'hyde-chat-host';
    host.style.cssText = 'position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647;';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // --- 3. ПЕРЕКЛАДИ ТА ІКОНКИ ---
    const translations = {
        uk: { title: "Підтримка", greeting: "Привіт! Чим допомогти?", placeholder: "Пишіть...", close: "Закрити", attach: "Прикріпити фото/файл", voiceMsg: "Голосове повідомлення", send: "Надіслати", recording: "Запис:", file: "Файл", audioMsg: "Аудіо", micError: "Не вдалося отримати доступ.", download: "Завантажити", prevMsgs: "Попередні повідомлення", bubbleHelp: "Потрібна допомога?", newMsg: "Нове повідомлення", waitManager: "Шукаємо вільного спеціаліста ⏳ Залиште свій номер телефону, щоб ми не втратили зв'язок, якщо ви закриєте сайт!", specialistJoined: "Спеціаліст підключився до чату ✅" },
        en: { title: "Support", greeting: "Hello! How can we help?", placeholder: "Type a message...", close: "Close", attach: "Attach file", voiceMsg: "Voice message", send: "Send", recording: "Recording:", file: "File", audioMsg: "Audio", micError: "Mic error.", download: "Download", prevMsgs: "Previous messages", bubbleHelp: "Need help?", newMsg: "New message", waitManager: "Looking for an available specialist ⏳ Please leave your phone number so we don't lose touch if you leave the site!", specialistJoined: "Specialist joined the chat ✅" },
        pl: { title: "Wsparcie", greeting: "Cześć! W czym możemy pomóc?", placeholder: "Napisz...", close: "Zamknij", attach: "Dołącz zdjęcie/PDF", voiceMsg: "Wiadomość głosowa", send: "Wyślij", recording: "Nagrywanie:", file: "Plik", audioMsg: "Audio", micError: "Błąd mikrofonu.", download: "Pobierz", prevMsgs: "Poprzednie wiadomości", bubbleHelp: "Potrzebujesz pomocy?", newMsg: "Nowa wiadomość", waitManager: "Szukamy wolnego specjalisty ⏳ Zostaw swój numer telefonu, abyśmy nie stracili kontaktu, jeśli zamkniesz stronę!", specialistJoined: "Specjalista dołączył do czatu ✅" },
        ru: { title: "Поддержка", greeting: "Здравствуйте! Чем помочь?", placeholder: "Напишите...", close: "Закрыть", attach: "Прикрепить файл", voiceMsg: "Голосовое сообщение", send: "Отправить", recording: "Запись:", file: "Файл", audioMsg: "Аудио", micError: "Ошибка микрофона.", download: "Скачать", prevMsgs: "Предыдущие сообщения", bubbleHelp: "Нужна помощь?", newMsg: "Новое сообщение", waitManager: "Ищем свободного специалиста ⏳ Оставьте свой номер телефона, чтобы мы не потеряли связь, если вы закроете сайт!", specialistJoined: "Специалист подключился к чату ✅" }
    };

    const htmlLang = document.documentElement.lang.toLowerCase();
    let lang = 'uk';
    if (htmlLang.includes('en')) lang = 'en';
    else if (htmlLang.includes('pl')) lang = 'pl';
    else if (htmlLang.includes('ru')) lang = 'ru';

    const t = translations[lang];
    const CHAT_TITLE = CHAT_TITLE_CUSTOM || t.title;

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    const icons = {
        chat: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
        close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        mic: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
        send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
        clip: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
        file: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>'
    };

    // --- 4. СТИЛІ (З CSS-ЗМІННОЮ) ---
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        :host {
            --hyde-theme: ${THEME_COLOR}; /* Базовий колір */
        }
        * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }
        #hyde-chat-widget { position: absolute; bottom: 0; right: 0; width: 100%; height: 100%; pointer-events: none; }
        
        #hyde-toggle-btn, #hyde-chat-window, #hyde-greeting-bubble, #hyde-lightbox { pointer-events: auto; }

        #hyde-toggle-btn { position: absolute; bottom: 20px; right: 20px; width: 64px; height: 60px; background: var(--hyde-theme); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15); transition: transform 0.3s ease, background 0.3s ease; z-index: 2; }
        
        #hyde-unread-badge { position: absolute; top: -4px; right: -4px; background: #ff4d4f; color: white; font-size: 12px; font-weight: bold; width: 22px; height: 22px; border-radius: 50%; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); border: 2px solid #fff; z-index: 3; }
        #hyde-unread-badge.show { display: flex; }

        #hyde-greeting-bubble { position: absolute; bottom: 95px; right: 20px; background: #ffffff; padding: 12px 18px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15); font-size: 14px; color: #333; width: max-content; max-width: 280px; opacity: 0; visibility: hidden; transform: translateY(15px) scale(0.95); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer; z-index: 1; border: 1px solid rgba(0,0,0,0.05); }
        #hyde-greeting-bubble.show { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }
        #hyde-greeting-bubble::after { content: ''; position: absolute; bottom: -6px; right: 26px; width: 12px; height: 12px; background: #ffffff; transform: rotate(45deg); box-shadow: 4px 4px 4px rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.05); border-right: 1px solid rgba(0,0,0,0.05); }
        #hyde-greeting-close { position: absolute; top: -8px; right: -8px; background: #ff4d4f; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.2); line-height: 1; z-index: 3; }
        
        #hyde-chat-window { opacity: 0; visibility: hidden; pointer-events: none !important; transform: translateY(20px) scale(0.95); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); width: 340px; height: 540px; max-height: calc(100vh - 110px); background: #ffffff; border-radius: 18px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; position: absolute; bottom: 95px; right: 20px; overflow: hidden; border: 1px solid rgba(0,0,0,0.05); z-index: 3; }
        #hyde-chat-window.open { opacity: 1; visibility: visible; pointer-events: auto !important; transform: translateY(0) scale(1); }
        
        #hyde-chat-header { background: var(--hyde-theme); color: white; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; font-weight: 600; font-size: 16px; transition: background 0.3s ease; }
        #hyde-close-btn { background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 50%; }
        #hyde-chat-messages { flex: 1; padding: 15px; overflow-y: auto; background: #f8f9fa; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
        
        .hyde-msg { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.4; max-width: 85%; word-wrap: break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.3s ease; }
        .hyde-msg.user { background: var(--hyde-theme); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        .hyde-msg.bot { background: #ffffff; color: #333; align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid #eee; }
        
        .hyde-system-msg { font-size: 12px; text-align: center; color: #555; background: #e9ecef; border: none; align-self: center; border-radius: 12px; padding: 6px 12px; margin: 5px 0; }
        
        .hyde-msg img { max-width: 100%; max-height: 200px; border-radius: 8px; display: block; object-fit: cover; margin-top: 5px; cursor: zoom-in; }
        .hyde-audio-player { max-width: 100%; height: 40px; margin-top: 5px; border-radius: 20px; outline: none; }
        .hyde-attachment { display: flex; align-items: center; gap: 8px; margin-top: 6px; padding: 8px 10px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 12px; text-decoration: none; color: inherit; }
        .hyde-msg.bot .hyde-attachment { background: rgba(0,0,0,0.05); }
        .hyde-attachment span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
        
        #hyde-lightbox { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center; cursor: zoom-out; opacity: 0; transition: opacity 0.2s ease; }
        #hyde-lightbox.active { display: flex; opacity: 1; }
        #hyde-lightbox img { max-width: 90%; max-height: 90%; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); object-fit: contain; }

        #hyde-chat-footer { padding: 10px 12px; display: flex; align-items: center; gap: 6px; background: #ffffff; border-top: 1px solid #eaeaea; }
        #hyde-file-input { display: none; }
        #hyde-chat-input { flex: 1; border: 1px solid #e0e0e0; border-radius: 20px; padding: 10px 12px; font-size: 16px !important; outline: none; background: #f8f9fa; width: 100%; margin: 0; transition: border-color 0.3s ease; }
        #hyde-chat-input:focus { border-color: var(--hyde-theme); background: #ffffff; }
        #hyde-record-timer { display: none; flex: 1; align-items: center; justify-content: center; border: 1px solid #ffccc7; border-radius: 20px; padding: 9px 10px; font-size: 14px; background: #fff0f0; color: #ff4d4f; font-weight: 500; }
        .hyde-blink-dot { animation: blink 1s infinite; margin-right: 6px; font-size: 10px; }
        
        .hyde-action-group { display: flex; gap: 2px; }
        .hyde-btn { background: none; border: none; cursor: pointer; color: #757575; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 50%; }
        .hyde-btn.primary-btn { color: var(--hyde-theme); padding-left: 8px; transition: color 0.3s ease; }
        .hyde-btn.recording-active { color: #ff4d4f; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        
        .hyde-file-preview { position: absolute; bottom: 100%; left: 0; right: 0; background: #f8f9fa; border-top: 1px solid #eaeaea; padding: 8px 16px; display: none; align-items: center; justify-content: space-between; font-size: 12px; color: #555; }
        .hyde-file-preview.active { display: flex; }
        .hyde-file-preview-name { display: flex; align-items: center; gap: 8px; overflow: hidden; }
        .hyde-file-preview-name span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
        #hyde-cancel-file-btn { color: #ff4d4f; background: none; border: none; cursor: pointer; font-size: 16px; line-height: 1; }

        @media (max-width: 480px) {
            #hyde-chat-window { bottom: 0; right: 0; width: 100%; height: 100%; max-height: 100dvh; border-radius: 0; border: none; }
            #hyde-chat-window.open ~ #hyde-toggle-btn, #hyde-chat-window.open ~ #hyde-greeting-bubble { display: none !important; }
        }
    `;
    shadow.appendChild(styleSheet);

    // --- 5. HTML СТРУКТУРА ---
    const widgetWrapper = document.createElement('div');
    widgetWrapper.id = 'hyde-chat-widget';
    widgetWrapper.innerHTML = `
        <div id="hyde-lightbox"><img id="hyde-lightbox-img" src="" alt="Zoomed Image"></div>
        
        <div id="hyde-greeting-bubble">
            <button id="hyde-greeting-close" title="${t.close}">&times;</button>
            <div id="hyde-bubble-title" style="font-weight: 500; margin-bottom: 2px;">${t.bubbleHelp}</div>
            <div id="hyde-bubble-text" style="color: #666; font-size: 13px; word-break: break-word;">${escapeHTML(t.greeting)}</div>
        </div>
        
        <div id="hyde-chat-window">
            <div id="hyde-chat-header">
                <div style="display: flex; align-items: center; gap: 8px;"><b id="hyde-chat-title-el">${escapeHTML(CHAT_TITLE)}</b></div>
                <button id="hyde-close-btn" title="${t.close}">${icons.close}</button>
            </div>
            <div id="hyde-chat-messages">
                <div class="hyde-msg bot" id="hyde-first-msg">${escapeHTML(t.greeting)}</div>
            </div>
            <div style="position: relative;">
                <div id="hyde-file-preview" class="hyde-file-preview">
                    <div class="hyde-file-preview-name">${icons.file}<span id="hyde-file-name"></span></div>
                    <button id="hyde-cancel-file-btn">&times;</button>
                </div>
                <div id="hyde-chat-footer">
                    <div class="hyde-action-group">
                        <button class="hyde-btn" id="hyde-attach-btn" title="${t.attach}">${icons.clip}</button>
                        <input type="file" id="hyde-file-input" accept="image/jpeg, image/png, image/gif, image/webp, .pdf, application/pdf, .doc, .docx, audio/*">
                        <button class="hyde-btn" id="hyde-mic-btn" title="${t.voiceMsg}">${icons.mic}</button>
                    </div>
                    <input type="text" id="hyde-chat-input" placeholder="${t.placeholder}">
                    <div id="hyde-record-timer"><span class="hyde-blink-dot">🔴</span> <span id="hyde-record-time">00:00</span></div>
                    <button class="hyde-btn primary-btn" id="hyde-send-btn" title="${t.send}">${icons.send}</button>
                </div>
            </div>
        </div>
        <button id="hyde-toggle-btn">
            ${icons.chat}
            <span id="hyde-unread-badge">0</span>
        </button>
    `;
    shadow.appendChild(widgetWrapper);

    // --- 6. ЛОГІКА ДОДАТКУ ---
    const WEBHOOK_URL = 'https://flow.hyde-media.com/webhook/3db1a162-e007-4c8a-a761-8e8e797f5b0e'; // Новий захищений вебхук повідомлень
    const CONFIG_URL = 'https://flow.hyde-media.com/webhook/chat-config'; // Новий вебхук для налаштувань

    function generateUUID() {
        let d = new Date().getTime();
        let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16;
            if (d > 0) r = (d + r) % 16 | 0, d = Math.floor(d / 16);
            else r = (d2 + r) % 16 | 0, d2 = Math.floor(d2 / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    const SESSION_KEY = 'hyde_chat_session';
    const ACTIVITY_KEY = 'hyde_last_activity';
    const SESSION_DATE_KEY = 'hyde_session_date';

    function initSession() {
        const today = new Date().toLocaleDateString(); 
        let sid = localStorage.getItem(SESSION_KEY);
        const sessionDate = localStorage.getItem(SESSION_DATE_KEY);
        if (!sid || sessionDate !== today) {
            sid = generateUUID();
            localStorage.setItem(SESSION_KEY, sid);
            localStorage.setItem(SESSION_DATE_KEY, today);
        }
        return sid;
    }

    function updateActivity() { localStorage.setItem(ACTIVITY_KEY, Date.now().toString()); }
    function isSafeUrl(url) { return url ? /^(https?|blob):/i.test(url) : false; }

    const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    notificationSound.volume = 0.5;

    const toggle = shadow.querySelector('#hyde-toggle-btn');
    const badge = shadow.querySelector('#hyde-unread-badge');
    const closeBtn = shadow.querySelector('#hyde-close-btn');
    const win = shadow.querySelector('#hyde-chat-window');
    const input = shadow.querySelector('#hyde-chat-input');
    const sendBtn = shadow.querySelector('#hyde-send-btn');
    const micBtn = shadow.querySelector('#hyde-mic-btn');
    const attachBtn = shadow.querySelector('#hyde-attach-btn');
    const fileInput = shadow.querySelector('#hyde-file-input');
    const msgContainer = shadow.querySelector('#hyde-chat-messages');
    const filePreview = shadow.querySelector('#hyde-file-preview');
    const fileNameSpan = shadow.querySelector('#hyde-file-name');
    const cancelFileBtn = shadow.querySelector('#hyde-cancel-file-btn');
    const recordTimer = shadow.querySelector('#hyde-record-timer');
    const recordTimeSpan = shadow.querySelector('#hyde-record-time');
    
    const greetingBubble = shadow.querySelector('#hyde-greeting-bubble');
    const greetingClose = shadow.querySelector('#hyde-greeting-close');
    const bubbleTitle = shadow.querySelector('#hyde-bubble-title');
    const bubbleText = shadow.querySelector('#hyde-bubble-text');
    const titleEl = shadow.querySelector('#hyde-chat-title-el');
    const firstMsgEl = shadow.querySelector('#hyde-first-msg');
    
    const lightbox = shadow.querySelector('#hyde-lightbox');
    const lightboxImg = shadow.querySelector('#hyde-lightbox-img');

    let selectedFile = null;
    let historyLoaded = false; 

    let hasVisited = localStorage.getItem('hyde_has_visited');
    let unreadCount = parseInt(localStorage.getItem('hyde_unread_count') || '0', 10);

    // --- 7. ФУНКЦІЯ ЗАВАНТАЖЕННЯ КОНФІГУ З N8N/NOCODB ---
    function applyConfig(config) {
        if (config.theme_color) host.style.setProperty('--hyde-theme', config.theme_color);
        if (config.chat_title && titleEl) titleEl.innerText = config.chat_title;
        if (config.greeting) {
            if (bubbleText) bubbleText.innerText = config.greeting;
            if (firstMsgEl && !historyLoaded) firstMsgEl.innerText = config.greeting;
        }
    }

    async function fetchConfig() {
        const cacheKey = 'hyde_config_' + CLIENT_ID;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try { applyConfig(JSON.parse(cached)); } catch(e) {}
        }
        try {
            const res = await fetch(`${CONFIG_URL}?clientId=${CLIENT_ID}`);
            if (res.ok) {
                const config = await res.json();
                localStorage.setItem(cacheKey, JSON.stringify(config));
                applyConfig(config);
            }
        } catch(e) { console.error("Помилка завантаження конфігу:", e); }
    }

    function setUnreadCount(count) {
        unreadCount = count;
        localStorage.setItem('hyde_unread_count', count.toString());
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }
    setUnreadCount(unreadCount); 

    setTimeout(() => {
        if (!hasVisited && !win.classList.contains('open')) {
            greetingBubble.classList.add('show');
            notificationSound.play().catch(()=>{}); 
            setUnreadCount(unreadCount + 1); 
            localStorage.setItem('hyde_has_visited', 'true'); 
        }
    }, 3000);

    greetingBubble.onclick = (e) => {
        if (e.target === greetingClose) {
            greetingBubble.classList.remove('show');
            return;
        }
        greetingBubble.classList.remove('show');
        toggle.onclick(); 
    };

    msgContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            lightboxImg.src = e.target.src;
            lightbox.classList.add('active');
        }
    });
    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
        setTimeout(() => lightboxImg.src = '', 200);
    });

    const pusherScript = document.createElement('script');
    pusherScript.src = 'https://js.pusher.com/8.4.0/pusher.min.js';
    pusherScript.onload = () => {
        const pusher = new Pusher('992192f426818164a83b', { cluster: 'eu' });
        const channel = pusher.subscribe('chat_' + initSession());
        
        channel.bind('manager_reply', function (data) {
            let fileData = null;
            if (data.fileUrl) fileData = { url: data.fileUrl, type: data.type, name: data.fileName || 'Файл' };
            
            const waitMsg = shadow.querySelector('.hyde-wait-msg');
            if (waitMsg) {
                waitMsg.innerText = t.specialistJoined;
                waitMsg.className = 'hyde-msg hyde-system-msg'; 
            }

            addMsg(data.message, 'bot', fileData);
            updateActivity();
            
            if (!win.classList.contains('open')) {
                setUnreadCount(unreadCount + 1); 
                bubbleTitle.innerText = t.newMsg;
                let previewText = data.message || (fileData ? (fileData.type === 'audio' ? t.audioMsg : t.file) : "...");
                if (previewText.length > 35) previewText = previewText.substring(0, 35) + '...';
                bubbleText.innerText = escapeHTML(previewText);

                greetingBubble.classList.add('show');
                notificationSound.play().catch(()=>{});
            }
        });
        
        channel.bind('manager_joined', function () {
            const waitMsg = shadow.querySelector('.hyde-wait-msg');
            if (waitMsg) {
                waitMsg.innerText = t.specialistJoined;
                waitMsg.className = 'hyde-msg hyde-system-msg';
                msgContainer.scrollTop = msgContainer.scrollHeight;
            }
        });
    };
    document.head.appendChild(pusherScript);

    function addMsg(txt, side, fileObj = null, isWaitMsg = false) {
        const d = document.createElement('div');
        d.className = 'hyde-msg ' + side;
        if (isWaitMsg) d.classList.add('hyde-wait-msg'); 

        let contentHtml = '';
        if (txt) contentHtml += `<div>${escapeHTML(txt).replace(/\\n|\n/g, '<br>')}</div>`;

        if (fileObj) {
            let isImage = false, isAudio = false, isDocument = false;
            let src = '', fileName = t.file;
            
            if (fileObj instanceof File || fileObj instanceof Blob) {
                src = URL.createObjectURL(fileObj);
                if (fileObj.type.startsWith('image/')) isImage = true;
                else if (fileObj.type.startsWith('audio/')) isAudio = true;
                else { isDocument = true; fileName = fileObj.name || t.file; }
            } else if (typeof fileObj === 'object' && fileObj !== null && fileObj.url) {
                src = fileObj.url;
                fileName = escapeHTML(fileObj.name || t.file);
                const urlLower = src.toLowerCase();
                if (fileObj.type === 'image' || urlLower.match(/\.(jpeg|jpg|gif|png|webp)$/)) isImage = true;
                else if (fileObj.type === 'audio' || urlLower.match(/\.(webm|mp3|ogg|m4a|wav)$/)) isAudio = true;
                else isDocument = true;
            } else if (fileObj === true) {
                 fileName = side === 'user' && !txt ? t.voiceMsg : t.file;
                 isDocument = true;
            }

            if (isImage && src && isSafeUrl(src)) contentHtml += `<div><img src="${src}"/></div>`;
            else if (isAudio && src && isSafeUrl(src)) contentHtml += `<div><audio controls class="hyde-audio-player"><source src="${src}">Ваш браузер не підтримує аудіо.</audio></div>`;
            else if (isDocument && src && isSafeUrl(src)) contentHtml += `<a href="${src}" target="_blank" rel="noopener noreferrer" download="${fileName}" class="hyde-attachment">${icons.file}<span>${fileName}</span></a>`;
            else if (isDocument && !src) contentHtml += `<div class="hyde-attachment">${icons.file}<span>${fileName}</span></div>`;
        }
        
        d.innerHTML = contentHtml;
        msgContainer.appendChild(d);
        d.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    toggle.onclick = () => { 
        win.classList.add('open'); 
        greetingBubble.classList.remove('show');
        setUnreadCount(0); 
        
        if (!historyLoaded) { loadHistoryFromN8n(); historyLoaded = true; }
        else { msgContainer.scrollTop = msgContainer.scrollHeight; }
    };
    
    closeBtn.onclick = () => win.classList.remove('open');

    attachBtn.onclick = () => { fileInput.click(); };
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            fileNameSpan.innerText = escapeHTML(file.name);
            filePreview.classList.add('active');
        }
    };
    cancelFileBtn.onclick = () => {
        selectedFile = null;
        fileInput.value = '';
        filePreview.classList.remove('active');
    };

    let lastTypingTime = 0;
    input.addEventListener('input', () => {
        const val = input.value.trim();
        if (val.length > 0) {
            const now = Date.now();
            if (localStorage.getItem('hyde_has_sent_message') === 'true') {
                if (now - lastTypingTime > 4000) {
                    lastTypingTime = now;
                    const formData = new FormData();
                    formData.append('sessionId', initSession());
                    formData.append('clientId', CLIENT_ID);
                    formData.append('action', 'typing'); // Маркер ДРУКУВАННЯ
                    fetch(WEBHOOK_URL, { method: 'POST', body: formData }).catch(e => {});
                }
            }
        }
    });

    // --- ОНОВЛЕНА ВІДПРАВКА В N8N ---
    async function sendToN8n(text, file = null, isAudio = false, isNewSession = false) {
        const formData = new FormData();
        formData.append('sessionId', initSession());
        formData.append('lang', lang);
        formData.append('clientId', CLIENT_ID);
        formData.append('isNewSession', isNewSession ? 'true' : 'false');
        
        // НОВЕ: додаємо тип події для вашого n8n Router
        formData.append('action', isNewSession ? 'new_session' : 'message');

        if (text) formData.append('message', text);
        if (file) {
            if (isAudio) { formData.append('audio', file, 'voice.webm'); formData.append('file', file, 'voice.webm'); } 
            else formData.append('file', file);
        }
        try { await fetch(WEBHOOK_URL, { method: 'POST', body: formData }); } catch (e) {}
    }

    let rec, stream, chunks = [], recordInterval, recordSeconds = 0, isRecording = false;
    function formatTime(sec) {
        return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;
    }
    function stopRecording() {
        if (rec && rec.state !== 'inactive') rec.stop();
        clearInterval(recordInterval);
        isRecording = false;
        micBtn.classList.remove('recording-active');
        input.style.display = 'block';
        recordTimer.style.display = 'none';
        attachBtn.style.display = 'flex';
    }

    micBtn.onclick = async () => {
        if (!isRecording) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                rec = new MediaRecorder(stream);
                chunks = [];
                rec.ondataavailable = e => chunks.push(e.data);
                rec.onstop = () => {
                    stream.getTracks().forEach(track => track.stop());
                    if (chunks.length > 0) {
                        const blob = new Blob(chunks, { type: 'audio/webm' });
                        
                        const lastActivityStr = localStorage.getItem(ACTIVITY_KEY);
                        const isNewConversation = !lastActivityStr || (Date.now() - parseInt(lastActivityStr, 10) > 30 * 60 * 1000);
                        
                        addMsg(null, 'user', blob);
                        sendToN8n(null, blob, true, isNewConversation);
                        
                        localStorage.setItem('hyde_has_sent_message', 'true');
                        updateActivity(); 

                        if (isNewConversation) {
                            setTimeout(() => { addMsg(t.waitManager, 'bot', null, true); updateActivity(); }, 800);
                        }
                    }
                    chunks = [];
                };
                rec.start();
                isRecording = true;
                micBtn.classList.add('recording-active');
                input.style.display = 'none';
                attachBtn.style.display = 'none';
                recordTimer.style.display = 'flex';
                recordSeconds = 0;
                recordTimeSpan.innerText = '00:00';
                recordInterval = setInterval(() => {
                    recordSeconds++;
                    recordTimeSpan.innerText = formatTime(recordSeconds);
                }, 1000);
            } catch (err) { alert(t.micError); }
        } else { stopRecording(); }
    };

    const handleSend = () => {
        if (isRecording) { stopRecording(); return; }
        const val = input.value.trim();
        if (!val && !selectedFile) return;
        
        const lastActivityStr = localStorage.getItem(ACTIVITY_KEY);
        const isNewConversation = !lastActivityStr || (Date.now() - parseInt(lastActivityStr, 10) > 30 * 60 * 1000);
        
        addMsg(val, 'user', selectedFile);
        sendToN8n(val, selectedFile, false, isNewConversation);
        
        localStorage.setItem('hyde_has_sent_message', 'true');
        updateActivity(); 

        if (isNewConversation) {
            setTimeout(() => { addMsg(t.waitManager, 'bot', null, true); updateActivity(); }, 800);
        }
        
        input.value = '';
        selectedFile = null;
        fileInput.value = '';
        filePreview.classList.remove('active');
    };

    sendBtn.onclick = handleSend;
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

    async function loadHistoryFromN8n() {
        try {
            const res = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "GET_HISTORY", sessionId: initSession(), clientId: CLIENT_ID })
            });
            const contentType = res.headers.get('content-type') || '';
            let historyArray = [];
            if (contentType.includes('application/json')) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0 && data[0].history) historyArray = data[0].history;
                else if (data.history) {
                    let hData = data.history;
                    if (typeof hData === 'string') { try { const parsed = JSON.parse(hData); if (Array.isArray(parsed)) historyArray = parsed; } catch (e) { } } 
                    else if (Array.isArray(hData)) historyArray = hData;
                } else if (Array.isArray(data)) historyArray = data;
            } else {
                const text = await res.text();
                try {
                    const parsed = JSON.parse(text);
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].history) historyArray = parsed[0].history;
                    else if (Array.isArray(parsed)) historyArray = parsed;
                } catch (e) { }
            }

            msgContainer.innerHTML = ''; 
            
            const initialGreetingDiv = document.createElement('div');
            initialGreetingDiv.className = 'hyde-msg bot';
            initialGreetingDiv.innerText = escapeHTML(t.greeting);
            msgContainer.appendChild(initialGreetingDiv);

            if (historyArray && historyArray.length > 0) {
                localStorage.setItem('hyde_has_sent_message', 'true');

                const lastActivityStr = localStorage.getItem(ACTIVITY_KEY);
                let showDivider = false;
                if (lastActivityStr) {
                    const lastActivity = parseInt(lastActivityStr, 10);
                    if ((Date.now() - lastActivity) > 30 * 60 * 1000) showDivider = true;
                }

                historyArray.forEach(msgItem => {
                    const isClient = msgItem.sender && msgItem.sender.toLowerCase() === 'client';
                    let fileObj = msgItem.file || msgItem.isFile;
                    if (fileObj && typeof fileObj === 'string') fileObj = { url: fileObj };
                    addMsg(msgItem.text, isClient ? 'user' : 'bot', fileObj);
                });

                if (showDivider) {
                    const divider = document.createElement('div');
                    divider.style.cssText = 'text-align: center; margin: 15px 0 10px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;';
                    divider.innerText = t.prevMsgs;
                    msgContainer.appendChild(divider);
                    
                    const newGreetingDiv = document.createElement('div');
                    newGreetingDiv.className = 'hyde-msg bot';
                    newGreetingDiv.innerText = escapeHTML(t.greeting);
                    msgContainer.appendChild(newGreetingDiv);
                }
            }
            msgContainer.scrollTop = msgContainer.scrollHeight;
        } catch (e) { console.error("Помилка завантаження історії", e); }
    }

    initSession();
    fetchConfig(); // Запуск завантаження кольорів та текстів з NocoDB
})();
