import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RotateCw, 
  Award, 
  CheckCircle2, 
  Users, 
  Coins, 
  Printer, 
  MessageCircle, 
  Trash2, 
  AlertCircle,
  FileCheck2,
  FileImage,
  Volume2,
  VolumeX,
  Shuffle,
  QrCode,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Member, LotteryWinner, PaguyubanProfile } from '../types';
import { formatRupiah, formatDateIndo, generateWinnerNotificationWA } from '../utils/formatters';
import { WinnerCertificateModal } from './WinnerCertificateModal';

interface LotteryViewProps {
  members: Member[];
  winners: LotteryWinner[];
  profile: PaguyubanProfile;
  onAddWinner: (winner: Omit<LotteryWinner, 'id'>) => void;
  onUpdateWinner?: (winner: LotteryWinner) => void;
  onDeleteWinner: (id: string) => void;
  onUpdateProfile?: (updatedProfile: PaguyubanProfile) => void;
  activeYear: number;
}

export const LotteryView: React.FC<LotteryViewProps> = ({
  members,
  winners,
  profile,
  onAddWinner,
  onUpdateWinner,
  onDeleteWinner,
  onUpdateProfile,
  activeYear,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeWinnerModal, setActiveWinnerModal] = useState<LotteryWinner | null>(null);
  const [selectedWinnerForDoc, setSelectedWinnerForDoc] = useState<LotteryWinner | null>(null);
  const [editingWinner, setEditingWinner] = useState<LotteryWinner | null>(null);
  const [customPrizeAmount, setCustomPrizeAmount] = useState<number>(1350000);
  const [roundNumberInput, setRoundNumberInput] = useState<number>(winners.length + 1);
  const [drawNotes, setDrawNotes] = useState('');

  // Selected eligible members for this draw
  const alreadyWonMemberIds = winners.map((w) => w.memberId);
  const arisanParticipants = members.filter((m) => m.isArisanParticipant && m.status === 'Aktif');

  // Eligible pool by default excludes prior winners
  const [eligibleMemberIds, setEligibleMemberIds] = useState<string[]>([]);

  useEffect(() => {
    const defaultEligible = arisanParticipants
      .filter((m) => !alreadyWonMemberIds.includes(m.id))
      .map((m) => m.id);
    setEligibleMemberIds(defaultEligible);
    setRoundNumberInput(winners.length + 1);
  }, [members, winners]);

  const eligibleMembers = arisanParticipants.filter((m) => eligibleMemberIds.includes(m.id));

  // Colors for wheel slices
  const sliceColors = [
    '#059669', '#0d9488', '#0284c7', '#2563eb', 
    '#7c3aed', '#c026d3', '#db2777', '#e11d48', 
    '#ea580c', '#d97706', '#65a30d', '#16a34a'
  ];

  // Draw the wheel on canvas
  const rotationAngleRef = useRef(0);
  const spinAnimationRef = useRef<number | null>(null);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 15;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (eligibleMembers.length === 0) {
      // Empty state on canvas
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Semua Sudah Menang!', centerX, centerY);
      return;
    }

    const numSlices = eligibleMembers.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Draw slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = sliceColors[i % sliceColors.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = numSlices > 20 ? 'bold 10px sans-serif' : 'bold 12px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      
      const member = eligibleMembers[i];
      const displayName = member.name.length > 16 ? member.name.substring(0, 14) + '..' : member.name;
      ctx.fillText(displayName, radius - 20, 4);
      ctx.restore();
    }

    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Center pin circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('P3N', centerX, centerY + 4);
  };

  useEffect(() => {
    drawWheel(rotationAngleRef.current);
  }, [eligibleMembers]);

  // Spin trigger
  const spinWheel = () => {
    if (isSpinning || eligibleMembers.length === 0) return;

    setIsSpinning(true);

    // Audio click effect simulation
    let audioInterval: any = null;
    if (soundEnabled && typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTick = () => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.04);
        };
        audioInterval = setInterval(playTick, 80);
      } catch (e) {
        // audio fallback
      }
    }

    const numSlices = eligibleMembers.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Pick random winner
    const winningIndex = Math.floor(Math.random() * numSlices);
    const winner = eligibleMembers[winningIndex];

    // Calculate target angle
    const targetSliceMid = winningIndex * sliceAngle + sliceAngle / 2;
    const extraRotations = 6 + Math.floor(Math.random() * 3); // 6 to 8 full spins
    const totalSpinAngle = extraRotations * 2 * Math.PI + (2 * Math.PI - targetSliceMid);

    const startAngle = rotationAngleRef.current % (2 * Math.PI);
    const finalAngle = startAngle + totalSpinAngle;

    const duration = 5500; // 5.5s
    const startTime = performance.now();

    const animateSpin = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentAngle = startAngle + (finalAngle - startAngle) * easeOut;

      rotationAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        spinAnimationRef.current = requestAnimationFrame(animateSpin);
      } else {
        if (audioInterval) clearInterval(audioInterval);
        setIsSpinning(false);

        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
        });

        // Add winner to state
        const newWinnerData: Omit<LotteryWinner, 'id'> = {
          roundNumber: roundNumberInput,
          drawDate: new Date().toISOString().split('T')[0],
          memberId: winner.id,
          memberName: winner.name,
          memberCategory: winner.category,
          prizeAmount: customPrizeAmount,
          periodLabel: `Putaran ${roundNumberInput} - ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())}`,
          notes: drawNotes || `Pemenang Kocokan Putaran ke-${roundNumberInput}`,
          disbursed: true,
          disbursedDate: new Date().toISOString().split('T')[0],
        };

        onAddWinner(newWinnerData);
        setActiveWinnerModal({
          id: `temp-${Date.now()}`,
          ...newWinnerData,
        });
      }
    };

    spinAnimationRef.current = requestAnimationFrame(animateSpin);
  };

  const toggleMemberEligibility = (memberId: string) => {
    if (eligibleMemberIds.includes(memberId)) {
      setEligibleMemberIds(eligibleMemberIds.filter((id) => id !== memberId));
    } else {
      setEligibleMemberIds([...eligibleMemberIds, memberId]);
    }
  };

  const handleResetAllEligibility = () => {
    setEligibleMemberIds(arisanParticipants.map((m) => m.id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="space-y-1 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-emerald-950/50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Sistem Kocokan Arisan Digital
            </span>
            <span className="rounded-md bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <FileImage className="h-3.5 w-3.5" />
              Kwitansi & Dokumen Ber-Kop Surat .JPG
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Kocokan Arisan {profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Roda putar transparan & acak. Hasil kocokan arisan otomatis menerbitkan Kwitansi & Berita Acara resmi ber-kop surat dengan barcode serta tanda tangan Ketua Paguyuban.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-amber-300" />
                <span>Suara: Nyala</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-slate-300" />
                <span>Suara: Mati</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Spinner & Controls Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wheel Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs relative">
          {/* Top Indicator Arrow */}
          <div className="relative flex items-center justify-center">
            {/* The Pointer Pin */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-0 h-0 border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent border-r-[26px] border-r-amber-500 drop-shadow-md" />

            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="max-w-full h-auto drop-shadow-xl"
            />
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-6 w-full max-w-sm">
            <button
              id="btn-spin-lottery-wheel"
              type="button"
              onClick={spinWheel}
              disabled={isSpinning || eligibleMembers.length === 0}
              className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                isSpinning
                  ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                  : eligibleMembers.length === 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-amber-500/25 animate-pulse'
              }`}
            >
              <RotateCw className={`h-5 w-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Sedang Mengocok...' : 'PUTAR KOCOKAN SEKARANG!'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
              {eligibleMembers.length} Peserta siap diundi dalam putaran ini.
            </p>
          </div>
        </div>

        {/* Configuration & Eligible Pool Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Round & Prize Settings Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Pengaturan Putaran Ini
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Putaran Ke-
                </label>
                <input
                  type="number"
                  value={roundNumberInput}
                  onChange={(e) => setRoundNumberInput(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nominal Hadiah (Get)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={customPrizeAmount}
                  onChange={(e) => setCustomPrizeAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Catatan Pertemuan / Tempat
              </label>
              <input
                type="text"
                placeholder={`Contoh: ${profile.meetingLocation}...`}
                value={drawNotes}
                onChange={(e) => setDrawNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Participant Pool Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Daftar Peserta Undian ({eligibleMembers.length})
              </h3>
              <button
                type="button"
                onClick={handleResetAllEligibility}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Reset Semua
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Centang nama anggota yang berhak ikut kocokan putaran ini:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {arisanParticipants.map((m) => {
                const hasWon = alreadyWonMemberIds.includes(m.id);
                const isChecked = eligibleMemberIds.includes(m.id);

                return (
                  <label
                    key={m.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      hasWon
                        ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                        : isChecked
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMemberEligibility(m.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                      />
                      <span className="font-medium">{m.no}. {m.name}</span>
                    </div>

                    {hasWon ? (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                        Sudah Menang
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">{m.category}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Winners Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Riwayat Pemenang Arisan Tahun {activeYear}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daftar seluruh penerima get arisan lengkap dengan tombol dokumen .JPG ber-barcode
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 text-xs">
            {winners.length} Putaran Selesai
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Putaran</th>
                <th className="py-3 px-4">Tanggal Undian</th>
                <th className="py-3 px-4">Nama Pemenang</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Nominal Get</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center">Dokumen Berita Acara</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {winners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Belum ada riwayat pemenang arisan yang tercatat.
                  </td>
                </tr>
              ) : (
                winners.map((winner) => {
                  const winnerMember = members.find((m) => m.id === winner.memberId);
                  return (
                    <tr
                      key={winner.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                        Putaran #{winner.roundNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {formatDateIndo(winner.drawDate)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {winner.memberName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {winner.memberCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                        {formatRupiah(winner.prizeAmount)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {winner.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedWinnerForDoc(winner)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                        >
                          <FileImage className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Kwitansi & Dokumen (Kop Surat)</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onUpdateWinner && (
                            <button
                              type="button"
                              onClick={() => setEditingWinner({ ...winner })}
                              title="Ubah / Edit Riwayat Pemenang Ini"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}
                          {winnerMember && (
                            <a
                              href={generateWinnerNotificationWA(
                                winner.memberName,
                                winnerMember.phone,
                                winner.roundNumber,
                                winner.prizeAmount,
                                winner.drawDate
                              )}
                              target="_blank"
                              rel="noreferrer"
                              title="Kirim Pemberitahuan WhatsApp ke Pemenang"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteWinner(winner.id)}
                            title="Hapus Catatan Pemenang"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Winner Celebration Modal */}
      {activeWinnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8 shadow-2xl border-2 border-amber-400/50 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-emerald-400 text-white shadow-xl shadow-amber-500/30 ring-4 ring-amber-300/40">
              <Award className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Alhamdulillah! Pemenang Putaran #{activeWinnerModal.roundNumber}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white pt-2">
                {activeWinnerModal.memberName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Kategori: {activeWinnerModal.memberCategory} • {profile.name}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Total Hak Dana Arisan (Get):
              </span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatRupiah(activeWinnerModal.prizeAmount)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tanggal: {formatDateIndo(activeWinnerModal.drawDate)}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 text-xs">
              {/* Button to View & Download Official Certificate / Berita Acara with Barcode & Signatures */}
              <button
                id="btn-open-winner-certificate"
                type="button"
                onClick={() => {
                  const winnerToOpen = activeWinnerModal;
                  setActiveWinnerModal(null);
                  setSelectedWinnerForDoc(winnerToOpen);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3.5 shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer"
              >
                <FileImage className="h-4 w-4" />
                <span>Lihat Kwitansi Ber-Kop Surat & Dokumen .JPG</span>
              </button>

              {(() => {
                const wMember = members.find((m) => m.id === activeWinnerModal.memberId);
                return wMember ? (
                  <a
                    href={generateWinnerNotificationWA(
                      activeWinnerModal.memberName,
                      wMember.phone,
                      activeWinnerModal.roundNumber,
                      activeWinnerModal.prizeAmount,
                      activeWinnerModal.drawDate
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 shadow-md transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Kirim Ucapan Selamat via WhatsApp
                  </a>
                ) : null;
              })()}

              <button
                type="button"
                onClick={() => setActiveWinnerModal(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Tutup & Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lottery Winner Record Modal */}
      {editingWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Ubah Data Pemenang Arisan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kocokan Putaran #{editingWinner.roundNumber} • {editingWinner.memberName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingWinner(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Putaran Ke-
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingWinner.roundNumber}
                    onChange={(e) => setEditingWinner({ ...editingWinner, roundNumber: Number(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Kocokan / Penarikan
                  </label>
                  <input
                    type="date"
                    value={editingWinner.drawDate}
                    onChange={(e) => setEditingWinner({ ...editingWinner, drawDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Anggota Pemenang
                </label>
                <select
                  value={editingWinner.memberId}
                  onChange={(e) => {
                    const selMem = members.find((m) => m.id === e.target.value);
                    if (selMem) {
                      setEditingWinner({
                        ...editingWinner,
                        memberId: selMem.id,
                        memberName: selMem.name,
                        memberCategory: selMem.category,
                      });
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-slate-900 dark:text-white"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.category}) - #{m.no}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nominal Hadiah / Get (Rp)
                  </label>
                  <input
                    type="number"
                    step={10000}
                    value={editingWinner.prizeAmount}
                    onChange={(e) => setEditingWinner({ ...editingWinner, prizeAmount: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Label Periode / Bulan
                  </label>
                  <input
                    type="text"
                    value={editingWinner.periodLabel}
                    onChange={(e) => setEditingWinner({ ...editingWinner, periodLabel: e.target.value })}
                    placeholder="Contoh: Putaran 1 - April 2026"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Pertemuan / Tempat Penarikan
                </label>
                <input
                  type="text"
                  value={editingWinner.notes || ''}
                  onChange={(e) => setEditingWinner({ ...editingWinner, notes: e.target.value })}
                  placeholder="Contoh: Penarikan arisan di Aula KUA Kedungbanteng"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={editingWinner.disbursed || false}
                    onChange={(e) => setEditingWinner({ 
                      ...editingWinner, 
                      disbursed: e.target.checked,
                      disbursedDate: e.target.checked ? (editingWinner.disbursedDate || editingWinner.drawDate) : undefined
                    })}
                    className="rounded text-emerald-600 h-4 w-4"
                  />
                  <span>Dana Telah Disalurkan / Lunas Diterima</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingWinner(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateWinner && editingWinner) {
                    onUpdateWinner(editingWinner);
                    setEditingWinner(null);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Official Certificate & Barcode Modal */}
      {selectedWinnerForDoc && (
        <WinnerCertificateModal
          winner={selectedWinnerForDoc}
          member={members.find((m) => m.id === selectedWinnerForDoc.memberId)}
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onClose={() => setSelectedWinnerForDoc(null)}
        />
      )}
    </div>
  );
};
