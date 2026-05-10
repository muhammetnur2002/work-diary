const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

export default function MonthNavigator({ year, month, setYear, setMonth }) {
    const prevMonth = () => {
    if (month === 0) {
        setYear(year - 1);
        setMonth(11);
    } else {
        setMonth(month - 1);
    }
    };
    const nextMonth = () => {
    if (month === 11) {
        setYear(year + 1);
        setMonth(0);
    } else {
        setMonth(month + 1);
    }
    };

    return (
    <div className="flex justify-between items-center mb-6 border-2 border-[#2C2C2C] p-4 bg-[#1A1A1A]">
        <button onClick={prevMonth} className="btn-brutal">&larr; Пред</button>
        <span className="text-2xl font-bold uppercase">
        {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} className="btn-brutal">След &rarr;</button>
    </div>
    );
}