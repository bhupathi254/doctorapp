import { INglDatatableSort } from 'ng-lightning'

export type PaginatedTable = {
    isLoading: boolean,
    sort: INglDatatableSort,
    data: (any)[],
    page: number;
    total: number;
    limit: number;
    boundaryNumbers: number;
    search: string;
    selectAll: boolean;
}

export type Appointment = {
    appointmentTime: Date;
    userId: string;
}

export type User = {
    _id: string;
    name: string;
}

export type Gender = 'Male' | 'Female';
