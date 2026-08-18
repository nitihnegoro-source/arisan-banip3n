import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { 
  X, 
  Printer, 
  Download, 
  Upload, 
  PenTool, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Camera, 
  ShieldCheck, 
  Building2, 
  User, 
  Eye, 
  Trash2, 
  FileImage,
  QrCode as QrIcon,
  Layers,
  Award,
  CheckCircle2
} from 'lucide-react';
import { Member, PaguyubanProfile } from '../types';

interface MemberCardModalProps {
  member: Member;
  profile: PaguyubanProfile;
  onClose: () => void;
  onUpdateMember?: (updatedMember: Member) => void;
}

type CardSideView = 'both' | 'front' | 'back';

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  member,
  profile,
  onClose,
  onUpdateMember,
}) => {
  const [activeSide, setActiveSide] = useState<CardSideView>('both');
  const [photoUrl, setPhotoUrl] = useState<string>(member.photoUrl || '');
  const [memberSignatureUrl, setMemberSignatureUrl] = useState<string>(member.signatureUrl || '');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  const [isDrawingSig, setIsDrawingSig] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // References for card capture & canvas drawing
  const frontCardRef = useRef<HTMLDivElement | null>(null);
  const backCardRef = useRef<HTMLDivElement | null>(null);
  const bothCardsRef = useRef<HTMLDivElement | null>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const filePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const fileSigInputRef = useRef<HTMLInputElement | null>(null);

  const memberIdCode = `KTA-P3N-2026-${member.no.toString().padStart(3, '0')}`;
  const chairmanName = profile.officialDocumentConfig?.chairmanName || profile.contact?.chairmanName || 'Drs. H. Mustofa';
  const chairmanSignature = profile.officialDocumentConfig?.signatureImageUrl || '';

  // Generate dynamic QR Code for Member Verification
  useEffect(() => {
    const generateQR = async () => {
      try {
        const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=kta&doc=${memberIdCode}&name=${encodeURIComponent(member.name)}&no=${member.no}&cat=${encodeURIComponent(member.category)}&phone=${encodeURIComponent(member.phone || '')}&date=2026-04-01`;
        const dataUrl = await QRCode.toDataURL(verifyUrl, {
          width: 256,
          margin: 1,
          color: {
            dark: '#022c22', // deep emerald dark
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating member QR Code:', err);
      }
    };
    generateQR();
  }, [memberIdCode, member.name, member.no, member.category, member.phone]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar (maksimal 5 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoUrl(result);
      if (onUpdateMember) {
        onUpdateMember({
          ...member,
          photoUrl: result,
        });
      }
      showToast('Pas foto anggota berhasil diperbarui');
    };
    reader.readAsDataURL(file);
  };

  // Sample Avatar Presets
  const sampleAvatars = [
    {
      label: 'Foto Resmi Jas & Peci',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
    {
      label: 'Foto Resmi Pria',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    },
    {
      label: 'Foto Resmi Batik',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    },
  ];

  const handleApplyPresetAvatar = (url: string) => {
    setPhotoUrl(url);
    if (onUpdateMember) {
      onUpdateMember({
        ...member,
        photoUrl: url,
      });
    }
    showToast('Preset foto diterapkan');
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (onUpdateMember) {
      onUpdateMember({
        ...member,
        photoUrl: undefined,
      });
    }
    showToast('Pas foto dihapus (menggunakan avatar default)');
  };

  // Signature Pad Logic
  useEffect(() => {
    if (showSigModal && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // Blue ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [showSigModal]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawingSig(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingSig(false);
  };

  const handleClearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveDrawnSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setMemberSignatureUrl(dataUrl);
    setShowSigModal(false);
    if (onUpdateMember) {
      onUpdateMember({
        ...member,
        signatureUrl: dataUrl,
      });
    }
    showToast('Tanda tangan pemegang berhasil disimpan');
  };

  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setMemberSignatureUrl(result);
      if (onUpdateMember) {
        onUpdateMember({
          ...member,
          signatureUrl: result,
        });
      }
      showToast('File tanda tangan berhasil dimuat');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setMemberSignatureUrl('');
    if (onUpdateMember) {
      onUpdateMember({
        ...member,
        signatureUrl: undefined,
      });
    }
    showToast('Tanda tangan pemegang direset');
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Download Card as Image (Front, Back, or Both)
  const handleDownloadCard = async (side: 'front' | 'back' | 'both') => {
    let targetElement: HTMLDivElement | null = null;
    let filename = `KTA_${member.no}_${member.name.replace(/\s+/g, '_')}`;

    if (side === 'front') {
      targetElement = frontCardRef.current;
      filename += '_DEPAN.png';
    } else if (side === 'back') {
      targetElement = backCardRef.current;
      filename += '_BELAKANG.png';
    } else {
      targetElement = bothCardsRef.current;
      filename += '_LENGKAP.png';
    }

    if (!targetElement) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(targetElement, {
        scale: 3, // High DPI resolution for crisp printing
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast(`Kartu (${side.toUpperCase()}) berhasil diunduh!`);
    } catch (err) {
      console.error('Error exporting card:', err);
      alert('Terjadi kesalahan saat mengunduh gambar kartu.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Print Card Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{saveToast}</span>
        </div>
      )}

      <div className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
              <QrIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Kartu Tanda Anggota (KTA) Digital
                </h3>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Resmi 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {member.name} &bull; Nomor Urut: #{member.no.toString().padStart(2, '0')} ({member.category})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar & Side View Selector */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Side Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSide('both')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSide === 'both'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Dua Sisi (Depan & Belakang)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSide('front')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSide === 'front'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Tampak Depan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSide('back')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSide === 'back'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Tampak Belakang (Pakta Integritas)</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-400" />
              <span>Cetak Kartu</span>
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownloadCard(activeSide)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isDownloading ? 'Mengunduh...' : 'Unduh Gambar (HD)'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Customization Bar: Pas Foto & Tanda Tangan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            
            {/* 1. Pas Foto Tool */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Camera className="h-4 w-4" />
                  <span>Pas Foto Anggota (Foto Formal):</span>
                </label>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-10 shrink-0 rounded-lg border-2 border-emerald-500/50 bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      ref={filePhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => filePhotoInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Unggah Pas Foto (Galeri/File)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span>Preset:</span>
                    {sampleAvatars.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPresetAvatar(av.url)}
                        className="px-1.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                      >
                        Model {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Tanda Tangan Pemegang Tool */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <PenTool className="h-4 w-4" />
                  <span>Tanda Tangan Pemegang Kartu:</span>
                </label>
                {memberSignatureUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveSignature}
                    className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-20 shrink-0 rounded-lg border border-slate-700 bg-white/90 p-1 flex items-center justify-center overflow-hidden">
                  {memberSignatureUrl ? (
                    <img src={memberSignatureUrl} alt="TTD Pemegang" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-400 italic">Belum ada</span>
                  )}
                </div>

                <div className="flex-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSigModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span>Tanda Tangan di Layar</span>
                  </button>

                  <input
                    ref={fileSigInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileSigInputRef.current?.click()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                    title="Upload Gambar Tanda Tangan"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Card Presentation Canvas (For Screen and High-Res Capture) */}
          <div ref={bothCardsRef} className="flex flex-col items-center justify-center gap-8 py-2">
            
            {/* ========== TAMPAK DEPAN (FRONT SIDE) ========== */}
            {(activeSide === 'both' || activeSide === 'front') && (
              <div className="flex flex-col items-center">
                <div className="text-center mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-800/60">
                    &bull; Tampak Depan (Front Side) &bull;
                  </span>
                </div>

                {/* ID Card Front Container (Standard ID-1 Aspect Ratio 85.6mm x 53.98mm) */}
                <div
                  ref={frontCardRef}
                  id="kta-card-front"
                  className="w-[440px] sm:w-[500px] h-[280px] sm:h-[318px] rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border-2 border-amber-400/80 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between p-4.5 select-none"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(2, 44, 34, 0.7), inset 0 0 25px rgba(251, 191, 36, 0.15)',
                  }}
                >
                  {/* Decorative Security Background Watermark & Guilloche Grid */}
                  <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-500/15 via-transparent to-transparent pointer-events-none" />

                  {/* Top Header Card */}
                  <div className="relative z-10 flex items-center justify-between border-b border-amber-400/40 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      {profile.logoUrl ? (
                        <img
                          src={profile.logoUrl}
                          alt="Logo Paguyuban"
                          className="h-10 w-10 rounded-xl object-contain bg-white p-0.5 border border-amber-400 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs shadow-md border border-amber-400">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] sm:text-xs font-black tracking-wider text-amber-300 uppercase">
                            PAGUYUBAN BANI P3N
                          </p>
                          <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1 rounded-xs">
                            2026
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-teal-100 font-medium">
                          KUA KECAMATAN KEDUNGBANTENG
                        </p>
                        <p className="text-[8px] text-emerald-300/80 font-mono tracking-tight">
                          KARTU TANDA ANGGOTA RESMI (KTA)
                        </p>
                      </div>
                    </div>

                    {/* Member Number Badge */}
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-amber-300">
                        Nomor ID Anggota
                      </p>
                      <div className="inline-block px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono font-black text-[11px] sm:text-xs shadow-xs">
                        {memberIdCode}
                      </div>
                    </div>
                  </div>

                  {/* Center Card Body: Photo & Member Bio */}
                  <div className="relative z-10 flex items-center gap-4 py-1.5">
                    
                    {/* Pas Foto (Standard 3x4 ID Frame) */}
                    <div className="relative shrink-0">
                      <div className="w-[84px] sm:w-[94px] h-[106px] sm:h-[118px] rounded-xl border-2 border-amber-400/90 bg-slate-900 shadow-md overflow-hidden relative group">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-teal-900 to-slate-900 flex flex-col items-center justify-center text-teal-200/80 p-1 text-center">
                            <User className="h-10 w-10 text-teal-400/60 mb-1" />
                            <span className="text-[8px] font-bold">Pas Foto 3x4</span>
                          </div>
                        )}
                        
                        {/* Security Hologram Strip on Photo */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent py-0.5 px-1 text-center">
                          <span className="text-[7px] font-bold text-amber-300 uppercase tracking-wider">
                            ORIGINAL
                          </span>
                        </div>
                      </div>

                      {/* Smart Card Gold Chip Emblem */}
                      <div className="absolute -top-2 -left-1.5 w-6 h-5 rounded-xs bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-100 shadow-xs flex items-center justify-center opacity-90">
                        <div className="w-4 h-3 border border-amber-800/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                          <div className="bg-amber-700/30 rounded-xs" />
                          <div className="bg-amber-700/30 rounded-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-teal-300">
                          Nama Lengkap Anggota:
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white truncate tracking-tight text-shadow-sm">
                          {member.name}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] sm:text-[10px] pt-0.5">
                        <div>
                          <p className="text-teal-300/80 text-[8px] uppercase">Kategori / Jabatan</p>
                          <p className="font-bold text-amber-300 truncate">
                            {member.category} {member.category === 'P3N' ? '(Pembantu PPN)' : ''}
                          </p>
                        </div>

                        <div>
                          <p className="text-teal-300/80 text-[8px] uppercase">No. Urut Undian</p>
                          <p className="font-bold text-white font-mono">
                            #{member.no.toString().padStart(2, '0')} (Putaran Arisan)
                          </p>
                        </div>

                        <div>
                          <p className="text-teal-300/80 text-[8px] uppercase">No. Telepon / WA</p>
                          <p className="font-bold text-slate-200 font-mono text-[9px]">
                            {member.phone || '-'}
                          </p>
                        </div>

                        <div>
                          <p className="text-teal-300/80 text-[8px] uppercase">Masa Berlaku</p>
                          <p className="font-bold text-emerald-300 font-mono text-[9px]">
                            01/04/2026 - 31/03/2027
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Security Scanner */}
                    <div className="shrink-0 flex flex-col items-center justify-center pl-1">
                      <div className="bg-white p-1 rounded-xl shadow-md border border-amber-400">
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="QR Verifikasi KTA"
                            className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-slate-200 animate-pulse rounded-md" />
                        )}
                      </div>
                      <span className="text-[7px] font-bold text-amber-300 mt-1 uppercase tracking-tighter">
                        Scan Verifikasi
                      </span>
                    </div>

                  </div>

                  {/* Bottom Bar: Barcode strip & Hologram Seal */}
                  <div className="relative z-10 pt-2 border-t border-amber-400/30 flex items-center justify-between text-[8px] text-teal-200/90">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                      <span className="font-bold text-amber-300">
                        PAGUYUBAN RESMI KUA KEDUNGBANTENG
                      </span>
                    </div>

                    {/* Faux Linear Barcode Graphic */}
                    <div className="flex items-center gap-0.5 bg-white/95 px-2 py-0.5 rounded-sm shadow-xs">
                      <div className="w-0.5 h-3 bg-black" />
                      <div className="w-1 h-3 bg-black" />
                      <div className="w-0.5 h-3 bg-black" />
                      <div className="w-1.5 h-3 bg-black" />
                      <div className="w-0.5 h-3 bg-black" />
                      <div className="w-1 h-3 bg-black" />
                      <div className="w-0.5 h-3 bg-black" />
                      <div className="w-2 h-3 bg-black" />
                      <div className="w-0.5 h-3 bg-black" />
                      <div className="w-1 h-3 bg-black" />
                      <span className="text-[7px] font-mono font-bold text-black ml-1">
                        *{memberIdCode}*
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ========== TAMPAK BELAKANG (BACK SIDE - PAKTA INTEGRITAS & TTD) ========== */}
            {(activeSide === 'both' || activeSide === 'back') && (
              <div className="flex flex-col items-center">
                <div className="text-center mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-3 py-0.5 rounded-full border border-teal-800/60">
                    &bull; Tampak Belakang (Pakta Integritas & Tanda Tangan) &bull;
                  </span>
                </div>

                {/* ID Card Back Container */}
                <div
                  ref={backCardRef}
                  id="kta-card-back"
                  className="w-[440px] sm:w-[500px] h-[280px] sm:h-[318px] rounded-2xl bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 border-2 border-amber-400/80 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between p-4 select-none"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(2, 44, 34, 0.7), inset 0 0 25px rgba(251, 191, 36, 0.15)',
                  }}
                >
                  {/* Decorative Guilloche Watermark */}
                  <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="absolute top-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Belakang */}
                  <div className="relative z-10 text-center border-b border-amber-400/40 pb-1.5">
                    <h5 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300">
                      PAKTA INTEGRITAS & KETENTUAN ANGGOTA
                    </h5>
                    <p className="text-[8px] text-teal-200">
                      PAGUYUBAN BANI P3N KUA KEC. KEDUNGBANTENG TAHUN 2026
                    </p>
                  </div>

                  {/* 5 Butir Pakta Integritas */}
                  <div className="relative z-10 text-[8px] sm:text-[8.5px] text-slate-200 space-y-1 leading-relaxed px-1">
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-400 shrink-0">1.</span>
                      <span>Menjunjung tinggi ukhuwah islamiyah, kekeluargaan, & silaturahmi keluarga besar KUA Kec. Kedungbanteng.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-400 shrink-0">2.</span>
                      <span>Menjaga etika, integritas, dan kehormatan korps P3N, Penyuluh Agama, & Staf KUA.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-400 shrink-0">3.</span>
                      <span>Melaksanakan kewajiban setoran Arisan (Rp 50.000) dan Iuran Kas (Rp 20.000) tepat waktu setiap bulan.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-400 shrink-0">4.</span>
                      <span>Berhak mengikuti undian get arisan bulanan & menerima hak santunan/manfaat dana sosial kas paguyuban.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-400 shrink-0">5.</span>
                      <span>Kartu ini bukti keanggotaan sah dan wajib ditunjukkan saat pertemuan rutin paguyuban.</span>
                    </div>
                  </div>

                  {/* Dual Signatures: Pemegang Kartu & Ketua Paguyuban */}
                  <div className="relative z-10 pt-1.5 border-t border-amber-400/30 grid grid-cols-2 gap-3 text-center">
                    
                    {/* TTD 1: Pemegang Kartu (Anggota) */}
                    <div className="flex flex-col items-center justify-between h-[64px] sm:h-[72px]">
                      <p className="text-[8px] font-bold text-teal-200">
                        Pemegang Kartu (Anggota)
                      </p>
                      
                      <div className="h-8 sm:h-9 w-full flex items-center justify-center relative">
                        {memberSignatureUrl ? (
                          <img
                            src={memberSignatureUrl}
                            alt="TTD Anggota"
                            className="max-h-full max-w-[120px] object-contain filter invert brightness-125"
                          />
                        ) : (
                          <span className="text-[7.5px] text-amber-300/60 italic font-mono border-b border-dashed border-slate-500 px-3 py-0.5">
                            ( Tanda Tangan Digital )
                          </span>
                        )}
                      </div>

                      <p className="text-[8.5px] sm:text-[9px] font-black text-white border-t border-white/20 w-4/5 truncate pt-0.5">
                        {member.name}
                      </p>
                    </div>

                    {/* TTD 2: Ketua Paguyuban (Pengurus & Cap) */}
                    <div className="flex flex-col items-center justify-between h-[64px] sm:h-[72px] relative">
                      <p className="text-[8px] font-bold text-amber-300">
                        Kedungbanteng, 01 April 2026<br />
                        <span className="text-[7.5px] text-teal-200 font-normal">Ketua Paguyuban Bani P3N</span>
                      </p>

                      <div className="h-8 sm:h-9 w-full flex items-center justify-center relative">
                        {/* Official Stamp Overlay */}
                        <div className="absolute -left-1 -top-1 w-11 h-11 rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 flex flex-col items-center justify-center text-[5.5px] font-extrabold text-emerald-300 rotate-[-12deg] pointer-events-none shadow-xs">
                          <span>PAGUYUBAN</span>
                          <span className="text-[4.5px] text-amber-300">BANI P3N</span>
                          <span>KEDUNGBANTENG</span>
                        </div>

                        {chairmanSignature ? (
                          <img
                            src={chairmanSignature}
                            alt="TTD Ketua"
                            className="max-h-full max-w-[120px] object-contain filter invert brightness-125 relative z-10"
                          />
                        ) : (
                          <span className="text-[8px] font-serif font-black italic text-amber-200/90 relative z-10">
                            Mustofa
                          </span>
                        )}
                      </div>

                      <p className="text-[8.5px] sm:text-[9px] font-black text-white border-t border-white/20 w-4/5 truncate pt-0.5">
                        {chairmanName}
                      </p>
                    </div>

                  </div>

                  {/* Disclaimer Bottom Text */}
                  <div className="relative z-10 text-center pt-1 text-[7px] text-slate-400 border-t border-white/10">
                    <p>
                      Jika menemukan kartu ini harap kembalikan ke Sekretariat: <strong>KUA Kec. Kedungbanteng, Kab. Tegal</strong>.
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Format kartu standar ID Card (CR80) siap cetak di kertas PVC atau kertas foto.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-900/40 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Kartu Tanda Anggota</span>
            </button>
          </div>
        </div>

      </div>

      {/* Signature Pad Modal (Drawing directly on touchscreen or mouse) */}
      {showSigModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-teal-400" />
                <h4 className="font-bold text-sm">Tanda Tangan Pemegang Kartu</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Goreskan tanda tangan Anda pada kotak putih di bawah ini menggunakan jari atau mouse:
            </p>

            <div className="rounded-2xl border-2 border-teal-500/60 bg-white overflow-hidden shadow-inner p-1">
              <canvas
                ref={sigCanvasRef}
                width={380}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 touch-none cursor-crosshair bg-white"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleClearSignature}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Bersihkan</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSigModal(false)}
                  className="px-3 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrawnSignature}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Gunakan Tanda Tangan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Specific CSS to format front and back cards beautifully */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #kta-card-front, #kta-card-front *,
          #kta-card-back, #kta-card-back * {
            visibility: visible;
          }
          #kta-card-front, #kta-card-back {
            position: relative !important;
            margin: 20px auto !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

    </div>
  );
};
