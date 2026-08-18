import React from 'react';
import { 
  LayoutDashboard, 
  UserCircle2, 
  Coins, 
  Receipt, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Sparkles, 
  Users, 
  Clock,
  ShieldCheck,
  CircleDollarSign,
  Cloud,
  User,
  Shield,
  LogOut,
  MessageSquare
} from 'lucide-react';
import { AuthUser } from '../types';

export type TabType = 
  | 'dashboard'
  | 'user_portal'
  | 'messages'
  | 'prayer_times'
  | 'profile'
  | 'arisan'
  | 'iuran'
  | 'cash_in'
  | 'cash_out'
  | 'lottery'
  | 'members';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  totalMembersCount: number;
  unreadMessagesCount?: number;
  logoUrl?: string;
  isFirebaseSyncing?: boolean;
  onOpenBackup?: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileMenuOpen,
  onCloseMobileMenu,
  totalMembersCount,
  unreadMessagesCount = 0,
  logoUrl,
  isFirebaseSyncing,
  onOpenBackup,
  currentUser,
  onLogout,
}) => {
  const isUserRole = currentUser?.role === 'user';

  const adminMenuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard Admin',
      icon: LayoutDashboard,
      badge: 'Utama',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    {
      id: 'messages' as TabType,
      label: 'Pesan & Chat Anggota',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} Baru` : undefined,
      badgeColor: 'bg-rose-500 text-white font-extrabold shadow-xs animate-pulse',
    },
    {
      id: 'prayer_times' as TabType,
      label: 'Jadwal Sholat & Adzan',
      icon: Clock,
      badge: 'Adzan',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    {
      id: 'profile' as TabType,
      label: 'Profil Paguyuban',
      icon: UserCircle2,
      badge: 'Info',
    },
    {
      id: 'arisan' as TabType,
      label: 'Setoran Arisan',
      icon: Coins,
      badge: 'Rp 50k',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    },
    {
      id: 'iuran' as TabType,
      label: 'Setoran Iuran',
      icon: Receipt,
      badge: 'Rp 20k',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    },
    {
      id: 'cash_in' as TabType,
      label: 'Uang Masuk',
      icon: ArrowDownLeft,
      badge: undefined,
    },
    {
      id: 'cash_out' as TabType,
      label: 'Uang Keluar',
      icon: ArrowUpRight,
      badge: undefined,
    },
    {
      id: 'lottery' as TabType,
      label: 'Kocokan Arisan',
      icon: Sparkles,
      badge: 'Undian',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 animate-pulse',
    },
    {
      id: 'members' as TabType,
      label: 'Data Nama Anggota',
      icon: Users,
      badge: `${totalMembersCount}`,
      badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    },
  ];

  const userMenuItems = [
    {
      id: 'user_portal' as TabType,
      label: 'Portal Data Pribadi',
      icon: User,
      badge: 'Pribadi',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
    },
    {
      id: 'prayer_times' as TabType,
      label: 'Jadwal Sholat & Adzan',
      icon: Clock,
      badge: 'Kedungbanteng',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    {
      id: 'profile' as TabType,
      label: 'Profil Paguyuban',
      icon: UserCircle2,
      badge: 'Info',
    },
  ];

  const menuItems = isUserRole ? userMenuItems : adminMenuItems;

  const handleItemClick = (tab: TabType) => {
    onSelectTab(tab);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobileMenu}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Banner */}
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-6">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Paguyuban"
              className="h-11 w-11 rounded-xl object-contain bg-white p-1 border border-slate-200 dark:border-slate-700 shadow-xs ring-2 ring-emerald-500/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/20">
              <CircleDollarSign className="h-6 w-6" />
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                BANI P3N
              </span>
              <span className="rounded-sm bg-emerald-600 px-1 py-0.2 text-[10px] font-bold text-white uppercase tracking-wider">
                2026
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              KUA Kec. Kedungbanteng
            </p>
          </div>
        </div>

        {/* Current User Role Notice */}
        {currentUser && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isUserRole ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}>
                {isUserRole ? <User className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isUserRole ? 'Akses Anggota' : 'Akses Administrator'}
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {currentUser.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isUserRole ? 'Menu Anggota' : 'Menu Pengurus'}
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-2">
          {!isUserRole && onOpenBackup && (
            <button
              type="button"
              onClick={onOpenBackup}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Cloud className="h-4 w-4" />
              <span>Backup Google Drive</span>
            </button>
          )}

          {/* Cloud Database Persistence Badge */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px]">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
              <span className={`h-2 w-2 rounded-full ${isFirebaseSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              <span>Firebase Cloud DB</span>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              {isFirebaseSyncing ? 'Menyinkron...' : 'Tersambung'}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Paguyuban KUA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Arisan: <span className="font-semibold text-slate-700 dark:text-slate-300">Rp 50.000</span> / bln
                <br />
                Iuran Kas: <span className="font-semibold text-slate-700 dark:text-slate-300">Rp 20.000</span> / bln
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-[10px] text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Paguyuban Bani P3N Kedungbanteng @2026</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500">Kresno Gadhing Pramudhyo | Hak Cipta</p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar / Ganti Akun</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

