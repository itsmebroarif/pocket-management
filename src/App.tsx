import React, { useState, useEffect } from 'react';
import { Habit, Task, Wallet, Transaction, StickyNote, TaskStatus } from './types';
import { Language, TRANSLATIONS } from './utils/i18n';
import Dashboard from './components/Dashboard';
import HabitsTracker from './components/HabitsTracker';
import TasksTracker from './components/TasksTracker';
import FinanceManager from './components/FinanceManager';
import NotesSection from './components/NotesSection';
import MiniGames from './components/MiniGames';
import { writeLog, downloadLogs, getLogs } from './utils/logger';
import { 
  Sparkles, 
  Flame, 
  CheckSquare, 
  Wallet as WalletIcon, 
  StickyNote as NotesIcon, 
  Gamepad2, 
  Settings as SettingsIcon,
  LayoutDashboard,
  Download,
  Monitor,
  Trash2,
  RefreshCw,
  User,
  Heart,
  Terminal,
  Smile,
  Volume2,
  VolumeX,
  Play,
  Pause,
  History
} from 'lucide-react';
import Swal from 'sweetalert2';
import { playClickSound, playHoverSound, playScrollSound } from './utils/audio';

// BOILERPLATE STARTER DATA for a flawless first-time load playground experience
const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', name: 'Minum Air Putih 2 Liter 💧', frequency: 'Harian', streak: 3, lastCheckedIn: null, color: '#bfdbfe', icon: '💧', history: ['2026-06-05', '2026-06-06'] },
  { id: 'h2', name: 'Membaca Buku 10 Halaman 📚', frequency: 'Harian', streak: 5, lastCheckedIn: null, color: '#fef08a', icon: '📚', history: ['2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06'] },
  { id: 'h3', name: 'Meditasi Tenang 10 Menit 🧘', frequency: 'Harian', streak: 0, lastCheckedIn: null, color: '#ddd6fe', icon: '🧘', history: [] },
];

const DEFAULT_TASKS: Task[] = [
  { id: 't1', title: 'Belajar Fundamental React & Tailwind 💻', status: 'in_progress', priority: 'high', tag: 'Belajar 📚', deadline: '2026-06-10', createdAt: '2026-06-07' },
  { id: 't2', title: 'Belanja ragi kue & buah melon segar 🍉', status: 'todo', priority: 'medium', tag: 'Pribadi 🏠', deadline: '2026-06-08', createdAt: '2026-06-07' },
  { id: 't3', title: 'Membayar internet bulanan 💡', status: 'done', priority: 'high', tag: 'Keuangan 💰', deadline: '2026-06-07', createdAt: '2026-06-07' },
];

const DEFAULT_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Dompet Cash 💵', balance: 180000, color: '#bbf7d0', type: 'cash', icon: '💵' },
  { id: 'w2', name: 'Rekening Bank Mandiri 🏦', balance: 2450000, color: '#bfdbfe', type: 'bank', icon: '🏦' },
  { id: 'w3', name: 'Saldo GoPay / OVO 📲', balance: 350000, color: '#ddd6fe', type: 'e-wallet', icon: '📲' },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', type: 'expense', amount: 35000, description: 'Beli Nasi Goreng Gila Pedas', walletId: 'w1', category: 'Makanan & Minuman 🍔', date: '2026-06-07' },
  { id: 'tx2', type: 'income', amount: 500000, description: 'Gaji Freelance Desain Logo', walletId: 'w2', category: 'Gaji & Penghasilan 📈', date: '2026-06-06' },
  { id: 'tx3', type: 'expense', amount: 150000, description: 'Isi Pulsa & Paket Internet', walletId: 'w3', category: 'Tagihan & Utilitas 💡', date: '2026-06-07' },
];

const DEFAULT_NOTES: StickyNote[] = [
  { id: 'n1', content: 'Kunci konsistensi adalah memulai dari langkah kecil yang sangat mudah sampai mustahil untuk gagal! ✨', color: 'bg-yellow-200 border-yellow-350', rotation: -2, date: '2026-06-07' },
  { id: 'n2', content: 'Daftar belanja bulanan: Cabai rawit, sabun mandi, susu oat, dan kopi robusta ☕', color: 'bg-rose-200 border-rose-350', rotation: 1.5, date: '2026-06-07' },
];

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('pocket_username') || 'Kawan Fokus';
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('pocket_lang') as Language) || 'id';
  });

  const t = TRANSLATIONS[lang];

  const getShortTabLabel = (tab: string) => {
    const labels: Record<Language, Record<string, string>> = {
      id: {
        dashboard: 'Hub',
        habits: 'Habit',
        tasks: 'Tugas',
        finance: 'Uang',
        notes: 'Memo',
        games: 'Game',
        settings: 'Opsi'
      },
      en: {
        dashboard: 'Hub',
        habits: 'Habit',
        tasks: 'Kanban',
        finance: 'Finance',
        notes: 'Memo',
        games: 'Games',
        settings: 'Config'
      },
      jp: {
        dashboard: '総覧',
        habits: '習慣',
        tasks: 'タスク',
        finance: '家計',
        notes: 'メモ',
        games: 'ゲーム',
        settings: '設定'
      }
    };
    return labels[lang]?.[tab] || tab;
  };

  // PWA states and events hook
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof addLogMessage === 'function') {
        addLogMessage('PWA Pocket Tracker berhasil dipasang! Buka langsung via desktop/home screen Anda! 🚀');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerPwaInstall = async () => {
    if (!deferredPrompt) {
      Swal.fire({
        title: lang === 'jp' ? 'アプリのインストール 🖥' : lang === 'en' ? 'Desktop App Mode 🖥' : 'Instal Aplikasi Desktop 🖥',
        html: lang === 'jp'
          ? '<p class="text-xs leading-relaxed text-slate-300 text-left">Google ChromeやMicrosoft Edgeなどをご利用の場合、アドレスバーの右側にある<b>インストールボタン（⊕）</b>をクリックしてデスクトップアプリとして追加できます。<br/><br/>追加すると、ブラウザを開かなくてもアプリのように直接起動することができます！</p>'
          : lang === 'en'
          ? '<p class="text-xs leading-relaxed text-slate-300 text-left">Click the <b>Install Icon (⊕)</b> at the right end of your browser\'s URL address bar to download and install this app directly onto your local desktop or home screen!<br/><br/>Once installed, you can launch it seamlessly in an isolated standalone PWA frame.</p>'
          : '<p class="text-xs leading-relaxed text-slate-300 text-left">Klik <b>ikon instalasi (⊕)</b> di samping kanan baris alamat URL browser Anda (atau pilih opsi "Buka / Pasang Aplikasi" di menu browser) untuk mengunduhnya langsung ke desktop/ponsel!<br/><br/>Setelah terpasang, aplikasi dapat dijalankan langsung layaknya program bawaan tanpa membuka browser terlebih dahulu.</p>',
        icon: 'info',
        confirmButtonColor: '#ec38bc',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white' }
      });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      addLogMessage('Pengguna menyetujui kualifikasi instalasi desktop.');
    }
    setDeferredPrompt(null);
  };


  // Background Nostalgic OST properties
  const [isOstPlaying, setIsOstPlaying] = useState<boolean>(() => {
    return localStorage.getItem('pocket_ost_playing') === 'true';
  });
  const [ostVolume, setOstVolume] = useState<number>(() => {
    const val = localStorage.getItem('pocket_ost_volume');
    return val ? parseFloat(val) : 0.5;
  });

  // Main data states loaded lazily from LocalStorage
  const [habits, setHabits] = useState<Habit[]>(() => {
    const data = localStorage.getItem('pocket_habits');
    return data ? JSON.parse(data) : DEFAULT_HABITS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const data = localStorage.getItem('pocket_tasks');
    return data ? JSON.parse(data) : DEFAULT_TASKS;
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const data = localStorage.getItem('pocket_wallets');
    return data ? JSON.parse(data) : DEFAULT_WALLETS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const data = localStorage.getItem('pocket_transactions');
    return data ? JSON.parse(data) : DEFAULT_TRANSACTIONS;
  });

  const [notes, setNotes] = useState<StickyNote[]>(() => {
    const data = localStorage.getItem('pocket_notes');
    return data ? JSON.parse(data) : DEFAULT_NOTES;
  });

  // Logging storage synchronization status
  const [liveLogs, setLiveLogs] = useState<any[]>([]);

  useEffect(() => {
    // Initial logs fetch
    setLiveLogs(getLogs());
    if (getLogs().length === 0) {
      writeLog('Aplikasi Pocket Management pertama kali dijalankan!');
    }

    // Attach scroll sound listener
    const handleScrollEvent = () => {
      playScrollSound();
    };

    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    // Also attach to main containers once rendered
    const mainEl = document.getElementById('main-scroll-pane');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScrollEvent, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScrollEvent);
      if (mainEl) {
        mainEl.removeEventListener('scroll', handleScrollEvent);
      }
    };
  }, []);

  // Save states to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem('pocket_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('pocket_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pocket_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('pocket_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pocket_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('pocket_username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('pocket_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('pocket_ost_playing', isOstPlaying ? 'true' : 'false');
  }, [isOstPlaying]);

  // ==========================================
  // ACTION LOGGERS & TRANSACTION AGENTS
  // ==========================================
  const addLogMessage = (msg: string) => {
    const updated = writeLog(msg);
    setLiveLogs(updated);
  };

  // 🔄 Habit Trackers actions
  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'streak' | 'lastCheckedIn' | 'history'>) => {
    const fresh: Habit = {
      ...newHabit,
      id: 'habit_' + Math.random().toString(36).substr(2, 9),
      streak: 0,
      lastCheckedIn: null,
      history: []
    };
    setHabits(prev => [fresh, ...prev]);
    addLogMessage(`Habit baru dibuat: ${fresh.name}`);
  };

  const handleCheckInHabit = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        if (h.history.includes(todayStr)) return h; // Avoid duplicate checkin

        const updatedHistory = [...h.history, todayStr];
        let nextStreak = h.streak + 1;
        
        return {
          ...h,
          streak: nextStreak,
          lastCheckedIn: todayStr,
          history: updatedHistory
        };
      }
      return h;
    }));

    const targetH = habits.find(h => h.id === id);
    addLogMessage(`Mengklik check-in habit: ${targetH?.name}`);
  };

  const handleResetHabit = (id: string) => {
    const targetH = habits.find(h => h.id === id);
    Swal.fire({
      title: 'Reset Streak?',
      text: `Apakah kamu yakin mau mereset riwayat beruntun habit "${targetH?.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, Reset',
      cancelButtonText: 'Batal',
      customClass: { popup: 'aero-glass rounded-[24px]' }
    }).then((result) => {
      if (result.isConfirmed) {
        setHabits(prev => prev.map(h => {
          if (h.id === id) {
            return { ...h, streak: 0, history: [] };
          }
          return h;
        }));
        addLogMessage(`Mereset total streak habit: ${targetH?.name}`);
        Swal.fire({ title: 'Status Berubah!', text: 'Streak kembali dari nol kawan, semangat lagi!', icon: 'success' });
      }
    });
  };

  const handleDeleteHabit = (id: string) => {
    const targetH = habits.find(h => h.id === id);
    Swal.fire({
      title: 'Hapus Habit Ini?',
      text: `Habit "${targetH?.name}" beserta semua historinya akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'aero-glass rounded-[24px]' }
    }).then((result) => {
      if (result.isConfirmed) {
        setHabits(prev => prev.filter(h => h.id !== id));
        addLogMessage(`Menghapus habit: ${targetH?.name}`);
      }
    });
  };

  // 📝 Tasks list actions
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const fresh: Task = {
      ...newTask,
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [fresh, ...prev]);
    addLogMessage(`Tugas baru ditambahkan: ${fresh.title}`);
  };

  const handleUpdateTaskStatus = (id: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
    const targetT = tasks.find(t => t.id === id);
    addLogMessage(`Memindahkan tugas "${targetT?.title}" menuju tahapan: ${newStatus.toUpperCase()}`);
  };

  const handleCompleteTaskDirectly = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'done' };
      }
      return t;
    }));
    const targetT = tasks.find(t => t.id === id);
    addLogMessage(`Menyelesaikan langsung tugas prioritas: ${targetT?.title} 🎉`);
    
    Swal.fire({
      title: 'Sukses Diselesaikan! 🎉',
      text: `Bagus sekali! Tugas "${targetT?.title}" kini telah diselesaikan!`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'aero-glass rounded-[24px]' }
    });
  };

  const handleDeleteTask = (id: string) => {
    const targetT = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    addLogMessage(`Menghapus tugas: ${targetT?.title}`);
  };

  // 💰 Finance ledger actions
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const fresh: Transaction = {
      ...newTx,
      id: 'tx_' + Math.random().toString(36).substr(2, 9)
    };
    
    setWallets(prev => prev.map(w => {
      if (w.id === newTx.walletId) {
        const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
        return { ...w, balance: Math.max(w.balance + delta, 0) };
      }
      return w;
    }));

    setTransactions(prev => [fresh, ...prev]);
    addLogMessage(`Mencatat transaksi [${newTx.type}] ${newTx.description} sebesar Rp ${newTx.amount}`);
  };

  const handleDeleteTransaction = (id: string) => {
    const targetTx = transactions.find(t => t.id === id);
    if (!targetTx) return;

    Swal.fire({
      title: 'Hapus Transaksi?',
      text: `Aktivitas "${targetTx.description}" akan dihapus, saldo dompet akan dikembalikan!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Batalkan Catatan',
      cancelButtonText: 'Batal',
      customClass: { popup: 'aero-glass rounded-[24px]' }
    }).then((result) => {
      if (result.isConfirmed) {
        setWallets(prev => prev.map(w => {
          if (w.id === targetTx.walletId) {
            const reverseDelta = targetTx.type === 'income' ? -targetTx.amount : targetTx.amount;
            return { ...w, balance: Math.max(w.balance + reverseDelta, 0) };
          }
          return w;
        }));

        setTransactions(prev => prev.filter(t => t.id !== id));
        addLogMessage(`Menghapus catatan kas: ${targetTx.description}`);
        Swal.fire({ title: 'Terhapus!', text: 'Catatan dibatalkan dengan aman kawan!', icon: 'success' });
      }
    });
  };

  const handleModifyWalletBalance = (id: string, amount: number) => {
    setWallets(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, balance: Math.max(w.balance + amount, 0) };
      }
      return w;
    }));
    const targetW = wallets.find(w => w.id === id);
    addLogMessage(`Menyesuaikan saldo dompet ${targetW?.name} dengan modifikasi: Rp ${amount}`);
  };

  // 📓 Notes board actions
  const handleAddNote = (content: string, color: string) => {
    const randomRot = Math.random() * 5 - 2.5;
    const fresh: StickyNote = {
      id: 'note_' + Math.random().toString(36).substr(2, 9),
      content,
      color,
      rotation: randomRot,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    };
    setNotes(prev => [fresh, ...prev]);
    addLogMessage(`Membuat sticky note memo tempel baru: "${content.slice(0, 15)}..."`);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    addLogMessage(`Merobek sticky memo tempel berkeluaran dari papan pin.`);
  };

  // Systems utilities
  const handleReloadDefaultData = () => {
    Swal.fire({
      title: 'Muat Uang Sandbox?',
      text: 'Ini akan meriset seluruh progress berjalanmu ke data demo bawaan kawan!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, Kembalikan Default',
      cancelButtonText: 'Batal',
      customClass: { popup: 'aero-glass rounded-[24px]' }
    }).then((result) => {
      if (result.isConfirmed) {
        setHabits(DEFAULT_HABITS);
        setTasks(DEFAULT_TASKS);
        setWallets(DEFAULT_WALLETS);
        setTransactions(DEFAULT_TRANSACTIONS);
        setNotes(DEFAULT_NOTES);
        addLogMessage('Merestart seluruh modul operasional kembali ke data demo bawaan.');
        Swal.fire({ title: 'Direfresh!', text: 'Data demo sandbox kembali mendarat!', icon: 'success' });
      }
    });
  };

  const handleEmptyAllStorage = () => {
    Swal.fire({
      title: 'Hapus Seluruh Data?',
      text: 'Semua habits, saldo, transaksi, dan sticky note-mu akan hilang dari penyimpanan lokal perangkat!',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Hapus Semuanya!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'aero-glass rounded-[24px]' }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        setHabits([]);
        setTasks([]);
        setWallets(DEFAULT_WALLETS.map(w => ({ ...w, balance: 0 })));
        setTransactions([]);
        setNotes([]);
        addLogMessage('Mengeosongkan seluruh isi penyimpanan database localStorage perangkat.');
        Swal.fire({ title: 'Amnesia Total!', text: 'Penyimpanan bersih dari semua data!', icon: 'success' });
      }
    });
  };

  return (
    <div className="min-h-screen frutiger-aurora text-[#0f2d4a] flex flex-col justify-between font-sans relative overflow-hidden select-none">
      
      {/* Glossy water droplets in background */}
      <div className="frutiger-bubble w-20 h-20 top-24 left-10" style={{ animationDelay: '1s' }} />
      <div className="frutiger-bubble w-12 h-12 top-60 right-20" style={{ animationDelay: '3s' }} />
      <div className="frutiger-bubble w-32 h-32 bottom-20 left-1/4" style={{ animationDelay: '0s' }} />
      <div className="frutiger-bubble w-16 h-16 top-1/2 right-1/3" style={{ animationDelay: '5s' }} />

      {/* HIDDEN YOUTUBE OST PLAYER MECHANISM */}
      {isOstPlaying && (
        <iframe 
          className="hidden" 
          src="https://www.youtube.com/embed/YVw5j8rOxBE?enablejsapi=1&autoplay=1&loop=1&playlist=YVw5j8rOxBE" 
          allow="autoplay"
          title="Pocket OST Player"
        />
      )}

      {/* GLOBAL BANNER WRAPPER BAR - Retro Pixel Gaming header navbar */}
      <header className="bg-[#11142e] text-white py-3 px-6 sticky top-0 z-40 border-b-4 border-black flex justify-between items-center shadow-[4px_4px_0_0_#000]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ec38bc] rounded-none flex items-center justify-center font-bold text-lg text-white shadow-[2.5px_2.5px_0_0_#000] border-2 border-black cursor-pointer animate-pulse" onClick={() => playClickSound()}>
            👾
          </div>
          <div>
            <h1 className="font-display font-extrabold text-[11px] md:text-sm tracking-tight flex items-center gap-1 text-yellow-400">
              POCKET MANAGMENT <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
            </h1>
            <p className="text-[9px] font-sans text-cyan-400 font-bold uppercase tracking-widest hidden sm:block">
              16-BIT RETRO EDITION &bull; MULTI-LANGUAGE
            </p>
          </div>
        </div>

        {/* Dynamic retro flags/characters language switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-black p-1 border-2 border-slate-700">
            {(['id', 'en', 'jp'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  playClickSound();
                  setLang(l);
                  addLogMessage(`Mengubah bahasa tampilan aplikasi ke: ${l.toUpperCase()}`);
                }}
                className={`px-2 py-0.5 text-[9px] font-display font-bold ${
                  lang === l 
                    ? 'bg-[#ec38bc] text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              playClickSound();
              addLogMessage('Mengunduh berkas log.txt');
              downloadLogs();
            }}
            onMouseEnter={() => playHoverSound()}
            className="hidden sm:inline-flex px-3 py-1.5 bg-[#10b981] text-black border-2 border-black font-semibold text-[9px] font-display items-center gap-1.5 hover:bg-emerald-400"
            title="Sistem Log: Download log.txt"
          >
            <Download className="w-3 h-3 text-black" /> {t.unduh_log}
          </button>
        </div>
      </header>

      {/* CORE BODY WITH LAYOUT: FIXED SIDEBAR ON DESKTOP & SCROLLABLE CONTENT */}
      {/* md:h-[calc(100vh-73px)] establishes split viewport height limiting right pane scroll */}
      <div className="flex-1 flex flex-col md:flex-row md:h-[calc(100vh-73px)] overflow-hidden">
        
        {/* DESKTOP SIDEBAR NAVIGATION (With perfect neon retro 16-bit backdrop) */}
        <nav className="hidden md:flex flex-col justify-between w-64 bg-[#11142e] border-r-4 border-black p-4 shrink-0 select-none h-full overflow-y-auto">
          <div className="space-y-4">
            
            {/* Active user status badge */}
            <div className="p-3 bg-black border-2 border-[#ec38bc] shadow-[2px_2px_0_0_#000]">
              <p className="text-[7px] font-display font-bold tracking-wider text-cyan-400">{t.user_status}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Smile className="w-4 h-4 text-yellow-405 text-yellow-400 font-bold" />
                <span className="font-extrabold text-[10px] text-white truncate">{userName}</span>
              </div>
            </div>

            {/* Menu Navigation Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => { playClickSound(); setActiveTab('dashboard'); }}
                onMouseEnter={() => playHoverSound()}
                className={`w-full px-3 py-2 border-2 border-black font-bold text-[9px] text-left cursor-pointer transition-all flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-[#ec38bc] text-white shadow-[2px_2px_0_0_#000]'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> {t.dashboard}
              </button>

              <button
                onClick={() => { playClickSound(); setActiveTab('habits'); }}
                onMouseEnter={() => playHoverSound()}
                className={`w-full px-3 py-2 border-2 border-black font-bold text-[9px] text-left cursor-pointer transition-all flex items-center gap-2 ${
                  activeTab === 'habits'
                    ? 'bg-[#ec38bc] text-white shadow-[2px_2px_0_0_#000]'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-emerald-400" /> {t.habits}
              </button>

              <button
                onClick={() => { playClickSound(); setActiveTab('tasks'); }}
                onMouseEnter={() => playHoverSound()}
                className={`w-full px-3 py-2 border-2 border-black font-bold text-[9px] text-left cursor-pointer transition-all flex items-center gap-2 ${
                  activeTab === 'tasks'
                    ? 'bg-[#ec38bc] text-white shadow-[2px_2px_0_0_#000]'
                    : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" /> {t.tasks}
              </button>

              <button
                onClick={() => { playClickSound(); setActiveTab('finance'); }}
                onMouseEnter={() => playHoverSound()}
                className={`w-full px-3 py-2 border-2 border-black font-bold text-[9px] text-left cursor-pointer transition-all flex items-center gap-2 ${
                  activeTab === 'finance'
                    ? 'bg-[#ec38bc] text-white shadow-[2px_2px_0_0_#000]'
                    : 'bg-slate-900 text-rose-400 hover:bg-slate-800'
                }`}
              >
                <WalletIcon className="w-3.5 h-3.5" /> {t.finance}
              </button>

              <button
                onClick={() => { playClickSound(); setActiveTab('notes'); }}
                onMouseEnter={() => playHoverSound()}
                className={`w-full px-3 py-2 border-2 border-black font-bold text-[9px] text-left cursor-pointer transition-all flex items-center gap-2 ${
                  activeTab === 'notes'
                    ? 'bg-[#ec38bc] text-white shadow-[2px_2px_0_0_#000]'
                    : 'bg-slate-900 text-sky-400 hover:bg-slate-800'
                }`}
              >
                <NotesIcon className="w-3.5 h-3.5" /> {t.notes}
              </button>

              <button
                onClick={() => { playClickSound(); setActiveTab('games'); }}
                onMouseEnter={() => playHoverSound()}
                className={`w-full px-3 py-2 border-2 border-black font-bold text-[9px] text-left cursor-pointer transition-all flex items-center gap-2 ${
                  activeTab === 'games'
                    ? 'bg-[#8b5cf6] text-white shadow-[2px_2px_0_0_#000]'
                    : 'bg-slate-900 text-[#c084fc] hover:bg-slate-800'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" /> {t.games}
              </button>

              <button
                onClick={() => { playClickSound(); setActiveTab('settings'); }}
                onMouseEnter={() => playHoverSound()}
                className={`w-full px-3 py-2 border-2 border-black font-bold text-[9px] text-left cursor-pointer transition-all flex items-center gap-2 ${
                  activeTab === 'settings'
                    ? 'bg-slate-800 text-white shadow-[2px_2px_0_0_#000]'
                    : 'bg-slate-900 text-slate-450 hover:bg-slate-800'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" /> {t.settings}
              </button>
            </div>

            {/* 🎵 Retro Player Widget - converted to pixel 16-bit arcade speaker style */}
            <div className="bg-[#0c0d21] p-3 border-2 border-black shadow-[3px_3px_0_0_#000] text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7px] font-display font-black text-cyan-300 uppercase tracking-widest">{t.aero_player}</span>
                <div className="flex items-center gap-0.5">
                  <span className={`w-1 h-3 bg-cyan-400 ${isOstPlaying ? 'animate-bounce' : 'opacity-40'}`} style={{ animationDuration: '0.4s' }} />
                  <span className={`w-1 h-2 bg-yellow-400 ${isOstPlaying ? 'animate-bounce' : 'opacity-40'}`} style={{ animationDuration: '0.6s' }} />
                  <span className={`w-1 h-4 bg-rose-400 ${isOstPlaying ? 'animate-bounce' : 'opacity-40'}`} style={{ animationDuration: '0.5s' }} />
                </div>
              </div>
              
              <div className="text-[8px] font-display text-slate-350 truncate mt-1">
                {t.nostalgia_track}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => {
                    playClickSound();
                    setIsOstPlaying(!isOstPlaying);
                  }}
                  onMouseEnter={() => playHoverSound()}
                  className={`flex items-center justify-center p-1 cursor-pointer border border-black ${isOstPlaying ? 'bg-red-600' : 'bg-emerald-600'}`}
                  title={isOstPlaying ? t.mute : t.resume}
                >
                  {isOstPlaying ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white fill-white" />}
                </button>
                
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[8px] font-display text-slate-400">VOL</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ostVolume}
                    disabled={!isOstPlaying}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setOstVolume(v);
                      localStorage.setItem('pocket_ost_volume', v.toString());
                    }}
                    className="w-16 h-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-white/20 text-center text-[10px] font-bold text-[#0c2a46]/60">
            Pocket Management &bull; 2026
          </div>
        </nav>


        {/* MAIN VISUAL CONTENT SCREEN - Independently scrollable on desktop */}
        <main 
          id="main-scroll-pane"
          className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto overflow-x-hidden pb-24 md:pb-12 bg-white/10"
        >
          {/* Aesthetic top play banner for mobile only to trigger nostalgia */}
          <div className="md:hidden mb-4 bg-[#0a273f]/95 p-3 rounded-2xl border border-white/25 flex justify-between items-center text-white text-xs shadow-xs select-none">
            <div className="flex items-center gap-2">
              <span className="text-sm animate-spin">📀</span>
              <div>
                <p className="font-bold text-[10px] leading-tight">Frutiger Nostalgic Stream</p>
                <p className="text-[8px] text-sky-305 text-sky-400 leading-normal">Interactive Win 7 Aero OST Play</p>
              </div>
            </div>
            <button
              onClick={() => {
                playClickSound();
                setIsOstPlaying(!isOstPlaying);
              }}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-[10px] border-none shadow-xs cursor-pointer flex items-center gap-1"
            >
              {isOstPlaying ? 'Mute' : 'Play 🎵'}
            </button>
          </div>
          
          {/* Dashboard Hub Tab */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              habits={habits}
              tasks={tasks}
              wallets={wallets}
              transactions={transactions}
              onCheckInHabit={handleCheckInHabit}
              onCompleteTask={handleCompleteTaskDirectly}
              setActiveTab={setActiveTab}
              userName={userName}
              lang={lang}
            />
          )}

          {/* Habit Tracker Tab */}
          {activeTab === 'habits' && (
            <HabitsTracker 
              habits={habits}
              onAddHabit={handleAddHabit}
              onCheckInHabit={handleCheckInHabit}
              onDeleteHabit={handleDeleteHabit}
              onResetHabit={handleResetHabit}
              lang={lang}
            />
          )}

          {/* Tasks Kanban Tab */}
          {activeTab === 'tasks' && (
            <TasksTracker 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              lang={lang}
            />
          )}

          {/* Finance ledger Tab */}
          {activeTab === 'finance' && (
            <FinanceManager 
              wallets={wallets}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onModifyWalletBalance={handleModifyWalletBalance}
              lang={lang}
            />
          )}

          {/* Notes Corkboard Tab */}
          {activeTab === 'notes' && (
            <NotesSection 
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              lang={lang}
            />
          )}

          {/* 3 Arcade Mini-Games Tab */}
          {activeTab === 'games' && (
            <MiniGames 
              onAddLog={addLogMessage}
              lang={lang}
            />
          )}

          {/* Settings & Logs lists Console Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6" id="settings-tab-layout">
              {/* Header */}
              <div className="card text-white">
                <h1 className="text-lg md:text-xl font-display font-black text-yellow-405 text-yellow-400">
                  ⚙️ {t.settings_header}
                </h1>
                <p className="text-[10px] text-cyan-400 mt-1">
                  {t.settings_desc}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: forms (5 cols) */}
                <div 
                  className="lg:col-span-12 xl:col-span-5 card p-5 space-y-4 text-white"
                  onMouseEnter={() => playHoverSound()}
                >
                  <h2 className="font-display font-black text-xs border-b-2 border-black pb-2 flex items-center gap-1.5 text-rose-400">
                    <User className="w-4 h-4" /> {t.profile_sec}
                  </h2>

                  {/* Edit Username */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">{t.name_label}</label>
                    <input
                      type="text"
                      maxLength={18}
                      className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                      }}
                    />
                  </div>

                  {/* Language selection select dropdown panel */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">{t.language_label}</label>
                    <select
                      value={lang}
                      onChange={(e) => {
                        playClickSound();
                        setLang(e.target.value as Language);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="id">BAHASA INDONESIA 🇮🇩</option>
                      <option value="en">ENGLISH (US/UK) 🇬🇧</option>
                      <option value="jp">日本語 (JAPANESE) 🇯🇵</option>
                    </select>
                  </div>

                  {/* PWA / Desktop App Download Installer Segment */}
                  <div className="border-t border-b border-dashed border-slate-800 py-3 my-2 space-y-2">
                    <h3 className="font-display font-black text-[10px] text-pink-400 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-pink-400" />
                      {lang === 'jp' ? 'デスクトップアプリ化 (PWA)' : lang === 'en' ? 'DESKTOP APP MODE (PWA)' : 'APLIKASI DESKTOP (PWA)'}
                    </h3>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      {lang === 'jp' 
                        ? 'デスクトップやスマホのホーム画面に直接インストールして、すばやく、フルスクリーンで快適に起動できます！' 
                        : lang === 'en' 
                        ? 'Install this app on your desktop or home screen for standalone layout, faster loading, and offline access.' 
                        : 'Simpan tracker di desktop/layar utama HP Anda untuk kemudahan akses penuh, luring instan, dan performa mulus!'}
                    </p>
                    <button
                      onClick={() => {
                        playClickSound();
                        triggerPwaInstall();
                      }}
                      onMouseEnter={() => playHoverSound()}
                      className="w-full py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white border-2 border-black font-display font-black text-[9px] cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]"
                    >
                      <Download className="w-3.5 h-3.5 text-white stroke-[2.5px] animate-bounce" />
                      {isInstalled 
                        ? (lang === 'jp' ? 'インストール済み / 起動中' : lang === 'en' ? 'APP INSTALLED SUCCESSFULLY' : 'APLIKASI TERPASANG') 
                        : (lang === 'jp' ? 'アプリとしてインストールする' : lang === 'en' ? 'INSTALL DESKTOP / MOBILE APP' : 'DOWNLOAD / INSTAL APLIKASI')}
                    </button>
                  </div>

                  <h2 className="font-display font-black text-xs border-b-2 border-black pb-2 pt-2 flex items-center gap-1.5 text-cyan-400">
                    ⚙️ {t.storage_sec}
                  </h2>

                  <div className="space-y-3">
                    {/* Trigger sandbox data load */}
                    <button
                      onClick={() => {
                        playClickSound();
                        handleReloadDefaultData();
                      }}
                      onMouseEnter={() => playHoverSound()}
                      className="aero-bubble-btn aero-aqua w-full py-2 text-[8px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-white" /> {t.sandbox_btn}
                    </button>

                    {/* Wipe disk */}
                    <button
                      onClick={() => {
                        playClickSound();
                        handleEmptyAllStorage();
                      }}
                      onMouseEnter={() => playHoverSound()}
                      className="aero-bubble-btn aero-rose w-full py-2 text-[8px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" /> {t.wipe_btn}
                    </button>
                  </div>
                </div>

                {/* Right Side: Log terminal output (7 cols) */}
                <div 
                  className="lg:col-span-12 xl:col-span-7 card p-5 text-white flex flex-col justify-between"
                  onMouseEnter={() => playHoverSound()}
                >
                  <div className="space-y-3">
                    <h2 className="font-display font-black text-xs border-b-2 border-black pb-2 flex items-center justify-between text-cyan-400 animate-pulse">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-cyan-400" /> {t.console_title}
                      </span>
                      <span className="text-[7px] bg-[#ec38bc] px-2 py-0.5 rounded-none text-white font-bold uppercase">{t.running_status}</span>
                    </h2>

                    {/* Scrollable logger screen */}
                    <div className="bg-slate-950 p-3 font-mono text-[9px] text-slate-350 space-y-1 max-h-72 overflow-y-auto w-full select-text border-2 border-black">
                      {liveLogs.length === 0 ? (
                        <p className="text-slate-500 italic">&gt; No logs recorded yet.</p>
                      ) : (
                        liveLogs.map((item) => (
                          <p key={item.id} className="leading-snug">
                            <span className="text-slate-500">[{item.timestamp}]</span>{' '}
                            <span className="text-cyan-400">&gt;</span> {item.message}
                          </p>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-[8px] text-slate-400 leading-normal font-sans">
                      {t.log_disclaimer}
                    </p>
                    <button
                      onClick={() => {
                        playClickSound();
                        downloadLogs();
                      }}
                      onMouseEnter={() => playHoverSound()}
                      className="px-3 py-1.5 bg-[#10b981] border-2 border-black text-black font-display font-bold text-[8px] hover:bg-emerald-400 shrink-0 cursor-pointer"
                    >
                      {t.unduh_log} &darr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION TAB BAR (Shows only on mobile viewports screen sizes - 7 beautiful high-contrast standalone tabs) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t-2 border-neutral-900 py-2.5 px-1.5 z-40 flex justify-around items-center select-none shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
        
        {/* Dashboard index */}
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('dashboard');
          }}
          onMouseEnter={() => playHoverSound()}
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1.5 px-0.5 rounded-lg transition-all ${
            activeTab === 'dashboard' ? 'text-blue-500 font-bold scale-105' : 'text-white/90 hover:text-blue-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 stroke-[2px]" />
          <span className="text-[8px] tracking-tight font-display mt-1">{getShortTabLabel('dashboard')}</span>
        </button>

        {/* Habits */}
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('habits');
          }}
          onMouseEnter={() => playHoverSound()}
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1.5 px-0.5 rounded-lg transition-all ${
            activeTab === 'habits' ? 'text-blue-500 font-bold scale-105' : 'text-white/90 hover:text-blue-200'
          }`}
        >
          <Flame className="w-5 h-5 stroke-[2px]" />
          <span className="text-[8px] tracking-tight font-display mt-1">{getShortTabLabel('habits')}</span>
        </button>

        {/* Kanban Tasks */}
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('tasks');
          }}
          onMouseEnter={() => playHoverSound()}
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1.5 px-0.5 rounded-lg transition-all ${
            activeTab === 'tasks' ? 'text-blue-500 font-bold scale-105' : 'text-white/90 hover:text-blue-200'
          }`}
        >
          <CheckSquare className="w-5 h-5 stroke-[2px]" />
          <span className="text-[8px] tracking-tight font-display mt-1">{getShortTabLabel('tasks')}</span>
        </button>

        {/* Finance */}
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('finance');
          }}
          onMouseEnter={() => playHoverSound()}
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1.5 px-0.5 rounded-lg transition-all ${
            activeTab === 'finance' ? 'text-blue-500 font-bold scale-105' : 'text-white/90 hover:text-blue-200'
          }`}
        >
          <WalletIcon className="w-5 h-5 stroke-[2px]" />
          <span className="text-[8px] tracking-tight font-display mt-1">{getShortTabLabel('finance')}</span>
        </button>

        {/* Memo notes */}
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('notes');
          }}
          onMouseEnter={() => playHoverSound()}
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1.5 px-0.5 rounded-lg transition-all ${
            activeTab === 'notes' ? 'text-blue-500 font-bold scale-105' : 'text-white/90 hover:text-blue-200'
          }`}
        >
          <NotesIcon className="w-5 h-5 stroke-[2px]" />
          <span className="text-[8px] tracking-tight font-display mt-1">{getShortTabLabel('notes')}</span>
        </button>

        {/* Retro Games */}
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('games');
          }}
          onMouseEnter={() => playHoverSound()}
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1.5 px-0.5 rounded-lg transition-all ${
            activeTab === 'games' ? 'text-blue-500 font-bold scale-105' : 'text-white/90 hover:text-blue-200'
          }`}
        >
          <Gamepad2 className="w-5 h-5 stroke-[2px]" />
          <span className="text-[8px] tracking-tight font-display mt-1">{getShortTabLabel('games')}</span>
        </button>

        {/* Settings/Options */}
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('settings');
          }}
          onMouseEnter={() => playHoverSound()}
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1.5 px-0.5 rounded-lg transition-all ${
            activeTab === 'settings' ? 'text-blue-500 font-bold scale-105' : 'text-white/90 hover:text-blue-200'
          }`}
        >
          <SettingsIcon className="w-5 h-5 stroke-[2px]" />
          <span className="text-[8px] tracking-tight font-display mt-1">{getShortTabLabel('settings')}</span>
        </button>

      </nav>

      {/* FOOTER SPECS */}
      <footer className="bg-[#11142e] border-t-4 border-black border-dashed text-[8px] font-display text-slate-400 py-4 px-6 text-center select-none flex flex-col md:flex-row items-center justify-center gap-1 leading-normal">
        <span>{t.dimasak_pecinta}</span>
        <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline shrink-0 animate-pulse" />
        <span>Pocket Management &copy; 2026.</span>
      </footer>

    </div>
  );
}
