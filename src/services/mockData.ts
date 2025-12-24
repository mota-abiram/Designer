import type { Designer, Task } from '../types';
import { addDays, format, startOfWeek } from 'date-fns';


export const designers: Designer[] = [
    { id: 'n1', name: 'Nagaraju' },
    { id: 'sh1', name: 'Sheshu' },
    { id: 'su1', name: 'Surya' },
    { id: 'd1', name: 'Dhruv' },
    { id: 'h1', name: 'Haneef' },
    { id: 'rt1', name: 'Ravi Teja' },
    { id: 'm1', name: 'Murali' },
    { id: 'st1', name: 'Sai Teja' },
    { id: 'sk1', name: 'Sai Kiran' },
];

// Generate dates for the current week starting Monday
export const getCurrentWeekDays = () => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 6; i++) {
        days.push(format(addDays(startOfCurrentWeek, i), 'yyyy-MM-dd'));
    }
    return days;
};

export const weekDates = getCurrentWeekDays();

export const initialTasks: Task[] = [];
