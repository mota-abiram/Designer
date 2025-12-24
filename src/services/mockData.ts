import type { Designer, Task } from '../types';
import { addDays, format, startOfWeek } from 'date-fns';

const avatars = {
    user: "https://lh3.googleusercontent.com/aida-public/AB6AXuBi8jXjNHhpaSwAWq9eMb3PRCIDCEXQeEImVr_E23PKVLvU-z0X5Lc4NcReNInJLpF9GOZ2i8CUSOwSHJYovmZMuCZlKLxCWTG4qjZS2bRn_W6VmbrY52vXTAfQSKb7c2DXCiFrZ22sBQ3OMKIBuGlQvrZ-SlROI-Mn4vM7A32ou9-JuL_ScTIVVLdYJ2qX0SumycaKFOkOa8R8h_gbfmg6MtbT2nvaDGXVe4WJDr0Z4ONgcg9kbuO39xrkHKZRH1KSRA8fSCFs-OA"
};

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
