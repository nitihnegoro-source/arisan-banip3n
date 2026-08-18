import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Coins, 
  HeartHandshake, 
  FileText,
  Award,
  Clock,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Image,
  Upload,
  Sliders,
  Check
} from 'lucide-react';
import { PaguyubanProfile, ManagementMember } from '../types';
import { INITIAL_PAGUYUBAN_PROFILE } from '../data/initialData';
import { formatRupiah } from '../utils/formatters';

interface ProfileViewProps {
  profile: PaguyubanProfile;
  onUpdateProfile: (updated: PaguyubanProfile) => void;
  isReadOnly?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  isReadOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<PaguyubanProfile>(profile);
  const [activeEditTab, setActiveEditTab] = useState<'general' | 'vision' | 'rules' | 'management' | 'contact' | 'signature'>('general');
  const [saveToast, setSaveToast] = useState(false);

  // When opening edit mode, sync form with current profile
  const handleOpenEdit = () => {
    if (isReadOnly) return;
    setEditForm(JSON.parse(JSON.stringify(profile)));
    setIsEditing(true);
  };

  // Save changes
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh profil paguyuban ke pengaturan standar awal?')) {
      onUpdateProfile(INITIAL_PAGUYUBAN_PROFILE);
      setEditForm(INITIAL_PAGUYUBAN_PROFILE);
      setIsEditing(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  };

  // Misi handlers
  const handleAddMission = () => {
    setEditForm((prev) => ({
      ...prev,
      missions: [...prev.missions, 'Butir misi baru'],
    }));
  };

  const handleUpdateMission = (index: number, val: string) => {
    const updated = [...editForm.missions];
    updated[index] = val;
    setEditForm((prev) => ({ ...prev, missions: updated }));
  };

  const handleDeleteMission = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      missions: prev.missions.filter((_, i) => i !== index),
    }));
  };

  // Arisan rule handlers
  const handleAddArisanRule = () => {
    setEditForm((prev) => ({
      ...prev,
      arisanRule: {
        ...prev.arisanRule,
        rules: [...prev.arisanRule.rules, 'Ketentuan baru setoran arisan'],
      },
    }));
  };

  const handleUpdateArisanRule = (index: number, val: string) => {
    const updated = [...editForm.arisanRule.rules];
    updated[index] = val;
    setEditForm((prev) => ({
      ...prev,
      arisanRule: { ...prev.arisanRule, rules: updated },
    }));
  };

  const handleDeleteArisanRule = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      arisanRule: {
        ...prev.arisanRule,
        rules: prev.arisanRule.rules.filter((_, i) => i !== index),
      },
    }));
  };

  // Iuran rule handlers
  const handleAddIuranRule = () => {
    setEditForm((prev) => ({
      ...prev,
      iuranRule: {
        ...prev.iuranRule,
        rules: [...prev.iuranRule.rules, 'Ketentuan baru iuran kas'],
      },
    }));
  };

  const handleUpdateIuranRule = (index: number, val: string) => {
    const updated = [...editForm.iuranRule.rules];
    updated[index] = val;
    setEditForm((prev) => ({
      ...prev,
      iuranRule: { ...prev.iuranRule, rules: updated },
    }));
  };

  const handleDeleteIuranRule = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      iuranRule: {
        ...prev.iuranRule,
        rules: prev.iuranRule.rules.filter((_, i) => i !== index),
      },
    }));
  };

  // Management handlers
  const handleAddManagement = () => {
    const newMember: ManagementMember = {
      id: `mgr-${Date.now()}`,
      role: 'Seksi / Anggota Pengurus',
      name: 'Nama Pengurus',
      subtitle: 'Keterangan Jabatan',
      phone: '081234567890',
    };
    setEditForm((prev) => ({
      ...prev,
      management: [...prev.management, newMember],
    }));
  };

  const handleUpdateManagement = (index: number, field: keyof ManagementMember, val: any) => {
    const updated = [...editForm.management];
    updated[index] = { ...updated[index], [field]: val };
    setEditForm((prev) => ({ ...prev, management: updated }));
  };

  const handleDeleteManagement = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      management: prev.management.filter((_, i) => i !== index),
    }));
  };

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const updated = {
          ...profile,
          logoUrl: base64,
        };
        onUpdateProfile(updated);
        setEditForm((prev) => ({ ...prev, logoUrl: base64 }));
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    const updated = {
      ...profile,
      logoUrl: undefined,
    };
    onUpdateProfile(updated);
    setEditForm((prev) => ({ ...prev, logoUrl: undefined }));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Signature image upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditForm((prev) => ({
          ...prev,
          officialDocumentConfig: {
            ...prev.officialDocumentConfig,
            signatureImageUrl: base64,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Kop Surat image upload
  const handleKopUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditForm((prev) => ({
          ...prev,
          officialDocumentConfig: {
            ...prev.officialDocumentConfig,
            kopSuratImageUrl: base64,
            useCustomKopImage: true,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Treasurer signature upload
  const handleTreasurerSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditForm((prev) => ({
          ...prev,
          officialDocumentConfig: {
            ...prev.officialDocumentConfig,
            treasurerSignatureImageUrl: base64,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 text-white px-5 py-3.5 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-amber-300" />
          <span className="text-sm font-bold">Profil Paguyuban Berhasil Diperbarui!</span>
        </div>
      )}

      {/* Hero Banner Profil */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-200 border border-emerald-400/30">
              <Building2 className="h-4 w-4 text-amber-300" />
              {profile.subtitle}
            </div>

            {!isReadOnly ? (
              <button
                id="btn-edit-profile"
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>Ubah / Edit Profil</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-200 border border-emerald-400/30">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span>Mode Baca Resmi Anggota</span>
              </div>
            )}
          </div>

          {/* Logo & Main Title Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group shrink-0">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white/95 dark:bg-slate-800 p-2 shadow-xl border-2 border-emerald-400/50 flex items-center justify-center overflow-hidden">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Logo Paguyuban"
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-emerald-800 dark:text-emerald-400 text-center p-2">
                    <Building2 className="h-10 w-10 mb-1 opacity-80" />
                    <span className="text-[10px] font-bold leading-tight">Belum Ada Logo</span>
                  </div>
                )}
              </div>

              {/* Quick Upload Button on Logo (Admin Only) */}
              {!isReadOnly && (
                <label
                  htmlFor="quick-logo-upload"
                  className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  title="Unggah / Ganti Logo Paguyuban"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <input
                    id="quick-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {profile.name}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                {profile.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 text-xs text-emerald-200/80">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <MapPin className="h-3.5 w-3.5 text-amber-300" />
              {profile.location}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Calendar className="h-3.5 w-3.5 text-amber-300" />
              Periode: Tahun {profile.currentYear}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Users className="h-3.5 w-3.5 text-amber-300" />
              {profile.management.length} Pengurus
            </span>
            {profile.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                Hapus Logo
              </button>
            )}
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
          <Building2 className="h-96 w-96 text-white" />
        </div>
      </div>

      {/* Visi & Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Visi Paguyuban
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {profile.vision}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Misi Paguyuban
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {profile.missions.map((mission, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{mission}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ketentuan Arisan & Iuran */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ketentuan Baku Arisan & Iuran Kas (Tahun {profile.currentYear})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Disepakati bersama dalam musyawarah anggota {profile.subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Arisan */}
          <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/20 p-5 border border-amber-200 dark:border-amber-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                1. Setoran Arisan
              </span>
              <span className="text-base font-extrabold text-amber-900 dark:text-amber-200 font-mono">
                {formatRupiah(profile.arisanRule.amountPerMonth)} / Bln
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {profile.arisanRule.description}
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
              {profile.arisanRule.rules.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Card Iuran Kas */}
          <div className="rounded-xl bg-blue-50/50 dark:bg-blue-950/20 p-5 border border-blue-200 dark:border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                2. Iuran Wajib Kas
              </span>
              <span className="text-base font-extrabold text-blue-900 dark:text-blue-200 font-mono">
                {formatRupiah(profile.iuranRule.amountPerMonth)} / Bln
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {profile.iuranRule.description}
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
              {profile.iuranRule.rules.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Jadwal Pertemuan */}
        <div className="mt-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Jadwal: {profile.meetingSchedule}</span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Tempat: {profile.meetingLocation}
          </span>
        </div>
      </div>

      {/* Susunan Pengurus */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Susunan Pengurus Paguyuban
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pengemban amanah musyawarah {profile.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.management.map((item, idx) => (
            <div
              key={item.id || idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-1 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {item.role}
                </span>
                {item.isSigner && (
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                    Penandatangan
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {item.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.subtitle}
              </p>
              {item.phone && (
                <p className="text-[10px] text-slate-400 font-mono pt-1">
                  WA: {item.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Kontak & Sekretariat */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Sekretariat & Pelayanan Informasi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5">
            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Alamat Kantor</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {profile.contact.address}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5">
            <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Kontak WhatsApp Bendahara</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                {profile.contact.treasurerPhone} ({profile.contact.treasurerName})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5">
            <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Email & Korespondensi</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                {profile.contact.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL / STUDIO */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] my-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 sm:px-6 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Ubah & Kustomisasi Profil Paguyuban
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sesuaikan nama, visi misi, nominal iuran, pengurus, hingga tanda tangan ketua
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset Standar</span>
                </button>
              </div>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 px-4 overflow-x-auto text-xs font-semibold scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveEditTab('general')}
                className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                  activeEditTab === 'general'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                1. Informasi Umum
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('vision')}
                className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                  activeEditTab === 'vision'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                2. Visi & Misi
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('rules')}
                className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                  activeEditTab === 'rules'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                3. Ketentuan Nominal
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('management')}
                className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                  activeEditTab === 'management'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                4. Susunan Pengurus
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('contact')}
                className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                  activeEditTab === 'contact'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                5. Kontak & Alamat
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('signature')}
                className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                  activeEditTab === 'signature'
                    ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                6. Dokumen & Tanda Tangan
              </button>
            </div>

            {/* Modal Body / Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 dark:text-slate-200">
              
              {/* TAB 1: General Info */}
              {activeEditTab === 'general' && (
                <div className="space-y-4">
                  {/* Logo Upload in Modal */}
                  <div className="rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Logo Resmi Paguyuban
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="h-20 w-20 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {editForm.logoUrl ? (
                          <img
                            src={editForm.logoUrl}
                            alt="Logo Paguyuban"
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-2 flex-1 text-center sm:text-left">
                        <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                          Format file: PNG, JPG, SVG atau WebP transparan untuk kop surat, sertifikat, kwitansi, dan dashboard.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors shadow-xs">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Pilih File Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setEditForm({ ...editForm, logoUrl: event.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {editForm.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, logoUrl: undefined })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Hapus Logo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Resmi Paguyuban *
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-semibold text-slate-900 dark:text-white"
                        placeholder="Contoh: Paguyuban Bani P3N & PAI"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Pendek / Singkatan
                      </label>
                      <input
                        type="text"
                        value={editForm.shortName}
                        onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                        placeholder="Contoh: Bani P3N"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sub-Judul / Instansi Pembina
                    </label>
                    <input
                      type="text"
                      value={editForm.subtitle}
                      onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                      placeholder="Contoh: Paguyuban Keluarga Besar KUA Kecamatan Kedungbanteng"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Deskripsi Profil
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Wilayah / Lokasi Kerja
                      </label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Periode Tahun Aktif
                      </label>
                      <input
                        type="number"
                        value={editForm.currentYear}
                        onChange={(e) => setEditForm({ ...editForm, currentYear: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Jadwal Pertemuan Rutin
                      </label>
                      <input
                        type="text"
                        value={editForm.meetingSchedule}
                        onChange={(e) => setEditForm({ ...editForm, meetingSchedule: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tempat Pertemuan
                      </label>
                      <input
                        type="text"
                        value={editForm.meetingLocation}
                        onChange={(e) => setEditForm({ ...editForm, meetingLocation: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Vision & Missions */}
              {activeEditTab === 'vision' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Visi Paguyuban
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.vision}
                      onChange={(e) => setEditForm({ ...editForm, vision: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Butir-Butir Misi ({editForm.missions.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddMission}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Misi
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editForm.missions.map((mission, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-5 font-bold text-slate-400 text-center">{idx + 1}.</span>
                          <input
                            type="text"
                            value={mission}
                            onChange={(e) => handleUpdateMission(idx, e.target.value)}
                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteMission(idx)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Rules & Amounts */}
              {activeEditTab === 'rules' && (
                <div className="space-y-6">
                  {/* Arisan Rules */}
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-3">
                    <h4 className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide text-xs">
                      Pengaturan Setoran Arisan
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Nominal per Bulan (Rp)</label>
                        <input
                          type="number"
                          step={5000}
                          value={editForm.arisanRule.amountPerMonth}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            arisanRule: { ...editForm.arisanRule, amountPerMonth: Number(e.target.value) }
                          })}
                          className="w-full rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 p-2 font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Keterangan Singkat</label>
                        <input
                          type="text"
                          value={editForm.arisanRule.description}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            arisanRule: { ...editForm.arisanRule, description: e.target.value }
                          })}
                          className="w-full rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[11px]">Butir Ketentuan Arisan</span>
                        <button
                          type="button"
                          onClick={handleAddArisanRule}
                          className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Tambah Aturan
                        </button>
                      </div>
                      {editForm.arisanRule.rules.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={r}
                            onChange={(e) => handleUpdateArisanRule(idx, e.target.value)}
                            className="flex-1 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteArisanRule(idx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Iuran Rules */}
                  <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3">
                    <h4 className="font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wide text-xs">
                      Pengaturan Iuran Kas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Nominal per Bulan (Rp)</label>
                        <input
                          type="number"
                          step={5000}
                          value={editForm.iuranRule.amountPerMonth}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            iuranRule: { ...editForm.iuranRule, amountPerMonth: Number(e.target.value) }
                          })}
                          className="w-full rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 p-2 font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Keterangan Singkat</label>
                        <input
                          type="text"
                          value={editForm.iuranRule.description}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            iuranRule: { ...editForm.iuranRule, description: e.target.value }
                          })}
                          className="w-full rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[11px]">Butir Ketentuan Iuran Kas</span>
                        <button
                          type="button"
                          onClick={handleAddIuranRule}
                          className="text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Tambah Aturan
                        </button>
                      </div>
                      {editForm.iuranRule.rules.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={r}
                            onChange={(e) => handleUpdateIuranRule(idx, e.target.value)}
                            className="flex-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteIuranRule(idx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Management List */}
              {activeEditTab === 'management' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Daftar Struktur Pengurus ({editForm.management.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddManagement}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Pengurus
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editForm.management.map((mgr, idx) => (
                      <div
                        key={mgr.id || idx}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            Pengurus #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteManagement(idx)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Hapus Pengurus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">Jabatan / Role</label>
                            <input
                              type="text"
                              value={mgr.role}
                              onChange={(e) => handleUpdateManagement(idx, 'role', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">Nama Lengkap & Gelar</label>
                            <input
                              type="text"
                              value={mgr.name}
                              onChange={(e) => handleUpdateManagement(idx, 'name', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">Keterangan / NIP / Unit</label>
                            <input
                              type="text"
                              value={mgr.subtitle}
                              onChange={(e) => handleUpdateManagement(idx, 'subtitle', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Contact & Secretariat */}
              {activeEditTab === 'contact' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Alamat Kantor / Sekretariat
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.contact.address}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        contact: { ...editForm.contact, address: e.target.value }
                      })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Bendahara
                      </label>
                      <input
                        type="text"
                        value={editForm.contact.treasurerName}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          contact: { ...editForm.contact, treasurerName: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        No WhatsApp Bendahara
                      </label>
                      <input
                        type="text"
                        value={editForm.contact.treasurerPhone}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          contact: { ...editForm.contact, treasurerPhone: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Ketua Paguyuban
                      </label>
                      <input
                        type="text"
                        value={editForm.contact.chairmanName}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          contact: { ...editForm.contact, chairmanName: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        No WhatsApp Ketua
                      </label>
                      <input
                        type="text"
                        value={editForm.contact.chairmanPhone}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          contact: { ...editForm.contact, chairmanPhone: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Resmi
                    </label>
                    <input
                      type="email"
                      value={editForm.contact.email}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        contact: { ...editForm.contact, email: e.target.value }
                      })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: Official Document & Chairman Signature Settings */}
              {activeEditTab === 'signature' && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs space-y-1">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Legalitas Berita Acara & Dokumen .JPG / .JPEG
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Pengaturan ini langsung digunakan pada surat keputusan, sertifikat pemenang arisan ber-barcode, dan kwitansi resmi.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Jabatan Penandatangan Dokumen
                      </label>
                      <input
                        type="text"
                        value={editForm.officialDocumentConfig.chairmanTitle}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          officialDocumentConfig: { ...editForm.officialDocumentConfig, chairmanTitle: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-semibold text-slate-900 dark:text-white"
                        placeholder="Contoh: Ketua Paguyuban Bani P3N"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Lengkap Ketua Penandatangan *
                      </label>
                      <input
                        type="text"
                        value={editForm.officialDocumentConfig.chairmanName}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          officialDocumentConfig: { ...editForm.officialDocumentConfig, chairmanName: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-slate-900 dark:text-white"
                        placeholder="Contoh: H. Lubab Habib, S.Ag"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Keterangan NIP / Jabatan Instansi
                      </label>
                      <input
                        type="text"
                        value={editForm.officialDocumentConfig.chairmanNip || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          officialDocumentConfig: { ...editForm.officialDocumentConfig, chairmanNip: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                        placeholder="Contoh: Penyuluh Agama Islam KUA Kedungbanteng"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Awalan Nomor Surat (Prefix)
                      </label>
                      <input
                        type="text"
                        value={editForm.officialDocumentConfig.documentPrefix}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          officialDocumentConfig: { ...editForm.officialDocumentConfig, documentPrefix: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white"
                        placeholder="Contoh: BA-ARS"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Teks Cap Stempel Basah
                      </label>
                      <input
                        type="text"
                        value={editForm.officialDocumentConfig.stampText}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          officialDocumentConfig: { ...editForm.officialDocumentConfig, stampText: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.officialDocumentConfig.showBarcode}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            officialDocumentConfig: { ...editForm.officialDocumentConfig, showBarcode: e.target.checked }
                          })}
                          className="rounded text-emerald-600 h-4 w-4"
                        />
                        <span className="font-semibold text-xs">Tampilkan Barcode</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.officialDocumentConfig.showStamp}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            officialDocumentConfig: { ...editForm.officialDocumentConfig, showStamp: e.target.checked }
                          })}
                          className="rounded text-emerald-600 h-4 w-4"
                        />
                        <span className="font-semibold text-xs">Tampilkan Cap Stempel</span>
                      </label>
                    </div>
                  </div>

                  {/* Upload custom Kop Surat image */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-bold text-slate-800 dark:text-slate-200">
                          Gambar KOP Surat Kustom (Opsional)
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Unggah banner header KOP surat resmi (PNG / JPG / SVG). Jika diaktifkan, gambar ini akan menggantikan format teks KOP bawaan.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-200 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={editForm.officialDocumentConfig.useCustomKopImage || false}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            officialDocumentConfig: { ...editForm.officialDocumentConfig, useCustomKopImage: e.target.checked }
                          })}
                          className="rounded text-emerald-600 h-4 w-4"
                        />
                        <span>Aktifkan KOP Gambar</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleKopUpload}
                        className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                      />

                      {editForm.officialDocumentConfig.kopSuratImageUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={editForm.officialDocumentConfig.kopSuratImageUrl}
                            alt="Preview KOP"
                            className="h-10 border rounded bg-white p-1 max-w-[200px] object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setEditForm({
                              ...editForm,
                              officialDocumentConfig: { 
                                ...editForm.officialDocumentConfig, 
                                kopSuratImageUrl: undefined,
                                useCustomKopImage: false 
                              }
                            })}
                            className="text-red-500 hover:text-red-600 text-[11px] font-semibold"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload custom signature image Ketua */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Gambar Tanda Tangan Ketua (Opsional)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Unggah file tanda tangan berlatar transparan/putih (PNG / JPG). Jika tidak diunggah, sistem akan menggunakan tanda tangan digital resmi.
                    </p>

                    <div className="flex items-center gap-4 pt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                      />

                      {editForm.officialDocumentConfig.signatureImageUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={editForm.officialDocumentConfig.signatureImageUrl}
                            alt="Preview Tanda Tangan"
                            className="h-10 border rounded bg-white p-1"
                          />
                          <button
                            type="button"
                            onClick={() => setEditForm({
                              ...editForm,
                              officialDocumentConfig: { ...editForm.officialDocumentConfig, signatureImageUrl: undefined }
                            })}
                            className="text-red-500 hover:text-red-600 text-[11px] font-semibold"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload custom signature image Bendahara */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Gambar Tanda Tangan Bendahara (Opsional)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Unggah tanda tangan pengelola kas / bendahara ({editForm.officialDocumentConfig.treasurerName || 'Darsito'}).
                    </p>

                    <div className="flex items-center gap-4 pt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTreasurerSignatureUpload}
                        className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500 cursor-pointer"
                      />

                      {editForm.officialDocumentConfig.treasurerSignatureImageUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={editForm.officialDocumentConfig.treasurerSignatureImageUrl}
                            alt="Preview Tanda Tangan Bendahara"
                            className="h-10 border rounded bg-white p-1"
                          />
                          <button
                            type="button"
                            onClick={() => setEditForm({
                              ...editForm,
                              officialDocumentConfig: { ...editForm.officialDocumentConfig, treasurerSignatureImageUrl: undefined }
                            })}
                            className="text-red-500 hover:text-red-600 text-[11px] font-semibold"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-4 sm:px-6 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/20 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
