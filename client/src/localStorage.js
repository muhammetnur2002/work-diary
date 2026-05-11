const STORAGE_KEY = 'work-diary-data';

export function loadData() {
    try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw);
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
    return getDefaultData();
    }
}

export function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDefaultData() {
    return {
    entries: {},       // ключ: date (YYYY-MM-DD), значение: объект записи
    settings: {
      hourlyRate: 0    // глобальная ставка
    },
    advances: {}       // ключ: month (YYYY-MM), значение: сумма аванса
    };
}