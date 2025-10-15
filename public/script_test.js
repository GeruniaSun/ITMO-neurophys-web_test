const CONFIG = {
    CANVAS: { width: 900, height: 400 },
    RADIUS: 130,
    STAR_RADIUS: 15,
    POINT_RADIUS: 10,
    COLORS: {
        GREEN: "#95c29f",
        BLUE: "#94bff9", 
        ORANGE: "#f8b25f",
        POINT: "#f8c4f3"
    }
};

const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');
canvas.width = CONFIG.CANVAS.width;
canvas.height = CONFIG.CANVAS.height;

const DOM = {
    startBtn: document.getElementById('start'),
    okno: document.getElementById('okno'),
    panel: document.getElementById('panel'),
    info: document.querySelector(".info"),
    timer: document.getElementById('timer'),
    canvas: document.querySelector('.canvas'),
    finish: document.querySelector('.finish'),
    pauseBtn: document.getElementById("pause"),
    abortBtn: document.getElementById("cancel"),
    finishBtn: document.getElementById("finish-early"),
    overlays: {
        pause: document.getElementById('pauseOverlay'),
        abort: document.getElementById('abortOverlay'),
        finish: document.getElementById('finishOverlay')
    },
    buttons: {
        resume: document.getElementById('resumeBtn'),
        abortYes: document.getElementById('abortYes'),
        abortNo: document.getElementById('abortNo'),
        finishYes: document.getElementById('finishYes'),
        finishNo: document.getElementById('finishNo')
    }
};

let seconds = 0;
let minutes = 0;
let paused = false;
let timerInterval;
let startTime;
let continueAnimating = true;


// эти пять штук инициализируются при старте теста, чтоб старые результаты убрать если они вдруг есть
let hits; // количество попаданий по каждой из звезд на текущий момент
let errors; // количество ошибок на текущий момент
let result; // массив куда кладутся hits и error каждую секунду
let baseSpeed; // изначальная скорость движения кружков
let counts; // количество полных оборотов для каждого круга
let previousAngles; // предыдущие углы для определения полных оборотов

const sensitivity = document.getElementById("sensitivity");
const sensitivityValue = document.getElementById("sensitivityValue");

const accelerationInput = document.getElementById("acceleration");
const accelerationValue = document.getElementById("accelerationValue");

// тут указаны значения по умолчанию, юзер может их поменять перед началом в настройках
let testDuration = 20; // длительность теста в минутах
let angleTolerance = 0.1; // допустимая погрешность угла в радианах
let acceleration = 0.1; // % на который увеличивается скорость каждые accInterval минут
let accInterval = 1.5; // см. строчку выше

// ====== отрисовка ======
const elements = [
    {
        pos: 1/6,
        starOffset: { x: 0, y: CONFIG.RADIUS },
        color: CONFIG.COLORS.GREEN,
        angle: Math.PI * ((Math.random() * 0.2) - 0.1),
        speed: 7
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
const targetAngles = elements.map(el => Math.atan2(el.starOffset.y, el.starOffset.x));

function tick() {
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

const CENTER_Y = CONFIG.CANVAS.height / 2;
const CIRCLE_POSITIONS = elements.map(el => CONFIG.CANVAS.width * el.pos);

function drawElements() {
    context.clearRect(0, 0, CONFIG.CANVAS.width, CONFIG.CANVAS.height);
    
    elements.forEach((el, index) => {
        const x = CIRCLE_POSITIONS[index];
        
        context.beginPath();
        context.arc(x, CENTER_Y, CONFIG.RADIUS, 0, Math.PI * 2);
        context.stroke();
        
        context.beginPath();
        star(CONFIG.STAR_RADIUS, x + el.starOffset.x, CENTER_Y + el.starOffset.y, 6);
        context.fillStyle = el.color;
        context.fill();
        context.stroke();
        
        context.beginPath();
        context.arc(
            x + CONFIG.RADIUS * Math.cos(el.angle),
            CENTER_Y + CONFIG.RADIUS * Math.sin(el.angle),
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
    context.moveTo(cX + R,cY);
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
        context.lineTo(x ,y);
    }
    context.closePath();
    context.stroke();
}


// ====== обработка кнопок ======

DOM.startBtn.addEventListener('click', function () {
    DOM.info.style.display = "none";
    DOM.timer.style.display = 'block';

    const settings = getSettings();
    testDuration = settings.duration;
    angleTolerance = Math.trunc((settings.sensitivity / 5) + 1) / 100;
    acceleration = settings.acceleration;
    accInterval = settings.interval;

    startTimer();
    startTest();
});

DOM.pauseBtn.addEventListener('click', () => showOverlay('pause'));
DOM.buttons.resume.addEventListener('click', () => hideOverlay('pause'));
DOM.abortBtn.addEventListener('click', () => showOverlay('abort'));
DOM.buttons.abortYes.addEventListener('click', () => window.location.href = 'test.html');
DOM.buttons.abortNo.addEventListener('click', () => hideOverlay('abort'));
DOM.finishBtn.addEventListener('click', () => showOverlay('finish'));
DOM.buttons.finishYes.addEventListener('click', () => {
    hideOverlay('finish');
    finishTest();
});
DOM.buttons.finishNo.addEventListener('click', () => hideOverlay('finish'));

// показывать возле слайдера значение
document.addEventListener("DOMContentLoaded", () => {
    sensitivity.addEventListener("input", () => {
        sensitivityValue.textContent = sensitivity.value;
    });

    accelerationInput.addEventListener("input", () => {
        accelerationValue.textContent = accelerationInput.value;
    });
});


let lastKeyTime = 0;
const KEY_DEBOUNCE = 100;

document.addEventListener('keydown', ({ key, timeStamp }) => {
    if (timeStamp - lastKeyTime < KEY_DEBOUNCE) return;
    lastKeyTime = timeStamp;

    const indexMap = { '1': 0, '2': 1, '3': 2 };
    const hitKeys = ['left', 'center', 'right'];

    if (indexMap[key] !== undefined) {
        const index = indexMap[key];
        const isClose = areAnglesClose(elements[index].angle, targetAngles[index], angleTolerance);

        DOM.okno.style.border = `solid 15px ${elements[index].color}`;
        setTimeout(() => {
            DOM.okno.style.border = 'solid 2px rgba(0, 0, 0, 0.2)';
        }, 300);

        isClose ? hits[hitKeys[index]]++ : errors++;
    } else { errors++; }
});

// приводит значение угла к промежутку [-pi; pi]
function normalizeAngle(angle) { return ((angle + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; }

// проверка на попадание (разность углов не больше заданной константы)
function areAnglesClose(a, b, tolerance) {
    const diff = Math.abs(normalizeAngle(a - b));
    return diff <= tolerance || diff >= 2 * Math.PI - tolerance;
}


// ====== управление тестом ======

// задает начальные значения и запускает анимацию
function startTest() {
    hits = {'left': 0, 'center': 0, 'right': 0};
    errors = 0;
    result = [];
    baseSpeed = 0.002;
    counts = [0, 0, 0];
    previousAngles = elements.map(el => el.angle);

    DOM.finish.classList.remove('show');
    DOM.canvas.style.display = "block";
    DOM.panel.classList.add("open");
    
    requestAnimationFrame(tick);
    console.log("дан старт теста");
}

// останавливает таймер и анимацию
function pauseTest() {
    stopTimer();
    continueAnimating = false;
    console.log("выполнение теста приостановлено")
}

// продолжает таймер и анимацию
function resumeTest() {
    continueAnimating = true;
    requestAnimationFrame(tick)
    continueTimer();
    console.log("выполнение теста возобновлено")
}

// выводит интерфейс завершения и отправки результатов
function finishTest() {
    continueAnimating = false;
    DOM.okno.style.backgroundColor = "#EDF0F2";
    DOM.canvas.style.display = "none";
    DOM.finish.classList.add('show');

    printFinalResult();
    endTimer();
    handleTestResults();
    DOM.panel.classList.remove('open');
}


// ====== раота с результатом ======

// показывает поле для ввода имени
function handleTestResults() {
    const userInputDiv = document.querySelector('.user-input');
    const input = document.getElementById('username');
    const button = document.getElementById('submit');
    const success = document.getElementById('success');

    userInputDiv.classList.add('visible');

    button.addEventListener('click', function() {
        const username = input.value;
        if (username) {
            sendData(username);
            userInputDiv.classList.remove('visible');
            success.classList.add('visible');
        } else {
            alert('Пожалуйста, введите ваше имя');
        }
    });
}

// отправляет данные в Influx Cloud
function sendData(username) {
    console.log("отправляем данные от" + username)
    const payload = parseToLine(username, result);

    // да да токен в коде это плохо, но я его удалю, как лабу сдадим, да и кому не насрать, боже
    const token = 'Bq4GHkZ6HhHVsJUv9tZeECFI-rPfqRY6TRmovqGUtIkwy3uqqoxWpXs_DCgMzjhpZBWWF7OH8UH0PrWNFxqFfA==';
    const org = 'neurofizz';
    const bucket = 'neurofizz_lab1';

    fetch(`https://eu-central-1-1.aws.cloud2.influxdata.com/api/v2/write?org=${org}&bucket=${bucket}`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'text/plain'
        },
        body: payload
    })
        .then(response => {
            if (!response.ok) {
                console.error(`Ошибка: ${response.status} ${response.statusText}`);
                throw new Error("Все плохо, код " + response.status);
            }
            return response.text();
        })
        .then(result => {
            console.log("Успех! Все хорошо:", result);
        })
        .catch(error => {
            console.error("Что-то пошло не так:", error.message);
        });
}

// переводит массив в LineProtocol для Influx Cloud
function parseToLine(user, records) {
    return records.map(record => {
        const fields = [
            `errors=${record.errors}i`,
            `hits_left=${record.hits_left}i`,
            `hits_center=${record.hits_center}i`,
            `hits_right=${record.hits_right}i`,
            `counts_left=${record.counts_left}i`,
            `counts_center=${record.counts_center}i`,
            `counts_right=${record.counts_right}i`
        ].join(',');

        const timestamp = BigInt(record.timestamp * 1_000_000n).toString();

        return `${user} ${fields} ${timestamp}`;
    }).join('\n');
}

// для вывода красивого лога по результатам
function printFinalResult() {
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


// ====== таймер ======
function startTimer() {
    startTime = BigInt(Date.now());
    seconds = 0;
    minutes = 0;
    paused = false;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(timerTick, 1000);
}

// поставить на паузу
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        paused = true;
    }
}

// закончить паузу
function continueTimer() {
    if (paused && !timerInterval) {
        paused = false;
        timerInterval = setInterval(timerTick, 1000);
    }
}

// убрать таймер когда время вышло
function endTimer() {
    clearInterval(timerInterval);
    return DOM.timer.textContent;
}

// упавляет поведением таймера
function timerTick() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }

    refreshResults(BigInt(60 * minutes + seconds));

    if (minutes === testDuration) {
        finishTest();
        endTimer();
        return;
    }

    if ((60 * minutes + seconds) % Math.trunc(60 * accInterval) === 0) {
        baseSpeed *= (1 + acceleration / 100);
        console.log("скорость была увеличена!")
    }

    let secondsStr = seconds < 10 ? '0' + seconds : seconds;
    let minutesStr = minutes < 10 ? '0' + minutes : minutes;
    DOM.timer.textContent = minutesStr + ':' + secondsStr;
}

// каждую секунду добавляет запись в массив с результатами
function refreshResults(duration) {
    result.push({
        'timestamp': BigInt(startTime + duration * 1_000n),
        'errors': errors,
        'hits_left': hits.left,
        'hits_center': hits.center,
        'hits_right': hits.right,
        'counts_left': counts[0],
        'counts_center': counts[1],
        'counts_right': counts[2]
    })
}

// ====== оверлеи ======
function showOverlay(type) {
    pauseTest();
    DOM.overlays[type].classList.add('show');
}

function hideOverlay(type) {
    DOM.overlays[type].classList.remove('show');
    resumeTest();
}

function getSettings() {
    const duration = parseInt(document.getElementById("duration").value, 10);
    const sensitivity = parseInt(document.getElementById("sensitivity").value, 10);
    const acceleration = parseInt(document.getElementById("acceleration").value, 10);
    const interval = parseFloat(document.getElementById("interval").value);
    
    if (duration < 1 || duration > 60) {
        throw new Error('Длительность должна быть от 1 до 60 минут');
    }
    if (sensitivity < 0 || sensitivity > 100) {
        throw new Error('Чувствительность должна быть от 0 до 100%');
    }
    
    return { duration, sensitivity, acceleration, interval };
}
