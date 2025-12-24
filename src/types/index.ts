export type Status = 'Pending' | 'Submitted';

export interface Brand {
    id: string;
    name: string;
    createdAt?: string;
}

export interface CreativeType {
    id: string;
    name: string;
    createdAt?: string;
}

export interface Scope {
    id: string;
    name: string;
    createdAt?: string;
}

export interface BrandQuota {
    id: string;
    brandId: string; // This is the Brand NAME in this context for easy display
    scopeId: string; // The Scope NAME
    targets: {
        [creativeTypeId: string]: number;
    };
    delivered?: {
        [creativeTypeId: string]: number;
    };
    assignedDesigner?: string;
}

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
    brand?: string;
    creativeType?: string;
    scope?: string;
    assignedBy?: string | null;
    assignedByAvatar?: string | null;
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
