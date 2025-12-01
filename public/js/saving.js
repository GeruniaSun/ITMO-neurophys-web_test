// всякие разные виды сохранения
// TODO выяснить сколько секунд можно отправить в инфлюх за раз
import { INFLUX_CONFIG } from './config.js';

// в Influx Cloud неполучится отправить простым запросом много данных
// поэтому данные разбиваются на части по столько строк и отправляются
const ROWS_PER_FETCH = 100;

// главная функция в файле - вызывает все виды сохранения
export function saveResult(username, result) {
    console.log(`начинаю сохранение результата ${username}...`)

    saveLocalCsv(username, result)
    sendToInflux(username, result).catch((err) => { console.error(`проблема с отправкой в Influx: `, err); });
}

// функция для локального сохранения в CSV
function saveLocalCsv(username, result) {
    console.log(`сохраняем результат ${username} в CSV...`);

    // парсим в CSV
    const headers = Object.keys(result[0]).join(',');
    const rows = result.map(record => { return Object.values(record).join(','); });

    loadLocalFile(username + '.csv', [headers, ...rows].join('\n'))
    console.log(`CSV от ${username} загружен`);
}

// функция для отправки результата в Influx Cloud
async function sendToInflux(username, result, { rowsPerFetch = ROWS_PER_FETCH, concurrency = 4 } = {}) {
    console.log(`отправляем данные от ${username} в Influx`);

    // партицирование
    const chunks = [];
    for (let i = 0; i < result.length; i += rowsPerFetch) {
        chunks.push(result.slice(i, i + rowsPerFetch));
    }
    console.log(`разбили на ${chunks.length} частей.`);

    let success = 0;
    let fail = 0;

    await asyncPool(
        chunks,
        async (chunk) => {
            const idx = chunks.indexOf(chunk) + 1;
            try {
                await sendPartToInflux(username, chunk);
                success++;
                console.log(`часть номер ${idx}/${chunks.length} успешно отправлена (${success}/${chunks.length})`);
            } catch (err) {
                fail++;
                console.error(`ошибка с номером: ${idx}:`, err.message || err);
            }
        },
        concurrency
    );

    if (fail === 0) { console.log(`весь результат ${username} успешно отправлен в Influx.`); }
    else { console.warn(`отправили: ${success}, не получилось: ${fail}.`); }
}

// парсит и отправляет в Influx конкретную часть
function sendPartToInflux(username, data) {
    const payload = parseToLineProtocol(username, data);
    return fetch(
        `${INFLUX_CONFIG.url}?org=${encodeURIComponent(INFLUX_CONFIG.org)}&bucket=${encodeURIComponent(INFLUX_CONFIG.bucket)}`,
        {
            method: "POST",
            headers: {
                Authorization: `Token ${INFLUX_CONFIG.token}`,
                "Content-Type": "text/plain",
            },
            body: payload,
        }
    ).then(async res => {
        if (!res.ok) throw new Error(`Influx ответил ${res.status} ${res.statusText}`);
        return res.text();
    });
}

// создает невидимую кнопку для скачивания кликает по ней
function loadLocalFile(filename, content) {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// переводит массив результатов в LineProtocol для Influx Cloud
function parseToLineProtocol(user, records) {
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

// пул для контроля параллельности при отправке результата в Influx
async function asyncPool(items, worker, concurrency = 4) {
    const it = items[Symbol.iterator]();
    const runners = Array.from({ length: concurrency }, async () => {
        for (let cur = it.next(); !cur.done; cur = it.next()) {
            await worker(cur.value);
        }
    });
    await Promise.all(runners);
}