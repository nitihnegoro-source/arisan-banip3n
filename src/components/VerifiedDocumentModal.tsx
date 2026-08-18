import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Award, 
  UserCheck, 
  FileCheck2, 
  X, 
  ExternalLink,
  QrCode,
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  FileText,
  ReceiptText,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { formatRupiah, formatDateIndo, terbilangRupiah } from '../utils/formatters';

export interface VerifiedDocData {
  docNumber: string;
  docType?: 'ba' | 'kwitansi' | 'iuran';
  roundNumber?: number;
  winnerName: string;
  category: string;
  prizeAmount: number;
  drawDate: string;
  chairmanName: string;
  treasurerName: string;
  paguyubanName: string;
  verificationCode: string;
  verifiedAt: string;
  logoUrl?: string;
  location?: string;
  notes?: string;
}

interface VerifiedDocumentModalProps {
  data: VerifiedDocData;
  onClose: () => void;
}

export const VerifiedDocumentModal: React.FC<VerifiedDocumentModalProps> = ({
  data,
  onClose,
}) => {
  const [activeDocView, setActiveDocView] = useState<'ba' | 'kwitansi'>(
    data.docType === 'kwitansi' ? 'kwitansi' : 'ba'
  );
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniQrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawDateObj = new Date(data.drawDate);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = !isNaN(drawDateObj.getTime()) ? days[drawDateObj.getDay()] : 'Jumat';
  const formattedFullDate = formatDateIndo(data.drawDate);
  const terbilangAmount = terbilangRupiah(data.prizeAmount);

  // Generate Current Verification Page URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    // Generate QR codes for the PDF sheet
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, currentUrl, {
        width: 90,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    }

    if (miniQrCanvasRef.current) {
      QRCode.toCanvas(miniQrCanvasRef.current, currentUrl, {
        width: 72,
        margin: 1,
        color: {
          dark: '#065f46',
          light: '#ffffff',
        },
      });
    }
  }, [currentUrl, activeDocView]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data.verificationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleShareWA = () => {
    const text = encodeURIComponent(
      `*DOKUMEN RESMI TERVERIFIKASI SAH - KUA KEDUNGBANTENG*\n` +
      `📌 Dokumen: ${activeDocView === 'ba' ? 'Berita Acara Pengundian Arisan' : 'Kwitansi Resmi Hak Arisan'}\n` +
      `📄 No. Dokumen: ${data.docNumber}\n` +
      `👤 Penerima: ${data.winnerName} (${data.category})\n` +
      `💰 Nominal: ${formatRupiah(data.prizeAmount)}\n` +
      `✅ Status: ASLI & SAH SECARA ELEKTRONIK\n` +
      `🔗 Buka Dokumen PDF Web: ${currentUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md overflow-hidden text-slate-100 select-none">
      
      {/* 1. PDF VIEWER TOP CONTROLS TOOLBAR */}
      <header className="h-16 bg-slate-900 border-b border-slate-700/80 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-lg z-20 no-print">
        {/* Left: Document Identity info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
            title="Kembali ke Aplikasi Paguyuban"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Aplikasi Paguyuban</span>
          </button>

          <div className="h-5 w-px bg-slate-700 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/90 text-white font-black text-xs shrink-0 shadow-xs">
              PDF
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-white truncate">
                  {activeDocView === 'ba' ? 'Berita_Acara_Kocokan_Arisan' : 'Kwitansi_Resmi_Penerimaan_Arisan'}_{data.docNumber.replace(/[\/\\]/g, '_')}.pdf
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                  <ShieldCheck className="h-3 w-3" />
                  E-DOKUMEN RESMI SAH
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                KUA Kecamatan Kedungbanteng &bull; {data.paguyubanName} &bull; Kode Hash: {data.verificationCode}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Document View Switcher */}
        <div className="hidden lg:flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveDocView('ba')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeDocView === 'ba'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Berita Acara (A4)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDocView('kwitansi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeDocView === 'kwitansi'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ReceiptText className="h-3.5 w-3.5" />
            <span>Kwitansi Resmi (A4)</span>
          </button>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-xl border border-slate-700/70 p-0.5 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] min-w-[45px] text-center font-bold">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Perbesar Tampilan"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Share WA */}
          <button
            type="button"
            onClick={handleShareWA}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Bagikan Tautan PDF Resmi via WhatsApp"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Kirim WA</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Salin Tautan Verifikasi PDF"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
          </button>

          {/* Print / Save to PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-900/40 transition-all active:scale-95 cursor-pointer"
            title="Unduh Berkas PDF atau Cetak Langsung"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / Simpan PDF</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Pratinjau PDF"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Sub-toolbar Mobile Tab Switcher */}
      <div className="lg:hidden bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-center gap-2 no-print">
        <button
          type="button"
          onClick={() => setActiveDocView('ba')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeDocView === 'ba'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Berita Acara (A4)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveDocView('kwitansi')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeDocView === 'kwitansi'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          <ReceiptText className="h-3.5 w-3.5" />
          <span>Kwitansi Resmi (A4)</span>
        </button>
      </div>

      {/* 2. PDF WORKSPACE CANVAS (SCROLLABLE & ZOOMABLE) */}
      <div className="flex-1 overflow-auto bg-slate-950/80 p-4 sm:p-8 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">
        
        {/* A4 PAPER CONTAINER */}
        <div 
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 ease-out print:!transform-none w-full max-w-[800px] bg-white text-slate-900 rounded-2xl sm:rounded-none shadow-2xl print:shadow-none border border-slate-300 print:border-none p-6 sm:p-12 relative overflow-hidden select-text"
        >

          {/* ========================================================================= */}
          {/* OPTION A: BERITA ACARA PENGUNDIAN DAN PENETAPAN HAK ARISAN (A4 PDF VIEW) */}
          {/* ========================================================================= */}
          {activeDocView === 'ba' && (
            <div className="space-y-6 relative">
              
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
                <div className="text-center rotate-[-35deg]">
                  <p className="text-6xl sm:text-7xl font-black uppercase tracking-widest text-slate-900 leading-tight">
                    KUA KEDUNGBANTENG
                  </p>
                  <p className="text-4xl sm:text-5xl font-black uppercase tracking-widest text-emerald-900 mt-2">
                    DOKUMEN RESMI SAH
                  </p>
                </div>
              </div>

              {/* KOP SURAT RESMI KUA & PAGUYUBAN */}
              <div className="border-b-[3px] border-double border-slate-900 pb-3 relative">
                <div className="flex items-center justify-between gap-4">
                  {/* Left Logo */}
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 flex items-center justify-center">
                    {data.logoUrl ? (
                      <img
                        src={data.logoUrl}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white flex items-center justify-center shadow-sm">
                        <Building2 className="h-9 w-9 text-amber-300" />
                      </div>
                    )}
                  </div>

                  {/* Kop Text */}
                  <div className="flex-1 text-center font-serif space-y-0.5">
                    <p className="text-[11px] sm:text-xs tracking-wider uppercase font-bold text-slate-800">
                      KEMENTERIAN AGAMA REPUBLIK INDONESIA
                    </p>
                    <p className="text-[11px] sm:text-xs tracking-wider uppercase font-bold text-slate-800">
                      KANTOR KEMENTERIAN AGAMA KABUPATEN BANYUMAS
                    </p>
                    <p className="text-xs sm:text-sm tracking-wide uppercase font-extrabold text-emerald-950">
                      KANTOR URUSAN AGAMA KECAMATAN KEDUNGBANTENG
                    </p>
                    <h1 className="text-sm sm:text-base tracking-tight uppercase font-black text-slate-900 pt-0.5">
                      PAGUYUBAN BANI P3N & PENYULUH AGAMA ISLAM (PAI)
                    </h1>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 font-sans italic pt-0.5">
                      Sekretariat: Jl. Raya Kedungbanteng No. 12, Kec. Kedungbanteng, Kab. Banyumas &bull; Kode Pos 53152
                    </p>
                  </div>

                  {/* Right Official Seal Badge */}
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 hidden sm:flex flex-col items-center justify-center text-center p-1 rounded-xl border border-emerald-600/30 bg-emerald-50/50">
                    <ShieldCheck className="h-7 w-7 text-emerald-700 mb-0.5" />
                    <span className="text-[8px] font-black text-emerald-900 uppercase leading-tight">
                      TERVERIFIKASI
                    </span>
                    <span className="text-[7px] text-emerald-700 font-mono">
                      KEMENAG RI
                    </span>
                  </div>
                </div>
              </div>

              {/* DOCUMENT TITLE & REGISTRATION NUMBER */}
              <div className="text-center space-y-1 pt-1">
                <h2 className="text-sm sm:text-lg font-black tracking-wide uppercase text-slate-950 underline decoration-2 underline-offset-4">
                  BERITA ACARA PENGUNDIAN DAN PENETAPAN HAK ARISAN
                </h2>
                <p className="text-xs sm:text-sm font-mono font-bold text-slate-800">
                  Nomor: {data.docNumber}
                </p>
                <p className="text-[11px] font-sans text-slate-500">
                  Tentang: Penetapan Penerima Hak Dana Arisan Periode Tahun 2026
                </p>
              </div>

              {/* BODY CLAUSE PREAMBLE */}
              <div className="text-xs sm:text-sm leading-relaxed text-slate-800 space-y-3 font-serif text-justify">
                <p>
                  Pada hari ini <strong className="font-sans font-bold text-slate-900">{dayName}</strong>, tanggal <strong className="font-sans font-bold text-slate-900">{formattedFullDate}</strong>, bertempat di Kantor Urusan Agama (KUA) Kecamatan Kedungbanteng, telah diselenggarakan rapat koordinasi dan pelaksanaan pengundian (kocokan) arisan paguyuban <strong>Bani P3N & Penyuluh Agama Islam (PAI)</strong> Putaran ke-<strong>{data.roundNumber || 1}</strong> Tahun Anggaran 2026.
                </p>
                <p>
                  Berdasarkan hasil musyawarah mufakat dan tata tertib arisan yang berlaku, Dewan Pengurus secara resmi menetapkan nama anggota berikut sebagai pemegang hak penerimaan dana arisan:
                </p>
              </div>

              {/* RECIPIENT DETAILS TABLE */}
              <div className="rounded-xl border-2 border-slate-900 overflow-hidden text-xs sm:text-sm">
                <div className="bg-slate-900 text-white px-4 py-2 font-bold uppercase tracking-wider flex items-center justify-between text-xs">
                  <span>Rincian Penetapan Hak Arisan</span>
                  <span className="text-[10px] text-emerald-300 font-mono">Status: SAH & TERCATAT</span>
                </div>
                
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3 border-r border-slate-200">
                        Putaran Pengundian
                      </td>
                      <td className="py-2.5 px-4 font-extrabold text-slate-900">
                        Putaran Ke-{data.roundNumber || 1} (Tahun 2026)
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Nama Penerima / Pemenang
                      </td>
                      <td className="py-2.5 px-4 font-black text-slate-950 text-base">
                        {data.winnerName}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Kategori Keanggotaan
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {data.category}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Besaran Hak Nominal
                      </td>
                      <td className="py-2.5 px-4 font-black text-emerald-700 text-base">
                        {formatRupiah(data.prizeAmount)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Terbilang
                      </td>
                      <td className="py-2.5 px-4 italic font-medium text-slate-800">
                        # {terbilangAmount} #
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200">
                        Kode Validasi Digital
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-800 text-xs">
                        {data.verificationCode}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CLOSING STATEMENT */}
              <div className="text-xs sm:text-sm leading-relaxed text-slate-800 space-y-2 font-serif text-justify">
                <p>
                  Dana hak arisan tersebut diserahkan secara langsung kepada yang bersangkutan dan telah dibukukan dalam Buku Kas Masuk/Keluar Paguyuban. Berita Acara ini dibuat dalam rangkap yang sah untuk dipergunakan sebagaimana mestinya.
                </p>
              </div>

              {/* SIGNATURE BLOCK & STEMPEL */}
              <div className="pt-4 space-y-4">
                <div className="text-right text-xs sm:text-sm font-sans text-slate-800">
                  Kedungbanteng, {formattedFullDate}
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-[11px] sm:text-xs">
                  {/* Recipient */}
                  <div className="space-y-14 flex flex-col justify-between">
                    <p className="font-semibold text-slate-700">Penerima Hak Arisan,</p>
                    <div>
                      <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 inline-block min-w-[120px]">
                        {data.winnerName}
                      </p>
                      <p className="text-[10px] text-slate-500">Anggota Paguyuban</p>
                    </div>
                  </div>

                  {/* Treasurer */}
                  <div className="space-y-14 flex flex-col justify-between relative">
                    <p className="font-semibold text-slate-700">Bendahara Paguyuban,</p>
                    
                    {/* Simulated digital signature stamp */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-80 pointer-events-none">
                      <div className="h-14 w-28 border border-emerald-600/40 rounded-lg flex items-center justify-center rotate-[-4deg] text-emerald-800 text-[9px] font-mono font-bold bg-emerald-50/20">
                        TERVERIFIKASI SAH
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 inline-block min-w-[120px]">
                        {data.treasurerName}
                      </p>
                      <p className="text-[10px] text-slate-500">NIP/KTA. Pengurus</p>
                    </div>
                  </div>

                  {/* Chairman */}
                  <div className="space-y-14 flex flex-col justify-between relative">
                    <p className="font-semibold text-slate-700">Mengetahui,<br/>Ketua Paguyuban,</p>

                    {/* Official Blue Stamp */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-85">
                      <div className="h-20 w-20 rounded-full border-2 border-dashed border-blue-700 p-1 flex flex-col items-center justify-center text-center text-blue-800 rotate-[-12deg] shadow-xs bg-white/40">
                        <span className="text-[6px] font-black uppercase">PAGUYUBAN BANI P3N</span>
                        <Building2 className="h-4 w-4 text-blue-700 my-0.5" />
                        <span className="text-[6px] font-black uppercase leading-tight">KUA KEDUNGBANTENG</span>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 inline-block min-w-[120px]">
                        {data.chairmanName}
                      </p>
                      <p className="text-[10px] text-slate-500">Ketua Paguyuban</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECURITY BARCODE & AUDIT TRAIL FOOTER */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded-lg border border-slate-300 shrink-0">
                    <canvas ref={qrCanvasRef} className="h-16 w-16" />
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Lock className="h-3.5 w-3.5" />
                      <span>E-VERIFIKASI RESMI DOKUMEN DIGITAL KUA</span>
                    </div>
                    <p className="font-mono text-[9px] text-slate-500">
                      Hash Keamanan: {data.verificationCode}
                    </p>
                    <p className="text-slate-500">
                      Waktu Penerbitan: {new Date(data.verifiedAt).toLocaleString('id-ID')} WIB
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right space-y-0.5">
                  <p className="font-bold text-slate-800">KUA KECAMATAN KEDUNGBANTENG</p>
                  <p className="text-[9px] text-slate-500">Paguyuban Bani P3N Kedungbanteng @2026</p>
                  <p className="text-[8px] text-slate-400">Kresno Gadhing Pramudhyo | Hak Cipta</p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION B: KWITANSI RESMI PENERIMAAN HAK ARISAN (A4 PDF VIEW)             */}
          {/* ========================================================================= */}
          {activeDocView === 'kwitansi' && (
            <div className="space-y-6 relative">
              
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                <div className="text-center rotate-[-30deg]">
                  <p className="text-7xl font-black uppercase tracking-widest text-slate-900">
                    KUITANSI SAH
                  </p>
                  <p className="text-5xl font-black uppercase tracking-widest text-emerald-900 mt-2">
                    LUNAS TERVERIFIKASI
                  </p>
                </div>
              </div>

              {/* KOP SURAT KWITANSI */}
              <div className="border-b-[3px] border-double border-slate-900 pb-3 relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 flex items-center justify-center">
                    {data.logoUrl ? (
                      <img
                        src={data.logoUrl}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white flex items-center justify-center shadow-sm">
                        <Building2 className="h-9 w-9 text-amber-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center font-serif space-y-0.5">
                    <p className="text-xs tracking-wider uppercase font-bold text-slate-800">
                      KANTOR URUSAN AGAMA KECAMATAN KEDUNGBANTENG
                    </p>
                    <h1 className="text-sm sm:text-base tracking-tight uppercase font-black text-slate-900">
                      PAGUYUBAN BANI P3N & PENYULUH AGAMA ISLAM (PAI)
                    </h1>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 font-sans italic">
                      Jl. Raya Kedungbanteng No. 12, Kab. Banyumas &bull; Buku Kas Resmi Paguyuban Tahun 2026
                    </p>
                  </div>

                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 hidden sm:flex flex-col items-center justify-center text-center p-1 rounded-xl border border-emerald-600/30 bg-emerald-50/50">
                    <CheckCircle2 className="h-7 w-7 text-emerald-700 mb-0.5" />
                    <span className="text-[8px] font-black text-emerald-900 uppercase leading-tight">
                      LUNAS SAH
                    </span>
                    <span className="text-[7px] text-emerald-700 font-mono">
                      BENDAHARA
                    </span>
                  </div>
                </div>
              </div>

              {/* DOCUMENT TITLE & REGISTRATION NUMBER */}
              <div className="text-center space-y-1 pt-1">
                <h2 className="text-base sm:text-xl font-black tracking-wide uppercase text-slate-950 underline decoration-2 underline-offset-4">
                  KUITANSI TANDA TERIMA RESMI HAK ARISAN
                </h2>
                <p className="text-xs sm:text-sm font-mono font-bold text-slate-800">
                  No. Bukti Kas: {data.docNumber}
                </p>
              </div>

              {/* RECEIPT FIELDS */}
              <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 gap-3.5">
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-200 pb-2 gap-1">
                    <span className="font-bold text-slate-600 sm:w-1/3">Telah Diserahkan Kepada:</span>
                    <span className="font-black text-slate-950 sm:w-2/3 text-base">
                      {data.winnerName} ({data.category})
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-200 pb-2 gap-1">
                    <span className="font-bold text-slate-600 sm:w-1/3">Untuk Pembayaran:</span>
                    <span className="font-semibold text-slate-900 sm:w-2/3">
                      Pencairan Dana Hak Arisan Putaran Ke-{data.roundNumber || 1} Paguyuban Bani P3N Periode 2026
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-200 pb-2 gap-1">
                    <span className="font-bold text-slate-600 sm:w-1/3">Jumlah Uang (Terbilang):</span>
                    <span className="italic font-bold text-emerald-900 sm:w-2/3 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                      # {terbilangAmount} #
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-2">
                    <span className="font-bold text-slate-600 sm:w-1/3">Jumlah Nominal:</span>
                    <div className="sm:w-2/3">
                      <div className="inline-block bg-slate-900 text-white font-black text-lg sm:text-xl px-5 py-2.5 rounded-xl shadow-sm tracking-wider font-mono">
                        {formatRupiah(data.prizeAmount)}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* SIGNATURE BLOCK */}
              <div className="pt-4 space-y-4">
                <div className="text-right text-xs sm:text-sm font-sans text-slate-800">
                  Kedungbanteng, {formattedFullDate}
                </div>

                <div className="grid grid-cols-2 gap-8 text-center text-xs">
                  {/* Recipient */}
                  <div className="space-y-16 flex flex-col justify-between">
                    <p className="font-semibold text-slate-700">Yang Menerima,</p>
                    <div>
                      <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 inline-block min-w-[140px]">
                        {data.winnerName}
                      </p>
                      <p className="text-[10px] text-slate-500">Penerima Hak Arisan</p>
                    </div>
                  </div>

                  {/* Treasurer */}
                  <div className="space-y-16 flex flex-col justify-between relative">
                    <p className="font-semibold text-slate-700">Bendahara Paguyuban,</p>

                    {/* Official Blue Stamp */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-85">
                      <div className="h-20 w-20 rounded-full border-2 border-dashed border-blue-700 p-1 flex flex-col items-center justify-center text-center text-blue-800 rotate-[-8deg] shadow-xs bg-white/30">
                        <span className="text-[6px] font-black uppercase">PAGUYUBAN BANI P3N</span>
                        <Building2 className="h-4 w-4 text-blue-700 my-0.5" />
                        <span className="text-[6px] font-black uppercase leading-tight">LUNAS KAS</span>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 inline-block min-w-[140px]">
                        {data.treasurerName}
                      </p>
                      <p className="text-[10px] text-slate-500">Bendahara Bani P3N</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECURITY BARCODE & AUDIT FOOTER */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded-lg border border-slate-300 shrink-0">
                    <canvas ref={miniQrCanvasRef} className="h-14 w-14" />
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>KUITANSI RESMI TERCATAT DALAM BUKU KAS</span>
                    </div>
                    <p className="font-mono text-[9px] text-slate-500">
                      Kode Verifikasi: {data.verificationCode}
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right space-y-0.5">
                  <p className="font-bold text-slate-800">KUA KECAMATAN KEDUNGBANTENG</p>
                  <p className="text-[9px] text-slate-500">Paguyuban Bani P3N Kedungbanteng @2026</p>
                  <p className="text-[8px] text-slate-400">Kresno Gadhing Pramudhyo | Hak Cipta</p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
