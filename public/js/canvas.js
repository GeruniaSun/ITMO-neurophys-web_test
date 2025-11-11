// логика отрисовки и анимации

import { CONFIG } from './config.js';

// инициализация canvas
const canvas = document.querySelector("canvas");
export const context = canvas.getContext('2d');
canvas.width = CONFIG.CANVAS.width;
canvas.height = CONFIG.CANVAS.height;

// массив элементов (все что касается кругов)
export const elements = [
    {
        pos: 1/6, // горизонтальная позиция центра на канвасе
        starOffset: { x: 0, y: CONFIG.RADIUS }, // положение звездочки
        color: CONFIG.COLORS.GREEN, // цвет звездочки
        angle: Math.PI * ((Math.random() * 0.2) - 0.1), // стартовый угол (немножко рандомный)
        speed: 7 // стартовая скорость (разная между кружками)
    },
    {
        pos: 3/6,
        starOffset: { x: -CONFIG.RADIUS, y: 0 },
        color: CONFIG.COLORS.BLUE,
        angle: Math.PI * ((Math.random() * 0.2) - 0.1),
        speed: 10
    },
    {
        pos: 5/6,
        starOffset: { x: 0, y: -CONFIG.RADIUS },
        color: CONFIG.COLORS.ORANGE,
        angle: Math.PI * ((Math.random() * 0.2) - 0.1),
        speed: 5
    }
];

// целевые углы для попаданий (небольшой офсет даем, а то без шансов)
export const targetAngles = elements.map(el => Math.atan2(el.starOffset.y, el.starOffset.x));

// константы для отрисовки
const CENTER_Y = CONFIG.CANVAS.height / 2;
const CIRCLE_POSITIONS = elements.map(el => CONFIG.CANVAS.width * el.pos);

// переменные состояния анимации
let continueAnimating = true;
let baseSpeed = 0.002;
let counts = [0, 0, 0];
let previousAngles = null;

// основной цикл анимации
export function tick() {
    if (!continueAnimating) return;

    elements.forEach((el, index) => {
        const previousAngle = el.angle;
        el.angle += el.speed * baseSpeed;
        
        if (previousAngles) {
            const prevNorm = normalizeAngle(previousAngle);
            const currNorm = normalizeAngle(el.angle);
            
            if (prevNorm > Math.PI / 2 && currNorm < -Math.PI / 2) {
                counts[index]++;
                if (counts[index] % 10 === 0) {
                    console.log(`${index + 1}-ый круг совершил ${counts[index]}-ый оборот!`);
                }
            }
        }
    });

    drawElements();
    requestAnimationFrame(tick);
}

// отрисовка всех элементов
export function drawElements() {
    context.clearRect(0, 0, CONFIG.CANVAS.width, CONFIG.CANVAS.height);
    
    elements.forEach((el, index) => {
        const x = CIRCLE_POSITIONS[index];
        
        // отрисовка круга
        context.beginPath();
        context.arc(x, CENTER_Y, CONFIG.RADIUS, 0, Math.PI * 2);
        context.stroke();
        
        // отрисовка звездочки
        context.beginPath();
        star(CONFIG.STAR_RADIUS, x + el.starOffset.x, CENTER_Y + el.starOffset.y, 6);
        context.fillStyle = el.color;
        context.fill();
        context.stroke();
        
        // отрисовка движущейся точки
        context.beginPath();
        context.arc(
            x + CONFIG.RADIUS * Math.cos(Number(el.angle)),
            CENTER_Y + CONFIG.RADIUS * Math.sin(Number(el.angle)),
            CONFIG.POINT_RADIUS, 0, Math.PI * 2
        );
        context.fillStyle = CONFIG.COLORS.POINT;
        context.fill();
        context.stroke();
    });
}

// функция для отрисовки звездочки
function star(R, cX, cY, N) {
    let theta;
    let x;
    let y;
    context.beginPath();
    context.moveTo(cX + R, cY);
    for(let i = 1; i <= N * 2; i++){
        if(i % 2 === 0){
            theta = i * (Math.PI * 2) / (N * 2);
            x = cX + (R * Math.cos(theta));
            y = cY + (R * Math.sin(theta));
        }else{
            theta = i * (Math.PI * 2) / (N * 2);
            x = cX + ((R/2) * Math.cos(theta));
            y = cY + ((R/2) * Math.sin(theta));
        }
        context.lineTo(x, y);
    }
    context.closePath();
    context.stroke();
}

// приводит значение угла к промежутку [-pi; pi]
export function normalizeAngle(angle) { 
    return ((angle + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; 
}

// проверка на попадание (разность углов не больше заданной константы)
export function areAnglesClose(a, b, tolerance) {
    const diff = Math.abs(normalizeAngle(a - b));
    return diff <= tolerance || diff >= 2 * Math.PI - tolerance;
}

// функции управление анимацией
export function startAnimation() {
    continueAnimating = true;
    previousAngles = elements.map(el => el.angle);
    counts = [0, 0, 0];
    baseSpeed = 0.002;
    requestAnimationFrame(tick);
}

export function stopAnimation() {
    continueAnimating = false;
}

export function resumeAnimation() {
    continueAnimating = true;
    requestAnimationFrame(tick);
}

// увеличение скорости
export function increaseSpeed(acceleration) {
    baseSpeed *= (1 + acceleration / 100);
    console.log("скорость была увеличена!");
}

// получение текущих данных
export function getCounts() {
    return counts;
}

export function getElements() {
    return elements;
}
