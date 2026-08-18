import React, { useRef, useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { 
  Award, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Copy, 
  MessageCircle, 
  FileImage,
  Sparkles,
  Check,
  ReceiptText,
  FileCheck,
  Upload,
  PenTool,
  RotateCcw,
  Sliders,
  Trash2,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { LotteryWinner, Member, PaguyubanProfile } from '../types';
import { formatRupiah, formatDateIndo, terbilangRupiah } from '../utils/formatters';
import { downloadCertificateFile, DocKind } from '../utils/certificateGenerator';

interface WinnerCertificateModalProps {
  winner: LotteryWinner;
  member?: Member;
  profile: PaguyubanProfile;
  onClose: () => void;
  onUpdateProfile?: (updated: PaguyubanProfile) => void;
}

type SignerTarget = 'chairman' | 'treasurer' | 'recipient';

export const WinnerCertificateModal: React.FC<WinnerCertificateModalProps> = ({
  winner,
  member,
  profile,
  onClose,
  onUpdateProfile,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sigPadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [docKind, setDocKind] = useState<DocKind>('kwitansi');
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadDoneMessage, setDownloadDoneMessage] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Document Config State (allows live editing/uploading before export)
  const [docConfig, setDocConfig] = useState({
    ...profile.officialDocumentConfig,
  });

  // Customizer Drawer / Panel toggle
  const [showCustomizer, setShowCustomizer] = useState(true);
  const [customizerTab, setCustomizerTab] = useState<'kop' | 'signature' | 'officials'>('kop');

  // Signature Draw Pad State
  const [selectedSigner, setSelectedSigner] = useState<SignerTarget>('chairman');
  const [penColor, setPenColor] = useState<string>('#1e3a8a');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasPadContent, setHasPadContent] = useState(false);

  const drawYear = new Date(winner.drawDate).getFullYear() || 2026;
  const drawMonthNum = new Date(winner.drawDate).getMonth() + 1;
  
  const kwPrefix = 'KW-ARS';
  const kwNumber = `${kwPrefix}/${drawYear}/${drawMonthNum.toString().padStart(2, '0')}/${winner.roundNumber.toString().padStart(3, '0')}`;
  
  const baPrefix = docConfig.documentPrefix || 'BA-ARS';
  const baNumber = `${baPrefix}/${drawYear}/${drawMonthNum.toString().padStart(2, '0')}/${winner.roundNumber.toString().padStart(3, '0')}`;
  
  const activeDocNumber = docKind === 'kwitansi' ? kwNumber : baNumber;
  const verificationCode = `P3N-ARS-${drawYear}-${winner.roundNumber.toString().padStart(2, '0')}-${winner.memberId.replace(/[^a-zA-Z0-9]/g, '')}`;

  // Composite profile with active docConfig
  const effectiveProfile: PaguyubanProfile = {
    ...profile,
    officialDocumentConfig: docConfig,
  };

  // Construct Verification Web URL for Barcode Scan
  const getVerificationUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const params = new URLSearchParams({
      verify: 'lottery',
      type: docKind,
      doc: activeDocNumber,
      round: String(winner.roundNumber),
      winner: winner.memberName,
      cat: winner.memberCategory || '',
      amt: String(winner.prizeAmount),
      date: winner.drawDate,
      chair: docConfig.chairmanName,
      treas: docConfig.treasurerName,
      code: verificationCode,
    });
    return `${origin}${pathname}?${params.toString()}`;
  };

  // Generate QR Code on mount & when config changes
  useEffect(() => {
    if (qrCanvasRef.current) {
      const verifyUrl = getVerificationUrl();

      QRCode.toCanvas(qrCanvasRef.current, verifyUrl, {
        width: 84,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }, (error) => {
        if (error) console.error('QR code generation error:', error);
      });
    }
  }, [winner, profile, activeDocNumber, docKind, docConfig]);

  // Setup / clear signature pad canvas
  const clearSigPad = useCallback(() => {
    const canvas = sigPadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasPadContent(false);
  }, []);

  // Handle drawing on signature pad
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigPadCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigPadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasPadContent(true);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigPadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  // Apply Drawn Signature to Selected Signer
  const handleApplyDrawnSignature = () => {
    const canvas = sigPadCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    if (selectedSigner === 'chairman') {
      setDocConfig((prev) => ({ ...prev, signatureImageUrl: dataUrl }));
    } else if (selectedSigner === 'treasurer') {
      setDocConfig((prev) => ({ ...prev, treasurerSignatureImageUrl: dataUrl }));
    } else if (selectedSigner === 'recipient') {
      setDocConfig((prev) => ({ ...prev, recipientSignatureImageUrl: dataUrl }));
    }

    setSaveSuccessMessage(`Tanda tangan berhasil diterapkan pada ${getSignerLabel(selectedSigner)}!`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Handle KOP Surat Image File Upload
  const handleKopFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setDocConfig((prev) => ({
          ...prev,
          kopSuratImageUrl: base64,
          useCustomKopImage: true,
        }));
        setSaveSuccessMessage('KOP Surat berhasil diunggah dan diaktifkan!');
        setTimeout(() => setSaveSuccessMessage(null), 3500);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Signature Image File Upload
  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>, signer: SignerTarget) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (signer === 'chairman') {
          setDocConfig((prev) => ({ ...prev, signatureImageUrl: base64 }));
        } else if (signer === 'treasurer') {
          setDocConfig((prev) => ({ ...prev, treasurerSignatureImageUrl: base64 }));
        } else if (signer === 'recipient') {
          setDocConfig((prev) => ({ ...prev, recipientSignatureImageUrl: base64 }));
        }
        setSaveSuccessMessage(`File tanda tangan ${getSignerLabel(signer)} berhasil diunggah!`);
        setTimeout(() => setSaveSuccessMessage(null), 3500);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save to Paguyuban Profile permanently
  const handleSaveToProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        officialDocumentConfig: docConfig,
      });
      setSaveSuccessMessage('Pengaturan KOP Surat & Tanda Tangan tersimpan permanen ke Profil Paguyuban!');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  };

  const getSignerLabel = (s: SignerTarget) => {
    switch (s) {
      case 'chairman':
        return `Ketua (${docConfig.chairmanName || 'Ketua Paguyuban'})`;
      case 'treasurer':
        return `Bendahara (${docConfig.treasurerName || 'Bendahara'})`;
      case 'recipient':
        return `Penerima (${winner.memberName})`;
    }
  };

  // Export to JPG / JPEG using the dedicated high-res Canvas 2D engine
  const handleDownloadJPG = async () => {
    try {
      setIsGeneratingJpg(true);
      setDownloadDoneMessage(null);
      await downloadCertificateFile(winner, effectiveProfile, 'jpeg', member, docKind);
      const label = docKind === 'kwitansi' ? 'Kwitansi' : 'Berita Acara';
      setDownloadDoneMessage(`${label} .JPG berhasil diunduh!`);
      setTimeout(() => setDownloadDoneMessage(null), 4000);
    } catch (err) {
      console.error('Error generating JPG certificate:', err);
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  // Export to PNG
  const handleDownloadPNG = async () => {
    try {
      setIsGeneratingPng(true);
      setDownloadDoneMessage(null);
      await downloadCertificateFile(winner, effectiveProfile, 'png', member, docKind);
      const label = docKind === 'kwitansi' ? 'Kwitansi' : 'Berita Acara';
      setDownloadDoneMessage(`${label} .PNG berhasil diunduh!`);
      setTimeout(() => setDownloadDoneMessage(null), 4000);
    } catch (err) {
      console.error('Error generating PNG certificate:', err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp share
  const handleShareWA = () => {
    const docTitle = docKind === 'kwitansi' ? 'KWITANSI RESMI PENERIMAAN HAK ARISAN' : 'BERITA ACARA RESMI KOCOKAN ARISAN';
    const text = `*${docTitle}*\n` +
      `*${profile.name.toUpperCase()}*\n` +
      `KUA Kecamatan Kedungbanteng\n` +
      `-------------------------------------------\n` +
      `Nomor: *${activeDocNumber}*\n` +
      `Putaran: *Putaran ke-${winner.roundNumber}*\n` +
      `Tanggal: *${formatDateIndo(winner.drawDate)}*\n` +
      `Pemenang: *${winner.memberName}* (${winner.memberCategory})\n` +
      `Nominal Get: *${formatRupiah(winner.prizeAmount)}*\n` +
      `Terbilang: _${terbilangRupiah(winner.prizeAmount)}_\n` +
      `Ketua Paguyuban: *${docConfig.chairmanName}*\n` +
      `Status: *SAH & TERVERIFIKASI SISTEM OTOMATIS*\n` +
      `-------------------------------------------\n` +
      `Dokumen resmi ber-kop surat dan ber-barcode telah diterbitkan.`;

    const phone = member?.phone ? member.phone.replace(/[^0-9]/g, '') : '';
    const formattedPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
    const url = formattedPhone 
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const docTitle = docKind === 'kwitansi' ? 'KWITANSI PEMBAYARAN ARISAN' : 'BERITA ACARA KOCOKAN ARISAN';
    const text = `${docTitle}\n` +
      `${profile.name}\n` +
      `No: ${activeDocNumber}\n` +
      `Putaran: #${winner.roundNumber}\n` +
      `Tanggal: ${formatDateIndo(winner.drawDate)}\n` +
      `Pemenang: ${winner.memberName} (${winner.memberCategory})\n` +
      `Nominal: ${formatRupiah(winner.prizeAmount)}\n` +
      `Ketua Paguyuban: ${docConfig.chairmanName}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6 bg-slate-800/90 border-b border-slate-700 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                <span>Dokumen Resmi Kocokan Arisan</span>
                <span className="text-[10px] uppercase font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  KOP SURAT & TANDA TANGAN
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Penerbitan kwitansi dan berita acara resmi ber-kop surat dengan tanda tangan Ketua Paguyuban
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-customizer-panel"
              type="button"
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showCustomizer
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-700 hover:bg-slate-600 text-amber-300 border border-amber-500/30'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{showCustomizer ? 'Sembunyikan Pengaturan Kop & TTD' : 'Upload Kop Surat & Tanda Tangan'}</span>
              {showCustomizer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST / BANNER */}
        {saveSuccessMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-inner">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-amber-300" />
              {saveSuccessMessage}
            </span>
            <button type="button" onClick={() => setSaveSuccessMessage(null)} className="text-white hover:text-emerald-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* UPLOAD & CUSTOMIZATION ACCORDION PANEL */}
        {showCustomizer && (
          <div className="bg-slate-850 border-b border-slate-700 p-4 sm:p-5 text-xs text-slate-200 shrink-0 overflow-y-auto max-h-72">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/70">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomizerTab('kop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    customizerTab === 'kop'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>1. KOP Surat ({docConfig.useCustomKopImage && docConfig.kopSuratImageUrl ? 'Gambar Kustom' : 'Format Teks'})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomizerTab('signature')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    customizerTab === 'signature'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PenTool className="h-3.5 w-3.5" />
                  <span>2. Tanda Tangan (Upload & Gores Langsung)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomizerTab('officials')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    customizerTab === 'officials'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>3. Pejabat & Legalitas</span>
                </button>
              </div>

              {onUpdateProfile && (
                <button
                  type="button"
                  onClick={handleSaveToProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all cursor-pointer shadow-xs"
                  title="Simpan pengaturan ini ke Profil Paguyuban agar selalu dipakai di kemudian hari"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Permanen ke Profil</span>
                </button>
              )}
            </div>

            {/* TAB 1: KOP SURAT UPLOAD */}
            {customizerTab === 'kop' && (
              <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 flex items-center gap-1.5">
                      <span>Unggah Gambar KOP Surat Resmi</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800 px-2.5 py-1 rounded-md text-[11px]">
                      <input
                        type="checkbox"
                        checked={docConfig.useCustomKopImage || false}
                        onChange={(e) => setDocConfig({ ...docConfig, useCustomKopImage: e.target.checked })}
                        className="rounded text-emerald-500 h-3.5 w-3.5"
                      />
                      <span>Pakai Gambar KOP</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pilih file gambar KOP surat paguyuban / KUA (PNG, JPG, SVG). Dokumen cetak & export JPG akan otomatis menggunakan header ini.
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      id="input-upload-kop-modal"
                      type="file"
                      accept="image/*"
                      onChange={handleKopFileUpload}
                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                    />

                    {docConfig.kopSuratImageUrl && (
                      <button
                        type="button"
                        onClick={() => setDocConfig({ ...docConfig, kopSuratImageUrl: undefined, useCustomKopImage: false })}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold px-2 py-1 bg-red-950/40 rounded border border-red-800/40 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Hapus KOP</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/80 flex flex-col justify-center items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">Preview KOP Header yang Digunakan:</span>
                  {docConfig.useCustomKopImage && docConfig.kopSuratImageUrl ? (
                    <div className="bg-white p-2 rounded-lg border border-slate-400 w-full flex justify-center">
                      <img
                        src={docConfig.kopSuratImageUrl}
                        alt="Preview KOP Unggahan"
                        className="max-h-20 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="bg-white text-slate-900 p-2 rounded-lg border border-slate-300 w-full text-center space-y-0.5 text-[9px]">
                      <p className="font-extrabold uppercase text-slate-700">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                      <p className="font-bold text-slate-800">KANTOR URUSAN AGAMA KECAMATAN KEDUNGBANTENG</p>
                      <p className="font-black text-emerald-950 uppercase">{profile.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SIGNATURES (UPLOAD & INTERACTIVE DRAW PAD) */}
            {customizerTab === 'signature' && (
              <div className="pt-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300">Pilih Pihak Penandatangan:</span>
                    <select
                      value={selectedSigner}
                      onChange={(e) => {
                        setSelectedSigner(e.target.value as SignerTarget);
                        clearSigPad();
                      }}
                      className="rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-1 font-semibold text-xs"
                    >
                      <option value="chairman">1. Ketua Paguyuban ({docConfig.chairmanName || 'Ketua'})</option>
                      <option value="treasurer">2. Bendahara ({docConfig.treasurerName || 'Darsito'})</option>
                      <option value="recipient">3. Penerima / Pemenang ({winner.memberName})</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Tanda Tangan Aktif:</span>
                    {selectedSigner === 'chairman' && (docConfig.signatureImageUrl ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Tersedia
                      </span>
                    ) : <span className="text-slate-400 italic">Digital Bawaan</span>)}

                    {selectedSigner === 'treasurer' && (docConfig.treasurerSignatureImageUrl ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Tersedia
                      </span>
                    ) : <span className="text-slate-400 italic">Belum Diisi</span>)}

                    {selectedSigner === 'recipient' && (docConfig.recipientSignatureImageUrl ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Tersedia
                      </span>
                    ) : <span className="text-slate-400 italic">Belum Diisi</span>)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mode A: Interactive Signature Pad */}
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <PenTool className="h-3.5 w-3.5" />
                        Gores Tanda Tangan Langsung (Mouse / Layar Sentuh)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPenColor('#1e3a8a')}
                          className={`w-4 h-4 rounded-full bg-blue-900 border ${penColor === '#1e3a8a' ? 'ring-2 ring-white' : 'border-slate-500'}`}
                          title="Tinta Biru Resmi"
                        />
                        <button
                          type="button"
                          onClick={() => setPenColor('#0f172a')}
                          className={`w-4 h-4 rounded-full bg-slate-950 border ${penColor === '#0f172a' ? 'ring-2 ring-white' : 'border-slate-500'}`}
                          title="Tinta Hitam"
                        />
                        <button
                          type="button"
                          onClick={() => setPenColor('#065f46')}
                          className={`w-4 h-4 rounded-full bg-emerald-800 border ${penColor === '#065f46' ? 'ring-2 ring-white' : 'border-slate-500'}`}
                          title="Tinta Hijau"
                        />
                      </div>
                    </div>

                    <div className="relative border-2 border-dashed border-slate-600 rounded-lg bg-white overflow-hidden touch-none">
                      <canvas
                        ref={sigPadCanvasRef}
                        width={400}
                        height={120}
                        onMouseDown={handleStartDraw}
                        onMouseMove={handleDraw}
                        onMouseUp={handleStopDraw}
                        onMouseLeave={handleStopDraw}
                        onTouchStart={handleStartDraw}
                        onTouchMove={handleDraw}
                        onTouchEnd={handleStopDraw}
                        className="w-full h-24 cursor-crosshair block"
                      />
                      {!hasPadContent && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs italic">
                          Tanda tangani di sini dengan mouse / jari...
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={clearSigPad}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Hapus Goresan</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyDrawnSignature}
                        disabled={!hasPadContent}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        <span>Gunakan Tanda Tangan Ini</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode B: Upload Image File */}
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/80 space-y-2">
                    <span className="font-bold text-teal-400 flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Atau Unggah File Tanda Tangan (PNG Transparan / JPG)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Unggah berkas tanda tangan untuk <strong>{getSignerLabel(selectedSigner)}</strong>.
                    </p>

                    <div className="pt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSignatureFileUpload(e, selectedSigner)}
                        className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Preview active signature & remove */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Gambar Terpasang:</span>
                        {selectedSigner === 'chairman' && docConfig.signatureImageUrl && (
                          <img src={docConfig.signatureImageUrl} alt="Chairman Sig" className="h-8 bg-white p-0.5 rounded border border-slate-400" />
                        )}
                        {selectedSigner === 'treasurer' && docConfig.treasurerSignatureImageUrl && (
                          <img src={docConfig.treasurerSignatureImageUrl} alt="Treasurer Sig" className="h-8 bg-white p-0.5 rounded border border-slate-400" />
                        )}
                        {selectedSigner === 'recipient' && docConfig.recipientSignatureImageUrl && (
                          <img src={docConfig.recipientSignatureImageUrl} alt="Recipient Sig" className="h-8 bg-white p-0.5 rounded border border-slate-400" />
                        )}
                      </div>

                      {((selectedSigner === 'chairman' && docConfig.signatureImageUrl) ||
                        (selectedSigner === 'treasurer' && docConfig.treasurerSignatureImageUrl) ||
                        (selectedSigner === 'recipient' && docConfig.recipientSignatureImageUrl)) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedSigner === 'chairman') setDocConfig((prev) => ({ ...prev, signatureImageUrl: undefined }));
                            if (selectedSigner === 'treasurer') setDocConfig((prev) => ({ ...prev, treasurerSignatureImageUrl: undefined }));
                            if (selectedSigner === 'recipient') setDocConfig((prev) => ({ ...prev, recipientSignatureImageUrl: undefined }));
                          }}
                          className="text-red-400 hover:text-red-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OFFICIALS & LEGALITY SETTINGS */}
            {customizerTab === 'officials' && (
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nama Ketua Penandatangan</label>
                  <input
                    type="text"
                    value={docConfig.chairmanName || ''}
                    onChange={(e) => setDocConfig({ ...docConfig, chairmanName: e.target.value })}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">NIP / Jabatan Ketua</label>
                  <input
                    type="text"
                    value={docConfig.chairmanNip || ''}
                    onChange={(e) => setDocConfig({ ...docConfig, chairmanNip: e.target.value })}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nama Bendahara Paguyuban</label>
                  <input
                    type="text"
                    value={docConfig.treasurerName || ''}
                    onChange={(e) => setDocConfig({ ...docConfig, treasurerName: e.target.value })}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-white font-bold"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={docConfig.showStamp}
                      onChange={(e) => setDocConfig({ ...docConfig, showStamp: e.target.checked })}
                      className="rounded text-emerald-500 h-4 w-4"
                    />
                    <span>Tampilkan Stempel Cap Basah</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={docConfig.showBarcode}
                      onChange={(e) => setDocConfig({ ...docConfig, showBarcode: e.target.checked })}
                      className="rounded text-emerald-500 h-4 w-4"
                    />
                    <span>Tampilkan Barcode Sah</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Document Kind Selector (Kwitansi vs Berita Acara) */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-2.5 bg-slate-800/80 border-b border-slate-700/80 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-700 text-xs">
            <button
              id="tab-select-kwitansi"
              type="button"
              onClick={() => setDocKind('kwitansi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                docKind === 'kwitansi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ReceiptText className="h-3.5 w-3.5" />
              <span>Kwitansi Ber-Kop Surat</span>
            </button>

            <button
              id="tab-select-berita-acara"
              type="button"
              onClick={() => setDocKind('berita_acara')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                docKind === 'berita_acara'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Surat Keputusan / Berita Acara</span>
            </button>
          </div>

          <span className="hidden md:inline-block text-[11px] font-mono text-slate-400">
            No: <strong className="text-emerald-400">{activeDocNumber}</strong>
          </span>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:px-6 bg-slate-800 border-b border-slate-700 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Download JPG Button */}
            <button
              id="btn-download-certificate-jpg"
              type="button"
              onClick={handleDownloadJPG}
              disabled={isGeneratingJpg}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:bg-slate-700 text-white font-extrabold px-4 py-2.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
            >
              <FileImage className="h-4 w-4" />
              <span>{isGeneratingJpg ? 'Memproses .JPG...' : `Unduh ${docKind === 'kwitansi' ? 'Kwitansi' : 'Berita Acara'} .JPG`}</span>
            </button>

            {/* Download PNG Button */}
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isGeneratingPng}
              className="flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold px-3.5 py-2.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingPng ? 'Memproses PNG...' : 'Unduh .PNG'}</span>
            </button>

            {/* Open Web PDF Verification Page */}
            <a
              href={getVerificationUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-2.5 shadow-md shadow-teal-950/40 transition-all active:scale-95 cursor-pointer"
              title="Buka Website Berbentuk PDF Resmi (Hasil Scan Barcode)"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Buka Dokumen PDF Web</span>
            </a>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-3 py-2.5 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {downloadDoneMessage && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-600/40 px-2.5 py-1 rounded-lg animate-pulse">
                <Check className="h-3.5 w-3.5" />
                {downloadDoneMessage}
              </span>
            )}

            <button
              type="button"
              onClick={handleShareWA}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-200 border border-emerald-600/40 font-semibold px-3 py-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>Kirim WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2.5 py-2 transition-colors cursor-pointer"
              title="Salin Rincian"
            >
              {copySuccess ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Certificate / Kwitansi Preview Container */}
        <div className="p-4 sm:p-6 md:p-8 bg-slate-950/60 flex-1 overflow-y-auto flex justify-center">
          
          {/* THE OFFICIAL DOCUMENT DOM PREVIEW */}
          <div
            id="official-lottery-certificate"
            className="w-full max-w-2xl bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl border-4 border-double border-slate-300 relative overflow-hidden font-sans select-none"
          >
            {/* Background Security Watermark */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center rotate-[-25deg]">
              <Building2 className="w-[520px] h-[520px] text-slate-900" />
            </div>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] select-none text-6xl font-black uppercase tracking-widest text-slate-800 rotate-[-30deg]">
              {profile.shortName || 'BANI P3N'} KEDUNGBANTENG
            </div>

            {/* ==================================================== */}
            {/* OFFICIAL KOP SURAT (Letterhead) */}
            {/* ==================================================== */}
            <div className="border-b-2 border-slate-800 pb-3 mb-5 text-center relative">
              {docConfig.useCustomKopImage && docConfig.kopSuratImageUrl ? (
                /* Custom Uploaded KOP Image Banner */
                <div className="w-full flex justify-center pb-2">
                  <img
                    src={docConfig.kopSuratImageUrl}
                    alt="KOP Surat Resmi"
                    className="max-h-28 max-w-full object-contain"
                  />
                </div>
              ) : (
                /* Standard Official Text KOP SURAT */
                <div className="flex items-center justify-between gap-4">
                  {/* Left Emblem */}
                  <div className="w-16 h-16 rounded-2xl bg-emerald-800 flex items-center justify-center text-white shadow-md shrink-0 border border-emerald-600/40">
                    <span className="text-3xl">🕌</span>
                  </div>

                  {/* Center Kop Text Details */}
                  <div className="flex-1 text-center space-y-0.5">
                    <h5 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      KEMENTERIAN AGAMA REPUBLIK INDONESIA
                    </h5>
                    <h4 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      KANTOR URUSAN AGAMA (KUA) KECAMATAN KEDUNGBANTENG
                    </h4>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                      {profile.name}
                    </h2>
                    <p className="text-[10px] text-slate-600">
                      {profile.contact.address || 'Jl. Raya Kedungbanteng, Kec. Kedungbanteng, Kab. Banyumas, Jawa Tengah 53152'}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Kontak: {profile.contact.treasurerPhone} • Email: {profile.contact.email}
                    </p>
                  </div>

                  {/* Right Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-amber-400 shadow-md shrink-0 p-1 text-center border border-slate-700">
                    <Award className="h-6 w-6" />
                    <span className="text-[8px] font-extrabold text-white mt-0.5 uppercase tracking-tighter">BANI P3N</span>
                    <span className="text-[7px] font-bold text-emerald-400">RESMI 2026</span>
                  </div>
                </div>
              )}

              {/* Double Decorative Line Under Kop */}
              <div className="mt-2 border-b border-slate-400" />
              <div className="mt-0.5 border-b-2 border-slate-900" />
            </div>

            {/* ==================================================== */}
            {/* CONTENT: KWITANSI vs BERITA ACARA */}
            {/* ==================================================== */}
            {docKind === 'kwitansi' ? (
              /* KWITANSI VIEW */
              <div className="space-y-5">
                {/* Title & Number */}
                <div className="text-center space-y-1">
                  <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-300">
                    BUKTI RESMI TANDA TERIMA HAK ARISAN
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                    KWITANSI PEMBAYARAN GET ARISAN
                  </h3>
                  <p className="text-xs font-mono font-semibold text-slate-600">
                    Nomor Kwitansi: <span className="text-slate-900 font-bold">{kwNumber}</span>
                  </p>
                </div>

                {/* Kwitansi Form Matrix */}
                <div className="rounded-2xl border border-slate-300 bg-slate-50/70 p-5 space-y-3 text-xs">
                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-200">
                    <span className="col-span-4 font-bold text-slate-600">Telah Diserahkan Kepada</span>
                    <span className="col-span-1 text-center font-bold text-slate-400">:</span>
                    <span className="col-span-7 font-black text-emerald-950 text-sm">
                      {winner.memberName} ({winner.memberCategory})
                      {member?.no && <span className="text-xs font-normal text-slate-600"> • No. #{member.no.toString().padStart(2, '0')}</span>}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-200 items-center">
                    <span className="col-span-4 font-bold text-slate-600">Uang Sejumlah</span>
                    <span className="col-span-1 text-center font-bold text-slate-400">:</span>
                    <span className="col-span-7 font-black text-emerald-700 text-base font-mono">
                      {formatRupiah(winner.prizeAmount)}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-200">
                    <span className="col-span-4 font-bold text-slate-600">Terbilang</span>
                    <span className="col-span-1 text-center font-bold text-slate-400">:</span>
                    <span className="col-span-7 font-semibold italic text-emerald-900">
                      "{terbilangRupiah(winner.prizeAmount)}"
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-200">
                    <span className="col-span-4 font-bold text-slate-600">Guna Pembayaran</span>
                    <span className="col-span-1 text-center font-bold text-slate-400">:</span>
                    <span className="col-span-7 font-medium text-slate-800">
                      Penyaluran Hak Dana Arisan (Get) <strong>Putaran #{winner.roundNumber}</strong> Periode {drawYear} Paguyuban Bani P3N KUA Kedungbanteng
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5">
                    <span className="col-span-4 font-bold text-slate-600">Tempat & Tanggal</span>
                    <span className="col-span-1 text-center font-bold text-slate-400">:</span>
                    <span className="col-span-7 font-medium text-slate-800">
                      {winner.notes || profile.meetingLocation || 'KUA Kec. Kedungbanteng'} • {formatDateIndo(winner.drawDate)}
                    </span>
                  </div>
                </div>

                {/* Amount Ribbon & Status */}
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-xl bg-emerald-700 text-white px-5 py-2 text-base font-black font-mono shadow-sm">
                    {formatRupiah(winner.prizeAmount)}
                  </div>
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    STATUS: LUNAS & TERVERIFIKASI
                  </span>
                </div>
              </div>
            ) : (
              /* BERITA ACARA VIEW */
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-300">
                    SURAT KEPUTUSAN & BERITA ACARA RESMI
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                    PENGESAHAN PEMENANG KOCOKAN ARISAN
                  </h3>
                  <p className="text-xs font-mono font-semibold text-slate-600">
                    Nomor: <span className="text-slate-900 font-bold">{baNumber}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  Pada hari ini, <strong className="text-slate-900">{formatDateIndo(winner.drawDate)}</strong>, telah dilaksanakan penarikan kocokan arisan putaran rutin bulanan <strong>{profile.name}</strong> untuk periode tahun berjalan <strong>{drawYear}</strong> secara transparan, terbuka, dan disaksikan oleh seluruh anggota. Dengan ini menetapkan dan mengesahkan:
                </p>

                {/* Winner Card Box */}
                <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50/70 p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-emerald-700 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs">
                    Putaran Ke-{winner.roundNumber}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Nama Penerima / Pemenang Arisan:
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                        {winner.memberName}
                      </h2>
                      <p className="text-xs text-slate-600 font-medium">
                        Kategori: <strong>{winner.memberCategory}</strong>
                        {member?.no && <span> • Nomor Anggota: <strong>#{member.no.toString().padStart(2, '0')}</strong></span>}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                          Hak Perolehan Dana (Get):
                        </span>
                        <div className="text-2xl font-black text-emerald-700 font-mono">
                          {formatRupiah(winner.prizeAmount)}
                        </div>
                        <p className="text-[11px] font-semibold italic text-emerald-900">
                          "{terbilangRupiah(winner.prizeAmount)}"
                        </p>
                      </div>

                      <div className="text-right text-xs text-slate-600">
                        <p>Lokasi Penarikan:</p>
                        <p className="font-bold text-slate-800">
                          {winner.notes || profile.meetingLocation || 'Pertemuan Rutin KUA Kedungbanteng'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Barcode & QR Code Security */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
              {/* 1D Barcode */}
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Barcode Autentikasi Sistem:
                </span>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center">
                  <div className="flex items-center gap-[2px] h-9 w-full justify-center">
                    {[
                      3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 2, 1, 4,
                      2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4,
                      2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 2, 1
                    ].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h * 7}px`, width: i % 3 === 0 ? '2.5px' : '1.5px' }}
                        className={i % 2 === 0 ? 'bg-slate-900' : 'bg-transparent'}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] font-bold text-slate-700 tracking-widest mt-1">
                    *{verificationCode}*
                  </span>
                </div>
              </div>

              {/* QR Code Verification */}
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-xs">
                  <canvas ref={qrCanvasRef} width={80} height={80} className="w-16 h-16" />
                </div>
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    E-Verifikasi Valid
                  </span>
                  <p>Arisan Digital Bani P3N</p>
                  <p className="font-mono text-[9px] text-slate-400">Timestamp: {winner.drawDate}</p>
                </div>
              </div>
            </div>

            {/* Official Signatures Section (3 Columns) */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs mt-6 pt-3 relative">
              {/* Recipient / Winner */}
              <div className="flex flex-col justify-between h-36">
                <p className="text-[11px] text-slate-600">Penerima Hak Arisan,</p>
                <div className="py-1 h-16 flex items-center justify-center">
                  {docConfig.recipientSignatureImageUrl ? (
                    <img 
                      src={docConfig.recipientSignatureImageUrl} 
                      alt="Tanda Tangan Penerima" 
                      className="h-14 max-w-[110px] object-contain" 
                    />
                  ) : (
                    <span className="font-serif italic text-slate-400 text-sm">(Tanda Tangan Asli)</span>
                  )}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900 text-xs">{winner.memberName}</p>
                  <p className="text-[10px] text-slate-500">Anggota Paguyuban</p>
                </div>
              </div>

              {/* Treasurer */}
              <div className="flex flex-col justify-between h-36">
                <p className="text-[11px] text-slate-600">{docConfig.treasurerTitle || 'Bendahara Paguyuban'},</p>
                <div className="py-1 h-16 flex items-center justify-center">
                  {docConfig.treasurerSignatureImageUrl ? (
                    <img 
                      src={docConfig.treasurerSignatureImageUrl} 
                      alt="Tanda Tangan Bendahara" 
                      className="h-14 max-w-[110px] object-contain" 
                    />
                  ) : (
                    <span className="font-serif italic text-slate-400 text-sm">(Tanda Tangan Asli)</span>
                  )}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900 text-xs">{docConfig.treasurerName || 'Darsito'}</p>
                  <p className="text-[10px] text-slate-500">Pengelola Kas & Arisan</p>
                </div>
              </div>

              {/* Chairman with Official Seal & Signature */}
              <div className="flex flex-col justify-between h-36 relative">
                <p className="text-[11px] text-slate-600">
                  Kedungbanteng, {formatDateIndo(winner.drawDate)}<br />
                  <strong className="text-slate-900">{docConfig.chairmanTitle || 'Ketua Paguyuban'},</strong>
                </p>

                {/* Signature Area & Stamp */}
                <div className="relative py-1 h-16 flex items-center justify-center">
                  {/* Stamp Cap Basah Paguyuban */}
                  {docConfig.showStamp && (
                    <div className="absolute -left-3 top-0 w-24 h-24 rounded-full border-2 border-dashed border-emerald-700/70 p-1 flex items-center justify-center rotate-[-12deg] pointer-events-none select-none opacity-85">
                      <div className="w-full h-full rounded-full border border-emerald-600/70 flex flex-col items-center justify-center p-1 text-center bg-emerald-500/5">
                        <span className="text-[6px] font-black uppercase text-emerald-800 tracking-tighter leading-none">
                          PAGUYUBAN BANI P3N
                        </span>
                        <div className="my-0.5 border-t border-b border-emerald-700 w-3/4 py-0.2">
                          <span className="text-[5px] font-bold text-emerald-900">KEDUNGBANTENG</span>
                        </div>
                        <span className="text-[5px] font-extrabold text-emerald-800">
                          ★ SAH ★
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Digital Signature of Ketua Paguyuban */}
                  {docConfig.signatureImageUrl ? (
                    <img 
                      src={docConfig.signatureImageUrl} 
                      alt="Tanda Tangan Ketua" 
                      className="h-14 max-w-[120px] object-contain relative z-10" 
                    />
                  ) : (
                    <div className="relative z-10 font-serif italic text-blue-900 text-lg font-bold tracking-tight select-none rotate-[-4deg]">
                      <svg className="w-28 h-12 text-blue-800/90" viewBox="0 0 120 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M10 35 C 25 10, 30 40, 45 15 C 55 35, 60 5, 75 25 C 90 20, 105 38, 115 15" />
                        <path d="M30 42 C 60 40, 95 44, 110 38" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900 text-xs underline decoration-slate-400 underline-offset-2">
                    {docConfig.chairmanName || 'H. Lubab Habib, S.Ag'}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    {docConfig.chairmanNip || 'Penyuluh Agama Islam KUA Kedungbanteng'}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Security Footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400 font-mono">
              <span>Sistem Digital Arisan Bani P3N KUA Kedungbanteng • Dokumen Sah Elektronik</span>
              <span>Ref: {activeDocNumber} • Cetak: {new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Info */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Dokumen {docKind === 'kwitansi' ? 'Kwitansi' : 'Berita Acara'} ber-kop surat siap diunduh (.JPG/.PNG) atau dibagikan langsung.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 transition-colors cursor-pointer"
          >
            Selesai / Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
