import { apiClient } from './api';
import type { ApiResponse } from '../types';

export interface DaySchedule {
  day: number;
  name: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface Schedule {
  days: DaySchedule[];
  lastOrderMinutesBefore: number;
}

export const DEFAULT_SCHEDULE: Schedule = {
  days: [
    { day: 0, name: 'Domingo',   isOpen: true,  openTime: '13:00', closeTime: '23:00' },
    { day: 1, name: 'Lunes',     isOpen: false, openTime: '13:00', closeTime: '23:00' },
    { day: 2, name: 'Martes',    isOpen: true,  openTime: '13:00', closeTime: '23:00' },
    { day: 3, name: 'Miércoles', isOpen: true,  openTime: '13:00', closeTime: '23:00' },
    { day: 4, name: 'Jueves',    isOpen: true,  openTime: '13:00', closeTime: '23:00' },
    { day: 5, name: 'Viernes',   isOpen: true,  openTime: '13:00', closeTime: '23:00' },
    { day: 6, name: 'Sábado',    isOpen: true,  openTime: '13:00', closeTime: '23:00' },
  ],
  lastOrderMinutesBefore: 30,
};

export const scheduleService = {
  getSchedule: async (): Promise<Schedule> => {
    try {
      const response = await apiClient.get<ApiResponse<Schedule>>('/schedule');
      return response.data.data;
    } catch {
      return DEFAULT_SCHEDULE;
    }
  },

  updateSchedule: async (schedule: Schedule): Promise<Schedule> => {
    const response = await apiClient.put<ApiResponse<Schedule>>('/schedule', schedule);
    return response.data.data;
  },
};
