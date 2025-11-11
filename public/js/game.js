// "игровая" логика

import { DOM } from './dom.js';
import { startAnimation, stopAnimation, resumeAnimation, getCounts, getElements } from './canvas.js';
import { startTimer, stopTimer, continueTimer, endTimer } from './timer.js';
import { handleTestResults } from './results.js';
import { DEFAULT_SETTINGS } from './config.js';

// переменные состояния теста
let hits = {'left': 0, 'center': 0, 'right': 0};
let errors = 0;
let result = [];
let testDuration = DEFAULT_SETTINGS.testDuration;
let angleTolerance = DEFAULT_SETTINGS.angleTolerance;
let acceleration = DEFAULT_SETTINGS.acceleration;
let accInterval = DEFAULT_SETTINGS.accInterval;

// задает начальные значения и запускает тест
export function startTest(settings) {
    // обновляем настройки
    testDuration = settings.duration;
    angleTolerance = Math.trunc((settings.sensitivity / 5) + 1) / 100;
    acceleration = settings.acceleration;
    accInterval = settings.interval;

    // сбрасываем счетчики
    hits = {'left': 0, 'center': 0, 'right': 0};
    errors = 0;
    result = [];

    // настраиваем интерфейс
    DOM.finish.classList.remove('show');
    DOM.canvas.style.display = "block";
    DOM.panel.classList.add("open");

    // запускаем анимацию и таймер
    startAnimation();
    startTimer();
    
    console.log("дан старт теста");
}

// приостанавливает тест
export function pauseTest() {
    stopTimer();
    stopAnimation();
    console.log("выполнение теста приостановлено");
}

// возобновляет тест
export function resumeTest() {
    resumeAnimation();
    continueTimer();
    console.log("выполнение теста возобновлено");
}

// завершает тест
export function finishTest() {
    stopAnimation();
    DOM.okno.style.backgroundColor = "#EDF0F2";
    DOM.canvas.style.display = "none";
    DOM.finish.classList.add('show');

    printFinalResult();
    endTimer();
    handleTestResults();
    DOM.panel.classList.remove('open');
}

// обработка попадания или ошибки
export function processHit(circleIndex, isHit) {
    const hitKeys = ['left', 'center', 'right'];
    
    // подсвечиваем окно цветом круга при нажатии на соответсвущую ему кнопку
    const elements = getElements();
    DOM.okno.style.border = `solid 15px ${elements[circleIndex].color}`;
    setTimeout(() => {
        DOM.okno.style.border = 'solid 2px rgba(0, 0, 0, 0.2)';
    }, 300);

    // записываем результат (если кнопка та и вовремя, то в hits, иначе в errors
    if (isHit) {
        hits[hitKeys[circleIndex]]++;
    } else { processError(); }
}

// обработка ошибочного нажатия
export function processError() {
    errors++;
}

// устанавливает значение толерантности угла (насколько позже/раньше можно нажать)
export function setAngleTolerance(tolerance) {
    angleTolerance = tolerance;
}

// обновление результатов каждую секунду
export function updateResults() {
    const counts = getCounts();
    return {
        errors: errors,
        hits_left: hits.left,
        hits_center: hits.center,
        hits_right: hits.right,
        counts_left: counts[0],
        counts_center: counts[1],
        counts_right: counts[2]
    };
}


// получение текущих настроек
export function getTestSettings() {
    return {
        testDuration,
        angleTolerance,
        acceleration,
        accInterval
    };
}

// для вывода красивого лога по результатам
function printFinalResult() {
    const counts = getCounts();
    console.log("=".repeat(30));
    console.log("ИТОГ");
    console.log("количество ошибок: " + errors);
    console.log("попаданий по левому кругу: " + hits.left);
    console.log("попаданий по центральному кругу: " + hits.center);
    console.log("попаданий по правому кругу: " + hits.right);
    console.log("полных оборотов левого круга: " + counts[0]);
    console.log("полных оборотов центрального круга: " + counts[1]);
    console.log("полных оборотов правого круга: " + counts[2]);
    console.log("=".repeat(30));
}