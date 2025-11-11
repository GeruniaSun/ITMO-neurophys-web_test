// DOM который не строил Джек

// получение DOM элементов (ленивое как и автор)
export const DOM = {
    get startBtn() { return document.getElementById('start'); },
    get okno() { return document.getElementById('okno'); },
    get panel() { return document.getElementById('panel'); },
    get info() { return document.querySelector(".info"); },
    get timer() { return document.getElementById('timer'); },
    get canvas() { return document.querySelector('.canvas'); },
    get finish() { return document.querySelector('.finish'); },
    get pauseBtn() { return document.getElementById("pause"); },
    get abortBtn() { return document.getElementById("cancel"); },
    get finishBtn() { return document.getElementById("finish-early"); },
    get overlays() {
        return {
            pause: document.getElementById('pauseOverlay'),
            abort: document.getElementById('abortOverlay'),
            finish: document.getElementById('finishOverlay')
        };
    },
    get buttons() {
        return {
            resume: document.getElementById('resumeBtn'),
            abortYes: document.getElementById('abortYes'),
            abortNo: document.getElementById('abortNo'),
            finishYes: document.getElementById('finishYes'),
            finishNo: document.getElementById('finishNo')
        };
    }
};

// настройки немного в стороне т.к. должны до старта работать
export const SETTINGS_ELEMENTS = {
    get sensitivity() { return document.getElementById("sensitivity"); },
    get sensitivityValue() { return document.getElementById("sensitivityValue"); },
    get accelerationInput() { return document.getElementById("acceleration"); },
    get accelerationValue() { return document.getElementById("accelerationValue"); },
    get duration() { return document.getElementById("duration"); },
    get interval() { return document.getElementById("interval"); }
};

// функции для работы с оверлеями
export function showOverlay(type) {
    DOM.overlays[type].classList.add('show');
}

export function hideOverlay(type) {
    DOM.overlays[type].classList.remove('show');
}

// получение настроек из формы
export function getSettings() {
    const duration = parseInt(SETTINGS_ELEMENTS.duration.value, 10);
    const sensitivity = parseInt(SETTINGS_ELEMENTS.sensitivity.value, 10);
    const acceleration = parseInt(SETTINGS_ELEMENTS.accelerationInput.value, 10);
    const interval = parseFloat(SETTINGS_ELEMENTS.interval.value);
    
    if (duration < 1 || duration > 60) {
        throw new Error('Длительность должна быть от 1 до 60 минут');
    }
    if (sensitivity < 0 || sensitivity > 100) {
        throw new Error('Чувствительность должна быть от 0 до 100%');
    }
    
    return { duration, sensitivity, acceleration, interval };
}
