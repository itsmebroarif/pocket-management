import React, { useState } from 'react';
import { StickyNote } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { Plus, Trash2, Pin, Calendar, ClipboardList } from 'lucide-react';
import Swal from 'sweetalert2';

interface NotesSectionProps {
  notes: StickyNote[];
  onAddNote: (content: string, color: string) => void;
  onDeleteNote: (id: string) => void;
  lang?: Language;
}

const RETRO_NOTE_COLORS = [
  { class: 'bg-[#fef08a] border-yellow-500', hex: '#fef08a', nameI18n: { id: 'Kuning Klasik 🟡', en: 'Classic Yellow 🟡', jp: 'クラシック黄 🟡' } },
  { class: 'bg-[#fecdd3] border-rose-500', hex: '#fecdd3', nameI18n: { id: 'Pink Manis 🌸', en: 'Lollipop Pink 🌸', jp: 'スイートピンク 🌸' } },
  { class: 'bg-[#bbf7d0] border-emerald-500', hex: '#bbf7d0', nameI18n: { id: 'Hijau Sejuk 🌿', en: 'Acid Teal 🌿', jp: 'ミントグリーン 🌿' } },
  { class: 'bg-[#bfdbfe] border-blue-500', hex: '#bfdbfe', nameI18n: { id: 'Biru Tenang 🌊', en: 'Ocean Blue 🌊', jp: 'クリアブルー 🌊' } },
  { class: 'bg-[#fed7aa] border-orange-500', hex: '#fed7aa', nameI18n: { id: 'Orange Ceria 🍊', en: 'Sunny Orange 🍊', jp: 'ハッピー橙 🍊' } },
];

export default function NotesSection({
  notes,
  onAddNote,
  onDeleteNote,
  lang = 'id'
}: NotesSectionProps) {
  const t = TRANSLATIONS[lang];
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(RETRO_NOTE_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      Swal.fire({
        title: lang === 'jp' ? '未入力' : lang === 'en' ? 'Blank memo!' : 'Catatan Kosong!',
        text: lang === 'jp' ? '内容を入力してください！' : lang === 'en' ? 'Write some content first!' : 'Tuliskan isi catatan tempel Anda terlebih dahulu, kawan!',
        icon: 'warning',
        confirmButtonColor: '#ec38bc',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white font-display' }
      });
      return;
    }

    onAddNote(newContent.trim(), selectedColor.class);
    setNewContent('');

    Swal.fire({
      title: lang === 'jp' ? 'ピン止め完了！ 📑' : lang === 'en' ? 'Pinned! 📑' : 'Tersimpan! 📑',
      text: lang === 'jp' ? 'メモ帳にしっかりとピンを刺しました！' : lang === 'en' ? 'Note successfully pinned onto the board!' : 'Catatan ringan berhasil ditempel ke papan pin!',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false,
      customClass: { popup: 'border-4 border-black bg-[#11142e] text-white font-display' }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="sticky-notes-board">
      {/* Header Board */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 card text-white">
        <div>
          <h1 className="text-md md:text-lg font-display font-black text-rose-455 text-rose-400 flex items-center gap-1.5">
            📓 {t.notes_title}
          </h1>
          <p className="text-[10px] text-slate-355 text-slate-300 mt-1 uppercase">
            {t.notes_desc}
          </p>
        </div>
      </div>

      {/* Grid: Editor Form & Sticky cork board list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Editor Form (4 cols) */}
        <div className="lg:col-span-12 xl:col-span-4 card text-white self-start h-max">
          <h2 className="font-display font-black text-xs text-yellow-450 text-yellow-400 flex items-center gap-1.5 pb-2 border-b-2 border-black mb-4">
            <ClipboardList className="w-4 h-4" /> {lang === 'jp' ? '新規付箋' : lang === 'en' ? 'WRITE NEW NOTE' : 'Tulis Catatan Baru'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">
                {lang === 'jp' ? '本文' : lang === 'en' ? 'NOTE CONTENT' : 'Isi Catatan'}
              </label>
              <textarea
                rows={5}
                required
                maxLength={400}
                className="w-full p-3 bg-slate-950 border-2 border-black text-slate-100 font-bold text-xs focus:outline-none"
                placeholder={lang === 'jp' ? '思いついたひらめき、買い物リスト、夢など...' : lang === 'en' ? 'Unleash crazy business ideas, grocery items or daily affirmations here...' : 'Tuliskan ide kreatif, belanjaan, atau impian gilamu di sini...'}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
              <p className="text-right text-[7px] font-display text-slate-550 text-slate-500 uppercase mt-1">
                {400 - newContent.length} {lang === 'jp' ? '文字残っています' : lang === 'en' ? 'chars remaining' : 'karakter tersisa'}
              </p>
            </div>

            {/* Note Color selecting */}
            <div className="space-y-1.5">
              <label className="block text-[8px] font-display text-slate-400 uppercase tracking-wide">
                {lang === 'jp' ? '付箋の色' : lang === 'en' ? 'MEMO COLOR' : 'Warna Kertas Tempel'}
              </label>
              <div className="grid grid-cols-5 gap-2 pt-1">
                {RETRO_NOTE_COLORS.map((color) => {
                  const active = selectedColor.hex === color.hex;
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 transition-transform cursor-pointer border-2 border-black ${
                        active
                          ? 'scale-110 ring-2 ring-[#ec38bc]'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.nameI18n[lang as keyof typeof color.nameI18n] || color.nameI18n.en}
                    />
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-display font-bold text-[9px] cursor-pointer shadow-[1.5px_1.5px_0_0_#000] border-2 border-black"
            >
              PIN ON CORKBOARD 📌
            </button>
          </form>
        </div>

        {/* Board View (8 cols) */}
        <div className="lg:col-span-12 xl:col-span-8 card text-white relative min-h-[420px]">
          <h2 className="font-display font-black text-xs text-orange-400 flex items-center gap-1.5 mb-6 border-b-2 border-black pb-2">
            📌 {lang === 'jp' ? 'コルクボード掲示板' : lang === 'en' ? 'MEMO CORK BOARD' : 'Papan Pin Gabus'} ({notes.length} memo)
          </h2>

          {notes.length === 0 ? (
            <div className="border-2 border-dashed border-slate-700 rounded-none flex flex-col items-center justify-center text-center p-8 bg-black/40 min-h-[280px]">
              <span className="text-3xl mb-2">🍃</span>
              <p className="text-xs font-display font-bold text-slate-400">{lang === 'jp' ? 'ボードは空っぽです' : lang === 'en' ? 'Board is currently clean' : 'Papan Memo Masih Bersih'}</p>
              <p className="text-[8px] text-slate-500 uppercase mt-1">{lang === 'jp' ? '左側のフォームから最初の付箋を貼りましょう！' : lang === 'en' ? 'Sling your first sticky note using the left editor panel!' : 'Letakkan pengingat pertamamu di sisi kiri!'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              {notes.map((note) => {
                const skewStyle = { transform: `rotate(${note.rotation}deg)` };

                return (
                  <div
                    key={note.id}
                    style={skewStyle}
                    className={`p-5 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${note.color} relative group flex flex-col justify-between hover:scale-[1.03] hover:rotate-0 transition-transform min-h-[140px]`}
                  >
                    {/* Metal Push Pin graphic representation */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-red-650 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] select-none">
                      <Pin className="w-5 h-5 fill-red-600 text-red-400 stroke-[2] rotate-12" />
                    </div>

                    <div className="mt-2 text-slate-900">
                      <p className="text-[10px] leading-relaxed font-bold whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/15 pt-2 mt-4 text-[7px] font-mono font-bold text-slate-600 uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-655" />
                        {note.date}
                      </span>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 bg-red-955 bg-black hover:bg-red-800 text-red-500 hover:text-white border border-black cursor-pointer flex items-center gap-0.5 text-[7px]"
                        title={lang === 'jp' ? 'はがす' : lang === 'en' ? 'TEAR IT' : 'Robek memo'}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        {lang === 'jp' ? '捨てる' : lang === 'en' ? 'TEAR' : 'Lempar'}
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
  );
}
