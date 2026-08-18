import React from 'react';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Calendar,
  Building2,
  Shield,
  User,
  LogOut
} from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  activeTabTitle: string;
  logoUrl?: string;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  mobileMenuOpen,
  onToggleMobileMenu,
  activeTabTitle,
  logoUrl,
  currentUser,
  onLogout,
}) => {
  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 lg:px-8 backdrop-blur-md transition-colors duration-200 bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center gap-3">
        <button
          id="btn-mobile-menu-toggle"
          type="button"
          onClick={onToggleMobileMenu}
          aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="h-8 w-8 rounded-lg object-contain bg-white p-0.5 border border-slate-200 dark:border-slate-700 lg:hidden shrink-0"
            referrerPolicy="no-referrer"
          />
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Building2 className="h-3 w-3" />
              KUA Kedungbanteng
            </span>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {activeTabTitle}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Sistem Informasi Arisan & Iuran Kas Bani P3N Tahun 2026
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{currentDate}</span>
        </div>

        {/* Current User Role Badge */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
              currentUser.role === 'admin'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800'
            }`}>
              {currentUser.role === 'admin' ? (
                <>
                  <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Admin (Pengurus)</span>
                  <span className="sm:hidden">Admin</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {currentUser.name}
                  </span>
                </>
              )}
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                id="btn-logout"
                type="button"
                onClick={onLogout}
                title="Keluar / Ganti Akun"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            )}
          </div>
        )}

        {/* Dark/Light Mode Switcher */}
        <button
          id="btn-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={darkMode ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 shadow-xs cursor-pointer"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
};

