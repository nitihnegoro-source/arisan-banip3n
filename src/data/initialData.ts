import { Member, MemberPaymentHistory, CashTransaction, LotteryWinner, PaguyubanProfile, ChatMessage } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm-1',
    no: 1,
    name: 'Darsito',
    category: 'P3N',
    phone: '081391315920',
    address: 'Desa Kalikesur',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'Bendahara Paguyuban'
  },
  {
    id: 'm-2',
    no: 2,
    name: 'Agus Setiono',
    category: 'Umum',
    phone: '082325001487',
    address: 'Desa Baturraden',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
  {
    id: 'm-3',
    no: 3,
    name: 'Sutrisno',
    category: 'Umum',
    phone: '085189003534',
    address: 'Desa Sidabowa',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'Lunas sampai Bulan 6'
  },
  {
    id: 'm-4',
    no: 4,
    name: 'Sugeng Sungkowo',
    category: 'Umum',
    phone: '085707734993',
    address: 'Desa Cilongok',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
  {
    id: 'm-5',
    no: 5,
    name: 'Abu Laits Hadi',
    category: 'Umum',
    phone: '085747302625',
    address: 'Desa Kutaliman',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
  {
    id: 'm-6',
    no: 6,
    name: 'Ali Yasin',
    category: 'Umum',
    phone: '085869459114',
    address: 'Desa Keniten',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
  {
    id: 'm-7',
    no: 7,
    name: 'M. Abdul Hamid',
    category: 'Umum',
    phone: '081335161881',
    address: 'Desa Kedungbanteng',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
  {
    id: 'm-8',
    no: 8,
    name: 'Naufal Zuhri Dz',
    category: 'Umum',
    phone: '081223958819',
    address: 'Desa Pasir',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
  {
    id: 'm-9',
    no: 9,
    name: 'M. Afham',
    category: 'Umum',
    phone: '085201192358',
    address: 'Desa Batang',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
  {
    id: 'm-10',
    no: 10,
    name: 'H. Lubab Habib PAI',
    category: 'PAI',
    phone: '081327045016',
    address: 'Desa Karangnangka',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'Ketua Paguyuban / Penyuluh Agama Islam'
  },
  {
    id: 'm-11',
    no: 11,
    name: 'Rifqoh PAI',
    category: 'PAI',
    phone: '082241155482',
    address: 'Desa Karangsalam',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'Penyuluh Agama Islam'
  },
  {
    id: 'm-12',
    no: 12,
    name: 'Khasanudin staf',
    category: 'Staf',
    phone: '085227989559',
    address: 'Desa Kedungbanteng',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'Staf KUA Kedungbanteng'
  },
  {
    id: 'm-13',
    no: 13,
    name: 'Slamet Ryd PAI',
    category: 'PAI',
    phone: '085726882622',
    address: 'Desa Pangebatan',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'Penyuluh Agama Islam'
  },
  {
    id: 'm-14',
    no: 14,
    name: 'Saefudin Zuhri PAI',
    category: 'PAI',
    phone: '081327949600',
    address: 'Desa Kebocoran',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'Penyuluh Agama Islam'
  },
  {
    id: 'm-15',
    no: 15,
    name: 'Usman PAI',
    category: 'PAI',
    phone: '089696028183',
    address: 'Desa Beji',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'Penyuluh Agama Islam'
  },
  {
    id: 'm-16',
    no: 16,
    name: 'Heru Purwanto',
    category: 'Umum',
    phone: '085876149454',
    address: 'Desa Kalibagor',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
  {
    id: 'm-17',
    no: 17,
    name: 'Tupang/Supyan p3n',
    category: 'P3N',
    phone: '083844471328',
    address: 'Desa Kedungbanteng',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Kedungbanteng'
  },
  {
    id: 'm-18',
    no: 18,
    name: 'Imam Mutaqin p3n',
    category: 'P3N',
    phone: '089520292777',
    address: 'Desa Kebocoran',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Kebocoran'
  },
  {
    id: 'm-19',
    no: 19,
    name: 'Sodik p3n Kr.salam',
    category: 'P3N',
    phone: '089675015883',
    address: 'Desa Karangsalam',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Karangsalam'
  },
  {
    id: 'm-20',
    no: 20,
    name: 'Chaeruri p3n',
    category: 'P3N',
    phone: '-',
    address: 'Desa Beji',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Beji'
  },
  {
    id: 'm-21',
    no: 21,
    name: 'Slamet Masruri p3n',
    category: 'P3N',
    phone: '082138657827',
    address: 'Desa Karangnangka',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Karangnangka'
  },
  {
    id: 'm-22',
    no: 22,
    name: 'Tofik Amin p3n',
    category: 'P3N',
    phone: '081542872825',
    address: 'Desa Keniten',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Keniten'
  },
  {
    id: 'm-23',
    no: 23,
    name: 'A. Sodikin p3n',
    category: 'P3N',
    phone: '085875066962',
    address: 'Desa Keniten',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Keniten'
  },
  {
    id: 'm-24',
    no: 24,
    name: 'Sudarwo p3n',
    category: 'P3N',
    phone: '081391475303',
    address: 'Desa Dawuhan Wetan',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Dawuhan Wetan'
  },
  {
    id: 'm-25',
    no: 25,
    name: 'Slamet Martin p3n',
    category: 'P3N',
    phone: '087822112468',
    address: 'Desa Kutaliman',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Kutaliman'
  },
  {
    id: 'm-26',
    no: 26,
    name: 'Kholil Mukhlisin p3n',
    category: 'P3N',
    phone: '083870634102',
    address: 'Desa Kalisalak',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Kalisalak'
  },
  {
    id: 'm-27',
    no: 27,
    name: 'Imam Husein p3n',
    category: 'P3N',
    phone: '082314034846',
    address: 'Desa Baseh',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Baseh'
  },
  {
    id: 'm-28',
    no: 28,
    name: "Imam Syafi'I p3n",
    category: 'P3N',
    phone: '081391331120',
    address: 'Desa Baseh',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Baseh'
  },
  {
    id: 'm-29',
    no: 29,
    name: 'Ahmad Misyadi p3n',
    category: 'P3N',
    phone: '081328126868',
    address: 'Desa Windujaya',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Windujaya - Lunas s/d Bln 6'
  },
  {
    id: 'm-30',
    no: 30,
    name: 'Sidik p3n',
    category: 'P3N',
    phone: '085878338010',
    address: 'Desa Melung',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
    notes: 'P3N Melung - Lunas s/d Bln 6'
  },
  {
    id: 'm-31',
    no: 31,
    name: 'A. Iqwamul Insif',
    category: 'Umum',
    phone: '087821512023',
    address: 'Desa Kedungbanteng',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
  {
    id: 'm-32',
    no: 32,
    name: 'Alwy Dakul',
    category: 'Umum',
    phone: '085647720008',
    address: 'Desa Dawuhan Kulon',
    status: 'Aktif',
    isArisanParticipant: true,
    isIuranParticipant: true,
    joinDate: '2026-01-01',
  },
];

// Helper to generate default payment state for year 2026 based on the uploaded document ticks
export function getInitialPaymentHistory(): MemberPaymentHistory[] {
  // Mapping of member ID to paid months in 2026
  // Iuran:
  // Month 4: [m-1..m-14, m-17..m-19, m-21..m-24, m-26..m-32]
  // Month 5: [m-2, m-3, m-5, m-6, m-7, m-8, m-9, m-11, m-12, m-13, m-17, m-18, m-21, m-22, m-23, m-24, m-27, m-28, m-29, m-30, m-31, m-32]
  // Month 6: [m-3, m-29, m-30]

  // Arisan (Month 4, 5, 6 similarly)
  const iuranMonth4 = ['m-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-7', 'm-8', 'm-9', 'm-10', 'm-11', 'm-12', 'm-13', 'm-14', 'm-17', 'm-18', 'm-19', 'm-21', 'm-22', 'm-23', 'm-24', 'm-26', 'm-27', 'm-28', 'm-29', 'm-30', 'm-31', 'm-32'];
  const iuranMonth5 = ['m-2', 'm-3', 'm-5', 'm-6', 'm-7', 'm-8', 'm-9', 'm-11', 'm-12', 'm-13', 'm-17', 'm-18', 'm-21', 'm-22', 'm-23', 'm-24', 'm-27', 'm-28', 'm-29', 'm-30', 'm-31', 'm-32'];
  const iuranMonth6 = ['m-3', 'm-29', 'm-30'];

  const arisanMonth4 = ['m-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-7', 'm-8', 'm-9', 'm-10', 'm-11', 'm-12', 'm-13', 'm-14', 'm-17', 'm-18', 'm-21', 'm-22', 'm-23', 'm-24', 'm-26', 'm-27', 'm-28', 'm-29', 'm-30', 'm-31', 'm-32'];
  const arisanMonth5 = ['m-2', 'm-3', 'm-5', 'm-6', 'm-7', 'm-8', 'm-9', 'm-10', 'm-11', 'm-12', 'm-13', 'm-17', 'm-18', 'm-21', 'm-22', 'm-23', 'm-24', 'm-27', 'm-28', 'm-29', 'm-30', 'm-31', 'm-32'];
  const arisanMonth6 = ['m-3', 'm-29', 'm-30'];

  return INITIAL_MEMBERS.map((m) => {
    const arisanHistory: { [key: string]: any } = {};
    const iuranHistory: { [key: string]: any } = {};

    for (let month = 1; month <= 12; month++) {
      const key = `2026-${month}`;
      const isArisanPaid =
        (month === 4 && arisanMonth4.includes(m.id)) ||
        (month === 5 && arisanMonth5.includes(m.id)) ||
        (month === 6 && arisanMonth6.includes(m.id));

      const isIuranPaid =
        (month === 4 && iuranMonth4.includes(m.id)) ||
        (month === 5 && iuranMonth5.includes(m.id)) ||
        (month === 6 && iuranMonth6.includes(m.id));

      arisanHistory[key] = {
        month,
        year: 2026,
        isPaid: isArisanPaid,
        paidDate: isArisanPaid ? `2026-0${month}-10` : undefined,
        amount: 50000,
        receiptNo: isArisanPaid ? `ARS-20260${month}-${m.no.toString().padStart(2, '0')}` : undefined,
      };

      iuranHistory[key] = {
        month,
        year: 2026,
        isPaid: isIuranPaid,
        paidDate: isIuranPaid ? `2026-0${month}-10` : undefined,
        amount: 20000,
        receiptNo: isIuranPaid ? `IUR-20260${month}-${m.no.toString().padStart(2, '0')}` : undefined,
      };
    }

    return {
      memberId: m.id,
      arisan: arisanHistory,
      iuran: iuranHistory,
    };
  });
}

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'tx-1',
    type: 'in',
    category: 'Saldo Awal',
    amount: 1500000,
    date: '2026-01-01',
    description: 'Saldo kas awal tahun 2026 Paguyuban Bani P3N',
    receiptNo: 'KM-2026-001',
    sourceOrRecipient: 'Kas Bendahara',
    paymentMethod: 'Tunai'
  },
  {
    id: 'tx-2',
    type: 'in',
    category: 'Setoran Iuran',
    amount: 560000, // 28 x 20.000
    date: '2026-04-10',
    description: 'Rekap Pembayaran Iuran Bulan April 2026 (28 Anggota)',
    receiptNo: 'KM-2026-004',
    sourceOrRecipient: 'Anggota Paguyuban',
    paymentMethod: 'Tunai'
  },
  {
    id: 'tx-3',
    type: 'in',
    category: 'Setoran Arisan',
    amount: 1350000, // 27 x 50.000
    date: '2026-04-10',
    description: 'Penerimaan Setoran Arisan Putaran 1 (Bulan April 2026)',
    receiptNo: 'KM-2026-005',
    sourceOrRecipient: 'Anggota Arisan',
    paymentMethod: 'Tunai'
  },
  {
    id: 'tx-4',
    type: 'out',
    category: 'Pencairan Arisan',
    amount: 1350000,
    date: '2026-04-10',
    description: 'Penyerahan Dana Arisan Putaran 1 kepada pemenang (Darsito)',
    receiptNo: 'KK-2026-001',
    sourceOrRecipient: 'Darsito',
    paymentMethod: 'Tunai'
  },
  {
    id: 'tx-5',
    type: 'out',
    category: 'Konsumsi & Pertemuan',
    amount: 150000,
    date: '2026-04-10',
    description: 'Snack & minuman pertemuan rutin bulanan April 2026 di KUA Kedungbanteng',
    receiptNo: 'KK-2026-002',
    sourceOrRecipient: 'Warung Bu Siti',
    paymentMethod: 'Tunai'
  },
  {
    id: 'tx-6',
    type: 'in',
    category: 'Setoran Iuran',
    amount: 440000, // 22 x 20.000
    date: '2026-05-10',
    description: 'Penerimaan Iuran Paguyuban Bulan Mei 2026 (22 Anggota)',
    receiptNo: 'KM-2026-006',
    sourceOrRecipient: 'Anggota Paguyuban',
    paymentMethod: 'Tunai'
  },
  {
    id: 'tx-7',
    type: 'in',
    category: 'Setoran Arisan',
    amount: 1150000, // 23 x 50.000
    date: '2026-05-10',
    description: 'Penerimaan Setoran Arisan Putaran 2 (Bulan Mei 2026)',
    receiptNo: 'KM-2026-007',
    sourceOrRecipient: 'Anggota Arisan',
    paymentMethod: 'Tunai'
  },
  {
    id: 'tx-8',
    type: 'out',
    category: 'Pencairan Arisan',
    amount: 1150000,
    date: '2026-05-10',
    description: 'Penyerahan Dana Arisan Putaran 2 kepada pemenang (Agus Setiono)',
    receiptNo: 'KK-2026-003',
    sourceOrRecipient: 'Agus Setiono',
    paymentMethod: 'Tunai'
  },
  {
    id: 'tx-9',
    type: 'out',
    category: 'Sosial & Santunan',
    amount: 200000,
    date: '2026-05-15',
    description: 'Santunan besuk keluarga anggota sakit',
    receiptNo: 'KK-2026-004',
    sourceOrRecipient: 'Keluarga Bpk. Slamet',
    paymentMethod: 'Tunai'
  }
];

export const INITIAL_LOTTERY_WINNERS: LotteryWinner[] = [
  {
    id: 'lot-1',
    roundNumber: 1,
    drawDate: '2026-04-10',
    memberId: 'm-1',
    memberName: 'Darsito',
    memberCategory: 'P3N',
    prizeAmount: 1350000,
    periodLabel: 'Putaran 1 - April 2026',
    notes: 'Kocokan perdana tahun 2026 bertempat di Balai Nikah KUA Kedungbanteng',
    disbursed: true,
    disbursedDate: '2026-04-10'
  },
  {
    id: 'lot-2',
    roundNumber: 2,
    drawDate: '2026-05-10',
    memberId: 'm-2',
    memberName: 'Agus Setiono',
    memberCategory: 'Umum',
    prizeAmount: 1150000,
    periodLabel: 'Putaran 2 - Mei 2026',
    notes: 'Pertemuan rutin bulanan Mei 2026',
    disbursed: true,
    disbursedDate: '2026-05-10'
  }
];

export const INITIAL_PAGUYUBAN_PROFILE: PaguyubanProfile = {
  name: 'Paguyuban Bani P3N & PAI',
  shortName: 'Bani P3N',
  subtitle: 'Paguyuban Keluarga Besar KUA Kecamatan Kedungbanteng',
  description: 'Wadah silaturahmi, kebersamaan, dan gotong royong bagi seluruh Pembantu Pegawai Pencatat Nikah (P3N), Penyuluh Agama Islam (PAI), serta Staf KUA di wilayah Kecamatan Kedungbanteng, Kabupaten Banyumas.',
  location: 'Kec. Kedungbanteng, Kab. Banyumas, Jawa Tengah',
  currentYear: 2026,
  vision: 'Terwujudnya ikatan silaturahmi yang kokoh, harmonis, profesional, dan berlandaskan nilai-nilai keislaman serta saling tolong-menolong di antara para pelayan masyarakat urusan agama dan pencatatan nikah di wilayah Kedungbanteng.',
  missions: [
    'Mempererat ukhuwah islamiyah melalui pertemuan rutin bulanan dan arisan bergilir.',
    'Membangun dana kas sosial (iuran kas) untuk santunan duka, besuk anggota sakit, dan kegiatan kemaslahatan.',
    'Mewujudkan sistem pengelolaan keuangan yang transparan, jujur, dan dapat diakses terbuka oleh seluruh anggota.',
    'Meningkatkan mutu koordinasi pelayanan pencatatan nikah dan bimbingan keagamaan bagi masyarakat.'
  ],
  arisanRule: {
    amountPerMonth: 50000,
    description: 'Setoran arisan bergilir yang diundi setiap pertemuan bulanan dengan sistem kocokan digital transparan.',
    rules: [
      'Wajib dibayarkan setiap putaran/bulan pada saat pertemuan atau transfer ke bendahara.',
      'Undian dilakukan dengan sistem Kocokan Otomatis Digital secara terbuka dan sah.',
      'Anggota yang sudah keluar namanya tidak akan diikutkan dalam putaran selanjutnya hingga seluruh putaran selesai.',
      'Pemenang arisan tetap berkewajiban membayar setoran arisan hingga periode tahun selesai.'
    ]
  },
  iuranRule: {
    amountPerMonth: 20000,
    description: 'Iuran wajib kas paguyuban untuk operasional, konsumsi pertemuan, dan dana sosial kemaslahatan.',
    rules: [
      'Digunakan murni untuk kas operasional paguyuban, konsumsi pertemuan rutin, dan dana sosial.',
      'Santunan duka keluarga inti atau besuk anggota yang dirawat di rumah sakit.',
      'Seluruh uang masuk dan uang keluar kas dicatat secara real-time di sistem pembukuan.',
      'Laporan saldo kas dipublikasikan berkala kepada seluruh anggota.'
    ]
  },
  meetingSchedule: 'Setiap tanggal 10 atau minggu kedua setiap bulan',
  meetingLocation: 'Balai Nikah KUA Kedungbanteng / Rumah Anggota Bergilir',
  management: [
    {
      id: 'mgr-1',
      role: 'Pelindung / Pembina',
      name: 'Kepala KUA Kec. Kedungbanteng',
      subtitle: 'Kementerian Agama Kab. Banyumas',
      phone: '081234567000'
    },
    {
      id: 'mgr-2',
      role: 'Ketua Paguyuban',
      name: 'H. Lubab Habib, S.Ag (PAI)',
      subtitle: 'Penyuluh Agama Islam KUA',
      phone: '081234567010',
      isSigner: true
    },
    {
      id: 'mgr-3',
      role: 'Sekretaris',
      name: 'Khasanudin (Staf)',
      subtitle: 'Administrasi & Data KUA',
      phone: '081234567012'
    },
    {
      id: 'mgr-4',
      role: 'Bendahara',
      name: 'Darsito (P3N)',
      subtitle: 'Pengelola Kas & Arisan',
      phone: '081234567001',
      isSigner: true
    },
    {
      id: 'mgr-5',
      role: 'Koordinator P3N',
      name: "Imam Syafi'i / Sidik",
      subtitle: 'Pembantu Pencatat Nikah',
      phone: '081234567028'
    },
    {
      id: 'mgr-6',
      role: 'Koordinator Sosial',
      name: 'Slamet Ryd / Usman PAI',
      subtitle: 'Santunan & Kepedulian Umat',
      phone: '081234567013'
    }
  ],
  contact: {
    address: 'KUA Kecamatan Kedungbanteng, Jl. Raya Kedungbanteng, Kab. Banyumas, Jawa Tengah (Kode Pos: 53152)',
    treasurerName: 'Darsito',
    treasurerPhone: '0812-3456-7001',
    chairmanName: 'H. Lubab Habib, S.Ag',
    chairmanPhone: '0812-3456-7010',
    email: 'kua.kedungbanteng@kemenag.go.id'
  },
  officialDocumentConfig: {
    chairmanTitle: 'Ketua Paguyuban Bani P3N',
    chairmanName: 'H. Lubab Habib, S.Ag',
    chairmanNip: 'Penyuluh Agama Islam KUA Kec. Kedungbanteng',
    treasurerTitle: 'Bendahara Paguyuban',
    treasurerName: 'Darsito',
    organizationLocation: 'Kedungbanteng, Banyumas',
    documentPrefix: 'BA-ARS',
    showBarcode: true,
    showStamp: true,
    stampText: 'PAGUYUBAN BANI P3N KUA KEDUNGBANTENG'
  }
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    memberId: 'm-2',
    memberName: 'Agus Setiono',
    memberCategory: 'Umum',
    memberNo: 2,
    memberPhone: '082325001487',
    recipient: 'bendahara',
    recipientName: 'Darsito',
    recipientPhone: '0812-3456-7001',
    category: 'Konfirmasi Pembayaran Transfer',
    topic: 'Konfirmasi Setoran Arisan & Iuran Mei 2026',
    message: 'Assalamu\'alaikum Pak Bendahara, saya Agus Setiono (No. Urut #02) telah mentransfer setoran arisan (Rp 50.000) dan iuran kas (Rp 20.000) total Rp 70.000 via BSI untuk bulan Mei 2026. Mohon dicek dan dicatat ya pak.',
    timestamp: '17 Mei 2026, 09:15 WIB',
    status: 'Baru',
    replies: [
      {
        id: 'rep-1',
        sender: 'user',
        senderName: 'Agus Setiono',
        senderRole: 'Anggota (#02)',
        message: 'Assalamu\'alaikum Pak Bendahara, saya Agus Setiono (No. Urut #02) telah mentransfer setoran arisan (Rp 50.000) dan iuran kas (Rp 20.000) total Rp 70.000 via BSI untuk bulan Mei 2026. Mohon dicek dan dicatat ya pak.',
        timestamp: '17 Mei 2026, 09:15 WIB',
      }
    ]
  },
  {
    id: 'msg-2',
    memberId: 'm-4',
    memberName: 'Sugeng Sungkowo',
    memberCategory: 'Umum',
    memberNo: 4,
    memberPhone: '085707734993',
    recipient: 'sekretariat',
    recipientName: 'Admin Layanan KUA Kedungbanteng',
    recipientPhone: '0812-3456-7010',
    category: 'Perbaikan Data Anggota / KTA',
    topic: 'Pengajuan Pas Foto Baru KTA Digital',
    message: 'Assalamu\'alaikum Admin Sekretariat, saya Sugeng Sungkowo (No. #04) mohon bantuan untuk update pas foto KTA digital saya dengan latar belakang resmi KUA. Sudah saya siapkan fotonya. Terima kasih.',
    timestamp: '16 Mei 2026, 14:20 WIB',
    status: 'Diproses',
    adminReply: 'Wa\'alaikumsalam Pak Sugeng. Permintaan update pas foto KTA telah kami terima. Silakan kirimkan file foto terbaru melalui portal atau WhatsApp resmi KUA Kedungbanteng agar segera kami terbitkan KTA terbarunya.',
    adminRepliedAt: '16 Mei 2026, 15:05 WIB',
    adminRepliedBy: 'Admin Layanan KUA',
    replies: [
      {
        id: 'rep-2a',
        sender: 'user',
        senderName: 'Sugeng Sungkowo',
        senderRole: 'Anggota (#04)',
        message: 'Assalamu\'alaikum Admin Sekretariat, saya Sugeng Sungkowo (No. #04) mohon bantuan untuk update pas foto KTA digital saya dengan latar belakang resmi KUA. Sudah saya siapkan fotonya. Terima kasih.',
        timestamp: '16 Mei 2026, 14:20 WIB',
      },
      {
        id: 'rep-2b',
        sender: 'admin',
        senderName: 'Admin Layanan KUA Kedungbanteng',
        senderRole: 'Sekretariat',
        message: 'Wa\'alaikumsalam Pak Sugeng. Permintaan update pas foto KTA telah kami terima. Silakan kirimkan file foto terbaru melalui portal atau WhatsApp resmi KUA Kedungbanteng agar segera kami terbitkan KTA terbarunya.',
        timestamp: '16 Mei 2026, 15:05 WIB',
      }
    ]
  },
  {
    id: 'msg-3',
    memberId: 'm-5',
    memberName: 'Abu Laits Hadi',
    memberCategory: 'Umum',
    memberNo: 5,
    memberPhone: '085747302625',
    recipient: 'ketua',
    recipientName: 'H. Lubab Habib, S.Ag',
    recipientPhone: '0812-3456-7010',
    category: 'Jadwal & Agenda Pertemuan',
    topic: 'Jadwal Kocokan & Silaturahmi Juni 2026',
    message: 'Assalamu\'alaikum Pak Ketua H. Lubab Habib, izin menanyakan untuk pertemuan dan kocokan arisan putaran berikutnya di bulan Juni apakah bertempat di Balai Nikah KUA atau giliran rumah anggota? Maturnuwun.',
    timestamp: '15 Mei 2026, 20:45 WIB',
    status: 'Dibalas',
    adminReply: 'Wa\'alaikumsalam Wr. Wb. Pak Abu Laits. Insya Allah untuk pertemuan arisan bulan Juni 2026 akan bertempat di Aula KUA Kecamatan Kedungbanteng bersamaan dengan pembinaan rutin P3N. Undangan resmi akan segera kami edarkan di grup.',
    adminRepliedAt: '16 Mei 2026, 08:30 WIB',
    adminRepliedBy: 'H. Lubab Habib, S.Ag (Ketua)',
    replies: [
      {
        id: 'rep-3a',
        sender: 'user',
        senderName: 'Abu Laits Hadi',
        senderRole: 'Anggota (#05)',
        message: 'Assalamu\'alaikum Pak Ketua H. Lubab Habib, izin menanyakan untuk pertemuan dan kocokan arisan putaran berikutnya di bulan Juni apakah bertempat di Balai Nikah KUA atau giliran rumah anggota? Maturnuwun.',
        timestamp: '15 Mei 2026, 20:45 WIB',
      },
      {
        id: 'rep-3b',
        sender: 'admin',
        senderName: 'H. Lubab Habib, S.Ag',
        senderRole: 'Ketua Paguyuban',
        message: 'Wa\'alaikumsalam Wr. Wb. Pak Abu Laits. Insya Allah untuk pertemuan arisan bulan Juni 2026 akan bertempat di Aula KUA Kecamatan Kedungbanteng bersamaan dengan pembinaan rutin P3N. Undangan resmi akan segera kami edarkan di grup.',
        timestamp: '16 Mei 2026, 08:30 WIB',
      }
    ]
  },
  {
    id: 'msg-4',
    memberId: 'm-3',
    memberName: 'Sutrisno',
    memberCategory: 'Umum',
    memberNo: 3,
    memberPhone: '085189003534',
    recipient: 'bendahara',
    recipientName: 'Darsito',
    recipientPhone: '0812-3456-7001',
    category: 'Konfirmasi Pembayaran Transfer',
    topic: 'Pelunasan Iuran & Arisan 6 Bulan di Muka',
    message: 'Assalamu\'alaikum Bendahara, saya Sutrisno mengonfirmasi setoran lunas sampai Bulan ke-6 (Juni 2026). Mohon cetak tanda terima kuitansi resminya di aplikasi ya pak. Terima kasih.',
    timestamp: '10 Mei 2026, 11:10 WIB',
    status: 'Selesai',
    adminReply: 'Wa\'alaikumsalam Pak Sutrisno. Alhamdulillah data setoran Anda lunas sampai bulan 6 sudah tercatat di sistem pembukuan, dan kuitansi ber-barcode digital sudah aktif dapat dicetak dari portal anggota kapan saja.',
    adminRepliedAt: '10 Mei 2026, 11:30 WIB',
    adminRepliedBy: 'Darsito (Bendahara)',
    replies: [
      {
        id: 'rep-4a',
        sender: 'user',
        senderName: 'Sutrisno',
        senderRole: 'Anggota (#03)',
        message: 'Assalamu\'alaikum Bendahara, saya Sutrisno mengonfirmasi setoran lunas sampai Bulan ke-6 (Juni 2026). Mohon cetak tanda terima kuitansi resminya di aplikasi ya pak. Terima kasih.',
        timestamp: '10 Mei 2026, 11:10 WIB',
      },
      {
        id: 'rep-4b',
        sender: 'admin',
        senderName: 'Darsito',
        senderRole: 'Bendahara Paguyuban',
        message: 'Wa\'alaikumsalam Pak Sutrisno. Alhamdulillah data setoran Anda lunas sampai bulan 6 sudah tercatat di sistem pembukuan, dan kuitansi ber-barcode digital sudah aktif dapat dicetak dari portal anggota kapan saja.',
        timestamp: '10 Mei 2026, 11:30 WIB',
      }
    ]
  }
];


