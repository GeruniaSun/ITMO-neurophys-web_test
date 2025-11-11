// обработка ввода (настройки + кнопки во время теста)

import { SETTINGS_ELEMENTS } from './dom.js';
import { getElements, targetAngles, areAnglesClose } from './canvas.js';
import { processHit, processError, getTestSettings } from './game.js';
import { KEY_CONFIG } from './config.js';

// переменные для дебаунса клавиш (чтоб нельзя было миллион раз в секунду нажимать)
let lastKeyTime = 0;

// инициализация обработчиков ввода
export function initInput() {
    setupKeyboardInput();
    setupSettingsInput();
}

// настройка обработки клавиш
function setupKeyboardInput() {
    document.addEventListener('keydown', ({ key, timeStamp }) => {
        if (timeStamp - lastKeyTime < KEY_CONFIG.DEBOUNCE) return;
        lastKeyTime = timeStamp;

        const elements = getElements();
        const indexMap = KEY_CONFIG.INDEX_MAP;

        if (indexMap[key] !== undefined) {
            const index = indexMap[key];
            const isClose = areAnglesClose(elements[index].angle, targetAngles[index], getAngleTolerance());

            processHit(index, isClose);
        } else { 
            processError(); 
        }
    });
}

// обработка настроек
function setupSettingsInput() {
    if (SETTINGS_ELEMENTS.sensitivity && SETTINGS_ELEMENTS.sensitivityValue) {
        SETTINGS_ELEMENTS.sensitivityValue.textContent = SETTINGS_ELEMENTS.sensitivity.value;
        SETTINGS_ELEMENTS.sensitivity.addEventListener("input", () => {
            SETTINGS_ELEMENTS.sensitivityValue.textContent = SETTINGS_ELEMENTS.sensitivity.value;
        });
    }

    if (SETTINGS_ELEMENTS.accelerationInput && SETTINGS_ELEMENTS.accelerationValue) {
        SETTINGS_ELEMENTS.accelerationValue.textContent = SETTINGS_ELEMENTS.accelerationInput.value;
        SETTINGS_ELEMENTS.accelerationInput.addEventListener("input", () => {
            SETTINGS_ELEMENTS.accelerationValue.textContent = SETTINGS_ELEMENTS.accelerationInput.value;
        });
    }
}

// получение текущей толерантности угла
function getAngleTolerance() {
    return getTestSettings().angleTolerance;
}
