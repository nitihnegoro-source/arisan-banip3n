import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Building2, 
  CircleDollarSign, 
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Check,
  Search,
  MessageSquare,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { Member, AuthUser, UserRole } from '../types';

interface LoginViewProps {
  members: Member[];
  onLogin: (user: AuthUser) => void;
  logoUrl?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  members,
  onLogin,
  logoUrl,
}) => {
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Member manual typing / search state
  const [manualMemberName, setManualMemberName] = useState<string>(members[0]?.name || '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || 'm-1');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter members based on typed manual name (first name / partial match)
  const filteredMembers = useMemo(() => {
    if (!manualMemberName.trim()) return members;
    const query = manualMemberName.toLowerCase().trim();
    return members.filter((m) => 
      m.name.toLowerCase().includes(query) ||
      m.no.toString() === query ||
      m.category.toLowerCase().includes(query)
    );
  }, [members, manualMemberName]);

  // Email format verification check
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isGmail = email.trim().toLowerCase().endsWith('@gmail.com');

  // Handle email changes and auto-detect role
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setErrorMsg(null);
    const lower = val.toLowerCase().trim();
    if (lower.includes('admin') || lower === 'admin@gmail.com' || lower === 'admin@kua.id') {
      setActiveRoleTab('admin');
    } else if (lower.includes('user') || lower === 'user@gmail.com' || lower === 'anggota@gmail.com') {
      setActiveRoleTab('user');
    }
  };

  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setErrorMsg(null);
    if (role === 'admin') {
      if (!email || email === 'user@gmail.com') {
        setEmail('admin@gmail.com');
      }
    } else {
      if (!email || email === 'admin@gmail.com') {
        setEmail('user@gmail.com');
      }
      if (!selectedMemberId && members.length > 0) {
        setSelectedMemberId(members[0].id);
        setManualMemberName(members[0].name);
      }
    }
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMemberId(member.id);
    setManualMemberName(member.name);
    setIsDropdownOpen(false);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Silakan masukkan alamat email / Gmail Anda.');
      return;
    }

    if (!isEmailValid) {
      setErrorMsg('Format email tidak valid. Pastikan memasukkan alamat email yang benar (contoh: nama@gmail.com).');
      return;
    }

    if (!password) {
      setErrorMsg('Silakan masukkan kata sandi / PIN.');
      return;
    }

    // If user role, verify member match
    let linkedMember: Member | undefined;
    if (activeRoleTab === 'user') {
      // First check by selected ID
      linkedMember = members.find((m) => m.id === selectedMemberId);
      
      // If not found or name doesn't match typed text, find by typed name (first name/partial)
      if (!linkedMember || !linkedMember.name.toLowerCase().includes(manualMemberName.toLowerCase().trim())) {
        const matched = members.find((m) => 
          m.name.toLowerCase().includes(manualMemberName.toLowerCase().trim()) ||
          manualMemberName.toLowerCase().trim().includes(m.name.toLowerCase())
        );
        if (matched) {
          linkedMember = matched;
        } else if (members.length > 0) {
          linkedMember = members[0];
        }
      }

      if (!manualMemberName.trim()) {
        setErrorMsg('Silakan ketikkan nama anggota Anda (nama depan atau nama lengkap).');
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Determine role based on email address or selected tab
      const isAdmin = cleanEmail.includes('admin') || activeRoleTab === 'admin';

      if (isAdmin) {
        const adminUser: AuthUser = {
          id: 'auth-admin',
          email: cleanEmail,
          name: 'Administrator (Pengurus KUA)',
          role: 'admin',
          phoneNumber: '0812-3456-7890',
          loginTime: new Date().toISOString(),
        };
        onLogin(adminUser);
      } else {
        const finalMember = linkedMember || members[0];
        const userObj: AuthUser = {
          id: `auth-user-${finalMember?.id || 'default'}`,
          email: cleanEmail,
          name: finalMember ? finalMember.name : (manualMemberName || 'Anggota Paguyuban'),
          role: 'user',
          memberId: finalMember?.id,
          phoneNumber: finalMember?.phone,
          loginTime: new Date().toISOString(),
        };
        onLogin(userObj);
      }
    }, 350);
  };

  const activeSelectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Paguyuban Bani P3N"
              className="h-11 w-11 rounded-2xl object-contain bg-white p-1 border border-slate-700 shadow-md ring-2 ring-emerald-500/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md ring-2 ring-emerald-500/20">
              <CircleDollarSign className="h-6 w-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                PAGUYUBAN BANI P3N
              </span>
              <span className="rounded-sm bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                2026
              </span>
            </div>
            <p className="text-xs text-slate-400">
              KUA Kecamatan Kedungbanteng, Kab. Tegal
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800/60">
          <ShieldCheck className="h-4 w-4" />
          <span>Autentikasi Terverifikasi</span>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          
          <div className="rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Header Text */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-teal-950/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-300 border border-teal-700/60 mb-1">
                <Building2 className="h-3.5 w-3.5" />
                Portal Masuk
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Sistem Informasi Paguyuban
              </h2>
              <p className="text-xs text-slate-400">
                Silakan masuk untuk mengakses portal paguyuban
              </p>
            </div>

            {/* Role Tab Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Pengurus (Admin)</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('user')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'user'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Anggota (User)</span>
              </button>
            </div>

            {/* Role Info Notice */}
            {activeRoleTab === 'user' ? (
              <div className="p-3 rounded-2xl bg-teal-950/50 border border-teal-800/60 text-teal-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-teal-300">
                  <BookOpen className="h-4 w-4 shrink-0 text-teal-400" />
                  <span>Akses Anggota: Mode Baca & Chat Pengurus</span>
                </div>
                <p className="text-[11px] text-teal-200/80 leading-relaxed">
                  Login anggota khusus untuk melihat status iuran/arisan pribadi, cetak kartu anggota (KTA), kuitansi, dan mengajukan chat langsung ke Admin/Pengurus.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <Shield className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Akses Administrator Pengurus</span>
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  Akses penuh untuk input setoran, kocok arisan, manajemen kas, ekspor laporan & kelola anggota.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-2 text-xs animate-in fade-in duration-150">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Tulis Nama Anggota Secara Manual (Khusus Login Anggota) */}
              {activeRoleTab === 'user' && (
                <div className="space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-teal-400" />
                      <span>Tulis Nama Anggota (Nama Depan / Lengkap):</span>
                    </label>
                    <span className="text-[10px] text-teal-400 font-normal">
                      Manual Input
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="input-login-manual-member-name"
                      type="text"
                      required
                      value={manualMemberName}
                      onChange={(e) => {
                        setManualMemberName(e.target.value);
                        setIsDropdownOpen(true);
                        setErrorMsg(null);
                        // Try auto matching
                        const match = members.find((m) => 
                          m.name.toLowerCase().startsWith(e.target.value.toLowerCase().trim()) ||
                          m.name.toLowerCase().includes(e.target.value.toLowerCase().trim())
                        );
                        if (match) {
                          setSelectedMemberId(match.id);
                        }
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Contoh: Kresno, Ahmad, Siti, Mustofa..."
                      className="w-full rounded-xl border border-teal-500/70 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Smart Suggestions Dropdown for Name Matches */}
                  {isDropdownOpen && filteredMembers.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl p-1.5 space-y-1">
                      <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Pilih Nama yang Cocok ({filteredMembers.length}):
                      </p>
                      {filteredMembers.slice(0, 8).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectMember(m)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            selectedMemberId === m.id
                              ? 'bg-teal-600/30 text-teal-200 border border-teal-500/40 font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-amber-400">#{m.no.toString().padStart(2, '0')}</span>
                            <span>{m.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {m.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matched Member Feedback Badge */}
                  {activeSelectedMember && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-slate-400">Terpilih:</span>
                        <span className="font-bold text-teal-300">{activeSelectedMember.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        No. #{activeSelectedMember.no.toString().padStart(2, '0')} ({activeSelectedMember.category})
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Email / Gmail Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">
                    Alamat Email / Gmail
                  </label>
                  {isEmailValid && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <Check className="h-3 w-3 stroke-[3]" />
                      {isGmail ? 'Gmail Terverifikasi' : 'Format Sesuai'}
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="nama@gmail.com"
                    className={`w-full rounded-xl border bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 transition-all font-medium ${
                      isEmailValid 
                        ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20' 
                        : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
                    }`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">
                    Kata Sandi / Password
                  </label>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-login"
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50 mt-2 ${
                  activeRoleTab === 'admin'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-900/30'
                }`}
              >
                <KeyRound className="h-4 w-4" />
                <span>
                  {isLoading
                    ? 'Memverifikasi...'
                    : activeRoleTab === 'admin'
                    ? 'Masuk Sebagai Administrator'
                    : 'Masuk Sebagai Anggota (Baca & Chat)'}
                </span>
              </button>
            </form>

            <div className="pt-1 text-center">
              <p className="text-[11px] text-slate-400">
                {activeRoleTab === 'admin'
                  ? 'Akses penuh kelola data anggota, kas & kocokan arisan'
                  : 'Akses membaca laporan setoran, KTA & layanan pengajuan chat ke admin'}
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Clean Institutional Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 border-t border-slate-800/80 text-center text-xs text-slate-400 space-y-0.5">
        <p className="font-semibold text-slate-300">
          Paguyuban Bani P3N Kedungbanteng @2026
        </p>
        <p className="text-[11px] text-slate-400">
          Kresno Gadhing Pramudhyo | Hak Cipta
        </p>
      </footer>
    </div>
  );
};

