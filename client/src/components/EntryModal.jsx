import { useState } from 'react';
import { calculateHours } from '../utils';

export default function EntryModal({ date, existingEntry, onClose, onSave }) {
    const [start, setStart] = useState(existingEntry?.start_time || '');
    const [end, setEnd] = useState(existingEntry?.end_time || '');
    const [comment, setComment] = useState(existingEntry?.comment || '');
    const [hourlyRate, setHourlyRate] = useState(existingEntry?.hourly_rate || '');
    const hours = calculateHours(start, end);

    const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
        start_time: start || null,
        end_time: end || null,
        comment: comment || '',
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
    });
    };

    const handleDelete = () => {
    onSave(null); // null означает удаление
    };

    return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1A1A1A] border-2 border-[#2C2C2C] p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 uppercase">{date}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm mb-1">Начало работы</label>
            <input type="time" value={start} onChange={e => setStart(e.target.value)}
                className="w-full bg-[#121212] border border-[#2C2C2C] p-2 text-[#E0E0E0] focus:border-[#FF4D00] outline-none"
            />
            </div>
            <div>
            <label className="block text-sm mb-1">Конец работы</label>
            <input type="time" value={end} onChange={e => setEnd(e.target.value)}
                className="w-full bg-[#121212] border border-[#2C2C2C] p-2 text-[#E0E0E0] focus:border-[#FF4D00] outline-none"
            />
            </div>
            <div className="text-sm">
            Отработано часов: <span className="font-bold text-[#FF4D00]">{hours}</span>
            </div>
            <div>
            <label className="block text-sm mb-1">Комментарий (адрес, место)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
                className="w-full bg-[#121212] border border-[#2C2C2C] p-2 text-[#E0E0E0] h-20 focus:border-[#FF4D00] outline-none"
            />
            </div>
            <div>
            <label className="block text-sm mb-1">Ставка за день (₽) – если отличается</label>
            <input
                type="number"
                step="0.01"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                placeholder="Оставить пустым для глобальной ставки"
                className="w-full bg-[#121212] border border-[#2C2C2C] p-2 text-[#E0E0E0] focus:border-[#FF4D00] outline-none"
            />
            </div>
            <div className="flex justify-between items-center">
            <button type="submit" className="btn-brutal">Сохранить</button>
            {existingEntry && (
                <button type="button" onClick={handleDelete} className="text-red-400 hover:underline text-sm">
                Удалить запись
                </button>
            )}
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white ml-4">
                Отмена
            </button>
            </div>
        </form>
        </div>
    </div>
    );
}