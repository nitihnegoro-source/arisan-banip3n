import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  MessageCircle, 
  Check, 
  X, 
  Phone, 
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  QrCode
} from 'lucide-react';
import { Member, MemberCategory, PaguyubanProfile } from '../types';
import { exportToCSV } from '../utils/formatters';
import { MemberCardModal } from './MemberCardModal';

interface MembersViewProps {
  members: Member[];
  profile?: PaguyubanProfile;
  onAddMember: (member: Omit<Member, 'id' | 'no'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onBulkImportMembers: (importedMembers: Omit<Member, 'id' | 'no'>[]) => void;
  onResetDefaultMembers?: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  profile,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onBulkImportMembers,
  onResetDefaultMembers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktif' | 'Nonaktif'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [cardMember, setCardMember] = useState<Member | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MemberCategory>('P3N');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('Kedungbanteng, Banyumas');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formIsArisan, setFormIsArisan] = useState(true);
  const [formIsIuran, setFormIsIuran] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  const filteredMembers = members.filter((member) => {
    const matchSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.no.toString().includes(searchTerm) ||
      (member.phone && member.phone.includes(searchTerm)) ||
      (member.notes && member.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory = selectedCategory === 'all' || member.category === selectedCategory;
    const matchStatus = statusFilter === 'all' || member.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const openAddModal = () => {
    setEditingMember(null);
    setFormName('');
    setFormCategory('P3N');
    setFormPhone('');
    setFormAddress('Kedungbanteng, Banyumas');
    setFormStatus('Aktif');
    setFormIsArisan(true);
    setFormIsIuran(true);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (m: Member) => {
    setEditingMember(m);
    setFormName(m.name);
    setFormCategory(m.category);
    setFormPhone(m.phone || '');
    setFormAddress(m.address || '');
    setFormStatus(m.status);
    setFormIsArisan(m.isArisanParticipant);
    setFormIsIuran(m.isIuranParticipant);
    setFormNotes(m.notes || '');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        name: formName.trim(),
        category: formCategory,
        phone: formPhone.trim(),
        address: formAddress.trim(),
        status: formStatus,
        isArisanParticipant: formIsArisan,
        isIuranParticipant: formIsIuran,
        notes: formNotes.trim(),
      });
    } else {
      onAddMember({
        name: formName.trim(),
        category: formCategory,
        phone: formPhone.trim() || `081234567${(members.length + 1).toString().padStart(3, '0')}`,
        address: formAddress.trim() || 'Kedungbanteng, Banyumas',
        status: formStatus,
        isArisanParticipant: formIsArisan,
        isIuranParticipant: formIsIuran,
        joinDate: new Date().toISOString().split('T')[0],
        notes: formNotes.trim(),
      });
    }

    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Nama Lengkap', 'Kategori', 'No WhatsApp', 'Alamat', 'Status', 'Ikut Arisan', 'Ikut Iuran', 'Keterangan'];
    const rows = members.map((m) => [
      m.no,
      m.name,
      m.category,
      m.phone,
      m.address || '-',
      m.status,
      m.isArisanParticipant ? 'Ya (Rp 50.000)' : 'Tidak',
      m.isIuranParticipant ? 'Ya (Rp 20.000)' : 'Tidak',
      m.notes || '-',
    ]);

    exportToCSV(`Data_Anggota_Bani_P3N.csv`, [headers, ...rows]);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) return;

        const newMembers: Omit<Member, 'id' | 'no'>[] = [];
        // Skip header if first line looks like header
        const startIndex = lines[0].toLowerCase().includes('nama') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 1 && cols[0]) {
            const name = cols[1] || cols[0];
            const cat = (cols[2] as MemberCategory) || 'P3N';
            newMembers.push({
              name,
              category: ['P3N', 'PAI', 'Staf', 'Umum'].includes(cat) ? cat : 'Umum',
              phone: cols[3] || '081234567890',
              address: cols[4] || 'Kedungbanteng, Banyumas',
              status: 'Aktif',
              isArisanParticipant: true,
              isIuranParticipant: true,
              joinDate: new Date().toISOString().split('T')[0],
              notes: cols[5] || 'Diimpor dari file',
            });
          }
        }

        if (newMembers.length > 0) {
          onBulkImportMembers(newMembers);
          alert(`Berhasil mengimpor ${newMembers.length} data anggota baru!`);
        }
      } catch (err) {
        alert('Gagal membaca file CSV. Pastikan format kolom sesuai.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-emerald-950 p-6 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-900/60 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
              Database Anggota
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Data Anggota Bani P3N
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Daftar 32 anggota terdaftar (P3N, PAI, Staf KUA & Umum) beserta status kepesertaan arisan dan iuran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onResetDefaultMembers && (
            <button
              id="btn-sync-official-members"
              type="button"
              onClick={() => {
                if (window.confirm('Sinkronkan seluruh data anggota kembali ke 32 data resmi dokumen lampiran (No, Nama, No. HP, dan Desa)?')) {
                  onResetDefaultMembers();
                }
              }}
              title="Perbarui & Sinkronkan 32 Data Anggota Resmi dari Lampiran"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 px-3.5 py-2 text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sinkronkan Data Lampiran</span>
            </button>
          )}

          <label className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold backdrop-blur-xs transition-colors">
            <Upload className="h-3.5 w-3.5 text-emerald-300" />
            <span>Import CSV</span>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-amber-300" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-add-member"
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 text-xs shadow-md transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="input-search-members"
              type="text"
              placeholder="Cari nama, no, no HP, atau catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9.5 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
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

          {/* Category Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Member Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Kategori / Unit</th>
                <th className="py-3.5 px-4">Kontak WhatsApp</th>
                <th className="py-3.5 px-4">Domisili / Wilayah</th>
                <th className="py-3.5 px-3 text-center">Ikut Arisan</th>
                <th className="py-3.5 px-3 text-center">Ikut Iuran</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Tidak ada data anggota yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-center font-bold text-slate-500 dark:text-slate-400">
                      {m.no}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {m.name}
                      </p>
                      {m.notes && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {m.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          m.category === 'P3N'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : m.category === 'PAI'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : m.category === 'Staf'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {m.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>{m.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {m.address || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {m.isArisanParticipant ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          Rp 50k
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {m.isIuranParticipant ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          Rp 20k
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          m.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Cetak / Lihat KTA */}
                        <button
                          type="button"
                          onClick={() => setCardMember(m)}
                          title="Lihat & Cetak Kartu Anggota (KTA)"
                          className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/60 dark:text-teal-400 transition-colors cursor-pointer"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>

                        {/* WA link */}
                        <a
                          href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Hubungi via WhatsApp"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditModal(m)}
                          title="Edit Data Anggota"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus ${m.name} dari daftar anggota?`)) {
                              onDeleteMember(m.id);
                            }
                          }}
                          title="Hapus Anggota"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingMember ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. Slamet Masruri"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori / Peran
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MemberCategory)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="P3N">P3N (Pembantu Pencatat Nikah)</option>
                    <option value="PAI">PAI (Penyuluh Agama Islam)</option>
                    <option value="Staf">Staf Kantor KUA</option>
                    <option value="Umum">Umum / Tokoh Masyarakat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Wilayah / Desa
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Karangsalam, Kedungbanteng"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Keanggotaan
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Participation Checkboxes */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Kepesertaan Keuangan:
                </p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formIsArisan}
                      onChange={(e) => setFormIsArisan(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>Ikut Arisan (Rp 50.000/bln)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formIsIuran}
                      onChange={(e) => setFormIsIuran(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Ikut Iuran Kas (Rp 20.000/bln)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: P3N Desa Beji..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
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
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 text-xs shadow-md transition-colors"
                >
                  {editingMember ? 'Simpan Perubahan' : 'Tambah Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Digital KTA Card Modal */}
      {cardMember && (
        <MemberCardModal
          member={cardMember}
          profile={profile || {
            name: 'Paguyuban Bani P3N',
            shortName: 'Bani P3N',
            subtitle: 'Keluarga Besar KUA Kec. Kedungbanteng',
            description: '',
            location: 'Kec. Kedungbanteng, Kab. Tegal',
            currentYear: 2026,
            vision: '',
            missions: [],
            arisanRule: { amountPerMonth: 50000, description: '', rules: [] },
            iuranRule: { amountPerMonth: 20000, description: '', rules: [] },
            meetingSchedule: '',
            meetingLocation: '',
            management: [],
            contact: {
              address: 'Kec. Kedungbanteng, Kab. Tegal',
              treasurerName: 'Hj. Siti Aminah, S.Ag',
              treasurerPhone: '0857-9876-5432',
              chairmanName: 'Drs. H. Mustofa',
              chairmanPhone: '0812-3456-7890',
              email: 'admin@kua.id',
            },
            officialDocumentConfig: {
              chairmanTitle: 'Ketua Paguyuban Bani P3N',
              chairmanName: 'Drs. H. Mustofa',
              treasurerTitle: 'Bendahara',
              treasurerName: 'Hj. Siti Aminah, S.Ag',
              organizationLocation: 'Kedungbanteng, Kab. Tegal',
              documentPrefix: 'P3N/KUA-KDB',
              showBarcode: true,
              showStamp: true,
              stampText: 'PAGUYUBAN BANI P3N KEDUNGBANTENG',
            },
          }}
          onClose={() => setCardMember(null)}
          onUpdateMember={(updated) => {
            onUpdateMember(updated);
            setCardMember(updated);
          }}
        />
      )}
    </div>
  );
};
