// src/components/Schedule/ScheduleList/ScheduleList.jsx
import { useMemo, useRef, useEffect } from 'react';
import ScheduleItem from '../ScheduleItem';
import { List } from './ScheduleList.styled';

const isSameYMD = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const ScheduleList = ({ currentMonth }) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const datesOfMonth = useMemo(() => {
    const build = (year, month, startDay = 1) => {
      const lastDay = new Date(year, month + 1, 0).getDate();
      const arr = [];
      for (let day = startDay; day <= lastDay; day++) {
        arr.push(new Date(year, month, day));
      }
      return arr;
    };

    return currentMonth
      ? build(y, m, d) // de azi până la finalul lunii
      : build(y + (m === 11 ? 1 : 0), (m + 1) % 12, 1); // luna viitoare
  }, [currentMonth, y, m, d]);

  const todayRef = useRef(null);
  useEffect(() => {
    if (currentMonth) {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentMonth, datesOfMonth]);

  return (
    <List>
      {datesOfMonth.map((date, idx) => {
        const isToday = currentMonth && isSameYMD(date, now);
        return (
          <li
            key={date.toISOString()}
            ref={currentMonth && idx === 0 ? todayRef : null}
          >
            <ScheduleItem date={date} isToday={isToday} />
          </li>
        );
      })}
    </List>
  );
};

export default ScheduleList;
