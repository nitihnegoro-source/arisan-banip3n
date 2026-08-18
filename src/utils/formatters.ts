export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function getMonthName(monthNumber: number): string {
  return MONTH_NAMES_ID[monthNumber - 1] || `Bulan ${monthNumber}`;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function terbilangRupiah(n: number): string {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function convert(num: number): string {
    num = Math.floor(Math.abs(num));
    if (num < 12) {
      return bilangan[num];
    } else if (num < 20) {
      return convert(num - 10) + ' Belas';
    } else if (num < 100) {
      return convert(Math.floor(num / 10)) + ' Puluh' + (num % 10 !== 0 ? ' ' + convert(num % 10) : '');
    } else if (num < 200) {
      return 'Seratus' + (num - 100 !== 0 ? ' ' + convert(num - 100) : '');
    } else if (num < 1000) {
      return convert(Math.floor(num / 100)) + ' Ratus' + (num % 100 !== 0 ? ' ' + convert(num % 100) : '');
    } else if (num < 2000) {
      return 'Seribu' + (num - 1000 !== 0 ? ' ' + convert(num - 1000) : '');
    } else if (num < 1000000) {
      return convert(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
    } else if (num < 1000000000) {
      return convert(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 !== 0 ? ' ' + convert(num % 1000000) : '');
    } else if (num < 1000000000000) {
      return convert(Math.floor(num / 1000000000)) + ' Miliar' + (num % 1000000000 !== 0 ? ' ' + convert(num % 1000000000) : '');
    }
    return String(num);
  }

  if (n === 0) return 'Nol Rupiah';
  const result = convert(n).trim();
  return result + ' Rupiah';
}

export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        let str = val === undefined || val === null ? '' : String(val);
        str = str.replace(/"/g, '""');
        if (str.search(/("|,|\n)/g) >= 0) {
          str = `"${str}"`;
        }
        return str;
      })
      .join(',');
  };

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(processRow).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateWhatsAppPaymentReminder(
  memberName: string,
  phone: string,
  type: 'arisan' | 'iuran' | 'kombinasi',
  amount: number,
  period: string
): string {
  const greeting = `Assalamu'alaikum Wr. Wb. Yth. Bpk/Ibu *${memberName}*,\n\n`;
  let content = '';
  if (type === 'arisan') {
    content = `Pemberitahuan dari Pengurus *Arisan Bani P3N KUA Kedungbanteng* terkait setoran Arisan untuk periode *${period}* sebesar *${formatRupiah(amount)}*.\n\n`;
  } else if (type === 'iuran') {
    content = `Pemberitahuan dari Pengurus *Paguyuban Bani P3N KUA Kedungbanteng* terkait setoran Iuran Wajib Kas untuk periode *${period}* sebesar *${formatRupiah(amount)}*.\n\n`;
  } else {
    content = `Pemberitahuan dari Pengurus *Bani P3N KUA Kedungbanteng* terkait setoran Arisan & Iuran Kas periode *${period}* dengan total *${formatRupiah(amount)}*.\n\n`;
  }
  const footer = `Pembayaran dapat diserahkan saat pertemuan rutin bulanan atau transfer ke kas bendahara. Terima kasih atas partisipasi dan kerjasamanya.\n\nWassalamu'alaikum Wr. Wb.\n_Pengurus Arisan Bani P3N_`;
  
  const fullText = encodeURIComponent(greeting + content + footer);
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').replace(/^0/, '62') : '';
  return `https://wa.me/${cleanPhone}?text=${fullText}`;
}

export function generateWinnerNotificationWA(
  winnerName: string,
  phone: string,
  round: number,
  amount: number,
  date: string
): string {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').replace(/^0/, '62') : '';
  const text = encodeURIComponent(
    `*ALHAMDULILLAH! SELAMAT!*\n\n` +
    `Yth. Bpk/Ibu *${winnerName}*,\n\n` +
    `Berdasarkan hasil Kocokan Arisan *Bani P3N KUA Kedungbanteng*:\n` +
    `🏷️ *Putaran:* Ke-${round}\n` +
    `📅 *Tanggal:* ${formatDateIndo(date)}\n` +
    `💰 *Nominal Get Arisan:* ${formatRupiah(amount)}\n\n` +
    `Selamat kepada pemenang! Dana arisan dapat diambil melalui bendahara atau ditransfer. Semoga berkah dan bermanfaat bagi keluarga.\n\n` +
    `_Wassalamu'alaikum Wr. Wb._\n` +
    `*Pengurus Paguyuban Bani P3N Kedungbanteng*`
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
}
