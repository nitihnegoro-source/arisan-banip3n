import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Coins, 
  Receipt, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Sparkles, 
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Cloud,
  HardDriveDownload,
  MessageSquare
} from 'lucide-react';
import { Member, MemberPaymentHistory, CashTransaction, LotteryWinner, ChatMessage } from '../types';
import { formatRupiah, formatDateIndo, MONTH_NAMES_ID } from '../utils/formatters';
import { calculatePrayerTimes, getNextPrayer, getHijriDate } from '../utils/prayerCalculator';
import { getStoredChatMessages } from '../utils/chatManager';
import { TabType } from './Sidebar';

interface DashboardViewProps {
  members: Member[];
  payments: MemberPaymentHistory[];
  cashTransactions: CashTransaction[];
  lotteryWinners: LotteryWinner[];
  onNavigate: (tab: TabType) => void;
  onOpenBackupModal?: () => void;
  activeYear: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  payments,
  cashTransactions,
  lotteryWinners,
  onNavigate,
  onOpenBackupModal,
  activeYear,
}) => {
  // Current month (defaults to current or Month 5 / Mei 2026 based on active data)
  const currentMonthNum = 5; // Mei
  const currentMonthKey = `${activeYear}-${currentMonthNum}`;
  const currentMonthName = MONTH_NAMES_ID[currentMonthNum - 1];

  // Financial calculations
  const totalCashIn = cashTransactions
    .filter((tx) => tx.type === 'in')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCashOut = cashTransactions
    .filter((tx) => tx.type === 'out')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentBalance = totalCashIn - totalCashOut;

  // Arisan collection stats
  const arisanParticipants = members.filter((m) => m.isArisanParticipant && m.status === 'Aktif');
  const totalArisanParticipants = arisanParticipants.length;
  
  let arisanPaidCountCurrentMonth = 0;
  payments.forEach((p) => {
    if (p.arisan[currentMonthKey]?.isPaid) {
      arisanPaidCountCurrentMonth++;
    }
  });

  const arisanCurrentMonthCollected = arisanPaidCountCurrentMonth * 50000;
  const arisanTargetMonthly = totalArisanParticipants * 50000;
  const arisanPercentage = totalArisanParticipants > 0 ? Math.round((arisanPaidCountCurrentMonth / totalArisanParticipants) * 100) : 0;

  // Iuran collection stats
  const iuranParticipants = members.filter((m) => m.isIuranParticipant && m.status === 'Aktif');
  const totalIuranParticipants = iuranParticipants.length;

  let iuranPaidCountCurrentMonth = 0;
  payments.forEach((p) => {
    if (p.iuran[currentMonthKey]?.isPaid) {
      iuranPaidCountCurrentMonth++;
    }
  });

  const iuranCurrentMonthCollected = iuranPaidCountCurrentMonth * 20000;
  const iuranTargetMonthly = totalIuranParticipants * 20000;
  const iuranPercentage = totalIuranParticipants > 0 ? Math.round((iuranPaidCountCurrentMonth / totalIuranParticipants) * 100) : 0;

  // Latest winner
  const latestWinner = lotteryWinners.length > 0 ? lotteryWinners[lotteryWinners.length - 1] : null;

  // Unpaid members this month
  const unpaidMembersThisMonth = members.filter((m) => {
    if (!m.isArisanParticipant && !m.isIuranParticipant) return false;
    const memberPayment = payments.find((p) => p.memberId === m.id);
    const arisanUnpaid = m.isArisanParticipant && !memberPayment?.arisan[currentMonthKey]?.isPaid;
    const iuranUnpaid = m.isIuranParticipant && !memberPayment?.iuran[currentMonthKey]?.isPaid;
    return arisanUnpaid || iuranUnpaid;
  });

  // Chat messages stats
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getStoredChatMessages());

  useEffect(() => {
    const handleUpdate = () => {
      setChatMessages(getStoredChatMessages());
    };
    window.addEventListener('paguyuban_chat_updated', handleUpdate);
    return () => window.removeEventListener('paguyuban_chat_updated', handleUpdate);
  }, []);

  const unreadMessages = chatMessages.filter((m) => m.status === 'Baru');
  const latestMessage = chatMessages.length > 0 ? chatMessages[0] : null;

  return (
    <div className="space-y-6">
      {/* Banner Ringkasan Selamat Datang */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              Sistem Keuangan & Undian Terpadu
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Arisan & Iuran Paguyuban Bani P3N
            </h2>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Kantor Urusan Agama (KUA) Kecamatan Kedungbanteng, Kab. Banyumas Tahun {activeYear}. Transparan, akuntabel, dan silaturahmi berkah.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              id="btn-quick-lottery"
              type="button"
              onClick={() => onNavigate('lottery')}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 text-sm transition-all shadow-md hover:shadow-amber-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Kocokan Arisan
            </button>
            <button
              id="btn-quick-arisan"
              type="button"
              onClick={() => onNavigate('arisan')}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 text-sm border border-white/20 transition-all backdrop-blur-xs"
            >
              <Coins className="h-4 w-4" />
              Setoran Arisan
            </button>
            <button
              id="btn-quick-prayer"
              type="button"
              onClick={() => onNavigate('prayer_times')}
              className="flex items-center gap-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 text-sm border border-emerald-400/30 transition-all shadow-xs"
            >
              <Clock className="h-4 w-4 text-emerald-300" />
              Jadwal Sholat & Adzan
            </button>
            {onOpenBackupModal && (
              <button
                id="btn-quick-backup"
                type="button"
                onClick={onOpenBackupModal}
                className="flex items-center gap-2 rounded-xl bg-teal-600/90 hover:bg-teal-500 text-white font-semibold px-4 py-2.5 text-sm border border-teal-300/30 transition-all shadow-xs cursor-pointer"
              >
                <Cloud className="h-4 w-4 text-teal-200" />
                Backup Google Drive
              </button>
            )}
          </div>
        </div>

        {/* Decorative ambient element */}
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Quick Prayer Times Strip Widget */}
      {(() => {
        const today = new Date();
        const pt = calculatePrayerTimes(today, -7.3686, 109.2135, undefined, 'KEMENAG');
        const next = getNextPrayer(pt);
        return (
          <div 
            onClick={() => onNavigate('prayer_times')}
            className="cursor-pointer rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Jadwal Sholat Hari Ini (KUA Kedungbanteng)
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-sm font-semibold">
                    {pt.hijriDate || getHijriDate(today)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Berikutnya: <strong className="text-emerald-600 dark:text-emerald-400">{next.nextName} ({next.nextTime})</strong> — {next.formattedRemaining} lagi
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[11px] mr-1">Subuh:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pt.subuh}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[11px] mr-1">Dzuhur:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pt.dzuhur}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[11px] mr-1">Ashar:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pt.ashar}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[11px] mr-1">Maghrib:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pt.maghrib}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[11px] mr-1">Isya:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pt.isya}</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-0.5 ml-1">
                Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        );
      })()}

      {/* Quick Messages & Inquiries Notification Strip */}
      <div 
        onClick={() => onNavigate('messages')}
        className="cursor-pointer rounded-2xl bg-gradient-to-r from-teal-900/90 via-slate-900 to-emerald-950 p-4 text-white border border-teal-500/30 shadow-md hover:border-teal-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 shadow-xs">
            <MessageSquare className="h-5 w-5" />
            {unreadMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white animate-pulse">
                {unreadMessages.length}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-white">
                Pusat Layanan Pesan & Pengajuan Anggota
              </h4>
              {unreadMessages.length > 0 ? (
                <span className="rounded-full bg-rose-500/30 border border-rose-400/40 px-2 py-0.5 text-[10px] font-bold text-rose-200">
                  {unreadMessages.length} Pesan Baru Perlu Direspon
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/30 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                  Semua Ditanggapi
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
              {latestMessage ? (
                <span>
                  Pesan terakhir dari <strong>{latestMessage.memberName}</strong>: "{latestMessage.topic || latestMessage.category}" ({latestMessage.timestamp})
                </span>
              ) : (
                'Pantau pertanyaan, konfirmasi setoran transfer, dan pengajuan anggota.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-sm transition-all cursor-pointer"
          >
            <span>Buka Inbox Chat</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Financial Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Kas Utama */}
        <div
          id="stat-card-balance"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Saldo Kas Bersih
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Wallet className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatRupiah(currentBalance)}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Kas Aktif Paguyuban
            </p>
          </div>
        </div>

        {/* Total Uang Masuk */}
        <div
          id="stat-card-cash-in"
          onClick={() => onNavigate('cash_in')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Uang Masuk
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <ArrowDownLeft className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatRupiah(totalCashIn)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Iuran, Arisan & Infaq Masuk
            </p>
          </div>
        </div>

        {/* Total Uang Keluar */}
        <div
          id="stat-card-cash-out"
          onClick={() => onNavigate('cash_out')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all hover:border-amber-300 dark:hover:border-amber-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Uang Keluar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatRupiah(totalCashOut)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Pencairan Arisan & Konsumsi
            </p>
          </div>
        </div>

        {/* Total Anggota */}
        <div
          id="stat-card-members"
          onClick={() => onNavigate('members')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all hover:border-blue-300 dark:hover:border-blue-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Anggota Terdaftar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {members.length} Orang
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              P3N, PAI & Staf KUA
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bulan Berjalan: Setoran Arisan & Iuran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Setoran Arisan Bulan Ini */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 font-bold">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Setoran Arisan ({currentMonthName} {activeYear})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tarif Rp 50.000 / peserta
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('arisan')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Lihat Matriks <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Terkumpul Bulan Ini:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatRupiah(arisanCurrentMonthCollected)} / {formatRupiah(arisanTargetMonthly)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${arisanPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {arisanPaidCountCurrentMonth} Sudah Bayar
              </span>
              <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                {totalArisanParticipants - arisanPaidCountCurrentMonth} Belum Bayar
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {arisanPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Card Setoran Iuran Bulan Ini */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Setoran Iuran Kas ({currentMonthName} {activeYear})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tarif Rp 20.000 / anggota
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('iuran')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Lihat Matriks <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Terkumpul Bulan Ini:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatRupiah(iuranCurrentMonthCollected)} / {formatRupiah(iuranTargetMonthly)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${iuranPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {iuranPaidCountCurrentMonth} Sudah Bayar
              </span>
              <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                {Math.max(0, totalIuranParticipants - iuranPaidCountCurrentMonth)} Belum Bayar
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {iuranPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Pemenang Arisan Terakhir & Ringkasan Perlu Ditagih */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pemenang Terkini */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-amber-500" />
              Pemenang Arisan Terakhir
            </h4>
            <span className="rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[11px] font-bold">
              {latestWinner ? `Putaran ${latestWinner.roundNumber}` : 'Belum Ada'}
            </span>
          </div>

          {latestWinner ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent p-4 border border-amber-500/20">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Nama Pemenang:
                </p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {latestWinner.memberName}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 border-t border-amber-500/20 pt-2.5">
                  <span>Nominal Get:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(latestWinner.prizeAmount)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Tanggal Undian:</span>
                  <span>{formatDateIndo(latestWinner.drawDate)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Total Putaran Selesai:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {lotteryWinners.length} dari {members.length} Putaran
                </span>
              </div>

              <button
                id="btn-goto-lottery-page"
                type="button"
                onClick={() => onNavigate('lottery')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold py-2.5 text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Buka Halaman Kocokan
              </button>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              Belum ada putaran arisan yang dikocok.
            </div>
          )}
        </div>

        {/* Transaksi Terbaru */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
              Catatan Kas Terbaru
            </h4>
            <button
              type="button"
              onClick={() => onNavigate('cash_in')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Semua Transaksi <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
            {cashTransactions.slice(-5).reverse().map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      tx.type === 'in'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {tx.type === 'in' ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatDateIndo(tx.date)}</span>
                      <span>•</span>
                      <span className="font-medium">{tx.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-bold ${
                      tx.type === 'in'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {tx.type === 'in' ? '+' : '-'} {formatRupiah(tx.amount)}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {tx.receiptNo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unpaid Alert List */}
      {unpaidMembersThisMonth.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-5">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm mb-3">
            <AlertCircle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            <span>
              Perhatian: {unpaidMembersThisMonth.length} Anggota Belum Menyelesaikan Setoran Bulan Ini ({currentMonthName} {activeYear})
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {unpaidMembersThisMonth.slice(0, 10).map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {m.name}
              </span>
            ))}
            {unpaidMembersThisMonth.length > 10 && (
              <span className="inline-flex items-center rounded-lg bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                +{unpaidMembersThisMonth.length - 10} lainnya
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
