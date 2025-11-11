// управление таймером

import { DOM } from './dom.js';
import { increaseSpeed } from './canvas.js';
import { finishTest, updateResults } from './game.js';
import { addResult } from './results.js';

// переменные состояния таймера
let seconds = 0;
let minutes = 0;
let paused = false;
let timerInterval;
let startTime;
let testDuration = 20;
let accInterval = 1.5;
let acceleration = 0.1;

// запуск таймера
export function startTimer() {
    startTime = BigInt(Date.now());
    seconds = 0;
    minutes = 0;
    paused = false;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(timerTick, 1000);
}

// поставить таймер на паузу
export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        paused = true;
    }
}

// продолжить таймер после паузы
export function continueTimer() {
    if (paused && !timerInterval) {
        paused = false;
        timerInterval = setInterval(timerTick, 1000);
    }
}

// завершить таймер
export function endTimer() {
    clearInterval(timerInterval);
    return DOM.timer.textContent;
}

// основной тик таймера
function timerTick() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }

    // обновляем результаты каждую секунду
    const resultData = updateResults();
    addResult({
        ...resultData,
        minutes,
        seconds
    });

    // проверяем не надо ли закончить тест
    if (minutes === testDuration) {
        finishTest();
        endTimer();
        return;
    }

    // проверяем не надо ли увеличить скорость
    if ((60 * minutes + seconds) % Math.trunc(60 * accInterval) === 0) {
        increaseSpeed(acceleration);
    }

    // обновляем отображение времени
    updateTimerDisplay();
}

// обновление отображения времени
function updateTimerDisplay() {
    let secondsStr = seconds < 10 ? '0' + seconds : seconds;
    let minutesStr = minutes < 10 ? '0' + minutes : minutes;
    DOM.timer.textContent = minutesStr + ':' + secondsStr;
}

// обновление настроек таймера
export function setTimerSettings(settings) {
    testDuration = settings.duration;
    accInterval = settings.interval;
    acceleration = settings.acceleration;
}

// получение времени начала теста
export function getStartTime() {
    return startTime;
}
