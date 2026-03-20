import { Request, Response } from 'express';
import { prisma } from '../config/database';

export interface DaySchedule {
  day: number; // 0=Sun, 1=Mon, ..., 6=Sat
  name: string;
  isOpen: boolean;
  openTime: string;  // "13:00"
  closeTime: string; // "23:00"
}

export interface Schedule {
  days: DaySchedule[];
  lastOrderMinutesBefore: number;
}

const DEFAULT_SCHEDULE: Schedule = {
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

export async function getSchedule(_req: Request, res: Response): Promise<void> {
  const setting = await prisma.settings.findUnique({ where: { key: 'schedule' } });
  const schedule: Schedule = setting ? JSON.parse(setting.value) : DEFAULT_SCHEDULE;
  res.json({ success: true, data: schedule });
}

export async function updateSchedule(req: Request, res: Response): Promise<void> {
  const schedule: Schedule = req.body;
  await prisma.settings.upsert({
    where: { key: 'schedule' },
    update: { value: JSON.stringify(schedule) },
    create: { key: 'schedule', value: JSON.stringify(schedule) },
  });
  res.json({ success: true, data: schedule });
}

export async function getScheduleData(): Promise<Schedule> {
  const setting = await prisma.settings.findUnique({ where: { key: 'schedule' } });
  return setting ? JSON.parse(setting.value) : DEFAULT_SCHEDULE;
}
