import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FolderSync, 
  FileJson, 
  LogOut, 
  Calendar, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initGoogleAuth, 
  googleSignIn, 
  googleLogout, 
  uploadBackupToGoogleDrive, 
  listDriveBackups, 
  downloadDriveBackupContent, 
  DriveFileItem 
} from '../lib/googleDriveService';
import { Member, MemberPaymentHistory, CashTransaction, LotteryWinner, PaguyubanProfile } from '../types';

interface GoogleDriveBackupModalProps {
  members: Member[];
  payments: MemberPaymentHistory[];
  cashTransactions: CashTransaction[];
  lotteryWinners: LotteryWinner[];
  profile: PaguyubanProfile;
  onRestoreData: (backupData: {
    members?: Member[];
    payments?: MemberPaymentHistory[];
    cashTransactions?: CashTransaction[];
    lotteryWinners?: LotteryWinner[];
    profile?: PaguyubanProfile;
  }) => void;
  onClose: () => void;
}

export const GoogleDriveBackupModal: React.FC<GoogleDriveBackupModalProps> = ({
  members,
  payments,
  cashTransactions,
  lotteryWinners,
  profile,
  onRestoreData,
  onClose,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [restoreConfirmFile, setRestoreConfirmFile] = useState<DriveFileItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
        loadBackupFiles(authToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadBackupFiles = async (accessToken: string) => {
    setIsLoadingFiles(true);
    try {
      const files = await listDriveBackups(accessToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setBackupError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        await loadBackupFiles(result.accessToken);
      }
    } catch (err: any) {
      setBackupError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
  };

  const handleBackupToDrive = async () => {
    if (!token) return;
    setIsBackingUp(true);
    setBackupSuccess(null);
    setBackupError(null);

    const fullBackupPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      paguyuban: profile.name,
      members,
      payments,
      cashTransactions,
      lotteryWinners,
      profile,
    };

    try {
      const res = await uploadBackupToGoogleDrive(token, fullBackupPayload);
      setBackupSuccess(`Backup berhasil disimpan ke Google Drive dengan nama "${res.name}".`);
      await loadBackupFiles(token);
    } catch (err: any) {
      setBackupError(err.message || 'Terjadi kesalahan saat mencadangkan ke Google Drive.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExecuteRestore = async () => {
    if (!token || !restoreConfirmFile) return;
    setIsRestoring(true);
    setBackupError(null);
    try {
      const downloadedData = await downloadDriveBackupContent(token, restoreConfirmFile.id);
      if (downloadedData && typeof downloadedData === 'object') {
        onRestoreData(downloadedData);
        setBackupSuccess(`Data berhasil dipulihkan dari cadangan "${restoreConfirmFile.name}"!`);
        setRestoreConfirmFile(null);
      } else {
        throw new Error('Format file cadangan tidak valid.');
      }
    } catch (err: any) {
      setBackupError(err.message || 'Gagal memulihkan cadangan.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Export local JSON file directly
  const handleDownloadLocalJson = () => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      paguyuban: profile.name,
      members,
      payments,
      cashTransactions,
      lotteryWinners,
      profile,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup-BaniP3N-Lokal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs text-white shadow-inner">
              <Cloud className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Integrasi Backup Google Drive
              </h2>
              <p className="text-xs text-emerald-200">
                Pencadangan data anggota & keuangan aman di akun Google Anda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-200">
          {/* Notification Messages */}
          {backupSuccess && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3.5 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <p className="font-semibold">{backupSuccess}</p>
            </div>
          )}

          {backupError && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3.5 flex items-start gap-2.5 text-red-800 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <p className="font-semibold">{backupError}</p>
            </div>
          )}

          {/* Auth Card */}
          {!user ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center space-y-4 bg-slate-50 dark:bg-slate-800/40">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Hubungkan ke Akun Google Drive
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Masuk untuk mengizinkan aplikasi menyimpan salinan berkas cadangan data paguyuban ke Google Drive pribadi Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoadingAuth}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isLoadingAuth ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active User Connected Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="h-8 w-8 rounded-full border border-emerald-400"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {user.displayName || 'Pengguna Google'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleBackupToDrive}
                  disabled={isBackingUp}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>{isBackingUp ? 'Mencadangkan...' : 'Cadangkan Data ke Google Drive Sekarang'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => token && loadBackupFiles(token)}
                  disabled={isLoadingFiles}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                  title="Segarkan daftar file Google Drive"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Backup Files List */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FolderSync className="h-4 w-4 text-emerald-600" />
                  <span>Riwayat Berkas Cadangan di Google Drive:</span>
                </h4>

                {isLoadingFiles ? (
                  <p className="text-slate-500 italic p-3 text-center">Memuat berkas cadangan...</p>
                ) : driveFiles.length === 0 ? (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/30">
                    Belum ada riwayat berkas cadangan di Google Drive. Klik tombol hijau di atas untuk membuat cadangan pertama.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-400 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileJson className="h-4 w-4 text-amber-500 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {file.createdTime ? new Date(file.createdTime).toLocaleString('id-ID') : 'Tanggal tidak tersedia'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setRestoreConfirmFile(file)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
                        >
                          Pulihkan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Local Download Option */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Opsi Cadangan Manual:
            </span>
            <button
              type="button"
              onClick={handleDownloadLocalJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <DownloadCloud className="h-3.5 w-3.5 text-blue-500" />
              <span>Unduh Berkas JSON Lokal</span>
            </button>
          </div>
        </div>

        {/* Restore Confirmation Dialog */}
        {restoreConfirmFile && (
          <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-amber-400/50 p-6 rounded-3xl max-w-sm text-center space-y-4 shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Konfirmasi Pemulihan Data
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs mt-1.5 leading-relaxed">
                  Apakah Anda yakin ingin memulihkan data dari berkas <strong className="text-slate-900 dark:text-white font-mono">{restoreConfirmFile.name}</strong>? Data saat ini akan digantikan dengan data cadangan tersebut.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestoreConfirmFile(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isRestoring}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  {isRestoring ? 'Memulihkan...' : 'Ya, Pulihkan Data'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
