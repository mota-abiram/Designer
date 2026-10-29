import type { Designer, Task, BrandQuota } from '../types';
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


const [mon, tue, wed] = weekDates;
const t = (id: string, title: string, status: Task['status'], date: string, designerId: string, brand: string, creativeType: string, scope: string): Task =>
    ({ id, title, description: `${title} (dummy data)`, link: '', status, date, designerId, brand, creativeType, scope, assignedBy: 'Abiram' });

export const initialBrands = ['Acme', 'Globex', 'Initech'].map((name, i) => ({ id: `b${i}`, name }));
export const initialCreativeTypes = ['Static', 'Carousel', 'Video'].map((name, i) => ({ id: `c${i}`, name }));
export const initialScopes = ['Social Media', 'Ads'].map((name, i) => ({ id: `s${i}`, name }));
export const initialQuotas: BrandQuota[] = [
    { id: 'acme_social_media', brandId: 'Acme', scopeId: 'Social Media', targets: { Static: 10, Carousel: 4, Video: 2 }, delivered: { Static: 1 } },
    { id: 'globex_ads', brandId: 'Globex', scopeId: 'Ads', targets: { Static: 6, Video: 3 }, delivered: {} },
];

export const initialTasks: Task[] = [
    t('t1', 'Diwali offer post', 'Pending', mon, 'n1', 'Acme', 'Static', 'Social Media'),
    t('t2', 'Product carousel', 'Pending Approval', mon, 'n1', 'Acme', 'Carousel', 'Social Media'),
    t('t3', 'Launch reel', 'Rework', tue, 'sh1', 'Globex', 'Video', 'Ads'),
    t('t4', 'Banner set', 'Approved', tue, 'su1', 'Acme', 'Static', 'Social Media'),
    t('t5', 'Festive creative', 'Pending', wed, 'd1', 'Initech', 'Static', 'Ads'),
];
