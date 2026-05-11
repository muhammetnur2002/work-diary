import { useState, useCallback } from 'react';
import MonthNavigator from './components/MonthNavigator';
import EntriesTable from './components/EntriesTable';
import MonthlySummary from './components/MonthlySummary';
import { getDaysInMonth } from './utils';
import { loadData, saveData } from './localStorage';

function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [allData, setAllData] = useState(loadData);

  const days = getDaysInMonth(year, month);
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Автосохранение при любом изменении
  const updateData = useCallback((newData) => {
    setAllData(newData);
    saveData(newData);
  }, []);

  // Получить записи текущего месяца (массив объектов или null)
  const entries = days.map(day => allData.entries[day.dateStr] || null);

  // Сохранить или удалить запись за конкретный день
  const saveEntry = (date, entryData) => {
    const newEntries = { ...allData.entries };
    if (entryData === null) {
      delete newEntries[date];
    } else {
      newEntries[date] = { ...newEntries[date], ...entryData };
    }
    const newData = { ...allData, entries: newEntries };
    updateData(newData);
  };

  // Глобальная ставка
  const {hourlyRate} = allData.settings;
  const setHourlyRate = (val) => {
    const newData = {
      ...allData,
      settings: { ...allData.settings, hourlyRate: parseFloat(val) || 0 }
    };
    updateData(newData);
  };

  // Аванс за месяц
  const advance = allData.advances[monthStr] || 0;
  const setAdvance = (val) => {
    const newAdvances = { ...allData.advances, [monthStr]: parseFloat(val) || 0 };
    const newData = { ...allData, advances: newAdvances };
    updateData(newData);
  };

  // Расчёт месячного отчёта
  const summary = calculateSummary(days, allData, monthStr);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 tracking-widest text-[#FF4D00] uppercase">
        График работы
      </h1>
      <MonthNavigator year={year} month={month} setYear={setYear} setMonth={setMonth} />
      <EntriesTable
        days={days}
        entries={entries}
        onEntrySaved={(date, entry) => saveEntry(date, entry)}
      />
      <MonthlySummary
        summary={summary}
        hourlyRate={hourlyRate}
        onHourlyRateSave={setHourlyRate}
        advance={advance}
        onAdvanceSave={setAdvance}
      />
    </div>
  );
}

function calculateSummary(days, allData, monthStr) {
  let totalHours = 0;
  let totalSalary = 0;
  const globalRate = allData.settings.hourlyRate || 0;

  days.forEach(day => {
    const entry = allData.entries[day.dateStr];
    if (!entry || !entry.start_time || !entry.end_time) return;

    const [sh, sm] = entry.start_time.split(':').map(Number);
    const [eh, em] = entry.end_time.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60;
    const hours = (endMin - startMin) / 60;
    totalHours += hours;

    const rate = (entry.hourly_rate != null && entry.hourly_rate > 0)
      ? entry.hourly_rate
      : globalRate;
    totalSalary += hours * rate;
  });

  const advance = allData.advances[monthStr] || 0;
  const net = totalSalary - advance;

  return {
    total_hours: Math.round(totalHours * 100) / 100,
    hourly_rate: globalRate,
    gross_salary: Math.round(totalSalary * 100) / 100,
    advance: advance,
    net_salary: Math.round(net * 100) / 100,
  };
}

export default App;