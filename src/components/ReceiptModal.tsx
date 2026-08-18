import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Download, 
  MessageCircle, 
  ShieldCheck, 
  Building2,
  CheckCircle2,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { Member } from '../types';
import { formatRupiah, formatDateIndo, MONTH_NAMES_ID } from '../utils/formatters';

interface ReceiptModalProps {
  member: Member | null;
  month: number;
  type: 'arisan' | 'iuran';
  activeYear: number;
  onClose: () => void;
  onOpenPdfVerification?: (urlParams: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  member,
  month,
  type,
  activeYear,
  onClose,
  onOpenPdfVerification,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  if (!member) return null;

  const amount = type === 'arisan' ? 50000 : 20000;
  const monthName = MONTH_NAMES_ID[month - 1];
  const receiptNo = `${type === 'arisan' ? 'KW-ARS' : 'KW-IUR'}/${activeYear}/${month.toString().padStart(2, '0')}/${member.no.toString().padStart(3, '0')}`;
  const currentDateStr = formatDateIndo(new Date().toISOString().split('T')[0]);
  const terbilang = type === 'arisan' ? 'Lima Puluh Ribu Rupiah' : 'Dua Puluh Ribu Rupiah';

  // Construct PDF verification scan URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const verifyParams = new URLSearchParams({
    verify: 'lottery',
    type: 'kwitansi',
    doc: receiptNo,
    winner: member.name,
    cat: member.category,
    amt: String(amount),
    date: new Date().toISOString().split('T')[0],
    code: `KW-${activeYear}-${month}-${member.id.substring(0, 6).toUpperCase()}`,
  });
  const verificationUrl = `${origin}${pathname}?${verifyParams.toString()}`;

  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, verificationUrl, {
        width: 72,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    }
  }, [verificationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = member.phone ? member.phone.replace(/[^0-9]/g, '').replace(/^0/, '62') : '';
  const waMessage = encodeURIComponent(
    `*KUITANSI PEMBAYARAN RESMI*\n` +
    `*BANI P3N KUA KEDUNGBANTENG*\n\n` +
    `📄 No. Kuitansi: ${receiptNo}\n` +
    `👤 Nama: ${member.name} (${member.category})\n` +
    `📌 Pembayaran: Setoran ${type === 'arisan' ? 'Arisan' : 'Iuran Kas'} Bulan ${monthName} ${activeYear}\n` +
    `💰 Nominal: ${formatRupiah(amount)} (${terbilang})\n` +
    `✅ Status: LUNAS & TERVERIFIKASI\n` +
    `📅 Tanggal: ${currentDateStr}\n` +
    `🔗 Tautan PDF Web: ${verificationUrl}\n\n` +
    `Terima kasih atas partisipasi dan kerjasamanya.\n` +
    `_Pengurus Bani P3N KUA Kedungbanteng_`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
        {/* Top Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 no-print">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Bukti Kuitansi Elektronik (PDF Web)
          </span>
          <div className="flex items-center gap-2">
            <a
              href={verificationUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 px-3 py-1.5 text-xs font-bold transition-all hover:bg-teal-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Buka Dokumen PDF</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak</span>
            </button>
            <a
              href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Kirim WA</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Receipt Document Card */}
        <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 space-y-5 relative">
          {/* Header */}
          <div className="text-center pb-4 border-b border-emerald-500/20 space-y-1">
            <div className="inline-flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300">
              <Building2 className="h-4 w-4" />
              PAGUYUBAN BANI P3N & PAI KUA KEDUNGBANTENG
            </div>
            <h4 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
              Kuitansi Bukti Pembayaran
            </h4>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              No: {receiptNo}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Telah Diterima Dari:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {member.name} ({member.category})
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Guna Pembayaran:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Setoran {type === 'arisan' ? 'Arisan' : 'Iuran Kas'} Bulan {monthName} {activeYear}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Terbilang:</span>
              <span className="font-medium italic text-slate-700 dark:text-slate-300 text-right">
                {terbilang}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Tanggal Transaksi:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentDateStr}
              </span>
            </div>
          </div>

          {/* Amount Badge, QR Code, & Stamp */}
          <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
            <div className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-base font-extrabold shadow-sm">
              {formatRupiah(amount)}
            </div>

            {/* Live QR Scan to PDF */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <canvas ref={qrCanvasRef} className="h-10 w-10" />
              <div className="text-[9px] leading-tight text-slate-500 dark:text-slate-400 font-mono">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Scan PDF Sah</span>
                KUA Banyumas
              </div>
            </div>

            {/* Simulated Stamp / Signature */}
            <div className="text-center text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
              <p>Kedungbanteng, {currentDateStr}</p>
              <div className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 font-bold border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                LUNAS TERVERIFIKASI
              </div>
              <p className="font-bold pt-1 text-slate-800 dark:text-slate-200">
                Bendahara Paguyuban
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
