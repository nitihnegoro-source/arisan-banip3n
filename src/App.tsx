/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { 
  COLLECTIONS, 
  saveMemberToFirestore, 
  deleteMemberFromFirestore, 
  batchSaveMembersToFirestore, 
  savePaymentHistoryToFirestore, 
  batchSavePaymentsToFirestore, 
  saveCashTransactionToFirestore, 
  deleteCashTransactionFromFirestore, 
  batchSaveCashTransactionsToFirestore,
  batchDeleteCashTransactionsFromFirestore,
  saveLotteryWinnerToFirestore, 
  deleteLotteryWinnerFromFirestore, 
  saveProfileToFirestore, 
  seedInitialDataIfEmpty 
} from './lib/firestoreService';
import { 
  buildArisanSyncTransaction, 
  buildIuranSyncTransaction, 
  buildLotterySyncTransaction, 
  reconcileAllTransactions 
} from './utils/syncFinance';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { ArisanView } from './components/ArisanView';
import { IuranView } from './components/IuranView';
import { CashInView } from './components/CashInView';
import { CashOutView } from './components/CashOutView';
import { LotteryView } from './components/LotteryView';
import { MembersView } from './components/MembersView';
import { PrayerTimesView } from './components/PrayerTimesView';
import { ReceiptModal } from './components/ReceiptModal';
import { WinnerCertificateModal } from './components/WinnerCertificateModal';
import { GoogleDriveBackupModal } from './components/GoogleDriveBackupModal';
import { VerifiedDocumentModal, VerifiedDocData } from './components/VerifiedDocumentModal';
import { LoginView } from './components/LoginView';
import { UserDashboardView } from './components/UserDashboardView';
import { AdminChatView } from './components/AdminChatView';
import { getStoredChatMessages } from './utils/chatManager';
import { 
  INITIAL_MEMBERS, 
  getInitialPaymentHistory, 
  INITIAL_CASH_TRANSACTIONS, 
  INITIAL_LOTTERY_WINNERS,
  INITIAL_PAGUYUBAN_PROFILE
} from './data/initialData';
import { Member, MemberPaymentHistory, CashTransaction, LotteryWinner, PaguyubanProfile, AuthUser, ChatMessage } from './types';

const STORAGE_KEYS = {
  MEMBERS: 'arisan_p3n_members_v2',
  PAYMENTS: 'arisan_p3n_payments_v1',
  CASH_TX: 'arisan_p3n_cashtx_v1',
  WINNERS: 'arisan_p3n_winners_v1',
  PROFILE: 'arisan_p3n_profile_v1',
  THEME: 'arisan_p3n_theme_v1',
  AUTH_USER: 'arisan_p3n_auth_user_v1',
};

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  // Dark mode state with immediate DOM class reflection
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(STORAGE_KEYS.THEME, 'light');
      }
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Active Tab & Navigation
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedAuth) {
      try {
        const parsed: AuthUser = JSON.parse(savedAuth);
        return parsed.role === 'user' ? 'user_portal' : 'dashboard';
      } catch (e) {
        // fallback
      }
    }
    return 'dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const activeYear = 2026;

  // Selected Winner for Certificate Modal
  const [selectedWinnerForCert, setSelectedWinnerForCert] = useState<LotteryWinner | null>(null);

  // Authentication Handlers
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    if (user.role === 'user') {
      setActiveTab('user_portal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setActiveTab('dashboard');
  };

  // Firebase Sync State
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);

  // Backup Modal State
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);

  // Verified Barcode Scan Modal State (detected via URL query params or manual trigger)
  const [verifiedDocData, setVerifiedDocData] = useState<VerifiedDocData | null>(null);

  // Members State (local fallback + Firestore sync)
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_MEMBERS;
  });

  // Payments State
  const [payments, setPayments] = useState<MemberPaymentHistory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return getInitialPaymentHistory();
  });

  // Cash Transactions State
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_TX);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_CASH_TRANSACTIONS;
  });

  // Lottery Winners State
  const [lotteryWinners, setLotteryWinners] = useState<LotteryWinner[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WINNERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_LOTTERY_WINNERS;
  });

  // Paguyuban Profile State
  const [profile, setProfile] = useState<PaguyubanProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_PAGUYUBAN_PROFILE;
  });

  // Receipt Modal State
  const [receiptModal, setReceiptModal] = useState<{
    member: Member;
    month: number;
    type: 'arisan' | 'iuran';
  } | null>(null);

  // 1. Check URL parameters for Barcode / QR Code Verification (PDF View)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const verifyType = searchParams.get('verify');
      const docParam = searchParams.get('doc');

      if (verifyType || docParam) {
        const docNo = docParam || searchParams.get('doc') || 'BA-ARS/2026/05/001';
        const docType = (searchParams.get('type') as 'ba' | 'kwitansi') || (docNo.startsWith('KW') ? 'kwitansi' : 'ba');
        const roundNo = Number(searchParams.get('round')) || 1;
        const winnerName = searchParams.get('winner') || 'Anggota Paguyuban';
        const cat = searchParams.get('cat') || 'P3N';
        const amt = Number(searchParams.get('amt')) || 1850000;
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
        const chair = searchParams.get('chair') || profile.officialDocumentConfig?.chairmanName || 'Drs. H. Mustofa';
        const treas = searchParams.get('treas') || profile.officialDocumentConfig?.treasurerName || 'Hj. Siti Aminah, S.Ag';
        const code = searchParams.get('code') || `P3N-ARS-2026-${roundNo.toString().padStart(2, '0')}-VALID`;
        const notes = searchParams.get('notes') || undefined;

        setVerifiedDocData({
          docNumber: docNo,
          docType,
          roundNumber: roundNo,
          winnerName,
          category: cat,
          prizeAmount: amt,
          drawDate: date,
          chairmanName: chair,
          treasurerName: treas,
          paguyubanName: profile.name || 'Paguyuban Bani P3N KUA Kedungbanteng',
          verificationCode: code,
          verifiedAt: new Date().toISOString(),
          logoUrl: profile.logoUrl,
          notes,
        });
      }
    } catch (err) {
      console.warn('Error parsing verification URL:', err);
    }
  }, [profile]);

  // 2. Initialize Firestore Cloud Synchronization & Listeners
  useEffect(() => {
    let isSubscribed = true;

    const setupFirestore = async () => {
      try {
        setIsFirebaseSyncing(true);
        // Seed initial data if empty
        await seedInitialDataIfEmpty(
          INITIAL_MEMBERS,
          getInitialPaymentHistory(),
          INITIAL_CASH_TRANSACTIONS,
          INITIAL_LOTTERY_WINNERS,
          INITIAL_PAGUYUBAN_PROFILE
        );
      } catch (err) {
        console.warn('Firestore initial check error (using offline state):', err);
      } finally {
        if (isSubscribed) setIsFirebaseSyncing(false);
      }
    };

    setupFirestore();

    // Listen to Members collection
    const unsubMembers = onSnapshot(collection(db, COLLECTIONS.MEMBERS), (snapshot) => {
      if (!snapshot.empty) {
        const cloudMembers: Member[] = [];
        snapshot.forEach((docSnap) => {
          cloudMembers.push(docSnap.data() as Member);
        });
        cloudMembers.sort((a, b) => a.no - b.no);
        setMembers(cloudMembers);
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(cloudMembers));
      }
    }, (err) => console.warn('Members snapshot listener:', err));

    // Listen to Payments collection
    const unsubPayments = onSnapshot(collection(db, COLLECTIONS.PAYMENTS), (snapshot) => {
      if (!snapshot.empty) {
        const cloudPayments: MemberPaymentHistory[] = [];
        snapshot.forEach((docSnap) => {
          cloudPayments.push(docSnap.data() as MemberPaymentHistory);
        });
        setPayments(cloudPayments);
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(cloudPayments));
      }
    }, (err) => console.warn('Payments snapshot listener:', err));

    // Listen to Cash Transactions collection
    const unsubCashTx = onSnapshot(collection(db, COLLECTIONS.CASH_TRANSACTIONS), (snapshot) => {
      if (!snapshot.empty) {
        const cloudTx: CashTransaction[] = [];
        snapshot.forEach((docSnap) => {
          cloudTx.push(docSnap.data() as CashTransaction);
        });
        cloudTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCashTransactions(cloudTx);
        localStorage.setItem(STORAGE_KEYS.CASH_TX, JSON.stringify(cloudTx));
      }
    }, (err) => console.warn('CashTx snapshot listener:', err));

    // Listen to Lottery Winners collection
    const unsubWinners = onSnapshot(collection(db, COLLECTIONS.LOTTERY_WINNERS), (snapshot) => {
      if (!snapshot.empty) {
        const cloudWinners: LotteryWinner[] = [];
        snapshot.forEach((docSnap) => {
          cloudWinners.push(docSnap.data() as LotteryWinner);
        });
        cloudWinners.sort((a, b) => a.roundNumber - b.roundNumber);
        setLotteryWinners(cloudWinners);
        localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(cloudWinners));
      }
    }, (err) => console.warn('Winners snapshot listener:', err));

    // Listen to Profile doc
    const unsubProfile = onSnapshot(doc(db, COLLECTIONS.APP_STATE, 'paguyuban_profile'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profile) {
          setProfile(data.profile as PaguyubanProfile);
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
        }
      }
    }, (err) => console.warn('Profile snapshot listener:', err));

    return () => {
      isSubscribed = false;
      unsubMembers();
      unsubPayments();
      unsubCashTx();
      unsubWinners();
      unsubProfile();
    };
  }, []);

  // Save changes to localStorage as secondary backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASH_TX, JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(lotteryWinners));
  }, [lotteryWinners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  // Toggle Single Payment Month with instant Cash In synchronization
  const handleTogglePayment = async (memberId: string, month: number, type: 'arisan' | 'iuran') => {
    const key = `${activeYear}-${month}`;
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    let updatedPaymentRecord: MemberPaymentHistory | null = null;
    let willBePaid = false;
    const paidDate = new Date().toISOString().split('T')[0];

    setPayments((prev) => {
      return prev.map((item) => {
        if (item.memberId === memberId) {
          const currentRecord = item[type][key];
          willBePaid = !currentRecord?.isPaid;
          const receiptNo = willBePaid
            ? `${type === 'arisan' ? 'KW-ARS' : 'KW-IUR'}/${activeYear}/${month.toString().padStart(2, '0')}/${member.no.toString().padStart(3, '0')}`
            : undefined;

          const updatedRecord = {
            month,
            year: activeYear,
            isPaid: willBePaid,
            paidDate: willBePaid ? paidDate : undefined,
            amount: type === 'arisan' ? 50000 : 20000,
            receiptNo,
          };

          updatedPaymentRecord = {
            ...item,
            [type]: {
              ...item[type],
              [key]: updatedRecord,
            },
          };
          return updatedPaymentRecord;
        }
        return item;
      });
    });

    if (updatedPaymentRecord) {
      await savePaymentHistoryToFirestore(updatedPaymentRecord);
    }

    // Synchronize directly with Cash Transactions (Buku Kas Masuk)
    const syncTxId = `tx-sync-${type}-${memberId}-${activeYear}-${month}`;
    if (willBePaid) {
      const syncTx = type === 'arisan'
        ? buildArisanSyncTransaction(member, month, activeYear, paidDate)
        : buildIuranSyncTransaction(member, month, activeYear, paidDate);

      setCashTransactions((prev) => {
        const withoutOld = prev.filter((t) => t.id !== syncTxId);
        const updated = [syncTx, ...withoutOld].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return updated;
      });
      await saveCashTransactionToFirestore(syncTx);
    } else {
      setCashTransactions((prev) => prev.filter((t) => t.id !== syncTxId));
      await deleteCashTransactionFromFirestore(syncTxId);
    }
  };

  // Add Cash Transaction
  const handleAddCashTransaction = async (tx: Omit<CashTransaction, 'id' | 'type'>, type: 'in' | 'out') => {
    const newTx: CashTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      type,
    };
    setCashTransactions((prev) => [newTx, ...prev]);
    await saveCashTransactionToFirestore(newTx);
  };

  const handleDeleteCashTransaction = async (id: string) => {
    setCashTransactions((prev) => prev.filter((t) => t.id !== id));
    await deleteCashTransactionFromFirestore(id);
  };

  // Add Lottery Winner with instant Cash Out synchronization
  const handleAddLotteryWinner = async (winnerData: Omit<LotteryWinner, 'id'>) => {
    const newWinnerId = `lot-${Date.now()}`;
    const newWinner: LotteryWinner = {
      ...winnerData,
      id: newWinnerId,
    };
    setLotteryWinners((prev) => [...prev, newWinner]);
    await saveLotteryWinnerToFirestore(newWinner);

    // Automatically create synchronized cash transaction for payout (Buku Kas Keluar)
    const syncPayoutTx = buildLotterySyncTransaction(newWinner, activeYear);
    setCashTransactions((prev) => {
      const withoutOld = prev.filter((t) => t.id !== syncPayoutTx.id);
      return [syncPayoutTx, ...withoutOld].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
    await saveCashTransactionToFirestore(syncPayoutTx);
  };

  const handleUpdateLotteryWinner = async (updatedWinner: LotteryWinner) => {
    setLotteryWinners((prev) =>
      prev.map((w) => (w.id === updatedWinner.id ? updatedWinner : w))
    );
    await saveLotteryWinnerToFirestore(updatedWinner);

    // Update synchronized cash transaction
    const syncPayoutTx = buildLotterySyncTransaction(updatedWinner, activeYear);
    setCashTransactions((prev) => {
      const exists = prev.some((t) => t.id === syncPayoutTx.id);
      if (exists) {
        return prev.map((t) => (t.id === syncPayoutTx.id ? syncPayoutTx : t));
      } else {
        return [syncPayoutTx, ...prev].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
    });
    await saveCashTransactionToFirestore(syncPayoutTx);
  };

  const handleDeleteLotteryWinner = async (id: string) => {
    setLotteryWinners((prev) => prev.filter((w) => w.id !== id));
    await deleteLotteryWinnerFromFirestore(id);

    // Delete synchronized cash transaction
    const syncTxId = `tx-sync-lottery-${id}`;
    setCashTransactions((prev) => prev.filter((t) => t.id !== syncTxId && t.id !== `tx-${id}`));
    await deleteCashTransactionFromFirestore(syncTxId);
  };

  // Reconcile / Synchronize all payments & lottery winners with cash transactions
  const handleSyncAllFinance = async () => {
    const result = reconcileAllTransactions(
      members,
      payments,
      lotteryWinners,
      cashTransactions,
      activeYear
    );
    setCashTransactions(result.reconciledTransactions);
    localStorage.setItem(STORAGE_KEYS.CASH_TX, JSON.stringify(result.reconciledTransactions));

    if (result.addedTransactions.length > 0) {
      await batchSaveCashTransactionsToFirestore(result.addedTransactions);
    }
    if (result.deletedTxIds.length > 0) {
      await batchDeleteCashTransactionsFromFirestore(result.deletedTxIds);
    }
    return result;
  };

  // Member CRUD
  const handleAddMember = async (memberData: Omit<Member, 'id' | 'no'>) => {
    const newNo = members.length > 0 ? Math.max(...members.map((m) => m.no)) + 1 : 1;
    const newId = `m-${Date.now()}`;
    const newMember: Member = {
      ...memberData,
      id: newId,
      no: newNo,
    };

    setMembers((prev) => [...prev, newMember]);
    await saveMemberToFirestore(newMember);

    // Initialize empty payment record
    const emptyArisan: { [key: string]: any } = {};
    const emptyIuran: { [key: string]: any } = {};
    for (let m = 1; m <= 12; m++) {
      emptyArisan[`${activeYear}-${m}`] = { month: m, year: activeYear, isPaid: false, amount: 50000 };
      emptyIuran[`${activeYear}-${m}`] = { month: m, year: activeYear, isPaid: false, amount: 20000 };
    }

    const newPayment: MemberPaymentHistory = {
      memberId: newId,
      arisan: emptyArisan,
      iuran: emptyIuran,
    };

    setPayments((prev) => [...prev, newPayment]);
    await savePaymentHistoryToFirestore(newPayment);
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    await saveMemberToFirestore(updatedMember);
  };

  const handleDeleteMember = async (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setPayments((prev) => prev.filter((p) => p.memberId !== id));
    await deleteMemberFromFirestore(id);
  };

  const handleBulkImportMembers = async (importedList: Omit<Member, 'id' | 'no'>[]) => {
    let currentMaxNo = members.length > 0 ? Math.max(...members.map((m) => m.no)) : 0;
    const newMembers: Member[] = [];
    const newPaymentHistories: MemberPaymentHistory[] = [];

    importedList.forEach((item) => {
      currentMaxNo++;
      const newId = `m-imp-${Date.now()}-${currentMaxNo}`;
      const newM: Member = {
        ...item,
        id: newId,
        no: currentMaxNo,
      };
      newMembers.push(newM);

      const emptyArisan: { [key: string]: any } = {};
      const emptyIuran: { [key: string]: any } = {};
      for (let m = 1; m <= 12; m++) {
        emptyArisan[`${activeYear}-${m}`] = { month: m, year: activeYear, isPaid: false, amount: 50000 };
        emptyIuran[`${activeYear}-${m}`] = { month: m, year: activeYear, isPaid: false, amount: 20000 };
      }
      newPaymentHistories.push({
        memberId: newId,
        arisan: emptyArisan,
        iuran: emptyIuran,
      });
    });

    setMembers((prev) => [...prev, ...newMembers]);
    setPayments((prev) => [...prev, ...newPaymentHistories]);

    await batchSaveMembersToFirestore(newMembers);
    await batchSavePaymentsToFirestore(newPaymentHistories);
  };

  const handleUpdateProfile = async (updated: PaguyubanProfile) => {
    setProfile(updated);
    await saveProfileToFirestore(updated);
  };

  // Restore data from Google Drive or JSON file
  const handleRestoreData = async (backupData: {
    members?: Member[];
    payments?: MemberPaymentHistory[];
    cashTransactions?: CashTransaction[];
    lotteryWinners?: LotteryWinner[];
    profile?: PaguyubanProfile;
  }) => {
    if (backupData.members && Array.isArray(backupData.members)) {
      setMembers(backupData.members);
      await batchSaveMembersToFirestore(backupData.members);
    }
    if (backupData.payments && Array.isArray(backupData.payments)) {
      setPayments(backupData.payments);
      await batchSavePaymentsToFirestore(backupData.payments);
    }
    if (backupData.cashTransactions && Array.isArray(backupData.cashTransactions)) {
      setCashTransactions(backupData.cashTransactions);
      for (const tx of backupData.cashTransactions) {
        await saveCashTransactionToFirestore(tx);
      }
    }
    if (backupData.lotteryWinners && Array.isArray(backupData.lotteryWinners)) {
      setLotteryWinners(backupData.lotteryWinners);
      for (const w of backupData.lotteryWinners) {
        await saveLotteryWinnerToFirestore(w);
      }
    }
    if (backupData.profile) {
      setProfile(backupData.profile);
      await saveProfileToFirestore(backupData.profile);
    }
  };

  // Tab Title helper
  const getTabTitle = (tab: TabType): string => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Utama';
      case 'user_portal':
        return 'Portal Data Pribadi Anggota';
      case 'messages':
        return 'Layanan Pesan & Chat Anggota';
      case 'prayer_times':
        return 'Jadwal Sholat & Kumandang Adzan';
      case 'profile':
        return 'Profil';
      case 'arisan':
        return 'Setoran Arisan (Rp 50.000)';
      case 'iuran':
        return 'Setoran Iuran Kas (Rp 20.000)';
      case 'cash_in':
        return 'Buku Kas Masuk';
      case 'cash_out':
        return 'Buku Kas Keluar';
      case 'lottery':
        return 'Kocokan Arisan';
      case 'members':
        return 'Data Nama Anggota';
      default:
        return 'Arisan Bani P3N';
    }
  };

  // Chat Messages State for global badges
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getStoredChatMessages());

  useEffect(() => {
    const handleChatUpdated = () => {
      setChatMessages(getStoredChatMessages());
    };
    window.addEventListener('paguyuban_chat_updated', handleChatUpdated);
    return () => {
      window.removeEventListener('paguyuban_chat_updated', handleChatUpdated);
    };
  }, []);

  const unreadMessagesCount = chatMessages.filter((m) => m.status === 'Baru').length;

  // If not logged in, render the Role-Based Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <LoginView
          members={members}
          onLogin={handleLogin}
          logoUrl={profile.logoUrl}
        />

        {/* Verified Barcode Online Verification Modal even on login screen */}
        {verifiedDocData && (
          <VerifiedDocumentModal
            data={verifiedDocData}
            onClose={() => {
              setVerifiedDocData(null);
              if (window.history && window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        totalMembersCount={members.length}
        unreadMessagesCount={unreadMessagesCount}
        logoUrl={profile.logoUrl}
        isFirebaseSyncing={isFirebaseSyncing}
        onOpenBackup={() => setShowBackupModal(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          darkMode={darkMode}
          onToggleTheme={toggleDarkMode}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          activeTabTitle={getTabTitle(activeTab)}
          logoUrl={profile.logoUrl}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* User Portal View for Regular Members */}
          {activeTab === 'user_portal' && (
            <UserDashboardView
              currentUser={currentUser}
              members={members}
              payments={payments}
              lotteryWinners={lotteryWinners}
              cashTransactions={cashTransactions}
              profile={profile}
              activeYear={activeYear}
              onOpenReceipt={(member, month, type) => setReceiptModal({ member, month, type })}
              onOpenWinnerCertificate={(winner) => setSelectedWinnerForCert(winner)}
              onUpdateMember={handleUpdateMember}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'dashboard' && currentUser.role === 'admin' && (
            <DashboardView
              members={members}
              payments={payments}
              cashTransactions={cashTransactions}
              lotteryWinners={lotteryWinners}
              onNavigate={setActiveTab}
              onOpenBackupModal={() => setShowBackupModal(true)}
              activeYear={activeYear}
            />
          )}

          {activeTab === 'messages' && currentUser.role === 'admin' && (
            <AdminChatView
              members={members}
              profile={profile}
              activeYear={activeYear}
            />
          )}

          {activeTab === 'prayer_times' && (
            <PrayerTimesView />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              isReadOnly={currentUser?.role === 'user'}
            />
          )}

          {activeTab === 'arisan' && (
            <ArisanView
              members={members}
              payments={payments}
              onTogglePayment={(memberId, month) => handleTogglePayment(memberId, month, 'arisan')}
              onOpenReceipt={(member, month) => setReceiptModal({ member, month, type: 'arisan' })}
              activeYear={activeYear}
            />
          )}

          {activeTab === 'iuran' && (
            <IuranView
              members={members}
              payments={payments}
              onTogglePayment={(memberId, month) => handleTogglePayment(memberId, month, 'iuran')}
              onOpenReceipt={(member, month) => setReceiptModal({ member, month, type: 'iuran' })}
              activeYear={activeYear}
            />
          )}

          {activeTab === 'cash_in' && (
            <CashInView
              transactions={cashTransactions}
              onAddTransaction={(tx) => handleAddCashTransaction(tx, 'in')}
              onDeleteTransaction={handleDeleteCashTransaction}
              onSyncFinance={handleSyncAllFinance}
            />
          )}

          {activeTab === 'cash_out' && (
            <CashOutView
              transactions={cashTransactions}
              onAddTransaction={(tx) => handleAddCashTransaction(tx, 'out')}
              onDeleteTransaction={handleDeleteCashTransaction}
              onSyncFinance={handleSyncAllFinance}
            />
          )}

          {activeTab === 'lottery' && (
            <LotteryView
              members={members}
              winners={lotteryWinners}
              profile={profile}
              onAddWinner={handleAddLotteryWinner}
              onUpdateWinner={handleUpdateLotteryWinner}
              onDeleteWinner={handleDeleteLotteryWinner}
              onUpdateProfile={handleUpdateProfile}
              activeYear={activeYear}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              members={members}
              profile={profile}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              onBulkImportMembers={handleBulkImportMembers}
              onResetDefaultMembers={async () => {
                setMembers(INITIAL_MEMBERS);
                await batchSaveMembersToFirestore(INITIAL_MEMBERS);
              }}
            />
          )}
        </main>

        {/* Bottom Application Footer */}
        <footer id="app-footer" className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Paguyuban Bani P3N Kedungbanteng @2026
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Kresno Gadhing Pramudhyo | Hak Cipta
            </p>
          </div>
        </footer>
      </div>

      {/* Printable Receipt Modal */}
      {receiptModal && (
        <ReceiptModal
          member={receiptModal.member}
          month={receiptModal.month}
          type={receiptModal.type}
          activeYear={activeYear}
          onClose={() => setReceiptModal(null)}
        />
      )}

      {/* Winner Official Certificate & Berita Acara Modal */}
      {selectedWinnerForCert && (
        <WinnerCertificateModal
          winner={selectedWinnerForCert}
          member={members.find((m) => m.id === selectedWinnerForCert.memberId)}
          profile={profile}
          onClose={() => setSelectedWinnerForCert(null)}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* Google Drive Backup & Restore Modal */}
      {showBackupModal && (
        <GoogleDriveBackupModal
          members={members}
          payments={payments}
          cashTransactions={cashTransactions}
          lotteryWinners={lotteryWinners}
          profile={profile}
          onRestoreData={handleRestoreData}
          onClose={() => setShowBackupModal(false)}
        />
      )}

      {/* Verified Barcode Online Verification Modal */}
      {verifiedDocData && (
        <VerifiedDocumentModal
          data={verifiedDocData}
          onClose={() => {
            setVerifiedDocData(null);
            // clean url without full reload
            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
        />
      )}
    </div>
  );

}
