import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, Undo2, Users, Cpu, Award, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

const PIECE_SYMBOLS = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚'
};

const PIECE_NAMES = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King'
};

const INITIAL_BOARD = [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
  ],
  [
    { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' },
    { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }
  ],
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  [
    { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' },
    { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }
  ],
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
  ]
];

// Web Audio API Synthesizer
const synthSound = (type, muted) => {
  if (muted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'move') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'capture') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'check') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'gameover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    }
  } catch (e) {
    console.warn("Synth blocked by browser policy:", e);
  }
};

export default function ChessGame() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState('w'); // 'w' or 'b'
  const [gameMode, setGameMode] = useState('ai'); // 'ai' or 'local'
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium'
  const [captured, setCaptured] = useState({ w: [], b: [] });
  const [history, setHistory] = useState([]);
  const [gameState, setGameState] = useState('active'); // 'active', 'checkmate', 'stalemate'
  const [muted, setMuted] = useState(false);
  const [checkingColor, setCheckingColor] = useState(null); // Color in check

  // AI Move triggering
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'b' && gameState === 'active') {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, gameState]);

  // Check state validation
  useEffect(() => {
    const isWCheck = isKingInCheck(board, 'w');
    const isBCheck = isKingInCheck(board, 'b');

    if (isWCheck) {
      setCheckingColor('w');
      synthSound('check', muted);
    } else if (isBCheck) {
      setCheckingColor('b');
      synthSound('check', muted);
    } else {
      setCheckingColor(null);
    }

    // Check game termination
    const hasW = hasAnyLegalMoves(board, 'w');
    const hasB = hasAnyLegalMoves(board, 'b');

    if (turn === 'w' && !hasW) {
      if (isWCheck) {
        setGameState('checkmate');
        synthSound('gameover', muted);
      } else {
        setGameState('stalemate');
        synthSound('gameover', muted);
      }
    } else if (turn === 'b' && !hasB) {
      if (isBCheck) {
        setGameState('checkmate');
        synthSound('gameover', muted);
      } else {
        setGameState('stalemate');
        synthSound('gameover', muted);
      }
    }
  }, [board, turn]);

  // Core Validators
  const isValidMove = (currentBoard, fromRow, fromCol, toRow, toCol) => {
    const piece = currentBoard[fromRow][fromCol];
    if (!piece) return false;
    const target = currentBoard[toRow][toCol];
    if (target && target.color === piece.color) return false;

    const dRow = toRow - fromRow;
    const dCol = toCol - fromCol;
    const absDRow = Math.abs(dRow);
    const absDCol = Math.abs(dCol);

    switch (piece.type) {
      case 'p': {
        const dir = piece.color === 'w' ? -1 : 1;
        const startRow = piece.color === 'w' ? 6 : 1;

        if (dCol === 0 && dRow === dir && !target) {
          return true;
        }
        if (dCol === 0 && fromRow === startRow && dRow === 2 * dir && !currentBoard[fromRow + dir][fromCol] && !target) {
          return true;
        }
        if (absDCol === 1 && dRow === dir && target && target.color !== piece.color) {
          return true;
        }
        return false;
      }
      case 'n': {
        return (absDRow === 2 && absDCol === 1) || (absDRow === 1 && absDCol === 2);
      }
      case 'b': {
        if (absDRow !== absDCol) return false;
        const stepRow = dRow > 0 ? 1 : -1;
        const stepCol = dCol > 0 ? 1 : -1;
        let r = fromRow + stepRow;
        let c = fromCol + stepCol;
        while (r !== toRow && c !== toCol) {
          if (currentBoard[r][c]) return false;
          r += stepRow;
          c += stepCol;
        }
        return true;
      }
      case 'r': {
        if (dRow !== 0 && dCol !== 0) return false;
        const stepRow = dRow === 0 ? 0 : (dRow > 0 ? 1 : -1);
        const stepCol = dCol === 0 ? 0 : (dCol > 0 ? 1 : -1);
        let r = fromRow + stepRow;
        let c = fromCol + stepCol;
        while (r !== toRow || c !== toCol) {
          if (currentBoard[r][c]) return false;
          r += stepRow;
          c += stepCol;
        }
        return true;
      }
      case 'q': {
        if (absDRow === absDCol) {
          const stepRow = dRow > 0 ? 1 : -1;
          const stepCol = dCol > 0 ? 1 : -1;
          let r = fromRow + stepRow;
          let c = fromCol + stepCol;
          while (r !== toRow && c !== toCol) {
            if (currentBoard[r][c]) return false;
            r += stepRow;
            c += stepCol;
          }
          return true;
        }
        if (dRow === 0 || dCol === 0) {
          const stepRow = dRow === 0 ? 0 : (dRow > 0 ? 1 : -1);
          const stepCol = dCol === 0 ? 0 : (dCol > 0 ? 1 : -1);
          let r = fromRow + stepRow;
          let c = fromCol + stepCol;
          while (r !== toRow || c !== toCol) {
            if (currentBoard[r][c]) return false;
            r += stepRow;
            c += stepCol;
          }
          return true;
        }
        return false;
      }
      case 'k': {
        return absDRow <= 1 && absDCol <= 1;
      }
      default:
        return false;
    }
  };

  const isKingInCheck = (currentBoard, color) => {
    let kingRow = -1;
    let kingCol = -1;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && p.type === 'k' && p.color === color) {
          kingRow = r;
          kingCol = c;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    if (kingRow === -1) return false;

    const opColor = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && p.color === opColor) {
          if (isValidMove(currentBoard, r, c, kingRow, kingCol)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const getLegalMoves = (currentBoard, fromRow, fromCol) => {
    const piece = currentBoard[fromRow][fromCol];
    if (!piece) return [];
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMove(currentBoard, fromRow, fromCol, r, c)) {
          const next = currentBoard.map(row => [...row]);
          next[r][c] = next[fromRow][fromCol];
          next[fromRow][fromCol] = null;
          if (!isKingInCheck(next, piece.color)) {
            moves.push({ row: r, col: c });
          }
        }
      }
    }
    return moves;
  };

  const hasAnyLegalMoves = (currentBoard, color) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && p.color === color) {
          if (getLegalMoves(currentBoard, r, c).length > 0) return true;
        }
      }
    }
    return false;
  };

  // Move Executor
  const executeMove = (fromRow, fromCol, toRow, toCol) => {
    const nextBoard = board.map(row => [...row]);
    const piece = nextBoard[fromRow][fromCol];
    const target = nextBoard[toRow][toCol];

    // Track capture
    let capturedPiece = null;
    if (target) {
      capturedPiece = target;
      setCaptured(prev => {
        const list = { ...prev };
        list[target.color === 'w' ? 'b' : 'w'] = [...list[target.color === 'w' ? 'b' : 'w'], target];
        return list;
      });
      synthSound('capture', muted);
    } else {
      synthSound('move', muted);
    }

    // Move piece
    nextBoard[toRow][toCol] = piece;
    nextBoard[fromRow][fromCol] = null;

    // Pawn Promotion (Auto to Queen)
    if (piece.type === 'p' && (toRow === 0 || toRow === 7)) {
      nextBoard[toRow][toCol] = { type: 'q', color: piece.color };
    }

    // Save history
    const moveLogStr = `${PIECE_NAMES[piece.type]} at ${String.fromCharCode(97 + fromCol)}${8 - fromRow} → ${String.fromCharCode(97 + toCol)}${8 - toRow}`;
    setHistory(prev => [
      ...prev,
      {
        boardState: board,
        capturedState: captured,
        moveDesc: moveLogStr,
        turnState: turn
      }
    ]);

    setBoard(nextBoard);
    setSelected(null);
    setValidMoves([]);
    setTurn(turn === 'w' ? 'b' : 'w');
  };

  // Tile Interaction
  const handleTileClick = (r, c) => {
    if (gameState !== 'active') return;
    if (gameMode === 'ai' && turn === 'b') return; // AI is thinking

    const piece = board[r][c];

    // If already selected, check if clicked on valid move target
    if (selected) {
      const isTargetValid = validMoves.some(m => m.row === r && m.col === c);
      if (isTargetValid) {
        executeMove(selected.row, selected.col, r, c);
        return;
      }
    }

    // Otherwise, select piece of current turn color
    if (piece && piece.color === turn) {
      setSelected({ row: r, col: c });
      setValidMoves(getLegalMoves(board, r, c));
    } else {
      setSelected(null);
      setValidMoves([]);
    }
  };

  // AI Move Engine
  const makeAIMove = () => {
    // 1. Gather all legal moves for Black
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === 'b') {
          const legals = getLegalMoves(board, r, c);
          legals.forEach(m => {
            allMoves.push({
              from: { row: r, col: c },
              to: m,
              piece: p,
              target: board[m.row][m.col]
            });
          });
        }
      }
    }

    if (allMoves.length === 0) return;

    // Heuristics Score calculation
    const scores = allMoves.map(m => {
      let score = 0;

      // Capture values
      if (m.target) {
        const valMap = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
        score += valMap[m.target.type] || 0;
      }

      // Center control bias
      const isCenter = m.to.row >= 3 && m.to.row <= 4 && m.to.col >= 3 && m.to.col <= 4;
      if (isCenter) score += 2;

      // Difficulty logic
      if (difficulty === 'medium') {
        // Avoid moving to squares where we can be captured next turn
        const nextBoard = board.map(row => [...row]);
        nextBoard[m.to.row][m.to.col] = nextBoard[m.from.row][m.from.col];
        nextBoard[m.from.row][m.from.col] = null;
        
        // Simple safety check: check if any White piece can legal move to Black's landing square
        let landingUnsafe = false;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = nextBoard[r][c];
            if (p && p.color === 'w') {
              if (isValidMove(nextBoard, r, c, m.to.row, m.to.col)) {
                landingUnsafe = true;
                break;
              }
            }
          }
          if (landingUnsafe) break;
        }

        if (landingUnsafe) {
          score -= 8; // Penalty for unsafe landing
        }
      }

      return { ...m, score };
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Pick top options
    const maxScore = scores[0].score;
    const candidates = scores.filter(s => s.score === maxScore);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    executeMove(chosen.from.row, chosen.from.col, chosen.to.row, chosen.to.col);
  };

  // Undo System
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];

    setBoard(last.boardState);
    setCaptured(last.capturedState);
    setTurn(last.turnState);
    setHistory(prev => prev.slice(0, -1));
    setSelected(null);
    setValidMoves([]);
    setGameState('active');
    setCheckingColor(null);
  };

  // Reset Engine
  const handleReset = () => {
    setBoard(INITIAL_BOARD);
    setSelected(null);
    setValidMoves([]);
    setTurn('w');
    setCaptured({ w: [], b: [] });
    setHistory([]);
    setGameState('active');
    setCheckingColor(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-6xl mx-auto pb-10">
      
      {/* ── Sidebar Controls ── */}
      <div className="xl:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Match Setup</h3>
            <p className="text-white/40 text-xs mt-0.5">Configure your game settings</p>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
            <button 
              onClick={() => { setGameMode('ai'); handleReset(); }}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                gameMode === 'ai' ? 'bg-accent text-white shadow-lg' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> VS Comp
            </button>
            <button 
              onClick={() => { setGameMode('local'); handleReset(); }}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                gameMode === 'local' ? 'bg-accent text-white shadow-lg' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> 2 Players
            </button>
          </div>

          {/* Difficulty setting (only visible in AI mode) */}
          {gameMode === 'ai' && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Difficulty</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setDifficulty('easy')}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    difficulty === 'easy' 
                      ? 'border-accent text-accent bg-accent/5' 
                      : 'border-white/10 text-white/50 hover:text-white/80'
                  }`}
                >
                  Easy
                </button>
                <button 
                  onClick={() => setDifficulty('medium')}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    difficulty === 'medium' 
                      ? 'border-purple-500 text-purple-400 bg-purple-500/5' 
                      : 'border-white/10 text-white/50 hover:text-white/80'
                  }`}
                >
                  Medium
                </button>
              </div>
            </div>
          )}

          {/* Sound, Restart & Undo */}
          <div className="pt-2 border-t border-white/5 flex gap-2">
            <button 
              onClick={() => setMuted(!muted)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 text-white/60 hover:text-white transition-all"
              title={muted ? "Unmute sounds" : "Mute sounds"}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleUndo} 
              disabled={history.length === 0}
              className="flex-1 py-2.5 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 text-white/60 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Undo Move"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleReset} 
              className="flex-1 py-2.5 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 text-white/60 hover:text-white transition-all animate-pulse"
              title="Restart Game"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Captured Pieces list */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-white/50">Captured Vault</h4>
          
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-white/40 uppercase mb-1 font-semibold">Captured by White</p>
              <div className="flex flex-wrap gap-1 min-h-[30px] p-2 rounded-xl bg-black/20 border border-white/5">
                {captured.b.map((p, idx) => (
                  <span key={idx} className="text-lg text-purple-400 filter drop-shadow-[0_1px_2px_rgba(168,85,247,0.5)]">
                    {PIECE_SYMBOLS[p.type]}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-white/40 uppercase mb-1 font-semibold">Captured by Black</p>
              <div className="flex flex-wrap gap-1 min-h-[30px] p-2 rounded-xl bg-black/20 border border-white/5">
                {captured.w.map((p, idx) => (
                  <span key={idx} className="text-lg text-white filter drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]">
                    {PIECE_SYMBOLS[p.type]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Chessboard View ── */}
      <div className="xl:col-span-2 flex flex-col items-center">
        
        {/* State Banner / Turn Indicator */}
        <div className="w-full max-w-[480px] mb-4 flex justify-between items-center px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full ${turn === 'w' ? 'bg-white shadow-[0_0_10px_#fff]' : 'bg-purple-500 shadow-[0_0_10px_#a855f7]'} transition-all`} />
            <span className="text-xs font-semibold text-white/80">
              {turn === 'w' ? "White's Turn" : gameMode === 'ai' ? "Computer is calculating..." : "Black's Turn"}
            </span>
          </div>

          {checkingColor && (
            <span className="px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
              <ShieldAlert className="w-3 h-3" /> Check
            </span>
          )}
        </div>

        {/* Board container */}
        <div className="relative p-3 rounded-[32px] bg-black/50 border border-white/15 shadow-2xl backdrop-blur-md">
          
          {/* Grid Chessboard */}
          <div className="grid grid-cols-8 gap-0.5 bg-white/5 rounded-2xl overflow-hidden border border-white/10 w-full max-w-[480px] aspect-square">
            {board.map((row, r) => 
              row.map((piece, c) => {
                const isSelected = selected && selected.row === r && selected.col === c;
                const isValidTarget = validMoves.some(m => m.row === r && m.col === c);
                const isDark = (r + c) % 2 === 1;
                const isKingCheck = piece && piece.type === 'k' && piece.color === checkingColor;

                return (
                  <div 
                    key={`${r}-${c}`}
                    onClick={() => handleTileClick(r, c)}
                    className={`relative flex items-center justify-center cursor-pointer select-none aspect-square transition-all duration-200 ${
                      isDark 
                        ? 'bg-black/30' 
                        : 'bg-white/5'
                    } ${
                      isSelected 
                        ? 'bg-accent-violet/30 shadow-[inset_0_0_15px_rgba(139,92,246,0.6)] z-10' 
                        : ''
                    } ${
                      isKingCheck 
                        ? 'bg-red-500/25 shadow-[inset_0_0_15px_rgba(239,68,68,0.6)] border border-red-500/50' 
                        : ''
                    }`}
                  >
                    {/* Piece Rendering */}
                    {piece && (
                      <span className={`text-4xl transition-transform duration-200 hover:scale-110 select-none ${
                        piece.color === 'w'
                          ? 'text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.7)]'
                          : 'text-purple-400 drop-shadow-[0_2px_8px_rgba(168,85,247,0.7)]'
                      }`}>
                        {PIECE_SYMBOLS[piece.type]}
                      </span>
                    )}

                    {/* Move Hints */}
                    {isValidTarget && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-3.5 h-3.5 rounded-full ${
                          piece ? 'border-2 border-red-500 bg-transparent scale-125' : 'bg-green-400/80 shadow-[0_0_10px_rgba(74,222,128,0.8)]'
                        }`} />
                      </div>
                    )}

                    {/* Coordinates on borders */}
                    {c === 0 && (
                      <span className="absolute top-1 left-1.5 text-[8px] font-semibold text-white/20 select-none">{8 - r}</span>
                    )}
                    {r === 7 && (
                      <span className="absolute bottom-1 right-1.5 text-[8px] font-semibold text-white/20 select-none">{String.fromCharCode(97 + c)}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameState !== 'active' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-[32px] flex flex-col items-center justify-center p-6 text-center z-30"
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">
                  {gameState === 'checkmate' ? 'Checkmate! 🏆' : 'Stalemate 🤝'}
                </h3>
                <p className="text-white/60 text-sm max-w-xs mb-6">
                  {gameState === 'checkmate' 
                    ? `Victory goes to ${turn === 'w' ? 'Black (Computer)' : 'White (Player)'}!`
                    : 'The match resulted in a draw due to stalemate.'
                  }
                </p>
                <button 
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold hover:shadow-lg hover:shadow-accent/30 transition-all text-sm"
                >
                  Play Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Move Log Panel ── */}
      <div className="xl:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-3xl h-[420px] flex flex-col">
          <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-white/50 mb-3">Live Log</h4>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-hide text-xs">
            {history.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/30 text-center p-4">
                No moves logged yet
              </div>
            ) : (
              history.map((h, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 text-white/70">
                  <span className="font-mono text-white/30">#{idx + 1}</span>
                  <span className="font-medium text-white/80">{h.moveDesc}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    h.turnState === 'w' ? 'bg-white/10 text-white' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {h.turnState === 'w' ? 'W' : 'B'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
