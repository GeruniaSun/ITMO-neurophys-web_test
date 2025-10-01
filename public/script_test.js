const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const okno = document.getElementById('okno');
const panel = document.getElementById('panel')

const pauseBtn = document.getElementById("pause")
const abortBtn = document.getElementById("cancel")
const finishBtn = document.getElementById("finish-early")

const overlays = {
    pause: document.getElementById('pauseOverlay'),
    abort: document.getElementById('abortOverlay'),
    finish: document.getElementById('finishOverlay')
};

const buttons = {
    resume: document.getElementById('resumeBtn'),
    abortYes: document.getElementById('abortYes'),
    abortNo: document.getElementById('abortNo'),
    finishYes: document.getElementById('finishYes'),
    finishNo: document.getElementById('finishNo')
};

let seconds = 0;
let minutes = 0;
let paused = false;
let timerInterval;
let startTime;
let continueAnimating = true;

canvas.width = 900;
canvas.height = 400;
const radius = 130;

// эти четыре штуки инициализируются при старте теста, чтоб старые результаты убрать если они вдруг есть
let hits; // количество попаданий по каждой из звезд на текущий момент
let errors; // количество ошибок на текущий момент
let result; // массив куда кладутся hits и error каждую секунду
let baseSpeed; // изначальная скорость движения кружков

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
        starOffset: { x: 0, y: radius },
        color: "#95c29f",
        angle: Math.PI * ((Math.random() * 0.2) - 0.1),
        speed: 7
    },
    {
        pos: 3/6,
        starOffset: { x: -radius, y: 0 },
        color: "#94bff9",
        angle: Math.PI * ((Math.random() * 0.2) - 0.1),
        speed: 10
    },
    {
        pos: 5/6,
        starOffset: { x: 0, y: -radius },
        color: "#f8b25f",
        angle: Math.PI * ((Math.random() * 0.2) - 0.1),
        speed: 5
    }
];
const targetAngles = elements.map(el => Math.atan2(el.starOffset.y, el.starOffset.x));

// обновляет положение кружочков
function tick() {
    if (!continueAnimating) return;

    // Обновляем углы
    elements.forEach(el => {
        el.angle += el.speed * baseSpeed;
    });

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawElements();
    requestAnimationFrame(tick);
}

// отрисовывает все фигуры
function drawElements() {
    const centerY = canvas.height / 2;

    // Круги
    elements.forEach(el => {
        context.beginPath();
        context.arc(canvas.width * el.pos, centerY, radius, 0, Math.PI * 2);
        context.stroke();
    });

    // Звезды
    elements.forEach(el => {
        context.beginPath();
        star(15, canvas.width * el.pos + el.starOffset.x, centerY + el.starOffset.y, 6);
        context.fillStyle = el.color;
        context.fill();
        context.stroke();
    });

    // Точки
    elements.forEach(el => {
        context.beginPath();
        context.arc(
            canvas.width * el.pos + radius * Math.cos(el.angle),
            centerY + radius * Math.sin(el.angle),
            10,
            0,
            Math.PI * 2
        );
        context.fillStyle = "#f8c4f3";
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

// запускает тест при нажатии на соответствующую кнопку
startBtn.addEventListener('click', function () {
    document.querySelector(".info").style.display = "none";
    document.getElementById('timer').style.display = 'block';

    const settings = getSettings();
    testDuration = settings.duration; // длительность теста в минутах
    angleTolerance = Math.trunc((settings.sensitivity / 5) + 1) / 100; // допустимая погрешность угла в радианах
    acceleration = settings.acceleration; // % на который увеличивается скорость каждые accInterval минут
    accInterval = settings.interval; // см. строчку выше

    startTimer();
    startTest();
});

// кнопка паузы
pauseBtn.addEventListener('click', () => showOverlay('pause'));

// снять с паузы
buttons.resume.addEventListener('click', () => hideOverlay('pause'));

// кнопка отмены
abortBtn.addEventListener('click', () => showOverlay('abort'));

// подтвердить отмену
buttons.abortYes.addEventListener('click', () => window.location.href = 'test.html');

// отменить отмену
buttons.abortNo.addEventListener('click', () => hideOverlay('abort'));

// кнопка скипа
finishBtn.addEventListener('click', () => showOverlay('finish'));

// подтвердить скип
buttons.finishYes.addEventListener('click', () => {
    hideOverlay('finish');
    finishTest();
});

// отменить скип
buttons.finishNo.addEventListener('click', () => hideOverlay('finish'));

// показывать возле слайдера значение
document.addEventListener("DOMContentLoaded", () => {
    sensitivity.addEventListener("input", () => {
        sensitivityValue.textContent = sensitivity.value;
    });

    accelerationInput.addEventListener("input", () => {
        accelerationValue.textContent = accelerationInput.value;
    });
});


// обработчик нажатия любой клавиши
document.addEventListener('keydown', ({ key }) => {
    const indexMap = { '1': 0, '2': 1, '3': 2 };

    if (indexMap[key] !== undefined) {
        const index = indexMap[key];
        const isClose = areAnglesClose(elements[index].angle, targetAngles[index], angleTolerance);

        okno.style.border = `solid 15px ${elements[index].color}`;

        // сброс подсветки
        setTimeout(() => {
            okno.style.border = 'solid 2px rgba(0, 0, 0, 0.2)';
        }, 300);

        isClose ? hits[['left', 'center', 'right'][index]]++ : errors++;
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

    requestAnimationFrame(tick);
    panel.classList.add("open")
    console.log("дан старт теста")
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
    okno.style.backgroundColor = "#EDF0F2";
    document.querySelector('.canvas').style.display = "none";
    document.querySelector('.finish').style.display = "flex";

    printFinalResult();
    endTimer();
    handleTestResults();
    panel.classList.remove('open');
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
            `hits_right=${record.hits_right}i`
        ].join(',');

        const timestamp = BigInt(record.timestamp * 1_000_000n).toString();

        return `${user} ${fields} ${timestamp}`;
    }).join('\n');
}

// для вывода красивого лога по результатам
function printFinalResult() {
    console.log("=" * 15);
    console.log("ИТОГ");
    console.log("количество ошибок: " + errors);
    console.log("попаданий по левому кругу: " + hits.left);
    console.log("попаданий по центральному кругу: " + hits.center);
    console.log("попаданий по правому кругу: " + hits.right);
    console.log("=" * 15);
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
    return document.getElementById('timer').textContent;
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
    document.getElementById('timer').textContent = minutesStr + ':' + secondsStr;
}

// каждую секунду добавляет запись в массив с результатами
function refreshResults(duration) {
    result.push({
        'timestamp': BigInt(startTime + duration * 1_000n),
        'errors': errors,
        'hits_left': hits.left,
        'hits_center': hits.center,
        'hits_right': hits.right
    })
}

// ====== оверлеи ======
function showOverlay(type) {
    pauseTest();
    overlays[type].classList.add('show');
}

function hideOverlay(type) {
    overlays[type].classList.remove('show');
    resumeTest();
}

function getSettings() {
    return {
        duration: parseInt(document.getElementById("duration").value, 10),
        sensitivity: parseInt(document.getElementById("sensitivity").value, 10),
        acceleration: parseInt(document.getElementById("acceleration").value, 10),
        interval: parseFloat(document.getElementById("interval").value)
    };
}
