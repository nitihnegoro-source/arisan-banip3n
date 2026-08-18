import React, { useState } from 'react';
import { 
  User, 
  Coins, 
  Receipt, 
  Award, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Phone, 
  MapPin, 
  FileText, 
  Printer, 
  QrCode, 
  Sparkles, 
  ArrowUpRight, 
  Building2, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Wallet,
  Check,
  Download,
  MessageSquare,
  Send,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { Member, MemberPaymentHistory, LotteryWinner, PaguyubanProfile, CashTransaction, AuthUser } from '../types';
import { formatRupiah, formatDateIndo, getMonthName } from '../utils/formatters';
import { MemberCardModal } from './MemberCardModal';
import { MemberChatAdminModal } from './MemberChatAdminModal';

interface UserDashboardViewProps {
  currentUser: AuthUser;
  members: Member[];
  payments: MemberPaymentHistory[];
  lotteryWinners: LotteryWinner[];
  cashTransactions: CashTransaction[];
  profile: PaguyubanProfile;
  activeYear: number;
  onOpenReceipt: (member: Member, month: number, type: 'arisan' | 'iuran') => void;
  onOpenWinnerCertificate?: (winner: LotteryWinner) => void;
  onUpdateMember?: (updated: Member) => void;
  onLogout: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  currentUser,
  members,
  payments,
  lotteryWinners,
  cashTransactions,
  profile,
  activeYear,
  onOpenReceipt,
  onOpenWinnerCertificate,
  onUpdateMember,
  onLogout,
}) => {
  const [showMemberCardModal, setShowMemberCardModal] = useState(false);
  const [showChatAdminModal, setShowChatAdminModal] = useState(false);

  // Find member details
  const currentMember = members.find((m) => m.id === currentUser.memberId) || members[0] || {
    id: 'm-default',
    no: 1,
    name: currentUser.name || 'Anggota Paguyuban',
    category: 'P3N',
    phone: currentUser.phoneNumber || '0812-3456-7890',
    address: 'Kec. Kedungbanteng, Kab. Tegal',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-04-01',
  };

  // Find member payment record
  const memberPayment = payments.find((p) => p.memberId === currentMember.id) || {
    memberId: currentMember.id,
    arisan: {},
    iuran: {},
  };

  // Find if member won lottery
  const memberWinnerRecord = lotteryWinners.find((w) => w.memberId === currentMember.id);

  // Calculate Arisan status (12 months: April - Maret)
  const monthSequence = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  
  let paidArisanCount = 0;
  let totalArisanPaid = 0;
  let paidIuranCount = 0;
  let totalIuranPaid = 0;

  monthSequence.forEach((m) => {
    const yr = m >= 4 ? activeYear : activeYear + 1;
    const key = `${activeYear}-${m}`;
    const arisanRec = memberPayment.arisan[key];
    const iuranRec = memberPayment.iuran[key];

    if (arisanRec?.isPaid) {
      paidArisanCount++;
      totalArisanPaid += (arisanRec.amount || 50000);
    }
    if (iuranRec?.isPaid) {
      paidIuranCount++;
      totalIuranPaid += (iuranRec.amount || 20000);
    }
  });

  const totalArisanTarget = 12 * 50000;
  const totalIuranTarget = 12 * 20000;

  // Global transparency calculation
  const totalKasMasuk = cashTransactions.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalKasKeluar = cashTransactions.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const saldoKasBersih = totalKasMasuk - totalKasKeluar;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Read-Only Notice & Chat Banner */}
      <div className="rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">
              Mode Akses Anggota (Read-Only & Layanan Chat Admin)
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Anda dapat membaca status setoran pribadi, mencetak kuitansi & KTA, serta mengajukan pesan chat ke Pengurus/Admin.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowChatAdminModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Ajukan Chat ke Admin</span>
        </button>
      </div>

      {/* Welcome Banner Card */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-teal-950/60 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-teal-200 border border-teal-500/30">
                Portal Anggota Resmi
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
                <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                Status Anggota: {currentMember.status}
              </span>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-200 border border-amber-400/30">
                Kategori: {currentMember.category}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Assalamu'alaikum, {currentMember.name}
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl">
                Nomor Urut Undian: <strong>#{currentMember.no.toString().padStart(2, '0')}</strong> &bull; Telepon/WA: <strong>{currentMember.phone || '-'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowChatAdminModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-3 text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat Pengurus</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMemberCardModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-3 text-xs sm:text-sm border border-white/20 transition-all backdrop-blur-xs shadow-md active:scale-95 cursor-pointer"
            >
              <QrCode className="h-4 w-4 text-emerald-300" />
              <span>Kartu Digital Anggota</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 text-xs sm:text-sm border border-white/15 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>


      {/* Status Hak Arisan Banner */}
      {memberWinnerRecord ? (
        <div className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  🎉 Selamat! Anda Pemenang Arisan
                </span>
                <span className="rounded-full bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:text-amber-200">
                  Putaran ke-{memberWinnerRecord.roundNumber}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Hak Dana Arisan: {formatRupiah(memberWinnerRecord.prizeAmount)}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Diundi pada tanggal: {formatDateIndo(memberWinnerRecord.drawDate)} &bull; Status:{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {memberWinnerRecord.disbursed ? 'Sudah Dicairkan' : 'Proses Pencairan'}
                </span>
              </p>
            </div>
          </div>

          {onOpenWinnerCertificate && (
            <button
              type="button"
              onClick={() => onOpenWinnerCertificate(memberWinnerRecord)}
              className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 text-xs shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <FileText className="h-4 w-4" />
              <span>Lihat Berita Acara & Sertifikat</span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Status Hak Undian Arisan: <span className="text-emerald-600 dark:text-emerald-400">Aktif & Berpeluang</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nama Anda terdaftar dalam {members.length} peserta kocokan arisan putaran tahun 2026/2027.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            Putaran Berikutnya
          </span>
        </div>
      )}

      {/* Progress Cards: Arisan & Iuran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Setoran Arisan Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Setoran Arisan Pribadi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kewajiban Rp 50.000 / bulan (12 Putaran)
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                {paidArisanCount} / 12 Bulan Lunas
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Total Disetor: {formatRupiah(totalArisanPaid)}</span>
              <span>Target: {formatRupiah(totalArisanTarget)}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${(paidArisanCount / 12) * 100}%` }}
              />
            </div>
          </div>

          {/* 12 Months Grid */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Rincian Bulan Setoran Arisan (Klik untuk Kuitansi):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {monthSequence.map((m) => {
                const key = `${activeYear}-${m}`;
                const rec = memberPayment.arisan[key];
                const isPaid = !!rec?.isPaid;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onOpenReceipt(currentMember, m, 'arisan')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isPaid
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100/70'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {getMonthName(m)}
                      </span>
                      {isPaid ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                      ) : (
                        <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                          Belum
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {isPaid ? rec?.receiptNo || 'Lunas' : 'Rp 50.000'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Setoran Iuran Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Setoran Iuran Kas Pribadi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Iuran Kas Rp 20.000 / bulan
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                {paidIuranCount} / 12 Bulan Lunas
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Total Disetor: {formatRupiah(totalIuranPaid)}</span>
              <span>Target: {formatRupiah(totalIuranTarget)}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${(paidIuranCount / 12) * 100}%` }}
              />
            </div>
          </div>

          {/* 12 Months Grid */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Rincian Bulan Setoran Iuran (Klik untuk Kuitansi):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {monthSequence.map((m) => {
                const key = `${activeYear}-${m}`;
                const rec = memberPayment.iuran[key];
                const isPaid = !!rec?.isPaid;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onOpenReceipt(currentMember, m, 'iuran')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isPaid
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700/60 hover:bg-teal-100/70'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {getMonthName(m)}
                      </span>
                      {isPaid ? (
                        <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 stroke-[3]" />
                      ) : (
                        <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                          Belum
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {isPaid ? rec?.receiptNo || 'Lunas' : 'Rp 20.000'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Transparency & Contact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kas Paguyuban Transparency Card */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Transparansi Keuangan Paguyuban
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Laporan live kas bersama Bani P3N KUA Kedungbanteng
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              Terverifikasi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                Total Kas Masuk
              </p>
              <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                {formatRupiah(totalKasMasuk)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Setoran arisan, iuran & donasi
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
              <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                Total Kas Keluar
              </p>
              <p className="text-base font-extrabold text-rose-700 dark:text-rose-400 mt-1">
                {formatRupiah(totalKasKeluar)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Pencairan get & operasional
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40">
              <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300">
                Sisa Saldo Kas Aktif
              </p>
              <p className="text-base font-extrabold text-teal-700 dark:text-teal-400 mt-1">
                {formatRupiah(saldoKasBersih)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Saldo kas berjalan aman
              </p>
            </div>
          </div>
        </div>

        {/* Contact Pengurus Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Kontak Pengurus KUA
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Bantuan & konfirmasi setoran
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Ketua Paguyuban</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{profile.contact?.chairmanName || 'H. Lubab Habib, S.Ag'}</p>
                <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">{profile.contact?.chairmanPhone || '0812-3456-7010'}</p>
              </div>
              <a
                href={`https://wa.me/${(profile.contact?.chairmanPhone || '0812-3456-7010').replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Assalamu'alaikum Pak Ketua (${profile.contact?.chairmanName || 'H. Lubab Habib, S.Ag'}), saya ${currentMember.name} (No. #${currentMember.no.toString().padStart(2, '0')}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                title="Chat WA Ketua"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-[11px]">Chat</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Bendahara</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{profile.contact?.treasurerName || 'Darsito'}</p>
                <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">{profile.contact?.treasurerPhone || '0812-3456-7001'}</p>
              </div>
              <a
                href={`https://wa.me/${(profile.contact?.treasurerPhone || '0812-3456-7001').replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Assalamu'alaikum Bendahara (${profile.contact?.treasurerName || 'Darsito'}), saya ${currentMember.name} (No. #${currentMember.no.toString().padStart(2, '0')}) ingin konfirmasi pembayaran setoran.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                title="Chat WA Bendahara"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-[11px]">Chat</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowChatAdminModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer mt-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Buka Formulir Pengajuan Pesan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Digital Membership Card Modal (KTA Modern 2-Sisi: Depan & Belakang Pakta Integritas) */}
      {showMemberCardModal && (
        <MemberCardModal
          member={currentMember}
          profile={profile}
          onClose={() => setShowMemberCardModal(false)}
          onUpdateMember={onUpdateMember}
        />
      )}

      {/* Layanan Chat Admin Modal */}
      {showChatAdminModal && (
        <MemberChatAdminModal
          member={currentMember}
          profile={profile}
          onClose={() => setShowChatAdminModal(false)}
        />
      )}

      {/* Footer Branding */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Paguyuban Bani P3N Kedungbanteng @2026</p>
        <p className="text-[11px]">Kresno Gadhing Pramudhyo | Hak Cipta &bull; Portal Akses Anggota</p>
      </div>

    </div>
  );
};
