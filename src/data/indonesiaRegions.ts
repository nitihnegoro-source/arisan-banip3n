export interface ProvinceData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  regencies: RegencyData[];
}

export interface RegencyData {
  id: string;
  name: string;
  type: 'Kabupaten' | 'Kota';
  lat: number;
  lng: number;
  districts: DistrictData[];
}

export interface DistrictData {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  villages: string[];
}

export interface WorldCountryData {
  code: string;
  name: string;
  nativeName: string;
  capital: string;
  lat: number;
  lng: number;
  timezone: string;
  method: string;
  flag: string;
  popularCities: { name: string; lat: number; lng: number }[];
}

// Full coverage for Kedungbanteng Banyumas villages
export const KEDUNGBANTENG_VILLAGES = [
  'Baseh',
  'Beji',
  'Dawuhan Kulon',
  'Dawuhan Wetan',
  'Kalikesur',
  'Kalisalak',
  'Karangnangka',
  'Karangsalam Kidul',
  'Kebocoran',
  'Kedungbanteng',
  'Keniten',
  'Kutaliman',
  'Melung',
  'Windujaya'
];

// Indonesian Hierarchical Data (38 Provinces, Regencies, Districts, Villages)
export const INDONESIA_PROVINCES: ProvinceData[] = [
  {
    id: 'JT',
    name: 'Jawa Tengah',
    lat: -7.150975,
    lng: 110.140259,
    regencies: [
      {
        id: 'BMS',
        name: 'Banyumas',
        type: 'Kabupaten',
        lat: -7.4567,
        lng: 109.2435,
        districts: [
          {
            id: 'KDB',
            name: 'Kedungbanteng',
            lat: -7.3686,
            lng: 109.2135,
            villages: KEDUNGBANTENG_VILLAGES,
          },
          {
            id: 'PWT_T',
            name: 'Purwokerto Timur',
            lat: -7.4243,
            lng: 109.2492,
            villages: ['Arcawinangun', 'Kranji', 'Mersi', 'Purwokerto Lor', 'Purwokerto Wetan', 'Sokanegara'],
          },
          {
            id: 'PWT_B',
            name: 'Purwokerto Barat',
            lat: -7.4215,
            lng: 109.2201,
            villages: ['Bantarsoka', 'Karanglewas Lor', 'Kedungwuluh', 'Kober', 'Pasir Kidul', 'Pasirmuncang', 'Rejasari'],
          },
          {
            id: 'PWT_U',
            name: 'Purwokerto Utara',
            lat: -7.3995,
            lng: 109.2438,
            villages: ['Bancarkembar', 'Bobosan', 'Grendeng', 'Karangwangkal', 'Pabuaran', 'Sumampir'],
          },
          {
            id: 'PWT_S',
            name: 'Purwokerto Selatan',
            lat: -7.4475,
            lng: 109.2372,
            villages: ['Berkoh', 'Karangklesem', 'Karangpucung', 'Purwokerto Kidul', 'Purwokerto Kulon', 'Tanjung', 'Teluk'],
          },
          {
            id: 'BTR',
            name: 'Baturraden',
            lat: -7.3242,
            lng: 109.2274,
            villages: ['Karangmangu', 'Karangtengah', 'Kebumen', 'Kemutug Kidul', 'Kemutug Lor', 'Ketenger', 'Kutasari', 'Pandak', 'Purwosari', 'Rempoah'],
          },
          {
            id: 'SBD',
            name: 'Sumbang',
            lat: -7.3621,
            lng: 109.2785,
            villages: ['Banjarsari Kulon', 'Banjarsari Wetan', 'Ciberem', 'Datar', 'Gandatapa', 'Karangcegak', 'Karanggintung', 'Karangturi', 'Kawungcarang', 'Kebanggan', 'Kedungmalang', 'Kotayasa', 'Limbangansari', 'Sikapat', 'Silado', 'Sumbang', 'Susukan', 'Tambaksogra'],
          },
          {
            id: 'KRL',
            name: 'Karanglewas',
            lat: -7.4110,
            lng: 109.1912,
            villages: ['Babakan', 'Jipang', 'Karanggude Kulon', 'Karangkemiri', 'Karanglewas Kidul', 'Kediri', 'Pasir Kulon', 'Pasir Lor', 'Pasir Wetan', 'Pangebatan', 'Singasari', 'Sunyalangu', 'Tamansari'],
          },
          {
            id: 'SKR',
            name: 'Sokaraja',
            lat: -7.4589,
            lng: 109.2891,
            villages: ['Banjaranyar', 'Banjarsari Kidul', 'Jompo Kulon', 'Kalikidang', 'Karangduren', 'Karangkedawung', 'Karangnanas', 'Karangrauk', 'Kedondong', 'Klahang', 'Lemberang', 'Pamijen', 'Sokaraja Kidul', 'Sokaraja Kulon', 'Sokaraja Lor', 'Sokaraja Tengah', 'Sokaraja Wetan', 'Wiradadi'],
          },
          {
            id: 'AJB',
            name: 'Ajibarang',
            lat: -7.4089,
            lng: 109.0768,
            villages: ['Ajibarang Kulon', 'Ajibarang Wetan', 'Banjarsari', 'Ciberung', 'Dharmasari', 'Kalibenda', 'Karangbawang', 'Kracak', 'Lesmana', 'Pancasan', 'Pancurendang', 'Pandansari', 'Sawangan', 'Tipar Kidul'],
          },
          {
            id: 'CIL',
            name: 'Cilongok',
            lat: -7.3980,
            lng: 109.1395,
            villages: ['Batuanten', 'Cikidang', 'Cilongok', 'Cipete', 'Gununglurah', 'Jatisaba', 'Kalisari', 'Karanglo', 'Karangtengah', 'Kasegeran', 'Langgedang', 'Panembangan', 'Pejogol', 'Pernasidi', 'Rancamaya', 'Sambirata', 'Sudimara'],
          },
          {
            id: 'WNG',
            name: 'Wangon',
            lat: -7.5182,
            lng: 109.0563,
            villages: ['Banteran', 'Cikakak', 'Jambu', 'Jatilawang', 'Jurangbahas', 'Klapagading', 'Klapagading Kulon', 'Pangadegan', 'Randegan', 'Rawaheng', 'Wangon', 'Windunegara'],
          },
          {
            id: 'BMS_D',
            name: 'Banyumas (Kota Lama)',
            lat: -7.5167,
            lng: 109.2941,
            villages: ['Binangun', 'Danaraja', 'Dawuhan', 'Kalisube', 'Karangrau', 'Kedunggede', 'Kedunguter', 'Pekunden', 'Pasinggangan', 'Papringan', 'Sudagaran', 'Sukimin'],
          }
        ]
      },
      {
        id: 'CLP',
        name: 'Cilacap',
        type: 'Kabupaten',
        lat: -7.7188,
        lng: 109.0159,
        districts: [
          { id: 'CLP_S', name: 'Cilacap Selatan', villages: ['Sidakaya', 'Tambakreja', 'Tegalkamulyan', 'Cilacap'] },
          { id: 'CLP_T', name: 'Cilacap Tengah', villages: ['Donan', 'Gunungsimping', 'Kutawaru', 'Lomanis', 'Sidanegara'] },
          { id: 'CLP_U', name: 'Cilacap Utara', villages: ['Gumilir', 'Karangkandri', 'Kranggan', 'Mertasinga', 'Tritih Kulon'] },
          { id: 'KRO', name: 'Kroya', villages: ['Ayamalas', 'Bajing', 'Bajing Kulon', 'Buntu', 'Genteng', 'Karangmangu', 'Kroya', 'Mujur', 'Mujur Lor', 'Pekuncen', 'Pucung Kidul', 'Pucung Lor', 'Sikampuh'] },
          { id: 'MJN', name: 'Majenang', villages: ['Bener', 'Bojongsari', 'Cibeunying', 'Cilopadang', 'Jenang', 'Majenang', 'Mulyadadi', 'Mulyasari', 'Padangjaya', 'Pahonjean', 'Sadabumi', 'Salebu', 'Sepatnunggal', 'Ujungbarang'] }
        ]
      },
      {
        id: 'PBG',
        name: 'Purbalingga',
        type: 'Kabupaten',
        lat: -7.3888,
        lng: 109.3639,
        districts: [
          { id: 'PBG_K', name: 'Purbalingga', villages: ['Bancarkan', 'Boenyamin', 'Jatisaba', 'Kandanggampang', 'Kedungmenjangan', 'Kembaran Kulon', 'Purbalingga Kidul', 'Purbalingga Kulon', 'Purbalingga Lor', 'Purbalingga Wetan', 'Wirasana'] },
          { id: 'KLT', name: 'Kalimanah', villages: ['Babakan', 'Blater', 'Grecol', 'Jompo', 'Kalimanah Kulon', 'Kalimanah Wetan', 'Karangpetir', 'Klapasawit', 'Manduraga', 'Mewek', 'Selabaya', 'Sidakangen'] },
          { id: 'BBS', name: 'Bobotsari', villages: ['Banjarkerta', 'Bobotsari', 'Dagan', 'Gandrungmangu', 'Gunungkarang', 'Karangduren', 'Karangmalang', 'Karangtalun', 'Limbangan', 'Majapura', 'Pakuncen', 'Palumbungan', 'Talagening'] }
        ]
      },
      {
        id: 'BNR',
        name: 'Banjarnegara',
        type: 'Kabupaten',
        lat: -7.3986,
        lng: 109.6972,
        districts: [
          { id: 'BNR_K', name: 'Banjarnegara', villages: ['Ampelsari', 'Candi', 'Karangtengah', 'Kragilan', 'Kutabanjarnegara', 'Parakancanggah', 'Semampir', 'Semarang', 'Sokanandi', 'Tlagawera', 'Wangon'] },
          { id: 'BTR_K', name: 'Batur (Dieng)', villages: ['Bakalan', 'Batur', 'Dieng Kulon', 'Karangtengah', 'Pasurenan', 'Pekasiran', 'Sumberejo'] }
        ]
      },
      {
        id: 'KBM',
        name: 'Kebumen',
        type: 'Kabupaten',
        lat: -7.6706,
        lng: 109.6586,
        districts: [
          { id: 'KBM_K', name: 'Kebumen', villages: ['Bandung', 'Bumirejo', 'Candimulyo', 'Depokrejo', 'Gemeksekti', 'Gesikan', 'Jatisari', 'Kebumen', 'Panjer', 'Selang', 'Tamanwinangun'] },
          { id: 'GOM', name: 'Gombong', villages: ['Banjarsari', 'Gombong', 'Kalitengah', 'Kedungpuji', 'Kemukus', 'Klampok', 'Patemon', 'Semanding', 'Sidayu', 'Wero'] }
        ]
      },
      {
        id: 'SMG_KTA',
        name: 'Semarang',
        type: 'Kota',
        lat: -6.9932,
        lng: 110.4203,
        districts: [
          { id: 'SMG_T', name: 'Semarang Tengah', villages: ['Bangunharjo', 'Brumbungan', 'Gabahan', 'Jagalan', 'Karangkidul', 'Kauman', 'Kembangsari', 'Kranggan', 'Miroto', 'Pandansari', 'Pekunden', 'Pendrikan Kidul', 'Pendrikan Lor', 'Purwodinatan', 'Sekayu'] },
          { id: 'SMG_B', name: 'Semarang Barat', villages: ['Bojongsalaman', 'Bongsari', 'Cabean', 'Gisikdrono', 'Kalibanteng Kidul', 'Kalibanteng Kulon', 'Karangayu', 'Kembangarum', 'Krapyak', 'Krobokan', 'Manyaran', 'Ngemplak Simongan', 'Salamanmloyo', 'Tambakharjo', 'Tawangmas', 'Tawangsari'] }
        ]
      },
      {
        id: 'SKA',
        name: 'Surakarta (Solo)',
        type: 'Kota',
        lat: -7.5666,
        lng: 110.8166,
        districts: [
          { id: 'BJR', name: 'Banjarsari', villages: ['Banyuanyar', 'Gilingan', 'Kadipiro', 'Keprabon', 'Kestalan', 'Ketelan', 'Manahan', 'Mangkubumen', 'Nusukan', 'Punggawan', 'Setabelan', 'Sumber', 'Timuran'] },
          { id: 'LWY', name: 'Laweyan', villages: ['Bumi', 'Jajar', 'Karangasem', 'Kerten', 'Laweyan', 'Pajang', 'Panularan', 'Penumping', 'Purwosari', 'Sondakan', 'Sriwedari'] }
        ]
      },
      {
        id: 'KDS',
        name: 'Kudus',
        type: 'Kabupaten',
        lat: -6.8048,
        lng: 110.8405,
        districts: [
          { id: 'KDS_K', name: 'Kota Kudus', villages: ['Barongan', 'Damaran', 'Demaan', 'Demangan', 'Glanggang', 'Janggalan', 'Kauman', 'Kragan', 'Langgardalem', 'Mlati Kidul', 'Mlati Lor', 'Mlati Norowito', 'Nganguk', 'Panjunan', 'Purwosari', 'Rendeng', 'Singocandi', 'Sunggingan', 'Wergu Kulon', 'Wergu Wetan'] }
        ]
      },
      {
        id: 'MGL',
        name: 'Magelang',
        type: 'Kota',
        lat: -7.4706,
        lng: 110.2178,
        districts: [
          { id: 'MGL_T', name: 'Magelang Tengah', villages: ['Cacaban', 'Gelangan', 'Magelang', 'Panjunan', 'Kemirirejo', 'Rejowinangun Utara'] }
        ]
      },
      {
        id: 'TEG',
        name: 'Tegal',
        type: 'Kota',
        lat: -6.8694,
        lng: 109.1402,
        districts: [
          { id: 'TEG_B', name: 'Tegal Barat', villages: ['Kraton', 'Kemandungan', 'Muarareja', 'Pekauman', 'Pesurungan Kidul', 'Tegalsari'] }
        ]
      },
      {
        id: 'PKL',
        name: 'Pekalongan',
        type: 'Kota',
        lat: -6.8886,
        lng: 109.6753,
        districts: [
          { id: 'PKL_B', name: 'Pekalongan Barat', villages: ['Bendan Kergon', 'Krapyak', 'Medono', 'Pasirkratonkramat', 'Podosugih', 'Pringrejo', 'Tirto'] }
        ]
      }
    ]
  },
  {
    id: 'DKI',
    name: 'DKI Jakarta',
    lat: -6.2088,
    lng: 106.8456,
    regencies: [
      {
        id: 'JKT_P',
        name: 'Jakarta Pusat',
        type: 'Kota',
        lat: -6.1805,
        lng: 106.8284,
        districts: [
          { id: 'GAM', name: 'Gambir', villages: ['Cideng', 'Duri Pulo', 'Gambir', 'Kebon Kelapa', 'Petojo Selatan', 'Petojo Utara'] },
          { id: 'TNA', name: 'Tanah Abang', villages: ['Bendungan Hilir', 'Gelora', 'Kampung Bali', 'Karet Tengsin', 'Kebon Kacang', 'Kebon Melati', 'Petamburan'] },
          { id: 'MNT', name: 'Menteng', villages: ['Cikini', 'Gondangdia', 'Kebon Sirih', 'Menteng', 'Pegangsaan'] }
        ]
      },
      {
        id: 'JKT_S',
        name: 'Jakarta Selatan',
        type: 'Kota',
        lat: -6.2615,
        lng: 106.8106,
        districts: [
          { id: 'KBY_B', name: 'Kebayoran Baru', villages: ['Gandaria Utara', 'Gunung', 'Kramat Pela', 'Melawai', 'Petogogan', 'Pulo', 'Rawa Barat', 'Selong', 'Senayan'] },
          { id: 'TEB', name: 'Tebet', villages: ['Bukit Duri', 'Kebon Baru', 'Manggarai', 'Manggarai Selatan', 'Menteng Dalam', 'Tebet Barat', 'Tebet Timur'] },
          { id: 'PSG', name: 'Pasar Minggu', villages: ['Cilandak Timur', 'Jati Padang', 'Kebagusan', 'Pasar Minggu', 'Pejaten Barat', 'Pejaten Timur', 'Ragunan'] }
        ]
      },
      {
        id: 'JKT_T',
        name: 'Jakarta Timur',
        type: 'Kota',
        lat: -6.2250,
        lng: 106.9004,
        districts: [
          { id: 'JTN', name: 'Jatinegara', villages: ['Bali Mester', 'Bidara Cina', 'Cipinang Besar Selatan', 'Cipinang Besar Utara', 'Cipinang Cempedak', 'Cipinang Muara', 'Kampung Melayu', 'Rawa Bunga'] },
          { id: 'DUR', name: 'Duren Sawit', villages: ['Duren Sawit', 'Klender', 'Malaka Jaya', 'Malaka Sari', 'Pondok Bambu', 'Pondok Kelapa', 'Pondok Kopi'] }
        ]
      },
      {
        id: 'JKT_B',
        name: 'Jakarta Barat',
        type: 'Kota',
        lat: -6.1683,
        lng: 106.7588,
        districts: [
          { id: 'GRB', name: 'Grogol Petamburan', villages: ['Grogol', 'Jelambar', 'Jelambar Baru', 'Tanjung Duren Selatan', 'Tanjung Duren Utara', 'Tomang', 'Wijaya Kusuma'] },
          { id: 'KBR', name: 'Kebon Jeruk', villages: ['Duri Kepa', 'Kedoya Selatan', 'Kedoya Utara', 'Kebon Jeruk', 'Kelapa Dua', 'Sukabumi Selatan', 'Sukabumi Utara'] }
        ]
      },
      {
        id: 'JKT_U',
        name: 'Jakarta Utara',
        type: 'Kota',
        lat: -6.1384,
        lng: 106.8640,
        districts: [
          { id: 'TJP', name: 'Tanjung Priok', villages: ['Kebon Bawang', 'Papanggo', 'Sungai Bambu', 'Sunter Agung', 'Sunter Jaya', 'Tanjung Priok', 'Warakas'] },
          { id: 'KLP_G', name: 'Kelapa Gading', villages: ['Kelapa Gading Barat', 'Kelapa Gading Timur', 'Pegangsaan Dua'] }
        ]
      }
    ]
  },
  {
    id: 'JB',
    name: 'Jawa Barat',
    lat: -6.9175,
    lng: 107.6191,
    regencies: [
      {
        id: 'BDG_KTA',
        name: 'Bandung',
        type: 'Kota',
        lat: -6.9175,
        lng: 107.6191,
        districts: [
          { id: 'CBL', name: 'Coblong', villages: ['Cipaganti', 'Dago', 'Lebak Siliwangi', 'Lebakgede', 'Sadang Serang', 'Sekeloa'] },
          { id: 'SUM_B', name: 'Sumur Bandung', villages: ['Babakan Ciamis', 'Braga', 'Kebon Pisang', 'Merdeka'] }
        ]
      },
      {
        id: 'BGR_KTA',
        name: 'Bogor',
        type: 'Kota',
        lat: -6.5971,
        lng: 106.8060,
        districts: [
          { id: 'BGR_T', name: 'Bogor Tengah', villages: ['Babakan', 'Babakan Pasar', 'Cibogor', 'Ciwaringin', 'Gudang', 'Kebon Kelapa', 'Pabaton', 'Paledang', 'Panaragan', 'Sempur', 'Tegallega'] }
        ]
      },
      {
        id: 'BKS_KTA',
        name: 'Bekasi',
        type: 'Kota',
        lat: -6.2383,
        lng: 106.9756,
        districts: [
          { id: 'BKS_B', name: 'Bekasi Barat', villages: ['Bintara', 'Bintara Jaya', 'Jaka Sampurna', 'Kota Baru', 'Kranji'] }
        ]
      },
      {
        id: 'DPK',
        name: 'Depok',
        type: 'Kota',
        lat: -6.4025,
        lng: 106.7942,
        districts: [
          { id: 'MCB', name: 'Pancoran Mas', villages: ['Depok', 'Depok Jaya', 'Mampang', 'Pancoran Mas', 'Rangkapan Jaya', 'Rangkapan Jaya Baru'] }
        ]
      },
      {
        id: 'CRB_KTA',
        name: 'Cirebon',
        type: 'Kota',
        lat: -6.7320,
        lng: 108.5523,
        districts: [
          { id: 'KJKS', name: 'Kejaksan', villages: ['Kebonbaru', 'Kejaksan', 'Kesenden', 'Sukapura'] }
        ]
      }
    ]
  },
  {
    id: 'JI',
    name: 'Jawa Timur',
    lat: -7.5361,
    lng: 112.2384,
    regencies: [
      {
        id: 'SBY',
        name: 'Surabaya',
        type: 'Kota',
        lat: -7.2575,
        lng: 112.7521,
        districts: [
          { id: 'TGS', name: 'Tegalsari', villages: ['Dr. Soetomo', 'Kedungdoro', 'Keputran', 'Tegalsari', 'Wonorejo'] },
          { id: 'GUB', name: 'Gubeng', villages: ['Airlangga', 'Baratajaya', 'Gubeng', 'Kertajaya', 'Mojo', 'Pucangsewu'] }
        ]
      },
      {
        id: 'MLG_KTA',
        name: 'Malang',
        type: 'Kota',
        lat: -7.9666,
        lng: 112.6326,
        districts: [
          { id: 'KLJ', name: 'Klojen', villages: ['Bareng', 'Gadingasri', 'Kasir', 'Kauman', 'Kiduldalem', 'Klojen', 'Oro-oro Dowo', 'Penanggungan', 'Rampal Celaket', 'Samaan', 'Sukoharjo'] }
        ]
      },
      {
        id: 'SDA',
        name: 'Sidoarjo',
        type: 'Kabupaten',
        lat: -7.4726,
        lng: 112.6675,
        districts: [
          { id: 'SDA_K', name: 'Sidoarjo', villages: ['Banjarbendo', 'Bluru Kidul', 'Celep', 'Cemengbakalan', 'Cemengkalang', 'Gebang', 'Jati', 'Kemiri', 'Lebo', 'Lemahputro', 'Magersari', 'Pekelingan', 'Rangkah Kidul', 'Sarirogo', 'Sekardangan', 'Sidokare', 'Sidoklumpuk', 'Sidokumpul', 'Urung-urung'] }
        ]
      },
      {
        id: 'JBR',
        name: 'Jember',
        type: 'Kabupaten',
        lat: -8.1845,
        lng: 113.6681,
        districts: [
          { id: 'KLW', name: 'Kaliwates', villages: ['Jember Kidul', 'Kaliwates', 'Kebon Agung', 'Kepatihan', 'Mangli', 'Sempusari', 'Tegal Besar'] }
        ]
      },
      {
        id: 'BWI',
        name: 'Banyuwangi',
        type: 'Kabupaten',
        lat: -8.2192,
        lng: 114.3692,
        districts: [
          { id: 'BWI_K', name: 'Banyuwangi', villages: ['Kampung Melayu', 'Karangrejo', 'Kebalenan', 'Kepatihan', 'Kertosari', 'Lateng', 'Pakis', 'Panderejo', 'Penganjuran', 'Pengantigan', 'Singonegaran', 'Singotrunan', 'Sobo', 'Sumberrejo', 'Tamanbaru', 'Temenggungan', 'Tukangkayu'] }
        ]
      }
    ]
  },
  {
    id: 'DIY',
    name: 'DI Yogyakarta',
    lat: -7.7956,
    lng: 110.3695,
    regencies: [
      {
        id: 'YOG_KTA',
        name: 'Yogyakarta',
        type: 'Kota',
        lat: -7.7956,
        lng: 110.3695,
        districts: [
          { id: 'GDT', name: 'Gondomanan', villages: ['Ngupasan', 'Prawirodirjan'] },
          { id: 'KRT', name: 'Kraton', villages: ['Kadipaten', 'Panembahan', 'Patehan'] },
          { id: 'MLI', name: 'Malioboro / Danurejan', villages: ['Bausasran', 'Suryatmajan', 'Tegalpanggung'] }
        ]
      },
      {
        id: 'SLM',
        name: 'Sleman',
        type: 'Kabupaten',
        lat: -7.7156,
        lng: 110.3556,
        districts: [
          { id: 'DPK_Y', name: 'Depok (Sleman)', villages: ['Caturtunggal', 'Condongcatur', 'Maguwoharjo'] },
          { id: 'KLS', name: 'Kalasan', villages: ['Purwomartani', 'Selomartani', 'Tamanmartani', 'Tirtomartani'] }
        ]
      },
      {
        id: 'BTL',
        name: 'Bantul',
        type: 'Kabupaten',
        lat: -7.8894,
        lng: 110.3292,
        districts: [
          { id: 'BTL_K', name: 'Bantul', villages: ['Bantul', 'Palbapang', 'Ringinharjo', 'Sabdodadi', 'Trirenggo'] }
        ]
      }
    ]
  },
  {
    id: 'BT',
    name: 'Banten',
    lat: -6.4058,
    lng: 106.0640,
    regencies: [
      {
        id: 'TGR_KTA',
        name: 'Tangerang',
        type: 'Kota',
        lat: -6.1783,
        lng: 106.6319,
        districts: [
          { id: 'TGR_C', name: 'Tangerang', villages: ['Babakan', 'Buaran Indah', 'Cikokol', 'Kelapa Indah', 'Sukasari', 'Sukaasih', 'Sukajadi', 'Tanah Tinggi'] }
        ]
      },
      {
        id: 'TGS',
        name: 'Tangerang Selatan (Tangsel)',
        type: 'Kota',
        lat: -6.2886,
        lng: 106.7179,
        districts: [
          { id: 'BSD', name: 'Serpong (BSD)', villages: ['Buaran', 'Ciater', 'Cilenggang', 'Lengkong Gudang', 'Lengkong Gudang Timur', 'Lengkong Wetan', 'Rawa Buntu', 'Rawa Mekar Jaya', 'Serpong'] }
        ]
      },
      {
        id: 'SRG_KTA',
        name: 'Serang',
        type: 'Kota',
        lat: -6.1104,
        lng: 106.1640,
        districts: [
          { id: 'SRG_C', name: 'Serang', villages: ['Cipare', 'Kagungan', 'Kaligandu', 'Kotabaru', 'Lontarbaru', 'Serang', 'Sukawana', 'Sumurpecung', 'Terondol', 'Unyur'] }
        ]
      }
    ]
  },
  {
    id: 'SU',
    name: 'Sumatera Utara',
    lat: 3.5952,
    lng: 98.6722,
    regencies: [
      {
        id: 'MDN',
        name: 'Medan',
        type: 'Kota',
        lat: 3.5952,
        lng: 98.6722,
        districts: [
          { id: 'MDN_K', name: 'Medan Kota', villages: ['Kotamatsum III', 'Mesjid', 'Pasar Baru', 'Pasar Merah Barat', 'Pusat Pasar', 'Sitirejo I', 'Sudirejo I', 'Sudirejo II', 'Teladan Barat', 'Teladan Timur'] }
        ]
      }
    ]
  },
  {
    id: 'SB',
    name: 'Sumatera Barat',
    lat: -0.9471,
    lng: 100.4172,
    regencies: [
      {
        id: 'PDG',
        name: 'Padang',
        type: 'Kota',
        lat: -0.9471,
        lng: 100.4172,
        districts: [
          { id: 'PDG_B', name: 'Padang Barat', villages: ['Belakang Tangsi', 'Berok Nipah', 'Flamboyan Baru', 'Kampung Jao', 'Kampung Pondok', 'Olo', 'Padang Pasir', 'Purus', 'Rimbo Kaluang', 'Ujung Gurun'] }
        ]
      },
      {
        id: 'BKT',
        name: 'Bukittinggi',
        type: 'Kota',
        lat: -0.3056,
        lng: 100.3692,
        districts: [
          { id: 'GBG', name: 'Guguk Panjang', villages: ['Benteng Pasar Atas', 'Bukit Apit Puhun', 'Bukit Cangang Kayu Ramang', 'Kayu Kubu', 'Pakan Kurai', 'Tarok Dipo'] }
        ]
      }
    ]
  },
  {
    id: 'RI',
    name: 'Riau',
    lat: 0.5071,
    lng: 101.4478,
    regencies: [
      {
        id: 'PKU',
        name: 'Pekanbaru',
        type: 'Kota',
        lat: 0.5071,
        lng: 101.4478,
        districts: [
          { id: 'SKJ', name: 'Sukajadi', villages: ['Harjosari', 'Jadirejo', 'Kampung Melayu', 'Kampung Tengah', 'Kedung Sari', 'Pulau Karam', 'Sukajadi'] }
        ]
      }
    ]
  },
  {
    id: 'KR',
    name: 'Kepulauan Riau',
    lat: 1.0828,
    lng: 104.0305,
    regencies: [
      {
        id: 'BTM',
        name: 'Batam',
        type: 'Kota',
        lat: 1.0828,
        lng: 104.0305,
        districts: [
          { id: 'BTM_K', name: 'Batam Kota', villages: ['Baloi Permai', 'Belian', 'Sukajadi', 'Sungai Panas', 'Taman Baloi', 'Teluk Tering'] }
        ]
      }
    ]
  },
  {
    id: 'SS',
    name: 'Sumatera Selatan',
    lat: -2.9761,
    lng: 104.7754,
    regencies: [
      {
        id: 'PLB',
        name: 'Palembang',
        type: 'Kota',
        lat: -2.9761,
        lng: 104.7754,
        districts: [
          { id: 'ILR_B', name: 'Ilir Barat I', villages: ['26 Ilir D. I', 'Bukit Baru', 'Bukit Lama', 'Demang Lebar Daun', 'Lorok Pakjo', 'Siring Agung'] }
        ]
      }
    ]
  },
  {
    id: 'LA',
    name: 'Lampung',
    lat: -5.4500,
    lng: 105.2667,
    regencies: [
      {
        id: 'BDL',
        name: 'Bandar Lampung',
        type: 'Kota',
        lat: -5.4500,
        lng: 105.2667,
        districts: [
          { id: 'TKB', name: 'Tanjung Karang Barat', villages: ['Gedong Air', 'Kelapa Tiga', 'Segala Mider', 'Sukadanaham', 'Susunan Baru'] }
        ]
      }
    ]
  },
  {
    id: 'AC',
    name: 'Aceh',
    lat: 5.5483,
    lng: 95.3238,
    regencies: [
      {
        id: 'BNA',
        name: 'Banda Aceh',
        type: 'Kota',
        lat: 5.5483,
        lng: 95.3238,
        districts: [
          { id: 'KTR', name: 'Kuta Raja', villages: ['Gampong Jawa', 'Gampong Pande', 'Gampong Peulanggahan', 'Keudah', 'Merduati', 'Lampaseh Kota'] }
        ]
      }
    ]
  },
  {
    id: 'BA',
    name: 'Bali',
    lat: -8.6705,
    lng: 115.2126,
    regencies: [
      {
        id: 'DPS',
        name: 'Denpasar',
        type: 'Kota',
        lat: -8.6705,
        lng: 115.2126,
        districts: [
          { id: 'DPS_B', name: 'Denpasar Barat', villages: ['Dauh Puri', 'Dauh Puri Kangin', 'Dauh Puri Kauh', 'Dauh Puri Klod', 'Padangsambian', 'Padangsambian Klod', 'Pemecutan', 'Pemecutan Klod', 'Tegal Harum', 'Tegal Kertha'] }
        ]
      }
    ]
  },
  {
    id: 'NB',
    name: 'Nusa Tenggara Barat',
    lat: -8.5772,
    lng: 116.0963,
    regencies: [
      {
        id: 'MTR',
        name: 'Mataram (Lombok)',
        type: 'Kota',
        lat: -8.5772,
        lng: 116.0963,
        districts: [
          { id: 'MTR_C', name: 'Mataram', villages: ['Mataram Timur', 'Pagesangan', 'Pagesangan Barat', 'Pagesangan Timur', 'Pagutan', 'Pagutan Barat', 'Pagutan Timur', 'Pejanggik', 'Punia'] }
        ]
      }
    ]
  },
  {
    id: 'NT',
    name: 'Nusa Tenggara Timur',
    lat: -10.1772,
    lng: 123.6070,
    regencies: [
      {
        id: 'KPG',
        name: 'Kupang',
        type: 'Kota',
        lat: -10.1772,
        lng: 123.6070,
        districts: [
          { id: 'KPG_C', name: 'Kota Raja', villages: ['Airnona', 'Bakunase', 'Bakunase II', 'Fontein', 'Kuanino', 'Manutapen', 'Naikoten I', 'Naikoten II', 'Nunleu'] }
        ]
      }
    ]
  },
  {
    id: 'KB',
    name: 'Kalimantan Barat',
    lat: -0.0263,
    lng: 109.3425,
    regencies: [
      {
        id: 'PTK',
        name: 'Pontianak',
        type: 'Kota',
        lat: -0.0263,
        lng: 109.3425,
        districts: [
          { id: 'PTK_K', name: 'Pontianak Kota', villages: ['Darat Sekip', 'Mariana', 'Sungai Bangkong', 'Sungai Jawi', 'Tengah'] }
        ]
      }
    ]
  },
  {
    id: 'KT',
    name: 'Kalimantan Timur',
    lat: -0.5022,
    lng: 117.1536,
    regencies: [
      {
        id: 'SMD',
        name: 'Samarinda',
        type: 'Kota',
        lat: -0.5022,
        lng: 117.1536,
        districts: [
          { id: 'SMD_K', name: 'Samarinda Kota', villages: ['Bugis', 'Karang Mumus', 'Pelabuhan', 'Pasar Pagi', 'Sungai Pinang Luar'] }
        ]
      },
      {
        id: 'BPP',
        name: 'Balikpapan',
        type: 'Kota',
        lat: -1.2654,
        lng: 116.8312,
        districts: [
          { id: 'BPP_K', name: 'Balikpapan Kota', villages: ['Damai', 'Klandasan Ilir', 'Klandasan Ulu', 'Prapatan', 'Telaga Sari'] }
        ]
      },
      {
        id: 'IKN',
        name: 'Ibu Kota Nusantara (IKN / Sepaku)',
        type: 'Kabupaten',
        lat: -0.9634,
        lng: 116.7028,
        districts: [
          { id: 'SPK', name: 'Sepaku', villages: ['Bumi Harapan', 'Bukit Raya', 'Pemaluan', 'Semoi Dua', 'Sukamaja', 'Sukareja', 'Tengin Baru'] }
        ]
      }
    ]
  },
  {
    id: 'KS',
    name: 'Kalimantan Selatan',
    lat: -3.3167,
    lng: 114.5901,
    regencies: [
      {
        id: 'BJM',
        name: 'Banjarmasin',
        type: 'Kota',
        lat: -3.3167,
        lng: 114.5901,
        districts: [
          { id: 'BJM_T', name: 'Banjarmasin Tengah', villages: ['Antasan Besar', 'Gadang', 'Kertak Baru Ilir', 'Kertak Baru Ulu', 'Mawar', 'Melayu', 'Pasar Lama', 'Pekapuran Laut', 'Seberang Mesjid', 'Sungai Baru', 'Teluk Dalam', 'Kelayan'] }
        ]
      }
    ]
  },
  {
    id: 'SA',
    name: 'Sulawesi Selatan',
    lat: -5.1477,
    lng: 119.4327,
    regencies: [
      {
        id: 'MKS',
        name: 'Makassar',
        type: 'Kota',
        lat: -5.1477,
        lng: 119.4327,
        districts: [
          { id: 'UJ_P', name: 'Ujung Pandang', villages: ['Baru', 'Bulogading', 'Lae-Lae', 'Lajangiru', 'Losari', 'Maloku', 'Mangkura', 'Pisang Selatan', 'Pisang Utara', 'Sawerigading'] },
          { id: 'PNT', name: 'Panakkukang', villages: ['Karampuang', 'Karuwisi', 'Karuwisi Utara', 'Masale', 'Pampang', 'Panaikang', 'Pandang', 'Sinrijawa', 'Tamamaung', 'Tello Baru'] }
        ]
      }
    ]
  },
  {
    id: 'SN',
    name: 'Sulawesi Utara',
    lat: 1.4748,
    lng: 124.8428,
    regencies: [
      {
        id: 'MND',
        name: 'Manado',
        type: 'Kota',
        lat: 1.4748,
        lng: 124.8428,
        districts: [
          { id: 'WNN', name: 'Wenang', villages: ['Bumi Beringin', 'Calaca', 'Istiqomah', 'Komo Luar', 'Lawangirung', 'Mahakeret Barat', 'Mahakeret Timur', 'Pinaesaan', 'Tikala Kumaraka', 'Teling Bawah', 'Wenang Selatan', 'Wenang Utara'] }
        ]
      }
    ]
  },
  {
    id: 'PA',
    name: 'Papua',
    lat: -2.5916,
    lng: 140.6690,
    regencies: [
      {
        id: 'JPR',
        name: 'Jayapura',
        type: 'Kota',
        lat: -2.5916,
        lng: 140.6690,
        districts: [
          { id: 'JPR_U', name: 'Jayapura Utara', villages: ['Angkasapura', 'Bayangkara', 'Gurabesi', 'Imbi', 'Mandiri', 'Tanjung Ria', 'Trikora'] }
        ]
      }
    ]
  }
];

// World Countries List with Capital & Coordinates & calculation method
export const WORLD_COUNTRIES: WorldCountryData[] = [
  {
    code: 'ID',
    name: 'Indonesia',
    nativeName: 'Indonesia',
    capital: 'Jakarta (Kec. Kedungbanteng Banyumas)',
    lat: -6.2088,
    lng: 106.8456,
    timezone: 'Asia/Jakarta',
    method: 'KEMENAG',
    flag: '🇮🇩',
    popularCities: [
      { name: 'Kedungbanteng (Banyumas)', lat: -7.3686, lng: 109.2135 },
      { name: 'Purwokerto (Banyumas)', lat: -7.4243, lng: 109.2492 },
      { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
      { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
      { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
      { name: 'Semarang', lat: -6.9932, lng: 110.4203 },
      { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
      { name: 'Medan', lat: 3.5952, lng: 98.6722 },
      { name: 'Makassar', lat: -5.1477, lng: 119.4327 },
      { name: 'Banda Aceh', lat: 5.5483, lng: 95.3238 },
      { name: 'Palembang', lat: -2.9761, lng: 104.7754 },
      { name: 'Denpasar', lat: -8.6705, lng: 115.2126 },
      { name: 'Balikpapan', lat: -1.2654, lng: 116.8312 },
      { name: 'Nusantara (IKN)', lat: -0.9634, lng: 116.7028 },
    ]
  },
  {
    code: 'SA',
    name: 'Arab Saudi (Saudi Arabia)',
    nativeName: 'المملكة العربية السعودية',
    capital: 'Riyadh',
    lat: 24.7136,
    lng: 46.6753,
    timezone: 'Asia/Riyadh',
    method: 'UMM_AL_QURA',
    flag: '🇸🇦',
    popularCities: [
      { name: 'Makkah Al-Mukarramah (Masjidil Haram)', lat: 21.4225, lng: 39.8262 },
      { name: 'Madinah Al-Munawwarah (Masjid Nabawi)', lat: 24.4672, lng: 39.6111 },
      { name: 'Jeddah', lat: 21.4858, lng: 39.1925 },
      { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
      { name: 'Dammam', lat: 26.4207, lng: 50.0888 },
      { name: 'Taif', lat: 21.2854, lng: 40.4222 }
    ]
  },
  {
    code: 'MY',
    name: 'Malaysia',
    nativeName: 'Malaysia',
    capital: 'Kuala Lumpur',
    lat: 3.1390,
    lng: 101.6869,
    timezone: 'Asia/Kuala_Lumpur',
    method: 'JAKIM',
    flag: '🇲🇾',
    popularCities: [
      { name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
      { name: 'Putrajaya', lat: 2.9264, lng: 101.6964 },
      { name: 'George Town (Penang)', lat: 5.4141, lng: 100.3288 },
      { name: 'Johor Bahru', lat: 1.4927, lng: 103.7414 },
      { name: 'Kota Kinabalu', lat: 5.9804, lng: 116.0735 },
      { name: 'Kuching', lat: 1.5533, lng: 110.3592 }
    ]
  },
  {
    code: 'SG',
    name: 'Singapura (Singapore)',
    nativeName: 'Singapore',
    capital: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    timezone: 'Asia/Singapore',
    method: 'MUIS',
    flag: '🇸🇬',
    popularCities: [
      { name: 'Singapore (Central)', lat: 1.3521, lng: 103.8198 },
      { name: 'Jurong East', lat: 1.3329, lng: 103.7436 },
      { name: 'Tampines', lat: 1.3525, lng: 103.9447 }
    ]
  },
  {
    code: 'BN',
    name: 'Brunei Darussalam',
    nativeName: 'Brunei',
    capital: 'Bandar Seri Begawan',
    lat: 4.9031,
    lng: 114.9398,
    timezone: 'Asia/Brunei',
    method: 'KEMENAG',
    flag: '🇧🇳',
    popularCities: [
      { name: 'Bandar Seri Begawan', lat: 4.9031, lng: 114.9398 },
      { name: 'Kuala Belait', lat: 4.5833, lng: 114.2333 }
    ]
  },
  {
    code: 'EG',
    name: 'Mesir (Egypt)',
    nativeName: 'مصر',
    capital: 'Kairo (Cairo)',
    lat: 30.0444,
    lng: 31.2357,
    timezone: 'Africa/Cairo',
    method: 'EGYPT',
    flag: '🇪🇬',
    popularCities: [
      { name: 'Kairo (Al-Azhar)', lat: 30.0444, lng: 31.2357 },
      { name: 'Alexandria', lat: 31.2001, lng: 29.9187 },
      { name: 'Giza', lat: 30.0131, lng: 31.2089 },
      { name: 'Luxor', lat: 25.6872, lng: 32.6396 }
    ]
  },
  {
    code: 'TR',
    name: 'Turki (Turkey)',
    nativeName: 'Türkiye',
    capital: 'Ankara',
    lat: 39.9334,
    lng: 32.8597,
    timezone: 'Europe/Istanbul',
    method: 'DIYANET',
    flag: '🇹🇷',
    popularCities: [
      { name: 'Istanbul (Hagia Sophia)', lat: 41.0082, lng: 28.9784 },
      { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
      { name: 'Izmir', lat: 38.4237, lng: 27.1428 },
      { name: 'Bursa', lat: 40.1885, lng: 29.0610 },
      { name: 'Konya', lat: 37.8746, lng: 32.4932 }
    ]
  },
  {
    code: 'AE',
    name: 'Uni Emirat Arab (UAE)',
    nativeName: 'الإمارات العربية المتحدة',
    capital: 'Abu Dhabi',
    lat: 24.4539,
    lng: 54.3773,
    timezone: 'Asia/Dubai',
    method: 'MWL',
    flag: '🇦🇪',
    popularCities: [
      { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
      { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
      { name: 'Sharjah', lat: 25.3573, lng: 55.4033 }
    ]
  },
  {
    code: 'PS',
    name: 'Palestina (Palestine / Al-Quds)',
    nativeName: 'فلسطين',
    capital: 'Al-Quds (Jerusalem)',
    lat: 31.7683,
    lng: 35.2137,
    timezone: 'Asia/Gaza',
    method: 'MWL',
    flag: '🇵🇸',
    popularCities: [
      { name: 'Al-Quds (Masjid Al-Aqsa)', lat: 31.7761, lng: 35.2358 },
      { name: 'Gaza', lat: 31.5017, lng: 34.4668 },
      { name: 'Ramallah', lat: 31.9038, lng: 35.2034 },
      { name: 'Hebron (Al-Khalil)', lat: 31.5326, lng: 35.0998 }
    ]
  },
  {
    code: 'JO',
    name: 'Yordania (Jordan)',
    nativeName: 'الأردن',
    capital: 'Amman',
    lat: 31.9454,
    lng: 35.9284,
    timezone: 'Asia/Amman',
    method: 'MWL',
    flag: '🇯🇴',
    popularCities: [
      { name: 'Amman', lat: 31.9454, lng: 35.9284 },
      { name: 'Zarqa', lat: 32.0728, lng: 36.0880 },
      { name: 'Irbid', lat: 32.5568, lng: 35.8469 }
    ]
  },
  {
    code: 'JP',
    name: 'Jepang (Japan)',
    nativeName: '日本',
    capital: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    timezone: 'Asia/Tokyo',
    method: 'MWL',
    flag: '🇯🇵',
    popularCities: [
      { name: 'Tokyo (Tokyo Camii)', lat: 35.6762, lng: 139.6503 },
      { name: 'Osaka', lat: 34.6937, lng: 135.5023 },
      { name: 'Kyoto', lat: 35.0116, lng: 135.7681 },
      { name: 'Nagoya', lat: 35.1815, lng: 136.9066 },
      { name: 'Fukuoka', lat: 33.5904, lng: 130.4017 }
    ]
  },
  {
    code: 'KR',
    name: 'Korea Selatan (South Korea)',
    nativeName: '대한민국',
    capital: 'Seoul',
    lat: 37.5665,
    lng: 126.9780,
    timezone: 'Asia/Seoul',
    method: 'MWL',
    flag: '🇰🇷',
    popularCities: [
      { name: 'Seoul (Seoul Central Mosque)', lat: 37.5665, lng: 126.9780 },
      { name: 'Busan', lat: 35.1796, lng: 129.0756 },
      { name: 'Incheon', lat: 37.4563, lng: 126.7052 }
    ]
  },
  {
    code: 'GB',
    name: 'Inggris / Britania Raya (UK)',
    nativeName: 'United Kingdom',
    capital: 'London',
    lat: 51.5074,
    lng: -0.1278,
    timezone: 'Europe/London',
    method: 'MWL',
    flag: '🇬🇧',
    popularCities: [
      { name: 'London (Regent\'s Park Mosque)', lat: 51.5074, lng: -0.1278 },
      { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
      { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
      { name: 'Glasgow', lat: 55.8642, lng: -4.2518 }
    ]
  },
  {
    code: 'US',
    name: 'Amerika Serikat (USA)',
    nativeName: 'United States',
    capital: 'Washington, D.C.',
    lat: 38.9072,
    lng: -77.0369,
    timezone: 'America/New_York',
    method: 'ISNA',
    flag: '🇺🇸',
    popularCities: [
      { name: 'New York City', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'Houston', lat: 29.7604, lng: -95.3698 },
      { name: 'Washington, D.C.', lat: 38.9072, lng: -77.0369 }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    nativeName: 'Australia',
    capital: 'Canberra',
    lat: -35.2809,
    lng: 149.1300,
    timezone: 'Australia/Sydney',
    method: 'MWL',
    flag: '🇦🇺',
    popularCities: [
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
      { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
      { name: 'Perth', lat: -31.9505, lng: 115.8605 }
    ]
  },
  {
    code: 'DE',
    name: 'Jerman (Germany)',
    nativeName: 'Deutschland',
    capital: 'Berlin',
    lat: 52.5200,
    lng: 13.4050,
    timezone: 'Europe/Berlin',
    method: 'MWL',
    flag: '🇩🇪',
    popularCities: [
      { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
      { name: 'Munich', lat: 48.1351, lng: 11.5820 },
      { name: 'Cologne (Köln Central Mosque)', lat: 50.9375, lng: 6.9603 }
    ]
  },
  {
    code: 'FR',
    name: 'Prancis (France)',
    nativeName: 'France',
    capital: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    timezone: 'Europe/Paris',
    method: 'MWL',
    flag: '🇫🇷',
    popularCities: [
      { name: 'Paris (Grande Mosquée)', lat: 48.8566, lng: 2.3522 },
      { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
      { name: 'Lyon', lat: 45.7640, lng: 4.8357 }
    ]
  },
  {
    code: 'PK',
    name: 'Pakistan',
    nativeName: 'پاکستان',
    capital: 'Islamabad',
    lat: 33.6844,
    lng: 73.0479,
    timezone: 'Asia/Karachi',
    method: 'KARACHI',
    flag: '🇵🇰',
    popularCities: [
      { name: 'Islamabad (Faisal Mosque)', lat: 33.6844, lng: 73.0479 },
      { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
      { name: 'Lahore (Badshahi Mosque)', lat: 31.5204, lng: 74.3587 }
    ]
  },
  {
    code: 'IN',
    name: 'India',
    nativeName: 'India',
    capital: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090,
    timezone: 'Asia/Kolkata',
    method: 'MWL',
    flag: '🇮🇳',
    popularCities: [
      { name: 'New Delhi (Jama Masjid)', lat: 28.6139, lng: 77.2090 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 }
    ]
  },
  {
    code: 'NL',
    name: 'Belanda (Netherlands)',
    nativeName: 'Nederland',
    capital: 'Amsterdam',
    lat: 52.3676,
    lng: 4.9041,
    timezone: 'Europe/Amsterdam',
    method: 'MWL',
    flag: '🇳🇱',
    popularCities: [
      { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
      { name: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
      { name: 'Den Haag', lat: 52.0705, lng: 4.3007 }
    ]
  }
];

// Helper: Search across Indonesian Provinces, Regencies, Districts, Villages
export function searchIndonesianLocation(query: string): Array<{
  province: string;
  regency: string;
  district: string;
  village?: string;
  lat: number;
  lng: number;
  label: string;
}> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: Array<{
    province: string;
    regency: string;
    district: string;
    village?: string;
    lat: number;
    lng: number;
    label: string;
  }> = [];

  for (const prov of INDONESIA_PROVINCES) {
    for (const reg of prov.regencies) {
      for (const dist of reg.districts) {
        // Match District
        if (dist.name.toLowerCase().includes(q)) {
          results.push({
            province: prov.name,
            regency: `${reg.type} ${reg.name}`,
            district: dist.name,
            lat: dist.lat || reg.lat,
            lng: dist.lng || reg.lng,
            label: `Kec. ${dist.name}, ${reg.type} ${reg.name}, ${prov.name}`
          });
        }

        // Match Villages
        for (const vil of dist.villages) {
          if (vil.toLowerCase().includes(q)) {
            results.push({
              province: prov.name,
              regency: `${reg.type} ${reg.name}`,
              district: dist.name,
              village: vil,
              lat: dist.lat || reg.lat,
              lng: dist.lng || reg.lng,
              label: `Desa/Kel. ${vil}, Kec. ${dist.name}, ${reg.type} ${reg.name}, ${prov.name}`
            });
          }
        }
      }

      // Match Regency
      if (reg.name.toLowerCase().includes(q)) {
        results.push({
          province: prov.name,
          regency: `${reg.type} ${reg.name}`,
          district: reg.districts[0]?.name || '',
          lat: reg.lat,
          lng: reg.lng,
          label: `${reg.type} ${reg.name}, ${prov.name}`
        });
      }
    }
  }

  // Deduplicate and limit to 15 best matches
  const seen = new Set<string>();
  return results.filter(item => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  }).slice(0, 15);
}
