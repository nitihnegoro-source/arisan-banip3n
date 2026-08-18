import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw,
  Award,
  CheckCircle2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { CashTransaction } from '../types';
import { formatRupiah, formatDateIndo, exportToCSV } from '../utils/formatters';

interface CashOutViewProps {
  transactions: CashTransaction[];
  onAddTransaction: (tx: Omit<CashTransaction, 'id' | 'type'>) => void;
  onDeleteTransaction: (id: string) => void;
  onSyncFinance?: () => Promise<any>;
}

export const CashOutView: React.FC<CashOutViewProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onSyncFinance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState('Konsumsi & Pertemuan');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formMethod, setFormMethod] = useState<'Tunai' | 'Transfer Bank' | 'E-Wallet'>('Tunai');

  const outTransactions = transactions.filter((t) => t.type === 'out');

  const filteredTransactions = outTransactions.filter((tx) => {
    const matchSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.sourceOrRecipient && tx.sourceOrRecipient.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory = categoryFilter === 'all' || tx.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  const totalOut = outTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Synchronized Lottery vs Operational stats
  const lotteryOutTxs = outTransactions.filter((t) => t.category === 'Pencairan Arisan');
  const totalLotteryOut = lotteryOutTxs.reduce((sum, t) => sum + t.amount, 0);

  const operasionalOutTxs = outTransactions.filter((t) => t.category !== 'Pencairan Arisan');
  const totalOperasionalOut = operasionalOutTxs.reduce((sum, t) => sum + t.amount, 0);

  const categories = [
    'all',
    'Pencairan Arisan',
    'Konsumsi & Pertemuan',
    'Sosial & Santunan',
    'ATK & Administrasi',
    'Operasional & Transport',
    'Lain-lain',
  ];

  const handleManualSync = async () => {
    if (!onSyncFinance) return;
    setIsSyncing(true);
    try {
      await onSyncFinance();
      setSyncFeedback('Data hasil undian arisan berhasil disinkronisasi ke Buku Kas Keluar!');
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0 || !formDescription) return;

    const receiptNo = `KK-${new Date().getFullYear()}-${(outTransactions.length + 1).toString().padStart(3, '0')}`;

    onAddTransaction({
      category: formCategory,
      amount: Number(formAmount),
      date: formDate,
      description: formDescription,
      sourceOrRecipient: formRecipient || 'Penerima',
      receiptNo,
      paymentMethod: formMethod,
    });

    setIsAddModalOpen(false);
    // Reset
    setFormAmount('');
    setFormDescription('');
    setFormRecipient('');
  };

  const handleExportCSV = () => {
    const headers = ['No Bukti', 'Tanggal', 'Kategori', 'Keterangan', 'Penerima', 'Metode', 'Nominal Keluar (Rp)'];
    const rows = outTransactions.map((tx) => [
      tx.receiptNo,
      tx.date,
      tx.category,
      tx.description,
      tx.sourceOrRecipient || '-',
      tx.paymentMethod || 'Tunai',
      tx.amount,
    ]);
    exportToCSV(`Laporan_Uang_Keluar_Bani_P3N.csv`, [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-700 via-rose-800 to-slate-900 p-6 text-white shadow-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-950/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-200 border border-amber-400/30">
              Buku Kas Keluar
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              <CheckCircle2 className="h-3 w-3 text-amber-300" />
              Tersinkron Hasil Undian
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pencatatan Uang Keluar
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl">
            Semua pengeluaran pencairan get arisan terhubung otomatis dengan <strong>Hasil Kocokan / Undian Arisan</strong>, ditambah pencatatan konsumsi, santunan duka/sakit, dan operasional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 p-3.5 sm:p-4 rounded-xl backdrop-blur-xs border border-white/20 text-right">
            <p className="text-[10px] sm:text-[11px] text-amber-200 uppercase font-semibold">
              Total Seluruh Kas Keluar
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-white">
              {formatRupiah(totalOut)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {onSyncFinance && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold px-3.5 py-2 text-xs border border-white/20 transition-all backdrop-blur-xs shadow-xs disabled:opacity-50 cursor-pointer"
                title="Sinkronkan ulang seluruh data hasil undian pemenang"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Hasil Undian'}</span>
              </button>
            )}
            <button
              id="btn-open-add-cash-out"
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Catat Kas Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">{syncFeedback}</span>
          </div>
          <button type="button" onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Breakdown Synchronized Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pencairan Arisan (Hasil Undian) */}
        <div 
          onClick={() => setCategoryFilter('Pencairan Arisan')}
          className={`rounded-2xl p-4 border transition-all cursor-pointer ${
            categoryFilter === 'Pencairan Arisan' 
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/30' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pencairan Arisan (Hasil Undian)
                </p>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  Tersinkron Pemenang Kocokan
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              {lotteryOutTxs.length} Putaran
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatRupiah(totalLotteryOut)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Penyerahan hak get arisan langsung terdata saat nama pemenang diundi
          </p>
        </div>

        {/* Pengeluaran Operasional & Sosial */}
        <div 
          onClick={() => setCategoryFilter('all')}
          className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pengeluaran Operasional & Sosial
                </p>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                  Konsumsi, Santunan, ATK
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
              {operasionalOutTxs.length} Pengeluaran
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatRupiah(totalOperasionalOut)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Pengeluaran kegiatan paguyuban, snack rapat, dan santunan anggota
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="input-search-cash-out"
              type="text"
              placeholder="Cari pengeluaran, penerima, nomor bukti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9.5 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
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

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              Cetak Laporan
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">No Bukti</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Deskripsi / Keterangan</th>
                <th className="py-3.5 px-4">Penerima</th>
                <th className="py-3.5 px-4">Status Sinkron</th>
                <th className="py-3.5 px-4 text-right">Nominal Keluar</th>
                <th className="py-3.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Tidak ada catatan pengeluaran yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isSyncTx = tx.id.startsWith('tx-sync-') || tx.category === 'Pencairan Arisan';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {tx.receiptNo}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDateIndo(tx.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          tx.category === 'Pencairan Arisan'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : tx.category === 'Sosial & Santunan'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {tx.sourceOrRecipient || '-'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSyncTx ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[9px] font-bold border border-amber-200 dark:border-amber-800">
                            <CheckCircle2 className="h-2.5 w-2.5 text-amber-500" />
                            Tersinkron Hasil Undian
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 text-[9px] font-semibold">
                            Pencatatan Manual
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap">
                        -{formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Hapus Transaksi"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Catat Pengeluaran Kas Baru
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Catat konsumsi pertemuan, santunan sosial, ATK, atau operasional
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Pengeluaran
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Konsumsi & Pertemuan">Konsumsi & Pertemuan Rutin</option>
                    <option value="Sosial & Santunan">Sosial & Santunan Duka/Sakit</option>
                    <option value="ATK & Administrasi">ATK & Keperluan Administrasi</option>
                    <option value="Operasional & Transport">Operasional & Transport</option>
                    <option value="Pencairan Arisan">Pencairan Arisan (Manual)</option>
                    <option value="Lain-lain">Pengeluaran Lain-lain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Pengeluaran
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal Pengeluaran (Rp) *
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 150000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  min={1000}
                  step={1000}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Keterangan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Snack dan konsumsi pertemuan rutin bulan Mei 2026..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Penerima / Toko
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Warung Bu Siti / Keluarga Anggota"
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Tunai">Tunai / Cash</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="E-Wallet">E-Wallet</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 text-xs shadow-md transition-colors cursor-pointer"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
