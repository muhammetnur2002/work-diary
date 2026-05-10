import { useState, useEffect, useCallback } from 'react';
import MonthNavigator from './components/MonthNavigator';
import EntriesTable from './components/EntriesTable';
import MonthlySummary from './components/MonthlySummary';
import { getDaysInMonth } from './utils';

function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [entries, setEntries] = useState([]);          // записи текущего месяца
  const [hourlyRate, setHourlyRate] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [summary, setSummary] = useState({ total_hours: 0, gross_salary: 0, net_salary: 0 });
  const days = getDaysInMonth(year, month);
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/entries?month=${monthStr}`);
    const data = await res.json();
    setEntries(data);
  }, [monthStr]);

  const fetchSettings = async () => {
    const res = await fetch('/api/settings/hourly_rate');
    const data = await res.json();
    setHourlyRate(data.value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchAdvance = async () => {
    const res = await fetch(`/api/advances/${monthStr}`);
    const data = await res.json();
    setAdvance(data.amount);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSummary = useCallback(async () => {
    const res = await fetch(`/api/summary?month=${monthStr}`);
    const data = await res.json();
    setSummary(data);
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
    fetchAdvance();
    fetchSummary();
  }, [monthStr, fetchEntries, fetchAdvance, fetchSummary]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, []);

  const handleHourlyRateSave = async (value) => {
    await fetch('/api/settings/hourly_rate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
    setHourlyRate(value);
    fetchSummary();
  };

  const handleAdvanceSave = async (amount) => {
    await fetch(`/api/advances/${monthStr}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    setAdvance(amount);
    fetchSummary();
  };

  const handleEntrySaved = () => {
    fetchEntries();
    fetchSummary();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 tracking-widest text-[#FF4D00] uppercase">
        График работы
      </h1>
      <MonthNavigator year={year} month={month} setYear={setYear} setMonth={setMonth} />
      <EntriesTable
        days={days}
        entries={entries}
        onEntrySaved={handleEntrySaved}
      />
      <MonthlySummary
        summary={summary}
        hourlyRate={hourlyRate}
        onHourlyRateSave={handleHourlyRateSave}
        advance={advance}
        onAdvanceSave={handleAdvanceSave}
      />
    </div>
  );
}

export default App;