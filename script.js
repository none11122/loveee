// ============================================================
// НАСТРОЙКИ ТЕЛЕГРАМ-БОТА — ЗАПОЛНИ ЭТИ ДВЕ СТРОКИ!
// ============================================================
const TELEGRAM_BOT_TOKEN = "8743308188:AAHoQLUdwone9M_knICzK7ZnDLTwl9tovAM";
const TELEGRAM_CHAT_ID   = "5037027845";
// ============================================================


// ================== ПЛАВАЮЩИЕ СЕРДЕЧКИ ==================
(function createHearts() {
    const bg = document.getElementById('heartsBg');
    if (!bg) return;
    const emojis = ['❤️', '💖', '💕', '💗', '💓', '🌸'];
    for (let i = 0; i < 25; i++) {
        const h = document.createElement('div');
        h.className = 'floating-heart';
        h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        h.style.left = Math.random() * 100 + 'vw';
        h.style.fontSize = (12 + Math.random() * 22) + 'px';
        h.style.animationDuration = (8 + Math.random() * 10) + 's';
        h.style.animationDelay = (Math.random() * 10) + 's';
        bg.appendChild(h);
    }
})();


// ================== ФОНОВАЯ МУЗЫКА ==================
const bgMusic = document.getElementById('bgMusic');
let musicStarted = false;

function tryStartMusic() {
    if (musicStarted || !bgMusic) return;
    bgMusic.volume = 0.5;
    const p = bgMusic.play();
    if (p && p.catch) {
        p.then(() => {
            musicStarted = true;
            removeMusicListeners();
        }).catch(() => {});
    }
}
function removeMusicListeners() {
    document.removeEventListener('click', tryStartMusic);
    document.removeEventListener('touchstart', tryStartMusic);
    document.removeEventListener('keydown', tryStartMusic);
}
document.addEventListener('click', tryStartMusic);
document.addEventListener('touchstart', tryStartMusic);
document.addEventListener('keydown', tryStartMusic);
tryStartMusic();

function stopMusic() {
    if (!bgMusic) return;
    try {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    } catch (e) {}
    musicStarted = false;
}


// ================== ХЕЛПЕРЫ ==================
function showStep(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('step' + n);
    if (el) el.classList.add('active');
}

function shakeAndBlink(el, blink = false) {
    el.classList.remove('wrong', 'blink');
    void el.offsetWidth;
    el.classList.add('wrong');
    if (blink) {
        setTimeout(() => el.classList.add('blink'), 500);
        setTimeout(() => el.classList.remove('blink'), 1600);
    }
    setTimeout(() => el.classList.remove('wrong'), 1800);
}


// ================== ШАГ 1 ==================
const step1Btn = document.querySelector('#step1 .check-btn');
const monthsSelect = document.getElementById('monthsSelect');

step1Btn.addEventListener('click', () => {
    const val = monthsSelect.value;
    if (!val) {
        shakeAndBlink(step1Btn);
        return;
    }
    if (val === '3') {
        step1Btn.classList.add('correct');
        step1Btn.disabled = true;
        monthsSelect.disabled = true;
        setTimeout(() => showStep(2), 700);
    } else {
        shakeAndBlink(step1Btn);
    }
});


// ================== ШАГ 2 ==================
const placeOptions = document.getElementById('placeOptions');
const step2Btn = document.querySelector('#step2 .check-btn');
let selectedPlace = null;

placeOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (!btn) return;
    placeOptions.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedPlace = btn.dataset.value;
    step2Btn.disabled = false;
});

step2Btn.addEventListener('click', () => {
    if (!selectedPlace) return;
    if (selectedPlace === 'Берёзовая роща') {
        const chosen = placeOptions.querySelector('.option-btn.selected');
        chosen.classList.add('correct');
        step2Btn.classList.add('correct');
        step2Btn.disabled = true;
        placeOptions.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
        setTimeout(() => showStep(3), 800);
    } else {
        const chosen = placeOptions.querySelector('.option-btn.selected');
        shakeAndBlink(chosen, true);
    }
});


// ================== ШАГ 3 ==================
const heightInput = document.getElementById('heightInput');
const step3Btn = document.querySelector('#step3 .check-btn');

heightInput.addEventListener('input', () => {
    heightInput.value = heightInput.value.replace(/\D/g, '');
});

step3Btn.addEventListener('click', () => {
    const val = heightInput.value.trim();
    if (!val) {
        shakeAndBlink(step3Btn);
        return;
    }
    if (val === '189') {
        step3Btn.classList.add('correct');
        step3Btn.disabled = true;
        heightInput.disabled = true;
        setTimeout(() => showStep(4), 700);
    } else {
        shakeAndBlink(step3Btn, true);
    }
});


// ================== ШАГ 4 — ОТПРАВКА В TELEGRAM ==================
const sendBtn = document.getElementById('sendBtn');
const loveMessage = document.getElementById('loveMessage');
const sendStatus = document.getElementById('sendStatus');

sendBtn.addEventListener('click', async () => {
    stopMusic();

    const text = loveMessage.value.trim();
    if (!text) {
        sendStatus.textContent = 'Напиши хоть что-нибудь 💌';
        sendStatus.classList.add('error');
        return;
    }

    sendBtn.disabled = true;
    sendStatus.classList.remove('error');
    sendStatus.textContent = 'Отправляю...';

    let success = false;

    // Если токен не заполнен — не пытаемся отправить
    if (TELEGRAM_BOT_TOKEN.includes('ВСТАВЬ') || TELEGRAM_CHAT_ID.includes('ВСТАВЬ')) {
        console.warn('Telegram не настроен — пропускаю отправку.');
        success = true; // чтобы сердечко всё равно показалось
    } else {
        try {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: `💌 Сообщение от любимой:\n\n${text}`
                })
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.description || 'Ошибка Telegram');
            success = true;
        } catch (err) {
            console.error('ОШИБКА ОТПРАВКИ:', err);
            // Всё равно пропускаем дальше — чтобы она увидела видео.
            // Но статус покажем.
            sendStatus.textContent = 'Не удалось отправить 😢 Но сюрприз всё равно ждёт 💖';
            sendStatus.classList.add('error');
            success = true; // ← fallback: показываем сердечко даже при ошибке
        }
    }

    if (success) {
        if (!sendStatus.classList.contains('error')) {
            sendStatus.textContent = 'Отправлено ❤️';
        }
        loveMessage.disabled = true;
        sendBtn.classList.add('correct');

        setTimeout(() => showStep('Heart'), 1100);
    }
});


// ================== ШАГ 4.5 — КНОПКА-СЕРДЕЧКО ==================
const heartBtn = document.getElementById('heartBtn');

heartBtn.addEventListener('click', () => {
    showStep(5);
    setTimeout(() => startVideo(), 100);
});


// ================== ШАГ 5 — ВИДЕО ==================
const finalVideo = document.getElementById('finalVideo');
let videoEnded = false;

function startVideo() {
    finalVideo.currentTime = 0;
    finalVideo.muted = false;
    finalVideo.volume = 1;

    // Пытаемся развернуть на весь экран
    const el = finalVideo;
    const req = el.requestFullscreen
             || el.webkitRequestFullscreen
             || el.webkitEnterFullscreen
             || el.msRequestFullscreen;
    if (req) {
        try {
            const p = req.call(el);
            if (p && p.catch) p.catch(() => {});
        } catch (e) {}
    }

    // Пытаемся залочить горизонтальную ориентацию (Android)
    if (screen.orientation && screen.orientation.lock) {
        try {
            screen.orientation.lock('landscape').catch(() => {});
        } catch (e) {}
    }

    // Запускаем видео
    const playPromise = finalVideo.play();
    if (playPromise && playPromise.catch) {
        playPromise.catch(() => {
            finalVideo.controls = true;
        });
    }

    // Подсказка "поверни телефон" на 2.5 сек
    const overlay = document.getElementById('rotateOverlay');
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    if (overlay && isPortrait && isTouch) {
        overlay.classList.add('show');
        setTimeout(() => overlay.classList.remove('show'), 2500);
    }
}

finalVideo.addEventListener('ended', () => {
    if (videoEnded) return;
    videoEnded = true;

    // Выходим из фуллскрина
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) { try { exit.call(document); } catch (e) {} }
    }

    // Разлочиваем ориентацию
    if (screen.orientation && screen.orientation.unlock) {
        try { screen.orientation.unlock(); } catch (e) {}
    }

    setTimeout(() => showStep(6), 400);
});

// Если видео не загрузилось / нет файла — на всякий случай пропускаем через 20 сек
setTimeout(() => {
    if (document.getElementById('step5').classList.contains('active') && !videoEnded) {
        // ничего не делаем — пользователь сам разберётся
    }
}, 20000);


// ================== ШАГ 6 ==================
document.getElementById('yesBtn').addEventListener('click', () => showStep(7));
document.getElementById('noBtn').addEventListener('click', () => showStep(7));