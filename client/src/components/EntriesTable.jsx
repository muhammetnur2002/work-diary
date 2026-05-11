import { useState } from 'react';
import EntryModal from './EntryModal';
import { calculateHours, formatTime } from '../utils';

export default function EntriesTable({ days, entries, onEntrySaved }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);

    const openForDate = (dateStr, entry) => {
    setSelectedDate(dateStr);
    setSelectedEntry(entry);
    };

    const closeModal = () => {
    setSelectedDate(null);
    setSelectedEntry(null);
    };

    const handleSave = (date, entryData) => {
    onEntrySaved(date, entryData);
    closeModal();
    };

    return (
    <>
        <div className="overflow-x-auto mb-8">
        <table className="table-brutal">
            <thead>
            <tr>
                <th>П/Ч</th>
                <th>День</th>
                <th>Время работы</th>
                <th>Часы</th>
                <th>Комментарий</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {days.map(({ dateStr, dayNum, dayOfWeek }, idx) => {
                const entry = entries[idx];
                const hours = entry ? calculateHours(entry.start_time, entry.end_time) : 0;
                const timeDisplay = entry?.start_time && entry?.end_time
                ? `${formatTime(entry.start_time)} – ${formatTime(entry.end_time)}`
                : '—';
                return (
                <tr key={dateStr} className="hover:bg-[#1A1A1A] cursor-pointer" onClick={() => openForDate(dateStr, entry)}>
                    <td className="font-bold">{dayNum}</td>
                    <td>{dayOfWeek}</td>
                    <td>{timeDisplay}</td>
                    <td>{entry && entry.start_time && entry.end_time ? hours : '—'}</td>
                    <td className="max-w-[200px] truncate" title={entry?.comment}>{entry?.comment || '—'}</td>
                    <td>
                    <span className="btn-brutal text-sm px-2 py-1">✎</span>
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
        </div>
        {selectedDate && (
        <EntryModal
            date={selectedDate}
            existingEntry={selectedEntry}
            onClose={closeModal}
            onSave={(entryData) => handleSave(selectedDate, entryData)}
        />
        )}
    </>
    );
}
