export interface Holiday {
  name: string;
  date: string; // ISO format YYYY-MM-DD
  month: number; // 1-indexed
  description?: string;
  isFixed: boolean;
}

export const MALAYSIAN_HOLIDAYS_2026: Holiday[] = [
  { name: 'Chinese New Year', date: '2026-02-17', month: 2, isFixed: false },
  { name: 'Chinese New Year (Day 2)', date: '2026-02-18', month: 2, isFixed: false },
  { name: 'Hari Raya Aidilfitri', date: '2026-03-20', month: 3, isFixed: false },
  { name: 'Hari Raya Aidilfitri (Day 2)', date: '2026-03-21', month: 3, isFixed: false },
  { name: 'Workers\' Day', date: '2026-05-01', month: 5, isFixed: true },
  { name: 'Yang di-Pertuan Agong\'s Birthday', date: '2026-06-01', month: 6, isFixed: false }, // Usually 1st Monday of June
  { name: 'National Day (Merdeka)', date: '2026-08-31', month: 8, isFixed: true },
  { name: 'Malaysia Day', date: '2026-09-16', month: 9, isFixed: true },
  { name: 'Deepavali', date: '2026-11-08', month: 11, isFixed: false }, // Approximate
  { name: 'Sultan of Selangor\'s Birthday', date: '2026-12-11', month: 12, isFixed: true },
  { name: 'Christmas Day', date: '2026-12-25', month: 12, isFixed: true },
];
