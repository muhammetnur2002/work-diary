import { useState } from 'react';

export default function MonthlySummary({ summary, hourlyRate, onHourlyRateSave, advance, onAdvanceSave }) {
    const [rateInput, setRateInput] = useState(hourlyRate);
    const [advanceInput, setAdvanceInput] = useState(advance);

    const handleRateSave = () => {
    onHourlyRateSave(parseFloat(rateInput) || 0);
    };

    const handleAdvanceSave = () => {
    onAdvanceSave(parseFloat(advanceInput) || 0);
    };

    return (
    <div className="border-2 border-[#2C2C2C] bg-[#1A1A1A] p-4 md:p-6 space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-[#2C2C2C] pb-2">Месячный отчёт</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm mb-1">Почасовая ставка (€/$/₽)</label>
            <div className="flex gap-2">
            <input type="number" step="0.01" value={rateInput} onChange={e => setRateInput(e.target.value)}
                className="flex-1 bg-[#121212] border border-[#2C2C2C] p-2 text-[#E0E0E0] focus:border-[#FF4D00] outline-none"
            />
            <button onClick={handleRateSave} className="btn-brutal text-sm">Обновить</button>
            </div>
        </div>
        <div>
            <label className="block text-sm mb-1">Полученный аванс (за месяц)</label>
            <div className="flex gap-2">
            <input type="number" step="0.01" value={advanceInput} onChange={e => setAdvanceInput(e.target.value)}
                className="flex-1 bg-[#121212] border border-[#2C2C2C] p-2 text-[#E0E0E0] focus:border-[#FF4D00] outline-none"
            />
            <button onClick={handleAdvanceSave} className="btn-brutal text-sm">Обновить</button>
            </div>
        </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
        <div className="border border-[#2C2C2C] p-3">
            <div className="text-xs uppercase tracking-wider">Всего часов</div>
            <div className="text-2xl font-bold text-[#FF4D00]">{summary.total_hours}</div>
        </div>
        <div className="border border-[#2C2C2C] p-3">
            <div className="text-xs uppercase tracking-wider">Начислено</div>
            <div className="text-2xl font-bold">{summary.gross_salary}</div>
        </div>
        <div className="border border-[#2C2C2C] p-3">
            <div className="text-xs uppercase tracking-wider">Аванс</div>
            <div className="text-2xl font-bold">{advance}</div>
        </div>
        <div className="border border-[#2C2C2C] p-3 bg-[#FF4D00]/10">
            <div className="text-xs uppercase tracking-wider">К выплате</div>
            <div className="text-2xl font-bold text-[#FF4D00]">{summary.net_salary}</div>
        </div>
        </div>
    </div>
    );
}