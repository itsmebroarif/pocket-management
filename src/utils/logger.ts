import { ActivityLog } from '../types';

export function getLogs(): ActivityLog[] {
  const data = localStorage.getItem('pocket_logs');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function writeLog(message: string): ActivityLog[] {
  const logs = getLogs();
  const now = new Date();
  
  // Format to standard readable string, e.g. [2026-06-07 10:00:22]
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  
  const newLog: ActivityLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp,
    message,
  };
  
  const updated = [newLog, ...logs].slice(0, 500); // Limit to last 500 logs for efficiency
  localStorage.setItem('pocket_logs', JSON.stringify(updated));
  return updated;
}

export function downloadLogs() {
  const logs = getLogs();
  if (logs.length === 0) {
    alert('Log aktivitas masih kosong!');
    return;
  }
  
  const textContent = logs
    .map((log) => `[${log.timestamp}] ${log.message}`)
    .join('\n');
  
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'log.txt';
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
