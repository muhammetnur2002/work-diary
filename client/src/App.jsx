import { useState, useEffect, useCallback } from 'react';
import MonthNavigator from './components/MonthNavigator';
import EntriesTable from './components/EntriesTable';
import MonthlySummary from './components/MonthlySummary';
import Login from './components/Login';
import { getDaysInMonth } from './utils';
import { api } from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [entries, setEntries] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [summary, setSummary] = useState({ total_hours: 0, gross_salary: 0, net_salary: 0 });

  const days = getDaysInMonth(year, month);
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchEntries = useCallback(async () => {
    if (!isAuthenticated) return;
    const data = await api.getEntries(monthStr);
    setEntries(data);
  }, [monthStr, isAuthenticated]);

  const fetchSettings = async () => {
    const data = await api.getHourlyRate();
    setHourlyRate(data.value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchAdvance = async () => {
    const data = await api.getAdvance(monthStr);
    setAdvance(data.amount);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSummary = async () => {
    const data = await api.getSummary(monthStr);
    setSummary(data);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
    fetchAdvance();
    fetchSummary();
  }, [monthStr, isAuthenticated, fetchEntries, fetchAdvance, fetchSummary]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [isAuthenticated]);

  const handleHourlyRateSave = async (value) => {
    await api.updateHourlyRate(value);
    setHourlyRate(value);
    fetchSummary();
  };

  const handleAdvanceSave = async (amount) => {
    await api.updateAdvance(monthStr, amount);
    setAdvance(amount);
    fetchSummary();
  };

  const handleEntrySaved = () => {
    fetchEntries();
    fetchSummary();
  };

  if (!isAuthenticated) {
    return <Login onAuth={() => setIsAuthenticated(true)} />;
  }

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