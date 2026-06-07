import React, { useState } from 'react';
import { Habit } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { Flame, Sparkles, Plus, Trash2, Calendar, Smile, RotateCcw } from 'lucide-react';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

interface HabitsTrackerProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'streak' | 'lastCheckedIn' | 'history'>) => void;
  onCheckInHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
  onResetHabit: (id: string) => void;
  lang?: Language;
}

const PASTEL_COLORS = [
  '#f43f5e', // Neon Rose
  '#a855f7', // Mystic Purple
  '#0ea5e9', // Cyber Blue
  '#10b981', // Acid Green
  '#f59e0b', // Power Gold
  '#ec38bc', // Retro Pink
];

const EMOJI_OPTIONS = ['🏃', '💧', '📚', '🥦', '🧘', '🧉', '🛌', '🧹', '🎨', '💻', '🔋', '🎧', '🎸', '🌱'];

export default function HabitsTracker({
  habits,
  onAddHabit,
  onCheckInHabit,
  onDeleteHabit,
  onResetHabit,
  lang = 'id'
}: HabitsTrackerProps) {
  const t = TRANSLATIONS[lang];
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('Harian');
  const [newHabitColor, setNewHabitColor] = useState(PASTEL_COLORS[0]);
  const [newHabitIcon, setNewHabitIcon] = useState(EMOJI_OPTIONS[0]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) {
      Swal.fire({
        title: lang === 'jp' ? 'エラー！' : lang === 'en' ? 'Oops!' : 'Ups!',
        text: lang === 'jp' ? '習慣の名前を入力してください！' : lang === 'en' ? 'Please enter a habit name!' : 'Tuliskan nama habit impianmu terlebih dahulu kawan!',
        icon: 'warning',
        confirmButtonColor: '#ec38bc',
        customClass: {
          popup: 'border-4 border-black bg-[#11142e] text-white font-display'
        }
      });
      return;
    }

    onAddHabit({
      name: newHabitName,
      frequency: newHabitFreq,
      color: newHabitColor,
      icon: newHabitIcon,
    });

    setNewHabitName('');
    setNewHabitFreq('Harian');
    setNewHabitColor(PASTEL_COLORS[0]);
    setNewHabitIcon(EMOJI_OPTIONS[0]);
    setShowAddModal(false);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 }
    });

    Swal.fire({
      title: lang === 'jp' ? '習慣開始！ 🌱' : lang === 'en' ? 'New Habit Commenced! 🚀' : 'Habit Baru Dimulai! 🚀',
      text: lang === 'jp' ? '毎日一歩ずつ進みましょう！' : lang === 'en' ? 'Remember: raw consistency beats random high intensity!' : 'Semoga konsisten ya. Ingat, satu langkah kecil setiap hari!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: 'border-4 border-black bg-[#11142e] text-white font-display'
      }
    });
  };

  const getLast7Days = () => {
    const daysIndo = lang === 'jp' ? ['日', '月', '火', '水', '木', '金', '土'] : lang === 'en' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        name: daysIndo[d.getDay()],
        dateStr,
        dayNum: d.getDate(),
      });
    }
    return result;
  };

  const streakDays = getLast7Days();

  return (
    <div className="space-y-6 animate-fade-in" id="habit-tracker-section">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 card text-white">
        <div>
          <h1 className="text-md md:text-lg font-display font-black text-emerald-400 flex items-center gap-1.5">
            🌱 {t.habits_title}
          </h1>
          <p className="text-[10px] text-slate-300 mt-1 uppercase">
            {t.habits_desc}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#ec38bc] border-2 border-black shadow-[2px_2px_0_0_#000] text-white font-display font-bold text-[10px] hover:bg-pink-500 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3px] inline mr-1" /> {t.add_habit_btn}
        </button>
      </div>

      {/* Main Habits List */}
      {habits.length === 0 ? (
        <div className="card text-center py-12 text-white">
          <div className="text-4xl mb-3">🧗‍♂️</div>
          <h3 className="text-xs font-display font-bold text-yellow-405 text-yellow-400">{t.no_habits_tracker}</h3>
          <p className="text-[10px] text-slate-400 mt-2 max-w-md mx-auto">
            {lang === 'jp' ? '毎日コップ一杯の。水を飲むなど、小さな習慣から始めましょう！' : lang === 'en' ? 'Consistent actions build permanent habits! Begin with something simple.' : 'Mulai dari yang kecil, seperti minum air putih atau membaca 5 halaman buku!'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 px-4 py-2 bg-[#3b82f6] text-white font-display border-2 border-black font-bold text-[10px] cursor-pointer hover:bg-blue-400 shadow-[2px_2px_0_0_#000]"
          >
            {lang === 'jp' ? '今すぐ開始！' : lang === 'en' ? 'Start Now!' : 'Mulai Sekarang!'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map((habit) => {
            const hasCheckedInToday = habit.history.includes(todayStr);

            return (
              <div
                key={habit.id}
                className="card p-0 overflow-hidden relative text-white"
              >
                {/* Visual Header Stripe */}
                <div 
                  className="h-2 border-b-2 border-black" 
                  style={{ backgroundColor: habit.color }}
                />

                <div className="p-4 space-y-3">
                  {/* Title & Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-slate-950 border-2 border-black text-white">
                        {habit.icon}
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-white line-clamp-1">{habit.name}</h3>
                        <p className="text-[8px] font-display font-bold text-cyan-300 bg-black/60 px-2 py-0.5 border border-black uppercase w-max tracking-wider mt-1">
                          🔁 {habit.frequency}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center bg-black/60 p-1.5 border border-black">
                      <Flame className="w-4 h-4 text-[#ec38bc] fill-[#ec38bc] animate-pulse mr-1" />
                      <div className="text-right">
                        <p className="text-[7px] font-display text-slate-500 uppercase leading-none">Streak</p>
                        <p className="text-[9px] font-bold text-yellow-405 text-yellow-400 mt-0.5">{habit.streak} {lang === 'jp' ? '日' : lang === 'en' ? 'Days' : 'Hari'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Checklist history grid */}
                  <div className="bg-slate-950 p-3 border-2 border-black">
                    <p className="text-[8px] font-display text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {t.last_7_days}
                    </p>
                    <div className="grid grid-cols-7 gap-1.5">
                      {streakDays.map((day) => {
                        const checked = habit.history.includes(day.dateStr);
                        const isToday = day.dateStr === todayStr;

                        return (
                          <div
                            key={day.dateStr}
                            className={`flex flex-col items-center justify-center py-1 border text-center relative ${
                              checked
                                ? 'bg-emerald-950 border-emerald-400 text-emerald-400 font-bold'
                                : isToday
                                ? 'bg-yellow-950/40 border-yellow-500 border-dashed text-yellow-400'
                                : 'bg-slate-900 border-black text-slate-600'
                            }`}
                            title={day.dateStr}
                          >
                            <span className="text-[7px] font-bold">{day.name}</span>
                            <span className="text-[9px] font-bold mt-0.5">{day.dayNum}</span>
                            {checked && (
                              <span className="absolute -top-1 -right-1 text-[7px]">⭐</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operational buttons */}
                  <div className="flex justify-between items-center gap-2 pt-1">
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-2 bg-red-950 hover:bg-red-800 text-red-400 border-2 border-black inline-flex items-center justify-center cursor-pointer"
                      title="Hapus Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => onResetHabit(habit.id)}
                      className="p-2 bg-slate-950 hover:bg-slate-900 text-slate-400 border-2 border-black text-[8px] font-display flex items-center gap-1 cursor-pointer"
                      title="Reset Streak"
                    >
                      <RotateCcw className="w-3 h-3" /> {lang === 'jp' ? 'リセット' : lang === 'en' ? 'Reset' : 'Reset'}
                    </button>

                    {hasCheckedInToday ? (
                      <div className="flex-1 py-1.5 bg-emerald-900/60 text-emerald-400 font-display font-medium border-2 border-black flex items-center justify-center gap-1 text-[8px] select-none uppercase">
                        <Smile className="w-3 h-3 text-emerald-400" /> Done! Checked
                      </div>
                    ) : (
                      <button
                        onClick={() => onCheckInHabit(habit.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-display font-bold text-[8px] border-2 border-black flex items-center justify-center gap-1 cursor-pointer shadow-[1.5px_1.5px_0_0_#000]"
                      >
                        <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
                        CHECK-IN! (+XP)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card max-w-sm w-full p-0 overflow-hidden text-white border-4 border-black">
            <div className="bg-slate-950 border-b-2 border-black p-3.5 flex justify-between items-center">
              <h2 className="font-display font-black text-xs text-[#ec38bc] flex items-center gap-1.5">
                🌱 {lang === 'jp' ? '新規習慣の追加' : lang === 'en' ? 'ADD CYBER HABIT' : 'Tambah Habit Disiplin Baru'}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-6 h-6 border-2 border-black bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center cursor-pointer text-[9px]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Habit Name */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">
                  {lang === 'jp' ? '習慣の名前' : lang === 'en' ? 'HABIT NAME' : 'Nama Habit'}
                </label>
                <input
                  type="text"
                  maxLength={30}
                  className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-slate-100 font-bold text-xs focus:outline-none"
                  placeholder={lang === 'jp' ? '電子書籍を読む、ジムなど...' : lang === 'en' ? 'e.g. Read 10 pages, Hydrate 3L...' : 'Contoh: Minum Air 2 Liter, Meditasi Pagi...'}
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
              </div>

              {/* Freq */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">
                  {lang === 'jp' ? '目標の頻度' : lang === 'en' ? 'FREQUENCY TARGET' : 'Frekuensi Target'}
                </label>
                <select
                  className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none cursor-pointer"
                  value={newHabitFreq}
                  onChange={(e) => setNewHabitFreq(e.target.value)}
                >
                  <option value="Harian">{lang === 'jp' ? '毎日 📆' : lang === 'en' ? 'Every Day 📆' : 'Setiap Hari 📆'}</option>
                  <option value="3x Seminggu">{lang === 'jp' ? '週3回 🧭' : lang === 'en' ? '3x A Week 🧭' : '3 Kali Seminggu 🧭'}</option>
                  <option value="Akhir Pekan">{lang === 'jp' ? '週末のみ 🕹️' : lang === 'en' ? 'Weekends Only 🕹️' : 'Hanya Akhir Pekan 🕹️'}</option>
                </select>
              </div>

              {/* Icon / Emoji Selection */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">
                  {lang === 'jp' ? 'アイコン' : lang === 'en' ? 'SELECT EMOJI' : 'Pilih Icon'}
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 border-2 border-black max-h-20 overflow-y-auto">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewHabitIcon(e)}
                      className={`text-base p-1 border transition-all cursor-pointer ${
                        newHabitIcon === e
                          ? 'bg-purple-900 border-purple-400 scale-110 shadow-xs'
                          : 'border-transparent hover:bg-slate-900'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Stripe selection */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">
                  {lang === 'jp' ? 'テーマ色' : lang === 'en' ? 'PALETTE STRIPE' : 'Tema Kartu'}
                </label>
                <div className="flex gap-2.5">
                  {PASTEL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewHabitColor(c)}
                      className={`w-6 h-6 border-2 transition-transform cursor-pointer ${
                        newHabitColor === c
                          ? 'border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-950 border-2 border-black text-slate-400 hover:text-white font-display font-semibold text-[8px] cursor-pointer"
                >
                  {lang === 'jp' ? 'キャンセル' : lang === 'en' ? 'CANCEL' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 border-2 border-black text-black font-display font-bold text-[8px] cursor-pointer"
                >
                  {lang === 'jp' ? '確定 🚀' : lang === 'en' ? 'START WORK 🚀' : 'Yuk Mulai! 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
