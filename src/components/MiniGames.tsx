import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, RotateCcw, Coins, Swords, MessageSquare } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';

interface MiniGamesProps {
  onAddLog: (message: string) => void;
  lang?: Language;
}

const MEMORY_EMOJIS = ['🥑', '👾', '🚀', '🍰', '🍿', '🦊'];

export default function MiniGames({ onAddLog, lang = 'id' }: MiniGamesProps) {
  const t = TRANSLATIONS[lang];
  const [activeGame, setActiveGame] = useState<'memory' | 'slime' | 'ttt'>('memory');

  // ==========================================
  // GAME 1: MEMORY MATCH STATE
  // ==========================================
  const [memoryCards, setMemoryCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWins, setMemoryWins] = useState(0);

  const initMemoryGame = () => {
    const pairEmojis = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS];
    const shuffled = pairEmojis
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
    setMemoryCards(shuffled);
    setSelectedIndices([]);
    setMemoryMoves(0);
  };

  useEffect(() => {
    if (activeGame === 'memory') {
      initMemoryGame();
    }
  }, [activeGame]);

  const handleCardClick = (index: number) => {
    if (selectedIndices.length === 2 || memoryCards[index].isFlipped || memoryCards[index].isMatched) return;

    const updated = [...memoryCards];
    updated[index].isFlipped = true;
    setMemoryCards(updated);

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelected;

      if (updated[firstIdx].emoji === updated[secondIdx].emoji) {
        setTimeout(() => {
          const matchedList = [...memoryCards];
          matchedList[firstIdx].isMatched = true;
          matchedList[secondIdx].isMatched = true;
          setMemoryCards(matchedList);
          setSelectedIndices([]);

          if (matchedList.every(c => c.isMatched)) {
            setMemoryWins(w => w + 1);
            onAddLog(lang === 'jp' ? `絵合わせパズルが${memoryMoves + 1}手でクリアされました！` : lang === 'en' ? `Memory Match completed in ${memoryMoves + 1} steps!` : `Memory Match diselesaikan dalam ${memoryMoves + 1} langkah! 🧩`);
            
            confetti({
              particleCount: 120,
              spread: 60,
              origin: { y: 0.7 }
            });

            Swal.fire({
              title: lang === 'jp' ? '脳が活性化されました！🧠' : lang === 'en' ? 'Brilliant Focus! 🧠' : 'Luar Biasa Memori Tajam! 🧠',
              text: lang === 'jp' ? `記録された挑戦回数: ${memoryMoves + 1}手` : `Completed perfectly in ${memoryMoves + 1} attempts!`,
              icon: 'success',
              confirmButtonColor: '#ec38bc',
              customClass: { popup: 'border-4 border-black bg-[#11142e] text-white font-display' }
            });
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetList = [...memoryCards];
          resetList[firstIdx].isFlipped = false;
          resetList[secondIdx].isFlipped = false;
          setMemoryCards(resetList);
          setSelectedIndices([]);
        }, 800);
      }
    }
  };

  // ==========================================
  // GAME 2: SLIME BATTLE RPG STATE
  // ==========================================
  const [coins, setCoins] = useState(() => {
    const val = localStorage.getItem('slime_coins');
    return val ? parseInt(val) : 50;
  });
  const [slimeHp, setSlimeHp] = useState(100);
  const [slimeMaxHp, setSlimeMaxHp] = useState(100);
  const [slimeLevel, setSlimeLevel] = useState(1);
  const [swordTier, setSwordTier] = useState(1);
  const [autoTappers, setAutoTappers] = useState(0);
  const [isSlimeHit, setIsSlimeHit] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: string; text: string; x: number; y: number }[]>([]);

  const SLIME_TYPES = [
    { name: lang === 'jp' ? 'プチスライム 🥦' : 'Slime Hutan Pedesaan 🥦', color: 'from-emerald-450 to-emerald-600', maxHp: 100 },
    { name: lang === 'jp' ? 'ストロチキュス 🍓' : 'Slime Stroberi Kemayu 🍓', color: 'from-rose-450 to-rose-600', maxHp: 180 },
    { name: lang === 'jp' ? 'ハニードリッパー 🍯' : 'Slime Madu Manis Berleleran 🍯', color: 'from-amber-400 to-amber-600', maxHp: 300 },
    { name: lang === 'jp' ? 'キングゴールドスライム 👑' : 'Raja Slime Mahkota Emas 👑', color: 'from-yellow-405 to-yellow-550', maxHp: 600 },
    { name: lang === 'jp' ? 'ボイドオメガ神 🪐' : 'Dewa Slime Kosmik Void 🪐', color: 'from-purple-650 to-pink-700', maxHp: 1200 },
  ];

  const currentSlimeData = SLIME_TYPES[(slimeLevel - 1) % SLIME_TYPES.length];

  useEffect(() => {
    if (autoTappers === 0) return;
    const interval = setInterval(() => {
      setSlimeHp(hp => {
        const dps = autoTappers * 3;
        const newHp = hp - dps;
        if (newHp <= 0) {
          triggerSlimeDefeated();
          return currentSlimeData.maxHp;
        }
        return newHp;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoTappers, slimeLevel]);

  useEffect(() => {
    localStorage.setItem('slime_coins', coins.toString());
  }, [coins]);

  const swordCost = swordTier * 40;
  const zapCost = (autoTappers + 1) * 60;
  const clickDmg = swordTier * 5;

  const handleSlimeTap = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSlimeHit(true);
    setTimeout(() => setIsSlimeHit(false), 100);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 30 - 15);
    const y = e.clientY - rect.top - 20;

    const dmg = clickDmg;
    const newFText = {
      id: Math.random().toString(),
      text: `-${dmg} HP!`,
      x,
      y
    };
    setFloatingTexts(p => [...p, newFText]);
    setTimeout(() => {
      setFloatingTexts(p => p.filter(ft => ft.id !== newFText.id));
    }, 800);

    setSlimeHp(hp => {
      const nextHp = hp - dmg;
      if (nextHp <= 0) {
        triggerSlimeDefeated();
        return currentSlimeData.maxHp;
      }
      return nextHp;
    });
  };

  const triggerSlimeDefeated = () => {
    const bounty = slimeLevel * 15 + Math.floor(Math.random() * 10);
    setCoins(c => c + bounty);
    setSlimeLevel(lvl => lvl + 1);
    
    const nextMax = 100 + (slimeLevel * 80);
    setSlimeMaxHp(nextMax);
    setSlimeHp(nextMax);

    onAddLog(lang === 'jp' ? `スライム討伐成功！報酬として ${bounty} ゴールドを獲得しました！` : lang === 'en' ? `Slayed Enemy level ${slimeLevel}! Rewarded with ${bounty} Gold pieces!` : `Berhasil mengalahkan Slime Level ${slimeLevel} dan mendapatkan ${bounty} Koin Emas! 👾⚔️`);

    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0.3, y: 0.8 }
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 0.7, y: 0.8 }
    });
  };

  const buySword = () => {
    if (coins < swordCost) {
      Swal.fire({
        title: lang === 'jp' ? 'ゴールド不足！' : lang === 'en' ? 'Poor Knight!' : 'Koin Kurang!',
        text: lang === 'jp' ? 'スライムをタップしてゴールドを稼いでください！' : 'Sabet monster slime lebih gencar untuk mencari emas!',
        icon: 'error',
        confirmButtonColor: '#ec38bc',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white' }
      });
      return;
    }
    setCoins(c => c - swordCost);
    setSwordTier(t => t + 1);
    onAddLog(`Membeli Pedang Tier ${swordTier + 1}! ⚔️`);
  };

  const buyZapper = () => {
    if (coins < zapCost) {
      Swal.fire({
        title: lang === 'jp' ? 'ゴールド不足！' : lang === 'en' ? 'No Coins!' : 'Koin Kurang!',
        text: lang === 'jp' ? '全自動サンダーボルトを起動するための資金がありません！' : 'Koinmu belum cukup untuk membiayai jebakan auto-petir!',
        icon: 'error',
        confirmButtonColor: '#ec38bc',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white' }
      });
      return;
    }
    setCoins(c => c - zapCost);
    setAutoTappers(a => a + 1);
    onAddLog(`Membeli Auto Slime-Zapper ke-${autoTappers + 1}! ⚡`);
  };

  // ==========================================
  // GAME 3: CASUAL TIC-TAC-TOE AI STATE
  // ==========================================
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [tttWinner, setTttWinner] = useState<string | null>(null);
  const [aiBubble, setAiBubble] = useState(lang === 'jp' ? '勝負よ！私の知恵にかなうわけがない 😈' : lang === 'en' ? 'Let us trade blows! Your limited cortex stands no chance 😈' : 'Mari bertanding! Manusia lemah tidak mungkin mengalahkanku 😈');

  const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (cells: string[]) => {
    for (let combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return cells[a];
      }
    }
    if (cells.every(cell => cell !== '')) return 'draw';
    return null;
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || tttWinner || !isPlayerTurn) return;

    const newCells = [...board];
    newCells[idx] = 'X';
    setBoard(newCells);

    const winStatus = checkWinner(newCells);
    if (winStatus) {
      concludeTtt(winStatus);
      return;
    }

    setIsPlayerTurn(false);
    setAiBubble(lang === 'jp' ? 'ふむ、面白い。どうやって包囲するか考え中...' : 'Hmm... interesting move. Thinking of how to outsmart you...');

    setTimeout(() => {
      triggerAiMove(newCells);
    }, 600);
  };

  const triggerAiMove = (currentCells: string[]) => {
    const emptyIndices: number[] = [];
    currentCells.forEach((cell, index) => {
      if (cell === '') emptyIndices.push(index);
    });

    if (emptyIndices.length === 0) return;

    let choice = -1;

    for (let p of ['O', 'X']) {
      for (let combo of WIN_COMBOS) {
        const [a, b, c] = combo;
        const vals = [currentCells[a], currentCells[b], currentCells[c]];
        const occByP = vals.filter(v => v === p).length;
        const occByEmpty = vals.filter(v => v === '').length;
        if (occByP === 2 && occByEmpty === 1) {
          if (currentCells[a] === '') choice = a;
          else if (currentCells[b] === '') choice = b;
          else if (currentCells[c] === '') choice = c;
          break;
        }
      }
      if (choice !== -1) break;
    }

    if (choice === -1) {
      choice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    const nextCells = [...currentCells];
    nextCells[choice] = 'O';
    setBoard(nextCells);

    const winStatus = checkWinner(nextCells);
    if (winStatus) {
      concludeTtt(winStatus);
    } else {
      setIsPlayerTurn(true);
      const reactionMessages = lang === 'jp' ? [
        'キミの番よ！AIの計算速度に勝てるかな？ 😎',
        '退屈な守り。もっと大胆に行こうよ！ 🐢/font',
        'この3x3グリッドは完全に支配した！ 🌌',
        '早く降參しなさい、キミの負けは確定よ。 💸',
        'アララ！すみに置いて勝とうとしているのね？ 👀'
      ] : lang === 'en' ? [
        'Your turn! Afraid of the perfect neural matrix? 😎',
        'Boring defensive move. Show me real chess! 🐢',
        'I regulate this entire 3x3 dimension, mortal! 🌌',
        'Give up and enjoy my processing beauty! 👑',
        'Oho! Stacking up corners, cute strategy! 👀'
      ] : [
        'Giliranmu! Takut ya melihat pertahanan koki AI? Haha! 😎',
        'Yah, taktik cangkang kura-kura. Sangat membosankan! 🐢',
        'Aku menguasai semesta grid 3x3 ini, Kawan! 🌌',
        'Bila kamu menyerah sekarang, gajimu masih utuh! 💸',
        'Walah! Kamu berniat menjebakku di sudut ya? 👀'
      ];
      setAiBubble(reactionMessages[Math.floor(Math.random() * reactionMessages.length)]);
    }
  };

  const concludeTtt = (winner: string) => {
    setTttWinner(winner);
    if (winner === 'X') {
      setAiBubble(lang === 'jp' ? 'う、ウソ！計算外だわ。一瞬バグが起きたのよ！😭🤖' : lang === 'en' ? 'NOOO!! Impossible! I detected sudden high packet drops! 😭🤖' : 'A-ADUH!! Kok bisa? Serverku sepertinya mengalami lag tadi! 😭🤖');
      onAddLog(lang === 'jp' ? 'AIに三目並べ勝負で勝利！ ❌⭕' : 'Won a round of Tic-Tac-Toe against Pocket AI! ❌⭕');
      confetti({
        particleCount: 150,
        spread: 90
      });
      Swal.fire({
        title: lang === 'jp' ? '人類の完全勝利！ 🏆' : lang === 'en' ? 'Victory Secured! 🏆' : 'Manusia Menang! 🏆',
        text: lang === 'jp' ? 'キミの知性がミニロボットの頭脳を凌駕しました！' : 'Superb tactics overrode my neural weights!',
        icon: 'success',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white' }
      });
    } else if (winner === 'O') {
      setAiBubble(lang === 'jp' ? 'ハハハ！私のアルゴリズムこそ至高！出直してきなさい！ 🦾👑' : lang === 'en' ? 'Mwahahaha! Machine supremacy is inevitable! 🦾👑' : 'Mwahahaha! Algoritmaku superior dibanding kedipan matamu! Coba lagi lain kali! 🦾👑');
      Swal.fire({
        title: lang === 'jp' ? 'AIが勝利！ 🤖' : 'AI Victorious! 🤖',
        text: lang === 'jp' ? 'もう一度戦略を鍛え直して挑戦しましょう！' : 'Practice your fork corners next time!',
        icon: 'info',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white' }
      });
    } else {
      setAiBubble(lang === 'jp' ? '引き分け！冷却ファンがブンブン回っちゃうわ... 🌀' : 'Draw! That burnt some critical cooling fluid... 🌀');
      Swal.fire({
        title: lang === 'jp' ? '引き分け！ 🤝' : 'Match Ties! 🤝',
        text: lang === 'jp' ? 'お互い完璧な一打でした。' : 'Both minds met and nullified nicely.',
        icon: 'warning',
        customClass: { popup: 'border-4 border-black bg-[#11142e] text-white' }
      });
    }
  };

  const resetTtt = () => {
    setBoard(Array(9).fill(''));
    setIsPlayerTurn(true);
    setTttWinner(null);
    setAiBubble(lang === 'jp' ? '本気を出してね！さぁ、打ってごらん！ 🔥♟️' : lang === 'en' ? 'Bring your authentic human force now! File your mark!' : 'Kali ini permainan aslimu harus keluar! Ayo pasang bidakmu! 🔥♟️');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="mini-games-hub">
      {/* Header section with active tabs selection */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 card text-white">
        <div>
          <h1 className="text-md md:text-lg font-display font-black text-violet-400 flex items-center gap-1.5">
            🕹️ {t.games_title}
          </h1>
          <p className="text-[10px] text-slate-300 mt-1 uppercase">
            {t.games_desc}
          </p>
        </div>

        {/* Arcade mode buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setActiveGame('memory')}
            className={`px-3 py-1 bg-slate-950 border-2 border-black text-[9px] font-display font-bold cursor-pointer transition-all ${
              activeGame === 'memory' ? 'bg-[#ec38bc] text-white shadow-[1.5px_1.5px_0_0_#111]' : 'text-slate-400'
            }`}
          >
            🧩 MATCH KEY
          </button>
          <button
            onClick={() => setActiveGame('slime')}
            className={`px-3 py-1 bg-slate-950 border-2 border-black text-[9px] font-display font-bold cursor-pointer transition-all ${
              activeGame === 'slime' ? 'bg-emerald-600 text-black shadow-[1.5px_1.5px_0_0_#111]' : 'text-slate-400'
            }`}
          >
            ⚔️ SLIME RPG
          </button>
          <button
            onClick={() => setActiveGame('ttt')}
            className={`px-3 py-1 bg-slate-950 border-2 border-black text-[9px] font-display font-bold cursor-pointer transition-all ${
              activeGame === 'ttt' ? 'bg-sky-505 bg-sky-500 text-black shadow-[1.5px_1.5px_0_0_#111]' : 'text-slate-400'
            }`}
          >
            ❌ TIC-TAC AI
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE GAME CONTROLLERS */}
      <div className="card text-white">
        
        {/* Memory Match */}
        {activeGame === 'memory' && (
          <div className="space-y-6 max-w-sm mx-auto text-center py-2" id="game-memory-match">
            <div className="flex justify-between items-center bg-slate-950 p-3 border-2 border-black">
              <div>
                <p className="text-[7px] font-display text-slate-500 uppercase">TILES FLIP ATTEMPT</p>
                <p className="text-xs font-bold text-white mt-1">{memoryMoves} tries</p>
              </div>
              
              <button
                onClick={initMemoryGame}
                className="p-1.5 bg-slate-900 border border-black hover:bg-slate-850 cursor-pointer"
                title="Shuffle"
              >
                <RotateCcw className="w-4 h-4 text-[#ec38bc]" />
              </button>

              <div>
                <p className="text-[7px] font-display text-slate-500 uppercase">TROPHY SLOTS</p>
                <p className="text-xs font-bold text-yellow-450 text-yellow-400 mt-1 flex items-center justify-end gap-1">
                  <Trophy className="w-3.5 h-3.5" /> {memoryWins}
                </p>
              </div>
            </div>

            {/* Grid 3x4 Cards */}
            <div className="grid grid-cols-4 gap-2.5 max-w-[280px] mx-auto">
              {memoryCards.map((card, idx) => {
                const open = card.isFlipped || card.isMatched;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`aspect-square border-2 border-black shadow-[1.5px_1.5px_0_0_#000] flex items-center justify-center text-xl cursor-pointer transform transition-all select-none ${
                      open
                        ? 'bg-purple-950/80 border-purple-500'
                        : 'bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    <span>
                      {open ? card.emoji : '❓'}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[8px] font-display text-slate-500 uppercase tracking-wider">
              Match dual same symbols to test dynamic focal efficiency!
            </p>
          </div>
        )}

        {/* Battle Slime RPG */}
        {activeGame === 'slime' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2" id="game-slime-tapper">
            
            {/* Arena */}
            <div className="md:col-span-7 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-5 md:pb-0 md:pr-6 space-y-4">
              <div className="text-center w-full">
                <span className="text-[7px] font-display bg-slate-950 text-emerald-400 px-2 py-0.5 border border-black uppercase tracking-widest">
                  SLIME ENEMY STAGE: LVL {slimeLevel}
                </span>
                <h3 className="font-bold text-white text-xs mt-2 truncate">
                  {currentSlimeData.name}
                </h3>
              </div>

              {/* Click box */}
              <div 
                onClick={handleSlimeTap}
                className="relative bg-slate-950 p-6 w-full max-w-sm aspect-video border-2 border-black shadow-[2.5px_2.5px_0_0_#000] flex items-center justify-center cursor-pointer select-none overflow-hidden"
              >
                {floatingTexts.map(ft => (
                  <span
                    key={ft.id}
                    style={{ left: ft.x, top: ft.y }}
                    className="absolute text-orange-400 font-extrabold text-xs animate-bounce drop-shadow-[0_1.5px_0_#000] pointer-events-none font-mono"
                  >
                    {ft.text}
                  </span>
                ))}

                <div 
                  className={`w-28 h-20 rounded-t-[50px] rounded-b-[15px] bg-gradient-to-b ${currentSlimeData.color} border-2 border-black shadow-xl relative transition-transform transform ${
                    isSlimeHit ? 'scale-90 translate-y-3' : 'animate-pulse hover:scale-105'
                  }`}
                >
                  <div className="absolute top-5 left-6 w-3.5 h-3.5 bg-white border border-black rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                  <div className="absolute top-5 right-6 w-3.5 h-3.5 bg-white border border-black rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-4.5 h-2.5 border-b-2 border-black rounded-b-full" />

                  <div className="absolute top-9 left-2.5 w-1.5 h-1 bg-red-400 rounded-full" />
                  <div className="absolute top-9 right-2.5 w-1.5 h-1 bg-red-400 rounded-full" />
                </div>

                <span className="absolute bottom-1 right-2 text-[6px] font-mono text-slate-650 text-slate-550 uppercase tracking-widest">CRUSH BY TAPPING</span>
              </div>

              <div className="w-full max-w-sm space-y-1">
                <div className="flex justify-between items-center text-[8px] font-display text-slate-400 uppercase">
                  <span>HP BAR</span>
                  <span>{slimeHp} / {slimeMaxHp} HP</span>
                </div>
                <div className="w-full bg-slate-950 h-3 border border-black overflow-hidden relative">
                  <div 
                    className="bg-rose-600 h-full transition-all"
                    style={{ width: `${Math.max((slimeHp / slimeMaxHp) * 100, 0)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Shop Upgrades column */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-950 p-3 border-2 border-black flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500 fill-amber-500 animate-bounce" />
                  <div>
                    <p className="text-[7px] font-display text-slate-500 uppercase">ARCADE GOLD STOCK</p>
                    <p className="text-xs font-bold text-white mt-1">{coins} Koin</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-black text-[9px] font-display">
                  <div>
                    <p className="font-bold text-white">⚔️ {lang === 'jp' ? '伝説の剣' : 'Pedang Besi Tempa'} (T-{swordTier})</p>
                    <p className="text-[7px] text-slate-500 mt-1">DAMAGE: +5 CPC (curr: {clickDmg})</p>
                  </div>
                  <button
                    onClick={buySword}
                    className="px-2.5 py-1.5 bg-amber-505 bg-amber-500 hover:bg-amber-400 border border-black text-black font-bold cursor-pointer"
                  >
                    {swordCost} 🪙
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-black text-[9px] font-display">
                  <div>
                    <p className="font-bold text-white">⚡ Auto Slime-Zapper ({autoTappers})</p>
                    <p className="text-[7px] text-slate-500 mt-1">SENGAT: +3 DPS (curr: {autoTappers * 3})</p>
                  </div>
                  <button
                    onClick={buyZapper}
                    className="px-2.5 py-1.5 bg-[#ec38bc] hover:bg-pink-550 hover:bg-pink-500 border border-black text-white font-bold cursor-pointer"
                  >
                    {zapCost} 🪙
                  </button>
                </div>
              </div>

              <div className="p-2 bg-slate-950 border border-slate-800 text-[7px] font-mono text-slate-500 uppercase leading-relaxed text-center">
                Defeated units drop golden items. Re-invest to auto grind stages!
              </div>
            </div>

          </div>
        )}

        {/* Tic Tac Toe Sassy AI */}
        {activeGame === 'ttt' && (
          <div className="max-w-sm mx-auto text-center space-y-4 py-2" id="game-ttt-ai">
            
            {/*Dialogue Bubble*/}
            <div className="flex items-start gap-2.5 bg-slate-950 border-2 border-black p-3 text-left">
              <div className="w-9 h-9 bg-slate-900 border border-black flex items-center justify-center shrink-0">
                <span className="text-xl">🤖</span>
              </div>
              
              <div className="flex-1">
                <p className="text-[7px] font-display font-black text-[#ec38bc] uppercase flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> POCKET CHATBOT SAY:
                </p>
                <p className="text-[10px] text-slate-205 font-bold text-slate-350 mt-1 leading-relaxed">
                  "{aiBubble}"
                </p>
              </div>
            </div>

            {/* Board 3x3 layout */}
            <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto relative">
              {board.map((cell, idx) => {
                const isX = cell === 'X';
                const isO = cell === 'O';
                return (
                  <div
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    className={`aspect-square border-2 border-black shadow-[1.5px_1.5px_0_0_#000] flex items-center justify-center text-xl font-bold cursor-pointer select-none transition-transform active:scale-95 ${
                      isX
                        ? 'bg-rose-955 bg-rose-950 text-rose-500'
                        : isO
                        ? 'bg-emerald-950 text-emerald-500'
                        : 'bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>

            {/* Reset Battle trigger */}
            <div className="flex justify-center pt-1 pb-1">
              <button
                onClick={resetTtt}
                className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border-2 border-black text-[#ec38bc] font-display font-bold text-[8px] cursor-pointer flex items-center gap-1 shadow-[1.5px_1.5px_0_0_#000]"
              >
                <RotateCcw className="w-3.5 h-3.5" /> RE-ENGAGE GRID ENGINES
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
