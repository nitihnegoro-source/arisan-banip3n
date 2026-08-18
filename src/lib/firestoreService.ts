import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Member, MemberPaymentHistory, CashTransaction, LotteryWinner, PaguyubanProfile } from '../types';

export const COLLECTIONS = {
  MEMBERS: 'members',
  PAYMENTS: 'payments',
  CASH_TRANSACTIONS: 'cash_transactions',
  LOTTERY_WINNERS: 'lottery_winners',
  APP_STATE: 'app_state',
};

const PROFILE_DOC_ID = 'paguyuban_profile';

/**
 * Save single member to Firestore
 */
export async function saveMemberToFirestore(member: Member): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.MEMBERS, member.id);
    await setDoc(docRef, member, { merge: true });
  } catch (error) {
    console.error('Error saving member to Firestore:', error);
  }
}

/**
 * Delete member from Firestore
 */
export async function deleteMemberFromFirestore(memberId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEMBERS, memberId));
    await deleteDoc(doc(db, COLLECTIONS.PAYMENTS, memberId));
  } catch (error) {
    console.error('Error deleting member from Firestore:', error);
  }
}

/**
 * Batch save all members to Firestore (e.g. initial seed or bulk import)
 */
export async function batchSaveMembersToFirestore(membersList: Member[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    membersList.forEach((m) => {
      const docRef = doc(db, COLLECTIONS.MEMBERS, m.id);
      batch.set(docRef, m, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error batch saving members to Firestore:', error);
  }
}

/**
 * Save single payment history record to Firestore
 */
export async function savePaymentHistoryToFirestore(payment: MemberPaymentHistory): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.PAYMENTS, payment.memberId);
    await setDoc(docRef, payment, { merge: true });
  } catch (error) {
    console.error('Error saving payment to Firestore:', error);
  }
}

/**
 * Batch save all payment histories to Firestore
 */
export async function batchSavePaymentsToFirestore(paymentsList: MemberPaymentHistory[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    paymentsList.forEach((p) => {
      const docRef = doc(db, COLLECTIONS.PAYMENTS, p.memberId);
      batch.set(docRef, p, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error batch saving payments to Firestore:', error);
  }
}

/**
 * Save single cash transaction to Firestore
 */
export async function saveCashTransactionToFirestore(tx: CashTransaction): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.CASH_TRANSACTIONS, tx.id);
    await setDoc(docRef, tx, { merge: true });
  } catch (error) {
    console.error('Error saving cash transaction to Firestore:', error);
  }
}

/**
 * Batch save cash transactions to Firestore
 */
export async function batchSaveCashTransactionsToFirestore(txList: CashTransaction[]): Promise<void> {
  try {
    if (txList.length === 0) return;
    const batch = writeBatch(db);
    txList.forEach((tx) => {
      const docRef = doc(db, COLLECTIONS.CASH_TRANSACTIONS, tx.id);
      batch.set(docRef, tx, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error batch saving cash transactions to Firestore:', error);
  }
}

/**
 * Batch delete cash transactions from Firestore
 */
export async function batchDeleteCashTransactionsFromFirestore(txIds: string[]): Promise<void> {
  try {
    if (txIds.length === 0) return;
    const batch = writeBatch(db);
    txIds.forEach((id) => {
      const docRef = doc(db, COLLECTIONS.CASH_TRANSACTIONS, id);
      batch.delete(docRef);
    });
    await batch.commit();
  } catch (error) {
    console.error('Error batch deleting cash transactions from Firestore:', error);
  }
}

/**
 * Delete cash transaction from Firestore
 */
export async function deleteCashTransactionFromFirestore(txId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CASH_TRANSACTIONS, txId));
  } catch (error) {
    console.error('Error deleting cash transaction from Firestore:', error);
  }
}

/**
 * Save lottery winner to Firestore
 */
export async function saveLotteryWinnerToFirestore(winner: LotteryWinner): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.LOTTERY_WINNERS, winner.id);
    await setDoc(docRef, winner, { merge: true });
  } catch (error) {
    console.error('Error saving lottery winner to Firestore:', error);
  }
}

/**
 * Delete lottery winner from Firestore
 */
export async function deleteLotteryWinnerFromFirestore(winnerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.LOTTERY_WINNERS, winnerId));
  } catch (error) {
    console.error('Error deleting lottery winner from Firestore:', error);
  }
}

/**
 * Save Paguyuban profile to Firestore
 */
export async function saveProfileToFirestore(profile: PaguyubanProfile): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.APP_STATE, PROFILE_DOC_ID);
    await setDoc(docRef, { profile, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Error saving profile to Firestore:', error);
  }
}

/**
 * Seed initial data if Firestore is empty
 */
export async function seedInitialDataIfEmpty(
  initialMembers: Member[],
  initialPayments: MemberPaymentHistory[],
  initialCashTx: CashTransaction[],
  initialWinners: LotteryWinner[],
  initialProfile: PaguyubanProfile
): Promise<void> {
  try {
    const membersSnap = await getDocs(collection(db, COLLECTIONS.MEMBERS));
    if (membersSnap.empty) {
      console.log('Seeding initial members & payments to Firestore...');
      await batchSaveMembersToFirestore(initialMembers);
      await batchSavePaymentsToFirestore(initialPayments);
      
      const batch = writeBatch(db);
      initialCashTx.forEach((tx) => {
        batch.set(doc(db, COLLECTIONS.CASH_TRANSACTIONS, tx.id), tx);
      });
      initialWinners.forEach((w) => {
        batch.set(doc(db, COLLECTIONS.LOTTERY_WINNERS, w.id), w);
      });
      batch.set(doc(db, COLLECTIONS.APP_STATE, PROFILE_DOC_ID), {
        profile: initialProfile,
        updatedAt: new Date().toISOString(),
      });
      await batch.commit();
      console.log('Initial data seeded successfully to Firebase Firestore.');
    }
  } catch (error) {
    console.warn('Could not seed initial data to Firestore (will use local state):', error);
  }
}
