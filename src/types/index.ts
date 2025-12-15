export type Status = 'Pending' | 'Submitted';

export interface Designer {
    id: string;
    name: string;
    avatar?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    link: string;
    status: Status;
    date: string; // YYYY-MM-DD format
    designerId: string;
    requestorAvatar?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type Role = 'Designer' | 'Manager';

export interface FilterState {
    status: Status[];
    dateRange: {
        start: string | null;
        end: string | null;
    };
}
