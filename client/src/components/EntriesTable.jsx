import { useState } from 'react';
import EntryModal from './EntryModal';
import { calculateHours, formatTime } from '../utils';

export default function EntriesTable({ days, entries, onEntrySaved }) {
  const [selectedEntry, setSelectedEntry] = useState(null);  // объект { date, entry? }
    const [modalOpen, setModalOpen] = useState(false);

    const openForDate = (dateStr) => {
    const entry = entries.find(e => e.date === dateStr) || null;
    setSelectedEntry({ date: dateStr, entry });
    setModalOpen(true);
    };

    const closeModal = () => {
    setModalOpen(false);
    setSelectedEntry(null);
    };

    return (
    <>
        <div className="overflow-x-auto mb-8">
        <table className="table-brutal">
            <thead>
            <tr>
                <th>Дата</th>
                <th>День</th>
                <th>Время работы</th>
                <th>Часы</th>
                <th>Комментарий</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {days.map(({ dateStr, dayNum, dayOfWeek }) => {
                const entry = entries.find(e => e.date === dateStr);
                const hours = entry ? calculateHours(entry.start_time, entry.end_time) : 0;
                const timeDisplay = entry && entry.start_time && entry.end_time
                ? `${formatTime(entry.start_time)} – ${formatTime(entry.end_time)}`
                : '—';
                return (
                <tr key={dateStr} className="hover:bg-[#1A1A1A] cursor-pointer" onClick={() => openForDate(dateStr)}>
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
        {modalOpen && selectedEntry && (
        <EntryModal
            date={selectedEntry.date}
            existingEntry={selectedEntry.entry}
            onClose={closeModal}
            onSaved={() => { closeModal(); onEntrySaved(); }}
        />
        )}
    </>
    );
}