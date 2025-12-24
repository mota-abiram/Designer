import type { Designer, Task } from '../types';
import { addDays, format, startOfWeek } from 'date-fns';


export const designers: Designer[] = [
    { id: 'v1', name: 'Vaishnove' },
    { id: 'j1', name: 'Janvi' },
    { id: 'a1', name: 'Aarti' },
    { id: 's1', name: 'Saurabh' },
    { id: 'h1', name: 'Haripriya' },
    { id: 'ab1', name: 'Abhishek' },
    { id: 've1', name: 'Veda' },
    { id: 'p1', name: 'Prajakta' },
    { id: 'hp1', name: 'Haripriya' }, // Duplicate in user list but keeping specified names
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
