// src/components/Schedule/ScheduleItem/ScheduleItem.jsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Card } from './ScheduleItem.styled';
import { selectAllCards as selectAllCardsFromCards } from '../../../redux/cards/cardsSelectors';
import TaskItem from '../TaskItem';
import compareDates from 'helpers/compareDates';

const ScheduleItem = ({ date, isToday }) => {
  const { t } = useTranslation();
  const allCards = useSelector(selectAllCardsFromCards);

  const tasksOfDay = useMemo(() => {
    return (allCards || []).filter(c =>
      compareDates(c.dueDate ?? c.deadline, date)
    );
  }, [allCards, date]);

  const daysOfTheWeek = [
    t('schedule.sunday'),
    t('schedule.monday'),
    t('schedule.tuesday'),
    t('schedule.wednesday'),
    t('schedule.thursday'),
    t('schedule.friday'),
    t('schedule.saturday'),
  ];

  return (
    <Card data-today={isToday ? 'true' : 'false'}>
      <p>
        {date.toLocaleDateString()} {daysOfTheWeek[date.getDay()]}
      </p>
      <ul>
        {tasksOfDay.length > 0 ? (
          tasksOfDay.map(task => (
            <li key={task._id}>
              <TaskItem task={task} />
            </li>
          ))
        ) : (
          <li style={{ opacity: 0.5 }}>{t('schedule.noTasks')}</li>
        )}
      </ul>
    </Card>
  );
};

export default ScheduleItem;
