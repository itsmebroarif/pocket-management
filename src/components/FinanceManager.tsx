import React, { useState } from 'react';
import { Wallet, Transaction } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Wallet as WalletIcon, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

interface FinanceManagerProps {
  wallets: Wallet[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onModifyWalletBalance: (id: string, amount: number) => void;
  lang?: Language;
}

const CATEGORY_ICONS: Record<string, string> = {
  // Expense
  'Makanan & Minuman 🍔': '🍔',
  'Transportasi 🚗': '🚗',
  'Belanja & Mall 🛍️': '🛍️',
  'Tagihan & Utilitas 💡': '💡',
  'Hiburan & Hobi 🎮': '🎮',
  
  // Income
  'Gaji & Penghasilan 📈': '📈',
  'Hadiah & Bonus 🎁': '🎁',
  'Uang Saku & Lainnya 🪙': '🪙',
  
  // General fallback
  'Lain-lain ✨': '✨'
};

const EXPENSE_CATEGORIES = [
  'Makanan & Minuman 🍔',
  'Transportasi 🚗',
  'Belanja & Mall 🛍️',
  'Tagihan & Utilitas 💡',
  'Hiburan & Hobi 🎮',
  'Lain-lain ✨'
];

const INCOME_CATEGORIES = [
  'Gaji & Penghasilan 📈',
  'Hadiah & Bonus 🎁',
  'Uang Saku & Lainnya 🪙',
  'Lain-lain ✨'
];

export default function FinanceManager({
  wallets,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onModifyWalletBalance,
  lang = 'id'
}: FinanceManagerProps) {
  const t = TRANSLATIONS[lang];
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '1');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Adjust Wallet Balance manually
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustWalletId, setAdjustWalletId] = useState(wallets[0]?.id || '1');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const money = parseFloat(amount);
    if (isNaN(money) || money <= 0) {
      Swal.fire({
        title: lang === 'jp' ? '金額エラー' : lang === 'en' ? 'Invalid Amount!' : 'Nominal Salah!',
        text: lang === 'jp' ? '0円より多い正しい金額を入力してください！' : lang === 'en' ? 'Please enter an amount greater than Rp 0!' : 'Masukkan jumlah uang yang valid dan lebih dari Rp 0, kawan!',
        icon: 'warning',
        confirmButtonColor: '#ec38bc',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white font-display' }
      });
      return;
    }

    if (!description.trim()) {
      Swal.fire({
        title: lang === 'jp' ? '説明がありません' : lang === 'en' ? 'Title Blank!' : 'Deskripsi Kosong',
        text: lang === 'jp' ? '取引の説明を入力してください！' : lang === 'en' ? 'Brief description is required!' : 'Silakan isi keterangan singkat tentang transaksi ini!',
        icon: 'warning',
        confirmButtonColor: '#ec38bc',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white font-display' }
      });
      return;
    }

    onAddTransaction({
      type: txType,
      amount: money,
      description: description.trim(),
      walletId: selectedWalletId,
      category: category,
      date: date || new Date().toISOString().split('T')[0]
    });

    setAmount('');
    setDescription('');
    Swal.fire({
      title: lang === 'jp' ? '記録成功！ 💰' : lang === 'en' ? 'Success! 💰' : 'Tercatat Sukses! 💰',
      text: lang === 'jp' ? `取引額 ${formatRupiah(money)} を学習帳簿に書き留めました！` : `Successfully logged current transaction of ${formatRupiah(money)}!`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'border-4 border-black bg-[#11142e] text-white font-display' }
    });
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = parseFloat(adjustAmount);
    if (isNaN(sum) || sum <= 0) {
      Swal.fire({
        title: lang === 'jp' ? 'エラー' : lang === 'en' ? 'Invalid Input' : 'Angka Tidak Valid',
        text: lang === 'jp' ? '有効な金額を入力してください！' : 'Silakan masukkan jumlah nominal uang yang valid!',
        icon: 'error'
      });
      return;
    }

    const modifier = adjustType === 'add' ? sum : -sum;
    onModifyWalletBalance(adjustWalletId, modifier);

    setAdjustAmount('');
    setShowAdjustModal(false);

    Swal.fire({
      title: lang === 'jp' ? '残高更新完了！ 🔄' : lang === 'en' ? 'Balance Recalibrated!' : 'Saldo Diperbarui! 🔄',
      text: lang === 'jp' ? 'ウォレットの初期値及び残高が修正されました。' : 'Nilai dompet Anda berhasil disesuaikan dengan sukses.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'border-4 border-black bg-[#11142e] text-white font-display' }
    });
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setTxType(type);
    if (type === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  };

  const aggregatedStats = React.useMemo(() => {
    const stats: Record<string, { income: number; expense: number }> = {};
    
    [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].forEach(cat => {
      stats[cat] = { income: 0, expense: 0 };
    });

    transactions.forEach(tx => {
      if (!stats[tx.category]) {
        stats[tx.category] = { income: 0, expense: 0 };
      }
      if (tx.type === 'income') {
        stats[tx.category].income += tx.amount;
      } else {
        stats[tx.category].expense += tx.amount;
      }
    });

    return Object.entries(stats)
      .map(([name, val]) => ({
        category: name,
        income: val.income,
        expense: val.expense,
        total: val.income + val.expense
      }))
      .filter(item => item.total > 0)
      .slice(0, 6);
  }, [transactions]);

  const maxVal = Math.max(
    ...aggregatedStats.map(s => Math.max(s.income, s.expense)),
    100000
  );

  return (
    <div className="space-y-6 animate-fade-in" id="finance-section">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 card text-white">
        <div>
          <h1 className="text-md md:text-lg font-display font-black text-amber-405 text-yellow-400 flex items-center gap-1.5">
            💰 {t.finance_title}
          </h1>
          <p className="text-[10px] text-slate-300 mt-1 uppercase">
            {t.finance_desc}
          </p>
        </div>
        <button
          onClick={() => setShowAdjustModal(true)}
          className="px-4 py-2 bg-[#ec38bc] border-2 border-black shadow-[2px_2px_0_0_#000] text-white font-display font-bold text-[10px] hover:bg-pink-500 whitespace-nowrap cursor-pointer shrink-0"
        >
          ⚙️ {t.adjust_wallet_btn}
        </button>
      </div>

      {/* Grid: Wallets Overview & SVG visualizer chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Wallets Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-display font-black text-xs text-rose-400 flex items-center gap-1.5 px-1">
            <WalletIcon className="w-4 h-4" /> {t.my_wallets}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
            {wallets.map((wallet) => {
              const walletTx = transactions.filter(t => t.walletId === wallet.id);
              const txCount = walletTx.length;

              return (
                <div
                  key={wallet.id}
                  className="card relative overflow-hidden flex flex-col justify-between text-white"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-2 bg-slate-950 border-2 border-black">
                        {wallet.icon}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-xs leading-tight">{wallet.name}</h3>
                        <p className="text-[8px] font-display text-slate-500 uppercase mt-1">{wallet.type}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-950 border border-black text-[7px] font-display text-slate-400">
                      {txCount} Trans
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-[8px] font-display text-slate-400 uppercase tracking-wide">{t.sub_wallets}</p>
                    <p className="text-sm md:text-md font-bold text-yellow-405 text-yellow-450 mt-1">{formatRupiah(wallet.balance)}</p>
                  </div>

                  {/* Corner tag representing the theme strip */}
                  <div 
                    className="absolute bottom-0 right-0 w-6 h-6 outline-none"
                    style={{ backgroundColor: wallet.color }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT CHART COLUMN: Bar Comparer */}
        <div className="lg:col-span-7 card text-white">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
            <div>
              <h2 className="font-display font-black text-xs text-cyan-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                {t.comp_chart_title}
              </h2>
              <p className="text-[8px] text-slate-400 mt-1 bg-black/40 p-1 font-mono uppercase">{t.comp_chart_desc}</p>
            </div>
          </div>

          {aggregatedStats.length === 0 ? (
            <div className="h-64 border-2 border-dashed border-slate-705 border-slate-700 flex flex-col items-center justify-center text-center bg-black p-6">
              <AlertCircle className="w-6 h-6 text-amber-500 mb-2 animate-pulse" />
              <p className="text-[9px] font-display text-slate-400">No category transactions logged yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 border-2 border-black">
                <div className="space-y-3.5">
                  {aggregatedStats.map((item) => {
                    const incPercent = Math.max((item.income / maxVal) * 100, 0);
                    const expPercent = Math.max((item.expense / maxVal) * 100, 0);

                    return (
                      <div key={item.category} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-slate-300">
                          <span className="truncate max-w-[140px] font-bold">{item.category}</span>
                          <span className="text-slate-450">
                            {item.income > 0 ? `+${formatRupiah(item.income)} ` : ''}
                            {item.expense > 0 ? `-${formatRupiah(item.expense)}` : ''}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1.5 h-2.5 bg-slate-900 border border-black overflow-hidden relative">
                          {/* Left Half: income Green */}
                          <div className="flex justify-end pr-[1px]">
                            <div 
                              className="bg-emerald-500 h-full"
                              style={{ width: `${incPercent}%` }}
                            />
                          </div>
                          
                          {/* Right Half: expense Red */}
                          <div className="flex justify-start pl-[1px]">
                            <div 
                              className="bg-rose-500 h-full"
                              style={{ width: `${expPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart Legend indicators */}
              <div className="flex flex-wrap items-center gap-4 text-[8px] font-display text-slate-400 justify-center">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-505 bg-emerald-500 border border-black" /> {t.income_today}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 border border-black" /> {t.expense_today}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Grid form: Record Form vs Log list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recording Form (5 cols) */}
        <div className="lg:col-span-12 xl:col-span-5 card text-white">
          <h2 className="font-display font-black text-xs text-rose-400 border-b-2 border-black pb-2 mb-4 flex items-center gap-1.5">
            🖋️ {t.log_ledger}
          </h2>

          <form onSubmit={handleAddTx} className="space-y-4">
            {/* IO type select buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-1.5 px-3 text-[9px] font-display font-bold border-2 border-black cursor-pointer ${
                  txType === 'expense'
                    ? 'bg-rose-600 text-white shadow-[1.5px_1.5px_0_0_#000]'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                🔴 {t.expense_today}
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-1.5 px-3 text-[9px] font-display font-bold border-2 border-black cursor-pointer ${
                  txType === 'income'
                    ? 'bg-emerald-600 text-black shadow-[1.5px_1.5px_0_0_#000]'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                🟢 {t.income_today}
              </button>
            </div>

            {/* Wallet Select */}
            <div className="space-y-1.5">
              <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">{t.my_wallets}</label>
              <select
                className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none cursor-pointer"
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.icon} {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">Nominal (IDR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1.5 font-bold text-slate-450 text-[10px]">Rp</span>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none"
                  placeholder="Contoh: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">{lang === 'jp' ? '内訳カテゴリ' : 'Kategori Transaksi'}</label>
              <select
                className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {txType === 'expense'
                  ? EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                  : INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                }
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">{lang === 'jp' ? 'メモ用説明' : 'Deskripsi Keterangan'}</label>
              <input
                type="text"
                maxLength={45}
                required
                className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none"
                placeholder={lang === 'jp' ? 'スーパーで買い物、お小遣い...' : 'Contoh: Makan siang mie ayam, bonus gaji...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">{lang === 'jp' ? '記帳日' : 'Tanggal Pencatatan'}</label>
              <input
                type="date"
                className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 border-2 border-black text-black font-display font-bold text-[9px] uppercase cursor-pointer shadow-[1.5px_1.5px_0_0_#000]"
            >
              WRITE LEDGER 💾
            </button>
          </form>
        </div>

        {/* Historik List of logs */}
        <div className="lg:col-span-12 xl:col-span-7 card text-white overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="font-display font-black text-xs text-cyan-405 text-cyan-400 border-b-2 border-black pb-2 mb-4 flex justify-between items-center">
              <span>{lang === 'jp' ? '帳簿履歴フィード' : 'Riwayat Alir Rekening'}</span>
              <span className="text-[7px] font-display px-2 py-0.5 bg-slate-950 border border-black text-slate-400 font-bold uppercase">
                {transactions.length} items
              </span>
            </h2>

            {transactions.length === 0 ? (
              <div className="h-64 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-center bg-black/40">
                <DollarSign className="w-6 h-6 text-slate-600 mb-1 animate-pulse" />
                <p className="text-[8px] font-display text-slate-500">No account actions registered yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {transactions.map((tx) => {
                  const isExp = tx.type === 'expense';
                  const assocWalletName = wallets.find(w => w.id === tx.walletId)?.name || 'Dompet Umum';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-slate-900 border-2 border-black text-slate-100 font-bold shadow-[1.5px_1.5px_0_0_#000]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1 bg-black border border-slate-800 shrink-0">
                          {CATEGORY_ICONS[tx.category] || '💸'}
                        </span>
                        <div>
                          <p className="text-[9px] font-bold text-white line-clamp-1">{tx.description}</p>
                          <p className="text-[7px] font-display text-slate-500 uppercase mt-0.5">
                            🏦 {assocWalletName} &bull; {tx.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className={`text-[10px] font-black shrink-0 ${isExp ? 'text-rose-455 text-rose-400' : 'text-emerald-400'}`}>
                          {isExp ? '-' : '+'}{formatRupiah(tx.amount)}
                        </p>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 bg-red-955 bg-red-950 text-red-500 hover:text-red-400 border border-black cursor-pointer rounded-none"
                          title="Hapus"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Adjust balance popup form */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card max-w-sm w-full p-0 overflow-hidden text-white border-4 border-black">
            <div className="bg-slate-950 border-b-2 border-black p-3.5 flex justify-between items-center">
              <h2 className="font-display font-black text-xs text-[#ec38bc] flex items-center gap-1.5">
                ⚙️ {lang === 'jp' ? 'ウォレット初期設定' : 'Sesuaikan Saldo Dompet'}
              </h2>
              <button 
                onClick={() => setShowAdjustModal(false)}
                className="w-6 h-6 border-2 border-black bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center cursor-pointer text-[9px]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustBalance} className="p-4 space-y-4">
              <div className="p-2.5 bg-yellow-950/40 border border-yellow-500 rounded-none text-[8px] font-sans font-black text-yellow-405 text-yellow-400 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>Adjustments modify physical status parameters directly without injecting transaction histories!</span>
              </div>

              {/* Wallet select */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase">Pilih Dompet</label>
                <select
                  className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none cursor-pointer"
                  value={adjustWalletId}
                  onChange={(e) => setAdjustWalletId(e.target.value)}
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.icon} {w.name} ({formatRupiah(w.balance)})</option>
                  ))}
                </select>
              </div>

              {/* Add or Subtract */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase">Tindakan</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-1.5 px-3 text-[8px] font-display font-bold border-2 border-black cursor-pointer ${
                      adjustType === 'add'
                        ? 'bg-emerald-600 text-black shadow-[1.5px_1.5px_0_0_#000]'
                        : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    ➕ PLUS
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('subtract')}
                    className={`py-1.5 px-3 text-[8px] font-display font-bold border-2 border-black cursor-pointer ${
                      adjustType === 'subtract'
                        ? 'bg-rose-600 text-white shadow-[1.5px_1.5px_0_0_#000]'
                        : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    ➖ SUBTRACT
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-display text-slate-400 uppercase">Nominal</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full px-3 py-1.5 bg-slate-950 border-2 border-black text-xs font-bold text-white focus:outline-none"
                  placeholder="Contoh: 100000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-3 py-1.5 bg-slate-950 border-2 border-black text-slate-400 hover:text-white font-display font-semibold text-[8px] cursor-pointer"
                >
                  {lang === 'jp' ? 'キャンセル' : lang === 'en' ? 'CANCEL' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3b82f6] border-2 border-black text-white font-display font-bold text-[8px] cursor-pointer"
                >
                  {lang === 'jp' ? '実行 🔄' : lang === 'en' ? 'EXECUTE' : 'Eksekusi Seting!'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
