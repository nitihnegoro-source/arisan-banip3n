export type MemberCategory = 'P3N' | 'PAI' | 'Staf' | 'Umum';

export interface Member {
  id: string;
  no: number;
  name: string;
  category: MemberCategory;
  phone: string;
  address?: string;
  status: 'Aktif' | 'Nonaktif';
  isArisanParticipant: boolean;
  isIuranParticipant: boolean;
  joinDate: string;
  notes?: string;
  photoUrl?: string;
  signatureUrl?: string;
  nik?: string;
}

export interface PaymentMonthRecord {
  month: number; // 1 - 12
  year: number;
  isPaid: boolean;
  paidDate?: string;
  amount: number;
  receiptNo?: string;
  notes?: string;
}

export interface MemberPaymentHistory {
  memberId: string;
  arisan: { [key: string]: PaymentMonthRecord }; // key: "2026-4", "2026-5", etc.
  iuran: { [key: string]: PaymentMonthRecord };
}

export interface CashTransaction {
  id: string;
  type: 'in' | 'out';
  category: string;
  amount: number;
  date: string;
  description: string;
  memberId?: string;
  memberName?: string;
  receiptNo: string;
  sourceOrRecipient?: string;
  paymentMethod?: 'Tunai' | 'Transfer Bank' | 'E-Wallet';
}

export interface LotteryWinner {
  id: string;
  roundNumber: number;
  drawDate: string;
  memberId: string;
  memberName: string;
  memberCategory: MemberCategory;
  prizeAmount: number;
  periodLabel: string; // e.g. "April 2026 (Bulan ke-4)"
  notes?: string;
  disbursed: boolean;
  disbursedDate?: string;
}

export interface ManagementMember {
  id: string;
  role: string;
  name: string;
  subtitle: string;
  phone?: string;
  isSigner?: boolean;
}

export interface PaguyubanProfile {
  name: string;
  shortName: string;
  subtitle: string;
  description: string;
  location: string;
  currentYear: number;
  logoUrl?: string;
  vision: string;
  missions: string[];
  arisanRule: {
    amountPerMonth: number;
    description: string;
    rules: string[];
  };
  iuranRule: {
    amountPerMonth: number;
    description: string;
    rules: string[];
  };
  meetingSchedule: string;
  meetingLocation: string;
  management: ManagementMember[];
  contact: {
    address: string;
    treasurerName: string;
    treasurerPhone: string;
    chairmanName: string;
    chairmanPhone: string;
    email: string;
  };
  officialDocumentConfig: {
    chairmanTitle: string;
    chairmanName: string;
    chairmanNip?: string;
    treasurerTitle: string;
    treasurerName: string;
    organizationLocation: string;
    documentPrefix: string;
    showBarcode: boolean;
    showStamp: boolean;
    stampText: string;
    signatureImageUrl?: string;
    kopSuratImageUrl?: string;
    useCustomKopImage?: boolean;
    treasurerSignatureImageUrl?: string;
    recipientSignatureImageUrl?: string;
  };
}

export interface PrayerTimes {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  date: string;
  hijriDate?: string;
}

export type PrayerKey = 'imsak' | 'subuh' | 'terbit' | 'dhuha' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export interface LocationInfo {
  country: string;
  province?: string;
  city: string;
  district?: string; // Kecamatan
  village?: string;  // Desa/Kelurahan
  latitude: number;
  longitude: number;
  timezone: string;
  calculationMethod: string;
}

export interface AdzanSettings {
  enabled: boolean;
  voiceType: 'makkah' | 'madinah' | 'subuh' | 'indonesia' | 'beep';
  volume: number;
  reminders: {
    imsak: boolean;
    subuh: boolean;
    dhuha: boolean;
    dzuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
  };
  alarmBeforeMinutes: number; // e.g., 0 for exact on time, or 5/10 mins before
}

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  memberId?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  loginTime?: string;
}

export interface ChatReply {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  senderRole?: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  memberCategory?: MemberCategory;
  memberNo?: number;
  memberPhone?: string;
  recipient: 'ketua' | 'bendahara' | 'sekretariat';
  recipientName: string;
  recipientPhone?: string;
  category: string;
  topic?: string;
  message: string;
  timestamp: string;
  status: 'Baru' | 'Diproses' | 'Dibalas' | 'Selesai';
  adminReply?: string;
  adminRepliedAt?: string;
  adminRepliedBy?: string;
  replies?: ChatReply[];
}


