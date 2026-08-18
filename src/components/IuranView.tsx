import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Check, 
  X, 
  MessageCircle, 
  AlertCircle
} from 'lucide-react';
import { Member, MemberPaymentHistory } from '../types';
import { 
  formatRupiah, 
  MONTH_SHORT_ID, 
  MONTH_NAMES_ID, 
  exportToCSV, 
  generateWhatsAppPaymentReminder 
} from '../utils/formatters';

interface IuranViewProps {
  members: Member[];
  payments: MemberPaymentHistory[];
  onTogglePayment: (memberId: string, month: number, type: 'iuran') => void;
  onOpenReceipt: (member: Member, month: number, type: 'iuran') => void;
  activeYear: number;
}

export const IuranView: React.FC<IuranViewProps> = ({
  members,
  payments,
  onTogglePayment,
  onOpenReceipt,
  activeYear,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number>(5); // default month 5 (Mei)
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const iuranMembers = members.filter((m) => m.isIuranParticipant);
  const ratePerMonth = 20000;

  // Filter members
  const filteredMembers = iuranMembers.filter((member) => {
    const matchSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.no.toString().includes(searchTerm) ||
      (member.notes && member.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory = selectedCategory === 'all' || member.category === selectedCategory;

    const paymentData = payments.find((p) => p.memberId === member.id);
    const isPaidInSelectedMonth = !!paymentData?.iuran[`${activeYear}-${selectedMonthFilter}`]?.isPaid;

    let matchStatus = true;
    if (statusFilter === 'paid') matchStatus = isPaidInSelectedMonth;
    if (statusFilter === 'unpaid') matchStatus = !isPaidInSelectedMonth;

    return matchSearch && matchCategory && matchStatus;
  });

  // Calculate monthly stats
  const getMonthlyStats = (month: number) => {
    let paidCount = 0;
    payments.forEach((p) => {
      if (p.iuran[`${activeYear}-${month}`]?.isPaid) {
        paidCount++;
      }
    });
    const totalCollected = paidCount * ratePerMonth;
    const targetTotal = iuranMembers.length * ratePerMonth;
    return { paidCount, totalCollected, targetTotal };
  };

  const currentMonthStats = getMonthlyStats(selectedMonthFilter);

  // Total collected all months in the year
  let totalYearCollected = 0;
  for (let m = 1; m <= 12; m++) {
    totalYearCollected += getMonthlyStats(m).totalCollected;
  }

  // Export handler
  const handleExportCSV = () => {
    const headers = ['No', 'Nama Anggota', 'Kategori', 'No HP', 'Status', ...MONTH_SHORT_ID.map((m) => `Bln ${m}`)];
    const rows = iuranMembers.map((member) => {
      const p = payments.find((item) => item.memberId === member.id);
      const monthCols = Array.from({ length: 12 }, (_, i) => {
        const isPaid = p?.iuran[`${activeYear}-${i + 1}`]?.isPaid;
        return isPaid ? 'LUNAS' : '-';
      });
      return [
        member.no,
        member.name,
        member.category,
        member.phone,
        member.status,
        ...monthCols,
      ];
    });

    exportToCSV(`Setoran_Iuran_Kas_Bani_P3N_${activeYear}.csv`, [headers, ...rows]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-700 via-teal-800 to-slate-900 p-6 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-950/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-200 border border-blue-400/30">
              Tarif: Rp 20.000 / Bulan
            </span>
            <span className="text-xs text-blue-100 font-medium">
              Kas Wajib Tahun {activeYear}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Matriks Setoran Iuran Kas Bani P3N
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90">
            Daftar checklist 12 bulan iuran kas operasional, konsumsi pertemuan & santunan sosial.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs border border-white/20">
          <div>
            <p className="text-[11px] text-blue-200 uppercase font-semibold">
              Bulan {MONTH_NAMES_ID[selectedMonthFilter - 1]}
            </p>
            <p className="text-lg font-extrabold text-white">
              {formatRupiah(currentMonthStats.totalCollected)}
            </p>
          </div>
          <div className="h-8 w-px bg-white/20 hidden sm:block" />
          <div>
            <p className="text-[11px] text-blue-200 uppercase font-semibold">
              Total Realisasi {activeYear}
            </p>
            <p className="text-lg font-extrabold text-teal-300">
              {formatRupiah(totalYearCollected)}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="input-search-iuran"
              type="text"
              placeholder="Cari nama anggota atau nomor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9.5 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Export & Print */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-export-iuran-csv"
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              id="btn-print-iuran"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              Cetak Rekap
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Kategori:
            </span>
            {['all', 'P3N', 'PAI', 'Staf', 'Umum'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>

          {/* Month & Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Filter Bulan:
            </span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(Number(e.target.value))}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              {MONTH_NAMES_ID.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  Bulan {i + 1} ({name})
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="paid">Sudah Lunas</option>
              <option value="unpaid">Belum Bayar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Responsive Table Matrix */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-12 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">
                  No
                </th>
                <th className="py-3.5 px-4 min-w-[200px] sticky left-12 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">
                  Nama Anggota
                </th>
                {Array.from({ length: 12 }, (_, i) => {
                  const mNum = i + 1;
                  const isSelected = selectedMonthFilter === mNum;
                  return (
                    <th
                      key={mNum}
                      className={`py-3.5 px-2 text-center min-w-[54px] ${
                        isSelected
                          ? 'bg-blue-100/70 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 border-x border-blue-300 dark:border-blue-800 font-extrabold'
                          : ''
                      }`}
                    >
                      <span>{mNum}</span>
                      <span className="block text-[9px] font-normal text-slate-500 dark:text-slate-400">
                        {MONTH_SHORT_ID[i]}
                      </span>
                    </th>
                  );
                })}
                <th className="py-3.5 px-3 text-center min-w-[90px] border-l border-slate-200 dark:border-slate-800">
                  Total Lunas
                </th>
                <th className="py-3.5 px-3 text-center min-w-[100px]">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Tidak ada data anggota iuran yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const paymentData = payments.find((p) => p.memberId === member.id);
                  let paidMonthsCount = 0;
                  for (let i = 1; i <= 12; i++) {
                    if (paymentData?.iuran[`${activeYear}-${i}`]?.isPaid) {
                      paidMonthsCount++;
                    }
                  }

                  const isCurrentFilterPaid = !!paymentData?.iuran[`${activeYear}-${selectedMonthFilter}`]?.isPaid;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3 px-3 text-center font-bold text-slate-500 dark:text-slate-400 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/40">
                        {member.no}
                      </td>

                      {/* Name & Badge */}
                      <td className="py-3 px-4 sticky left-12 bg-white dark:bg-slate-900 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/40 border-r border-slate-200 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          <span
                            className={`rounded-sm px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                              member.category === 'P3N'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : member.category === 'PAI'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : member.category === 'Staf'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {member.category}
                          </span>
                        </div>
                        {member.notes && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                            {member.notes}
                          </span>
                        )}
                      </td>

                      {/* 12 Months Checkboxes */}
                      {Array.from({ length: 12 }, (_, i) => {
                        const mNum = i + 1;
                        const key = `${activeYear}-${mNum}`;
                        const isPaid = !!paymentData?.iuran[key]?.isPaid;
                        const isSelected = selectedMonthFilter === mNum;

                        return (
                          <td
                            key={mNum}
                            className={`py-2 px-1.5 text-center ${
                              isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                            }`}
                          >
                            <button
                              id={`btn-iuran-toggle-${member.no}-${mNum}`}
                              type="button"
                              onClick={() => onTogglePayment(member.id, mNum, 'iuran')}
                              title={`${member.name} - Bln ${mNum}: ${isPaid ? 'Sudah Lunas (Klik untuk batal)' : 'Belum Bayar (Klik untuk lunas)'}`}
                              className={`h-7 w-7 rounded-lg inline-flex items-center justify-center font-bold transition-all duration-150 transform active:scale-90 ${
                                isPaid
                                  ? 'bg-teal-500 text-white shadow-xs hover:bg-teal-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-400'
                              }`}
                            >
                              {isPaid ? <Check className="h-4 w-4 stroke-[3]" /> : <span className="text-[10px]">•</span>}
                            </button>
                          </td>
                        );
                      })}

                      {/* Total Lunas */}
                      <td className="py-3 px-3 text-center font-bold border-l border-slate-200 dark:border-slate-800">
                        <span className="text-slate-800 dark:text-slate-200">
                          {paidMonthsCount} / 12
                        </span>
                        <span className="block text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                          {formatRupiah(paidMonthsCount * ratePerMonth)}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Receipt */}
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(member, selectedMonthFilter, 'iuran')}
                            title="Lihat Kuitansi Pembayaran"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>

                          {/* WhatsApp Reminder if unpaid */}
                          {!isCurrentFilterPaid && (
                            <a
                              href={generateWhatsAppPaymentReminder(
                                member.name,
                                member.phone,
                                'iuran',
                                ratePerMonth,
                                `${MONTH_NAMES_ID[selectedMonthFilter - 1]} ${activeYear}`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              title="Kirim Pengingat WhatsApp"
                              className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer with Summaries */}
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
                <td colSpan={2} className="py-3 px-4 text-right">
                  TOTAL TERKUMPUL PER BULAN:
                </td>
                {Array.from({ length: 12 }, (_, i) => {
                  const mNum = i + 1;
                  const stats = getMonthlyStats(mNum);
                  return (
                    <td key={mNum} className="py-3 px-1 text-center text-[10px]">
                      <span className="block text-teal-700 dark:text-teal-300 font-extrabold">
                        {stats.paidCount} Org
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">
                        {formatRupiah(stats.totalCollected).replace(',00', '').replace('Rp', '')}
                      </span>
                    </td>
                  );
                })}
                <td className="py-3 px-3 text-center text-xs font-extrabold text-teal-700 dark:text-teal-300 border-l border-slate-200 dark:border-slate-800">
                  {formatRupiah(totalYearCollected)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
