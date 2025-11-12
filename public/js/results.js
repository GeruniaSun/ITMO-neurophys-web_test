// работа с результатами

/**
    <h2>про формат результата:</h2>
    <p>каждую секунду в массив result добавляется запись (словарик) с таким содержимым:</p>
    <ul>
      <li><code>timestamp</code>: метка времени от начала теста в мс <em>(вроде бы)</em> ,</li>
      <li><code>errors</code>: количетсво ошибок (кнопка нажата не вовремя или не та),</li>
      <li><code>hits_left</code>: количество нажатий вовремя (для левого круга),</li>
      <li><code>hits_center</code>: количество нажатий вовремя (для центрального круга),</li>
      <li><code>hits_right</code>: количество нажатий вовремя (для правого круга),</li>
      <li><code>counts_left</code>: количество полных оборотов (для левого круга),</li>
      <li><code>counts_center</code>: количество полных оборотов (для левого круга),</li>
      <li><code>counts_right</code>: количество полных оборотов (для левого круга)</li>
    </ul>
    <p>замечу, что последние 3 поля нужны, чтоб можно было понять, сколько было пропусков на каждом из кругов
    (т.е. шарик прошел мимо звездочки, но врная кнопка нажата не была)</p>
**/
import { INFLUX_CONFIG } from './config.js';
import { getStartTime } from './timer.js';

// массив для хранения результатов
let result = [];

// показывает поле для ввода имени и отправки результатов
export function handleTestResults() {
    const userInputDiv = document.querySelector('.user-input');
    const input = document.getElementById('username');
    const button = document.getElementById('submit');
    const success = document.getElementById('success');

    userInputDiv.classList.add('visible');

    button.addEventListener('click', function() {
        const username = input.value;
        if (username) {
            sendData(username);
            saveData(username); // сохранение локально
            userInputDiv.classList.remove('visible');
            success.classList.add('visible');
        } else {
            alert('Пожалуйста, введите ваше имя');
        }
    });
}

// функция для локального сохранения
// а то блять в инфлюх чета нихуя не отправляется больно данных дохуя
function saveData(username) {
    // функция для приведения бигинта к строке, а то не дает стригифаится
    function replacer(key, value) {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    }
    const jsonString = JSON.stringify(result, replacer);

    // Создаем Blob с типом application/json
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob); // Создаем ссылку для скачивания

    // Создаем элемент <a> для скачивания файла (он не отобразится, просто сразу скачаем)
    const a = document.createElement('a');
    a.href = url;
    a.download = username + '.json'; // Имя файла
    document.body.appendChild(a); // Добавляем элемент в DOM и кликаем по нему
    a.click();

    // Удаляем элемент из DOM и освобождаем URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// отправляет данные в Influx Cloud
function sendData(username) {
    console.log("отправляем данные от " + username);
    const payload = parseToLine(username, result);

    fetch(`${INFLUX_CONFIG.url}?org=${INFLUX_CONFIG.org}&bucket=${INFLUX_CONFIG.bucket}`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${INFLUX_CONFIG.token}`,
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

// переводит массив результатов в LineProtocol для Influx Cloud
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

// добавляет запись в массив результатов
export function addResult(record) {
    const startTime = getStartTime();
    const duration = BigInt(60 * record.minutes + record.seconds);
    
    result.push({
        'timestamp': BigInt(startTime + duration * 1_000n),
        'errors': record.errors,
        'hits_left': record.hits_left,
        'hits_center': record.hits_center,
        'hits_right': record.hits_right,
        'counts_left': record.counts_left,
        'counts_center': record.counts_center,
        'counts_right': record.counts_right
    });
}

// сброс результатов (для рстарта теста)
export function resetResults() {
    result = [];
}