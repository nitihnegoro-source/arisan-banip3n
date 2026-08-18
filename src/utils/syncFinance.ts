import { Member, MemberPaymentHistory, CashTransaction, LotteryWinner } from '../types';
import { MONTH_NAMES_ID } from './formatters';

/**
 * Builds the synchronized Cash In transaction for a member's Arisan deposit
 */
export function buildArisanSyncTransaction(
  member: Member,
  month: number,
  year: number,
  paidDate?: string
): CashTransaction {
  const monthName = MONTH_NAMES_ID[month - 1] || `Bulan ${month}`;
  const formattedDate = paidDate || new Date().toISOString().split('T')[0];
  const receiptNo = `KW-ARS/${year}/${month.toString().padStart(2, '0')}/${member.no.toString().padStart(3, '0')}`;

  return {
    id: `tx-sync-arisan-${member.id}-${year}-${month}`,
    type: 'in',
    category: 'Setoran Arisan',
    amount: 50000,
    date: formattedDate,
    description: `Setoran Arisan ${monthName} ${year} - ${member.name} (${member.category})`,
    memberId: member.id,
    memberName: member.name,
    sourceOrRecipient: `${member.name} (${member.category})`,
    receiptNo,
    paymentMethod: 'Tunai',
  };
}

/**
 * Builds the synchronized Cash In transaction for a member's Iuran Kas deposit
 */
export function buildIuranSyncTransaction(
  member: Member,
  month: number,
  year: number,
  paidDate?: string
): CashTransaction {
  const monthName = MONTH_NAMES_ID[month - 1] || `Bulan ${month}`;
  const formattedDate = paidDate || new Date().toISOString().split('T')[0];
  const receiptNo = `KW-IUR/${year}/${month.toString().padStart(2, '0')}/${member.no.toString().padStart(3, '0')}`;

  return {
    id: `tx-sync-iuran-${member.id}-${year}-${month}`,
    type: 'in',
    category: 'Setoran Iuran',
    amount: 20000,
    date: formattedDate,
    description: `Setoran Iuran Kas ${monthName} ${year} - ${member.name} (${member.category})`,
    memberId: member.id,
    memberName: member.name,
    sourceOrRecipient: `${member.name} (${member.category})`,
    receiptNo,
    paymentMethod: 'Tunai',
  };
}

/**
 * Builds the synchronized Cash Out transaction for a Lottery Winner payout
 */
export function buildLotterySyncTransaction(
  winner: LotteryWinner,
  year: number
): CashTransaction {
  const formattedDate = winner.drawDate || new Date().toISOString().split('T')[0];
  const cleanIdSuffix = winner.id.replace('lot-', '').slice(-3).padStart(3, '0');
  const receiptNo = `KK-ARS/${year}/${winner.roundNumber.toString().padStart(2, '0')}/${cleanIdSuffix}`;

  return {
    id: `tx-sync-lottery-${winner.id}`,
    type: 'out',
    category: 'Pencairan Arisan',
    amount: winner.prizeAmount,
    date: formattedDate,
    description: `Pencairan dana Hasil Undian Arisan Putaran ke-${winner.roundNumber} (${winner.periodLabel || 'Periode ' + year}) kepada ${winner.memberName} (${winner.memberCategory})`,
    memberId: winner.memberId,
    memberName: winner.memberName,
    sourceOrRecipient: `${winner.memberName} (${winner.memberCategory})`,
    receiptNo,
    paymentMethod: 'Tunai',
  };
}

export interface ReconcileResult {
  reconciledTransactions: CashTransaction[];
  addedTransactions: CashTransaction[];
  deletedTxIds: string[];
  totalSyncedInCount: number;
  totalSyncedInAmount: number;
  totalSyncedOutCount: number;
  totalSyncedOutAmount: number;
}

/**
 * Reconciles all payments (arisan & iuran) and lottery winners with cash transactions.
 * Non-sync manual transactions (e.g. Saldo Awal, Infaq, Konsumsi, Santunan) are preserved.
 */
export function reconcileAllTransactions(
  members: Member[],
  payments: MemberPaymentHistory[],
  winners: LotteryWinner[],
  currentTransactions: CashTransaction[],
  activeYear: number
): ReconcileResult {
  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const expectedSyncTransactions: CashTransaction[] = [];
  const expectedSyncIds = new Set<string>();

  // 1. Process all Member Payments (Arisan & Iuran)
  payments.forEach((p) => {
    const member = memberMap.get(p.memberId);
    if (!member) return;

    for (let m = 1; m <= 12; m++) {
      const key = `${activeYear}-${m}`;
      
      // Arisan
      const arisanRecord = p.arisan?.[key];
      if (arisanRecord && arisanRecord.isPaid) {
        const tx = buildArisanSyncTransaction(member, m, activeYear, arisanRecord.paidDate);
        expectedSyncTransactions.push(tx);
        expectedSyncIds.add(tx.id);
      }

      // Iuran
      const iuranRecord = p.iuran?.[key];
      if (iuranRecord && iuranRecord.isPaid) {
        const tx = buildIuranSyncTransaction(member, m, activeYear, iuranRecord.paidDate);
        expectedSyncTransactions.push(tx);
        expectedSyncIds.add(tx.id);
      }
    }
  });

  // 2. Process all Lottery Winners
  winners.forEach((w) => {
    const tx = buildLotterySyncTransaction(w, activeYear);
    expectedSyncTransactions.push(tx);
    expectedSyncIds.add(tx.id);
  });

  // 3. Separate existing transactions into manual vs sync
  // Note: Old transactions with manual IDs that match legacy sample names can be migrated or kept
  const existingMap = new Map<string, CashTransaction>();
  currentTransactions.forEach((tx) => existingMap.set(tx.id, tx));

  const manualTransactions: CashTransaction[] = [];
  const deletedTxIds: string[] = [];
  const addedTransactions: CashTransaction[] = [];

  currentTransactions.forEach((tx) => {
    if (tx.id.startsWith('tx-sync-')) {
      // It's a sync transaction
      if (!expectedSyncIds.has(tx.id)) {
        // It was removed/unmarked, so it should be deleted
        deletedTxIds.push(tx.id);
      }
    } else {
      // Manual transaction (e.g. Saldo Awal, Infaq, Konsumsi, etc.)
      manualTransactions.push(tx);
    }
  });

  // Check which expected sync transactions are new or need updating
  expectedSyncTransactions.forEach((expectedTx) => {
    const existing = existingMap.get(expectedTx.id);
    if (!existing) {
      addedTransactions.push(expectedTx);
    }
  });

  // Merge manual transactions and all expected sync transactions
  const allReconciled = [...manualTransactions, ...expectedSyncTransactions];

  // Sort by date descending (newest first)
  allReconciled.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let totalSyncedInCount = 0;
  let totalSyncedInAmount = 0;
  let totalSyncedOutCount = 0;
  let totalSyncedOutAmount = 0;

  expectedSyncTransactions.forEach((tx) => {
    if (tx.type === 'in') {
      totalSyncedInCount++;
      totalSyncedInAmount += tx.amount;
    } else {
      totalSyncedOutCount++;
      totalSyncedOutAmount += tx.amount;
    }
  });

  return {
    reconciledTransactions: allReconciled,
    addedTransactions,
    deletedTxIds,
    totalSyncedInCount,
    totalSyncedInAmount,
    totalSyncedOutCount,
    totalSyncedOutAmount,
  };
}
