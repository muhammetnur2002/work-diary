// Генерация списка всех дней месяца
export function getDaysInMonth(year, month) { // month 0-11
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
    days.push({
      dateStr: date.toISOString().slice(0, 10), // YYYY-MM-DD
        dayNum: date.getDate(),
        dayOfWeek: date.toLocaleDateString('ru-RU', { weekday: 'short' })
    });
    date.setDate(date.getDate() + 1);
    }
    return days;
}

// Форматирование времени HH:MM -> "HH:MM"
export function formatTime(time) {
    if (!time) return '';
    const [h, m] = time.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

// Разница между временами в часах (float)
export function calculateHours(start, end) {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
  let diffMin = (eh * 60 + em) - (sh * 60 + sm);
  if (diffMin < 0) diffMin += 24 * 60; // смена через полночь
  return Math.round((diffMin / 60) * 100) / 100;
}