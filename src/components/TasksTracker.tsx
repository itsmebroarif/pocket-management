import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Tag as TagIcon, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  Inbox
} from 'lucide-react';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

interface TasksTrackerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, newStatus: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
  lang?: Language;
}

const COMMON_TAGS = ['Kerja 💻', 'Pribadi 🏠', 'Belajar 📚', 'Keuangan 💰', 'Olahraga 🏃', 'Hiburan 🎮'];

export default function TasksTracker({
  tasks,
  onAddTask,
  onUpdateStatus,
  onDeleteTask,
  lang = 'id'
}: TasksTrackerProps) {
  const t = TRANSLATIONS[lang];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newTag, setNewTag] = useState(COMMON_TAGS[0]);
  const [customTag, setCustomTag] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      Swal.fire({
        title: lang === 'jp' ? '電子記録エラー' : lang === 'en' ? 'Blank Task Title!' : 'Formulir Kosong!',
        text: lang === 'jp' ? 'タスク名を入力してください！' : lang === 'en' ? 'Task title cannot be blank!' : 'Tolong beri judul tugas baru Anda kawan!',
        icon: 'warning',
        confirmButtonColor: '#ec38bc',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white font-display' }
      });
      return;
    }

    const finalTag = customTag.trim() ? customTag.trim() : newTag;

    onAddTask({
      title: newTitle,
      status: 'todo',
      priority: newPriority,
      tag: finalTag,
      deadline: newDeadline || todayStr,
    });

    setNewTitle('');
    setNewPriority('medium');
    setNewTag(COMMON_TAGS[0]);
    setCustomTag('');
    setNewDeadline('');
    setShowAddForm(false);

    Swal.fire({
      title: lang === 'jp' ? '追加完了！ 📝' : lang === 'en' ? 'Task Created! 📝' : 'Tugas Tercatat! 📝',
      text: lang === 'jp' ? '１つずつ進めていきましょう！' : lang === 'en' ? 'Consistency matters — crush it!' : 'Semangat menyelesaikannya satu demi satu!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'border-4 border-black bg-[#11142e] text-white font-display' }
    });
  };

  const promoteStatus = (task: Task) => {
    if (task.status === 'todo') {
      onUpdateStatus(task.id, 'in_progress');
    } else if (task.status === 'in_progress') {
      onUpdateStatus(task.id, 'done');
      confetti({
        particleCount: 120,
        spread: 85,
        colors: ['#0ea5e9', '#10b981', '#f59e0b', '#ec38bc'],
        origin: { y: 0.8 }
      });
    }
  };

  const demoteStatus = (task: Task) => {
    if (task.status === 'in_progress') {
      onUpdateStatus(task.id, 'todo');
    } else if (task.status === 'done') {
      onUpdateStatus(task.id, 'in_progress');
    }
  };

  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-950 text-red-400 border-red-500',
          accent: '💥 ' + t.priority_high
        };
      case 'medium':
        return {
          bg: 'bg-amber-950 text-amber-400 border-amber-500',
          accent: '🧭 ' + t.priority_med
        };
      case 'low':
        return {
          bg: 'bg-emerald-950 text-emerald-400 border-emerald-500',
          accent: '🌱 ' + t.priority_low
        };
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const progressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const renderTaskCard = (task: Task) => {
    const pr = getPriorityInfo(task.priority);
    return (
      <div
        key={task.id}
        className="bg-slate-900 border-2 border-black p-3.5 flex flex-col justify-between space-y-3 shadow-[2.5px_2.5px_0px_0px_#000] relative group hover:scale-[1.01] transition-transform text-white"
      >
        {/* Tag and priority */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 border border-black text-[7px] font-display text-cyan-300">
            <TagIcon className="w-2 h-2" />
            {task.tag}
          </span>
          <span className={`text-[7px] font-display px-2 py-0.5 border-2 border-black font-bold uppercase ${pr.bg}`}>
            {pr.accent}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className={`font-display text-[9px] leading-relaxed text-slate-100 ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>
            {task.title}
          </h3>
        </div>

        {/* Bottom info & movement controls */}
        <div className="flex items-center justify-between border-t-2 border-black pt-2 text-[8px] font-display">
          <span className="flex items-center gap-0.5 text-slate-400">
            <Calendar className="w-3 h-3 text-slate-500" />
            Batas: {task.deadline}
          </span>

          <div className="flex items-center gap-1 justify-end shrink-0">
            {task.status !== 'todo' && (
              <button
                onClick={() => demoteStatus(task)}
                className="p-1 bg-slate-950 hover:bg-slate-800 border border-black cursor-pointer text-slate-350"
                title="Kembalikan status"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 bg-red-955 bg-red-950 text-red-500 border border-black cursor-pointer hover:bg-red-900"
              title="Hapus Tugas"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            {task.status !== 'done' && (
              <button
                onClick={() => promoteStatus(task)}
                className="p-1 bg-sky-500 hover:bg-sky-450 border border-black cursor-pointer text-white shadow-[1px_1px_0_0_#000]"
                title={task.status === 'todo' ? 'Kerjakan Sekarang' : 'Selesaikan Tugas'}
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" id="tasks-board-layout">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 card text-white">
        <div>
          <h1 className="text-md md:text-lg font-display font-black text-rose-450 text-rose-400 flex items-center gap-1.5">
            📝 {t.tasks_board_title}
          </h1>
          <p className="text-[10px] text-slate-300 mt-1 uppercase">
            {t.tasks_board_subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-emerald-600 border-2 border-black shadow-[2px_2px_0_0_#000] text-black font-display font-bold text-[10px] hover:bg-emerald-500 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3px] inline mr-1" /> {t.add_task_btn}
        </button>
      </div>

      {/* Kanban Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= COLUMN 1: TODO ================= */}
        <div className="card text-white flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <h2 className="font-display font-black text-xs text-cyan-400 flex items-center gap-1.5">
              🎯 {t.todo}
            </h2>
            <span className="px-2 py-0.5 bg-[#ec38bc] border-2 border-black text-white text-[9px] font-display font-black">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3.5 flex-1">
            {todoTasks.length === 0 ? (
              <div className="h-full border-2 border-dashed border-slate-700 p-6 flex flex-col items-center justify-center text-center bg-black/40">
                <Inbox className="w-6 h-6 text-slate-650 text-slate-600 mb-1" />
                <p className="text-[9px] font-display text-slate-500">Antrean kosong!</p>
              </div>
            ) : (
              todoTasks.map(t => renderTaskCard(t))
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: IN PROGRESS ================= */}
        <div className="card text-white flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <h2 className="font-display font-black text-xs text-[#ff9800] flex items-center gap-1.5">
              ⚡ {t.in_progress}
            </h2>
            <span className="px-2 py-0.5 bg-[#ff9800] border-2 border-black text-black text-[9px] font-display font-black">
              {progressTasks.length}
            </span>
          </div>

          <div className="space-y-3.5 flex-1">
            {progressTasks.length === 0 ? (
              <div className="h-full border-2 border-dashed border-slate-700 p-6 flex flex-col items-center justify-center text-center bg-black/40">
                <Sparkles className="w-6 h-6 text-yellow-500 mb-1 animate-spin" />
                <p className="text-[9px] font-display text-slate-500">Belum ada fokus aktif.</p>
              </div>
            ) : (
              progressTasks.map(t => renderTaskCard(t))
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: DONE ================= */}
        <div className="card text-white flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <h2 className="font-display font-black text-xs text-[#10b981] flex items-center gap-1.5">
              🎉 {t.done}
            </h2>
            <span className="px-2 py-0.5 bg-[#10b981] border-2 border-black text-black text-[9px] font-display font-black">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-3.5 flex-1">
            {doneTasks.length === 0 ? (
              <div className="h-full border-2 border-dashed border-slate-700 p-6 flex flex-col items-center justify-center text-center bg-black/40">
                <CheckCircle className="w-6 h-6 text-slate-650 text-slate-600 mb-1" />
                <p className="text-[9px] font-display text-slate-500">Belum ada tugas selesai.</p>
              </div>
            ) : (
              doneTasks.map(t => renderTaskCard(t))
            )}
          </div>
        </div>

      </div>

      {/* Modal: Add Task */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card max-w-sm w-full p-0 overflow-hidden text-white border-4 border-black">
            <div className="bg-slate-950 border-b-2 border-black p-3.5 flex justify-between items-center">
              <h2 className="font-display font-black text-xs text-[#ec38bc] flex items-center gap-1.5">
                📝 {lang === 'jp' ? 'タスク作成' : lang === 'en' ? 'ADD QUEST TASK' : 'Buat Tugas Fokus Baru'}
              </h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="w-6 h-6 border-2 border-black bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center cursor-pointer text-[9px]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase tracking-widest">{lang === 'jp' ? 'タスクタイトル' : lang === 'en' ? 'TASK TITLE' : 'Judul Tugas'}</label>
                <input
                  type="text"
                  maxLength={50}
                  className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-slate-100 font-bold text-xs focus:outline-none"
                  placeholder={lang === 'jp' ? 'タスク名を入力...' : lang === 'en' ? 'e.g. Code feature API routing...' : 'Contoh: Belajar modul React, Bayar tagihan dan belanja...'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase tracking-widest">{lang === 'jp' ? '優先順位' : lang === 'en' ? 'PRIORITY WEIGHT' : 'Tingkat Urgensi'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                    const active = newPriority === p;
                    const style = p === 'high' ? 'bg-red-600 text-white' : p === 'medium' ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-black';
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`py-1 text-[8px] font-bold border-2 border-black transition-all cursor-pointer ${
                          active
                            ? `${style} shadow-[1.5px_1.5px_0_0_#000]`
                            : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        {p === 'high' ? '🔴 ' + t.priority_high : p === 'medium' ? ' ' + t.priority_med : '🟢 ' + t.priority_low}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Selector */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase tracking-widest">{lang === 'jp' ? 'カテゴリタグ' : lang === 'en' ? 'CATEGORY TAG' : 'Kelompok Kategori (Tag)'}</label>
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {COMMON_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setNewTag(tag);
                        setCustomTag('');
                      }}
                      className={`px-2 py-0.5 text-[8px] font-bold border-2 border-black cursor-pointer transition ${
                        newTag === tag && !customTag
                          ? 'bg-[#ec38bc] text-white'
                          : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  maxLength={15}
                  className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-slate-100 focus:outline-none"
                  placeholder={lang === 'jp' ? 'カスタムタグを作成...' : lang === 'en' ? 'Or write a custom tag...' : '✍️ Buat tag kustom sendiri...'}
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                />
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase tracking-widest">{lang === 'jp' ? '期限日' : lang === 'en' ? 'LIMIT DEADLINE' : 'Tanggal Batas Akhir'}</label>
                <input
                  type="date"
                  className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-slate-100 font-bold text-xs focus:outline-none"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>

              {/* Action */}
              <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-950 border-2 border-black text-slate-400 hover:text-white font-display font-semibold text-[8px] cursor-pointer"
                >
                  {lang === 'jp' ? 'キャンセル' : lang === 'en' ? 'CANCEL' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-450 border-2 border-black text-black font-display font-bold text-[8px] cursor-pointer"
                >
                  {lang === 'jp' ? '確定 ✍️' : lang === 'en' ? 'CREATE TASK' : 'Buat Agenda!'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
