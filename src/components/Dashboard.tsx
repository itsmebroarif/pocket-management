import React from 'react';
import { Habit, Task, Wallet, Transaction } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Flame, 
  Calendar, 
  Clock, 
  Sparkles,
  Smile,
  Check,
  TrendingDown,
  BarChart2
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/audio';

// Chart.js integrations
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  habits: Habit[];
  tasks: Task[];
  wallets: Wallet[];
  transactions: Transaction[];
  onCheckInHabit: (id: string) => void;
  onCompleteTask: (id: string) => void;
  setActiveTab: (tab: string) => void;
  userName?: string;
  lang?: Language;
}

export default function Dashboard({
  habits,
  tasks,
  wallets,
  transactions,
  onCheckInHabit,
  onCompleteTask,
  setActiveTab,
  userName = 'Kawan',
  lang = 'id'
}: DashboardProps) {
  const t = TRANSLATIONS[lang];
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingHabits = habits.filter(h => !h.history.includes(todayStr));

  // Get active tasks (not done), prioritize High and nearest deadline
  const activeTasks = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const weightA = priorityWeight[a.priority];
      const weightB = priorityWeight[b.priority];
      if (weightA !== weightB) return weightB - weightA;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 3); // Top 3 priority tasks

  // Calculate total balance across all wallets
  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  // Calculate expenses today
  const todayExpense = transactions
    .filter(t => t.type === 'expense' && t.date === todayStr)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate income today
  const todayIncome = transactions
    .filter(t => t.type === 'income' && t.date === todayStr)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Formatting currency Indonesian Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // ==========================================
  // CHART 1: ALOKASI PENGELUARAN KATEGORI (Doughnut)
  // ==========================================
  const expenseCategories: { [cat: string]: number } = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const catName = t.category.split(' ')[0] || t.category; // shorten emoji
      expenseCategories[catName] = (expenseCategories[catName] || 0) + t.amount;
    });

  const catLabels = Object.keys(expenseCategories);
  const catValues = Object.values(expenseCategories);

  const doughnutData = {
    labels: catLabels.length > 0 ? catLabels : ['No Data'],
    datasets: [{
      label: 'Nominal Rupiah (IDR)',
      data: catValues.length > 0 ? catValues : [1],
      backgroundColor: catValues.length > 0 ? [
        '#0288d1',  // Aqua Blue
        '#10b981',  // Emerald Green
        '#ff9800', // Glass Orange
        '#f43f5e',   // Hot Rose
        '#8b5cf6',  // Vibrant Purple
        '#f59e0b'    // Sun Yellow
      ] : ['#334155'],
      borderColor: '#000000',
      borderWidth: 3,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          font: { family: 'Silkscreen', size: 9 }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (catValues.length === 0) return ' No transactions';
            const value = context.raw || 0;
            return ` ${context.label}: ${formatRupiah(value)}`;
          }
        }
      }
    }
  };

  // ==========================================
  // CHART 2: TUGAS KANBAN COMPLETION STATUS (Bar)
  // ==========================================
  const taskCounts = { todo: 0, in_progress: 0, done: 0 };
  tasks.forEach(t => {
    if (taskCounts[t.status] !== undefined) {
      taskCounts[t.status]++;
    }
  });

  const barData = {
    labels: [t.todo, t.in_progress, t.done],
    datasets: [{
      label: 'Tasks',
      data: [taskCounts.todo, taskCounts.in_progress, taskCounts.done],
      backgroundColor: [
        '#ff9800', // Retro Gold / Orange
        '#0288d1', // Aquatic Blue
        '#10b981'  // Success Green
      ],
      borderColor: '#000000',
      borderWidth: 3,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return ` ${context.raw} Tasks`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#ffffff', font: { family: 'Silkscreen', size: 8 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#ffffff', font: { family: 'Silkscreen', size: 8 }, stepSize: 1 },
        grid: { color: '#1e293b' }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-hub">
      {/* Welcome Banner with neon colors & pixel style */}
      <div 
        className="card relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-6"
        onMouseEnter={() => playHoverSound()}
      >
        <div className="absolute right-4 bottom-[-20px] opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-yellow-400" />
        </div>
        
        <div className="relative z-10-retro">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-1.5 bg-black border border-slate-700 animate-bounce">👾</span>
            <h1 className="text-md md:text-lg font-display font-extrabold text-[#ec38bc] flex items-center gap-1">
              {t.welcome.replace('{name}', userName)} <Smile className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </h1>
          </div>
          <p className="text-[10px] font-sans text-slate-300 font-bold uppercase mt-2">
            {t.intro}
          </p>
        </div>

        <button 
          onClick={() => {
            playClickSound();
            setActiveTab('games');
          }}
          onMouseEnter={() => playHoverSound()}
          className="aero-bubble-btn aero-aqua cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3 h-3 text-white animate-spin" /> {t.mini_arcade_btn}
        </button>
      </div>

      {/* CHARTS ROW INTEGRATED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Expense Allocations */}
        <div 
          className="card"
          onMouseEnter={() => playHoverSound()}
        >
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <h3 className="font-display text-xs flex items-center gap-2 text-cyan-400">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              {t.allocation_title}
            </h3>
            <span className="text-[7px] font-display px-2 py-0.5 bg-[#ff9800] text-black font-bold">Chart.js Pie</span>
          </div>

          <div className="relative h-60 w-full flex items-center justify-center">
            {catValues.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black border-2 border-dashed border-slate-700 p-4">
                <p className="text-[10px] text-slate-400">Belum ada data pengeluaran terekam.</p>
                <p className="text-[8px] text-slate-500 mt-2">Gunakan tab Keuangan Mini untuk mencatat pengeluaran pertama!</p>
              </div>
            ) : (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            )}
          </div>
        </div>

        {/* Chart B: Task Status Summary */}
        <div 
          className="card"
          onMouseEnter={() => playHoverSound()}
        >
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <h3 className="font-display text-xs flex items-center gap-2 text-emerald-400">
              <BarChart2 className="w-4 h-4" />
              {t.task_status_title}
            </h3>
            <span className="text-[7px] font-display px-2 py-0.5 bg-[#8b5cf6] text-white font-bold">Chart.js Bar</span>
          </div>

          <div className="relative h-60 w-full flex items-center justify-center">
            {tasks.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black border-2 border-dashed border-slate-700 p-4">
                <p className="text-[10px] text-slate-400">Belum ada daftar pekerjaan/tugas.</p>
                <p className="text-[8px] text-slate-500 mt-2">Buat tugas pertamamu di Tugas Kanban kawan!</p>
              </div>
            ) : (
              <Bar data={barData} options={barOptions} />
            )}
          </div>
        </div>

      </div>

      {/* Main Grid Overview of Lists & Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Focus Today & Priority tasks */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section: Habits Focus Today */}
          <div 
            className="card text-white"
            onMouseEnter={() => playHoverSound()}
          >
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
              <h2 className="text-xs font-display flex items-center gap-1.5 text-[#ec38bc]">
                <Flame className="w-4 h-4 text-[#ec38bc] animate-pulse" />
                {t.focus_today}
              </h2>
              <button 
                onClick={() => {
                  playClickSound();
                  setActiveTab('habits');
                }}
                onMouseEnter={() => playHoverSound()}
                className="text-[8px] font-display text-cyan-300 hover:underline cursor-pointer bg-black/60 px-2 py-1 border border-black shadow-[1px_1px_0_0_#000]"
              >
                {t.all_habits}
              </button>
            </div>

            {pendingHabits.length === 0 ? (
              <div className="bg-black p-6 border-2 border-dashed border-slate-700 text-center">
                <p className="text-[10px] font-display text-emerald-400 flex items-center justify-center gap-2">
                  {t.no_habits}
                </p>
                <p className="text-[8px] text-slate-400 mt-2">{t.keep_streak}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingHabits.slice(0, 4).map((habit) => (
                  <div 
                    key={habit.id}
                    onMouseEnter={() => playHoverSound()}
                    className="bg-slate-900 p-3 border-2 border-black flex items-center justify-between hover:scale-[1.01] transform transition-transform text-white shadow-[2px_2px_0_0_#000]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-1 bg-black border border-slate-700">{habit.icon}</span>
                      <div>
                        <h3 className="text-[10px] font-bold text-white truncate max-w-[120px]">{habit.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame className="w-3.5 h-3.5 text-[#ec38bc] fill-[#ec38bc]" />
                          <span className="text-[8px] text-yellow-405 text-yellow-400 font-display">{t.streak_count.replace('{count}', habit.streak.toString())}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        playClickSound();
                        onCheckInHabit(habit.id);
                      }}
                      onMouseEnter={() => playHoverSound()}
                      className="aero-bubble-btn aero-green px-2 py-1 text-white hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
                    >
                      <Check className="w-4 h-4 stroke-[3px]" />
                    </button>
                  </div>
                ))}
                {pendingHabits.length > 4 && (
                  <div 
                    onClick={() => {
                      playClickSound();
                      setActiveTab('habits');
                    }}
                    onMouseEnter={() => playHoverSound()}
                    className="bg-slate-950 hover:bg-slate-900 border-2 border-dashed border-slate-700 p-3 flex items-center justify-center cursor-pointer text-[8px] font-display text-slate-400 transition-colors"
                  >
                    + {pendingHabits.length - 4} MORE TARGETS!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Tugas Prioritas */}
          <div 
            className="card text-white"
            onMouseEnter={() => playHoverSound()}
          >
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
              <h2 className="text-xs font-display flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                {t.priority_tasks}
              </h2>
              <button 
                onClick={() => {
                  playClickSound();
                  setActiveTab('tasks');
                }}
                onMouseEnter={() => playHoverSound()}
                className="text-[8px] font-display text-cyan-300 hover:underline cursor-pointer bg-black/60 px-2 py-1 border border-black shadow-[1px_1px_0_0_#000]"
              >
                {t.open_tasks}
              </button>
            </div>

            {activeTasks.length === 0 ? (
              <div className="bg-black p-6 border-2 border-dashed border-slate-700 text-center">
                <p className="text-[10px] text-cyan-400">{t.no_tasks}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.map((task) => {
                  const isHigh = task.priority === 'high';
                  const isMedium = task.priority === 'medium';
                  return (
                    <div 
                      key={task.id}
                      onMouseEnter={() => playHoverSound()}
                      className="bg-slate-900 p-3 border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-3 text-white shadow-[2px_2px_0_0_#000]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isHigh ? (
                            <span className="px-1.5 py-0.5 text-[7px] bg-red-600 text-white font-display border border-black uppercase">{t.priority_high}</span>
                          ) : isMedium ? (
                            <span className="px-1.5 py-0.5 text-[7px] bg-amber-500 text-white font-display border border-black uppercase">{t.priority_med}</span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[7px] bg-slate-600 text-white font-display border border-black uppercase">{t.priority_low}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-[10px] font-bold text-white line-clamp-1">{task.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-slate-400 text-[9px] font-medium">
                            <span className="bg-black px-1.5 py-0.5 border border-slate-800 text-[8px] text-cyan-300">{t.tag_label}: {task.tag}</span>
                            <span className="flex items-center gap-1 text-rose-450 text-rose-400">
                              <Calendar className="w-3 h-3" />
                              {t.deadline_label}: {task.deadline}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-0 pt-2.5 md:pt-0 border-slate-800">
                        <span className="text-[8px] font-display px-2 py-1 bg-slate-950 border border-slate-800 text-cyan-400 uppercase">
                          {task.status === 'todo' ? t.todo : t.in_progress}
                        </span>
                        <button
                          onClick={() => {
                            playClickSound();
                            onCompleteTask(task.id);
                          }}
                          onMouseEnter={() => playHoverSound()}
                          className="aero-bubble-btn aero-green py-1.5 px-3 text-[8px] flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" /> {t.done}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Ringkasan Dompet & Arus Kas Today */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Total Balance & Wallets */}
          <div 
            className="card text-white flex flex-col justify-between"
            onMouseEnter={() => playHoverSound()}
          >
            <div>
              <h2 className="text-xs font-display text-white flex items-center gap-1.5 mb-3">
                <WalletIcon className="w-4 h-4 text-rose-500" />
                {t.wallets_title}
              </h2>
              <div className="bg-black border-2 border-black p-4 mb-4 shadow-[inset_2px_2px_0_0_#000]">
                <p className="text-[7px] font-display text-slate-450 text-slate-400 uppercase tracking-wider">{t.sub_wallets}</p>
                <p className="text-sm md:text-md font-bold text-yellow-405 text-yellow-400 mt-1 select-all">{formatRupiah(totalBalance)}</p>
              </div>

              {/* Wallet list splits */}
              <div className="space-y-2">
                {wallets.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-2.5 bg-slate-900 border-2 border-black text-[9px] shadow-[1px_1px_0_0_#000]">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-black border border-slate-800">{w.icon}</span>
                      <div>
                        <p className="font-bold text-white leading-tight">{w.name}</p>
                        <p className="text-[8px] uppercase text-slate-500 mt-0.5">{w.type}</p>
                      </div>
                    </div>
                    <p className="font-extrabold text-cyan-300">{formatRupiah(w.balance)}</p>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                playClickSound();
                setActiveTab('finance');
              }}
              onMouseEnter={() => playHoverSound()}
              className="aero-bubble-btn aero-aqua w-full mt-4 py-2 flex items-center justify-center gap-1.5 cursor-pointer text-[8px]"
            >
              {t.log_cash_btn}
            </button>
          </div>

          {/* Today's Transactions Summary */}
          <div 
            className="card text-white"
            onMouseEnter={() => playHoverSound()}
          >
            <h2 className="text-xs font-display text-white flex items-center gap-1.5 mb-3">
              <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
              {t.cashflow_today}
            </h2>

            <div className="space-y-2">
              <div className="bg-slate-950 p-2.5 border-2 border-black flex items-center justify-between shadow-[1.5px_1.5px_0_0_#000]">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-900 border border-emerald-500">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                  <div>
                    <p className="text-[8px] text-slate-400 font-display uppercase">{t.income_today}</p>
                    <p className="text-xs font-black text-emerald-400">{formatRupiah(todayIncome)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 border-2 border-black flex items-center justify-between shadow-[1.5px_1.5px_0_0_#000]">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-rose-955 bg-rose-900 border border-rose-500">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-rose-450 text-rose-400" />
                  </span>
                  <div>
                    <p className="text-[8px] text-slate-400 font-display uppercase">{t.expense_today}</p>
                    <p className="text-xs font-black text-rose-400">{formatRupiah(todayExpense)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
