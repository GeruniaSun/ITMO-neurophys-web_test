// конфигурация важных параметров

export const CONFIG = {
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

// настройки по умолчанию
export const DEFAULT_SETTINGS = {
    testDuration: 20, // длительность теста в минутах
    angleTolerance: 0.1, // допустимая погрешность угла в радианах
    acceleration: 0.1, // % на который увеличивается скорость каждые accInterval минут
    accInterval: 1.5 // интервал ускорения в минутах
};

// настройки "игровых" кнопок
export const KEY_CONFIG = {
    DEBOUNCE: 100, // задержка между нажатиями клавиш в мс
    INDEX_MAP: { '1': 0, '2': 1, '3': 2 }, // соответствие клавиш кругам
    HIT_KEYS: ['left', 'center', 'right'] // названия кругов
};

// настройки InfluxDB (туда отправляются реультаты)
export const INFLUX_CONFIG = {
    token: 'Bq4GHkZ6HhHVsJUv9tZeECFI-rPfqRY6TRmovqGUtIkwy3uqqoxWpXs_DCgMzjhpZBWWF7OH8UH0PrWNFxqFfA==',
    org: 'neurofizz',
    bucket: 'neurofizz_lab1',
    url: 'https://eu-central-1-1.aws.cloud2.influxdata.com/api/v2/write'
};
