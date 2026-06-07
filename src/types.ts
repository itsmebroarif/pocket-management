export interface Habit {
  id: string;
  name: string;
  frequency: string;
  streak: number;
  lastCheckedIn: string | null; // ISO string Date
  color: string;
  icon: string;
  history: string[]; // List of dates 'YYYY-MM-DD' checked in
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  tag: string;
  deadline: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  walletId: string;
  category: string;
  date: string; // YYYY-MM-DD
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  color: string;
  type: 'cash' | 'bank' | 'e-wallet';
  icon: string;
}

export interface StickyNote {
  id: string;
  content: string;
  color: string; // Hex or tailwind bg class
  rotation: number; // degrees for visual charm (-3 to 3)
  date: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
}

export interface SlimeUpgrade {
  id: string;
  name: string;
  cost: number;
  dpc: number; // damage per click increase
  dps: number; // damage per second (autotap)
  level: number;
  icon: string;
}
