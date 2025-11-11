// главный файл приложения - связывает все модули

import { DOM, getSettings, showOverlay, hideOverlay } from './dom.js';
import { startTest, pauseTest, resumeTest, finishTest, setAngleTolerance } from './game.js';
import { initInput } from './input.js';
import { setTimerSettings } from './timer.js';
import { resetResults } from './results.js';

// инициализация приложения
function init() {
    console.log('старт мега приложения...');

    initInput(); // инициализируем обработку ввода
    setupEventListeners(); // настраиваем обработчики кнопок
    
    console.log('всё ок, можно стартовать!');
}

// настройка обработчиков событий
function setupEventListeners() {
    // кнопка запуска теста
    DOM.startBtn.addEventListener('click', function () {
        DOM.info.style.display = "none";
        DOM.timer.style.display = 'block';

        const settings = getSettings();
        
        // настраиваем модули с пользовательскими параметрами
        setAngleTolerance(Math.trunc((settings.sensitivity / 5) + 1) / 100);
            setTimerSettings(settings);

            // сбрасываем предыдущие результаты (чтоб случайно не остались старые резы при рестарте)
            resetResults();

            // запускаем тест
            startTest(settings);
    });

    // кнопки с боковой панели и их оверлеев (отображаются во время самого теста)
    // кнопка паузы
    DOM.pauseBtn.addEventListener('click', () => {
        pauseTest();
        showOverlay('pause');
    });
    
    DOM.buttons.resume.addEventListener('click', () => {
        hideOverlay('pause');
        resumeTest();
    });
    
    // кнопка отмены
    DOM.abortBtn.addEventListener('click', () => {
        pauseTest();
        showOverlay('abort');
    });
    
    DOM.buttons.abortYes.addEventListener('click', () => {
        window.location.href = 'test.html';
    });
    
    DOM.buttons.abortNo.addEventListener('click', () => {
        hideOverlay('abort');
        resumeTest();
    });
    
    // кнопка досрочного завершения
    DOM.finishBtn.addEventListener('click', () => {
        pauseTest();
        showOverlay('finish');
    });
    
    DOM.buttons.finishYes.addEventListener('click', () => {
        hideOverlay('finish');
        finishTest();
    });
    
    DOM.buttons.finishNo.addEventListener('click', () => {
        hideOverlay('finish');
        resumeTest();
    });
}

// запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
