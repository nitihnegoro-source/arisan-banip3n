import QRCode from 'qrcode';
import { LotteryWinner, Member, PaguyubanProfile } from '../types';
import { formatRupiah, formatDateIndo, terbilangRupiah } from './formatters';

export type DocKind = 'kwitansi' | 'berita_acara';

/**
 * Draws the official KOP SURAT Header onto the canvas
 */
async function drawOfficialKopSurat(
  ctx: CanvasRenderingContext2D,
  profile: PaguyubanProfile,
  width: number,
  headerTop: number
): Promise<number> {
  // Check if custom uploaded KOP image is selected and available
  if (
    profile.officialDocumentConfig.useCustomKopImage &&
    profile.officialDocumentConfig.kopSuratImageUrl
  ) {
    try {
      const kopImg = new Image();
      kopImg.src = profile.officialDocumentConfig.kopSuratImageUrl;
      await new Promise((resolve, reject) => {
        kopImg.onload = resolve;
        kopImg.onerror = reject;
      });

      // Calculate aspect ratio to fit width nicely (with 70px side padding)
      const targetWidth = width - 140;
      const aspect = kopImg.height / kopImg.width;
      const targetHeight = Math.min(Math.max(targetWidth * aspect, 90), 160);

      ctx.drawImage(kopImg, 70, headerTop, targetWidth, targetHeight);

      // Divider line under custom Kop
      const dividerY = headerTop + targetHeight + 10;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(70, dividerY);
      ctx.lineTo(width - 70, dividerY);
      ctx.stroke();

      return dividerY + 12;
    } catch (e) {
      console.warn('Failed to load custom KOP image, falling back to standard text KOP:', e);
    }
  }

  // Standard Official Text KOP SURAT
  // Left Official Emblem Logo Box
  ctx.fillStyle = '#065f46'; // Deep emerald
  ctx.beginPath();
  ctx.roundRect(70, headerTop, 90, 90, [18]);
  ctx.fill();

  // Emblem symbol inside logo
  ctx.fillStyle = '#f59e0b'; // Amber gold
  ctx.font = 'bold 42px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🕌', 115, headerTop + 60);

  // Center Kop Texts
  ctx.textAlign = 'center';
  
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('KEMENTERIAN AGAMA REPUBLIK INDONESIA', width / 2, headerTop + 18);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('KANTOR URUSAN AGAMA (KUA) KECAMATAN KEDUNGBANTENG', width / 2, headerTop + 36);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 24px sans-serif';
  ctx.fillText(profile.name.toUpperCase(), width / 2, headerTop + 64);

  ctx.fillStyle = '#475569';
  ctx.font = '12px sans-serif';
  ctx.fillText(profile.contact.address || 'Jl. Raya Kedungbanteng, Kec. Kedungbanteng, Kab. Banyumas, Jawa Tengah 53152', width / 2, headerTop + 84);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.fillText(`Kontak: ${profile.contact.treasurerPhone || '0812-3456-7890'} • Email: ${profile.contact.email || 'kuakedungbanteng@kemenag.go.id'}`, width / 2, headerTop + 100);

  // Right Badge Box
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(width - 160, headerTop, 90, 90, [18]);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('🏆', width - 115, headerTop + 42);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('BANI P3N', width - 115, headerTop + 64);
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('2026 RESMI', width - 115, headerTop + 78);

  // Double Divider Line under Kop Surat
  const dividerY = headerTop + 116;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, dividerY);
  ctx.lineTo(width - 70, dividerY);
  ctx.stroke();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(70, dividerY + 4);
  ctx.lineTo(width - 70, dividerY + 4);
  ctx.stroke();

  return dividerY + 12;
}

/**
 * Draws the 3-column Signatures block with Chairman stamp & signature
 */
async function drawSignaturesBlock(
  ctx: CanvasRenderingContext2D,
  profile: PaguyubanProfile,
  winner: LotteryWinner,
  width: number,
  sigTop: number
) {
  const colWidth = (width - 140) / 3;

  // Column 1: Penerima / Pemenang
  const col1X = 70 + colWidth / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.font = '13px sans-serif';
  ctx.fillText('Yang Menerima (Pemenang),', col1X, sigTop);

  if (profile.officialDocumentConfig.recipientSignatureImageUrl) {
    try {
      const recImg = new Image();
      recImg.src = profile.officialDocumentConfig.recipientSignatureImageUrl;
      await new Promise((resolve) => {
        recImg.onload = resolve;
        recImg.onerror = resolve;
      });
      ctx.drawImage(recImg, col1X - 50, sigTop + 20, 100, 60);
    } catch {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 13px serif';
      ctx.fillText('(Tanda Tangan Asli)', col1X, sigTop + 62);
    }
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 13px serif';
    ctx.fillText('(Tanda Tangan Asli)', col1X, sigTop + 62);
  }

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(col1X - 90, sigTop + 100);
  ctx.lineTo(col1X + 90, sigTop + 100);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(winner.memberName, col1X, sigTop + 120);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('Penerima Hak Arisan', col1X, sigTop + 136);

  // Column 2: Bendahara
  const col2X = 70 + colWidth + colWidth / 2;
  ctx.fillStyle = '#475569';
  ctx.font = '13px sans-serif';
  ctx.fillText(profile.officialDocumentConfig.treasurerTitle || 'Bendahara Paguyuban,', col2X, sigTop);

  if (profile.officialDocumentConfig.treasurerSignatureImageUrl) {
    try {
      const trImg = new Image();
      trImg.src = profile.officialDocumentConfig.treasurerSignatureImageUrl;
      await new Promise((resolve) => {
        trImg.onload = resolve;
        trImg.onerror = resolve;
      });
      ctx.drawImage(trImg, col2X - 50, sigTop + 20, 100, 60);
    } catch {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 13px serif';
      ctx.fillText('(Tanda Tangan Asli)', col2X, sigTop + 62);
    }
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 13px serif';
    ctx.fillText('(Tanda Tangan Asli)', col2X, sigTop + 62);
  }

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(col2X - 90, sigTop + 100);
  ctx.lineTo(col2X + 90, sigTop + 100);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(profile.officialDocumentConfig.treasurerName || 'Darsito', col2X, sigTop + 120);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('Pengelola Kas & Arisan', col2X, sigTop + 136);

  // Column 3: Ketua Paguyuban (With Stamp & Digital Signature)
  const col3X = 70 + colWidth * 2 + colWidth / 2;
  ctx.fillStyle = '#475569';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Kedungbanteng, ${formatDateIndo(winner.drawDate)}`, col3X, sigTop - 14);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`${profile.officialDocumentConfig.chairmanTitle || 'Mengetahui, Ketua Paguyuban'},`, col3X, sigTop + 4);

  // Draw Official Stamp Badge
  if (profile.officialDocumentConfig.showStamp) {
    ctx.save();
    ctx.translate(col3X - 42, sigTop + 55);
    ctx.rotate(-0.18);

    ctx.strokeStyle = 'rgba(5, 150, 105, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(5, 150, 105, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(6, 95, 70, 0.9)';
    ctx.font = '900 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAGUYUBAN BANI P3N', 0, -18);
    ctx.fillText('KUA KEDUNGBANTENG', 0, -8);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('★ SAH ★', 0, 6);
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('BANYUMAS', 0, 20);

    ctx.restore();
  }

  // Draw Ketua Signature
  if (profile.officialDocumentConfig.signatureImageUrl) {
    try {
      const sigImg = new Image();
      sigImg.src = profile.officialDocumentConfig.signatureImageUrl;
      await new Promise((resolve) => {
        sigImg.onload = resolve;
        sigImg.onerror = resolve;
      });
      ctx.drawImage(sigImg, col3X - 60, sigTop + 16, 120, 68);
    } catch {
      // fallback
    }
  } else {
    // Elegant calligraphic signature path
    ctx.save();
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(col3X - 50, sigTop + 65);
    ctx.bezierCurveTo(col3X - 25, sigTop + 15, col3X - 10, sigTop + 80, col3X + 15, sigTop + 30);
    ctx.bezierCurveTo(col3X + 25, sigTop + 70, col3X + 45, sigTop + 10, col3X + 55, sigTop + 55);
    ctx.moveTo(col3X - 30, sigTop + 80);
    ctx.lineTo(col3X + 50, sigTop + 72);
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(col3X - 90, sigTop + 100);
  ctx.lineTo(col3X + 90, sigTop + 100);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(profile.officialDocumentConfig.chairmanName || 'H. Lubab Habib, S.Ag', col3X, sigTop + 120);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText(profile.officialDocumentConfig.chairmanNip || 'Penyuluh Agama Islam KUA Kedungbanteng', col3X, sigTop + 136);
}

/**
 * Generates an ultra high-resolution official Kwitansi or Berita Acara canvas with Kop Surat
 */
export async function generateCertificateCanvas(
  winner: LotteryWinner,
  profile: PaguyubanProfile,
  member?: Member,
  docKind: DocKind = 'kwitansi'
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = docKind === 'kwitansi' ? 1540 : 1680;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const drawYear = new Date(winner.drawDate).getFullYear() || 2026;
  const drawMonthNum = new Date(winner.drawDate).getMonth() + 1;
  
  const kwPrefix = 'KW-ARS';
  const kwNumber = `${kwPrefix}/${drawYear}/${drawMonthNum.toString().padStart(2, '0')}/${winner.roundNumber.toString().padStart(3, '0')}`;
  
  const baPrefix = profile.officialDocumentConfig.documentPrefix || 'BA-ARS';
  const baNumber = `${baPrefix}/${drawYear}/${drawMonthNum.toString().padStart(2, '0')}/${winner.roundNumber.toString().padStart(3, '0')}`;
  
  const activeDocNumber = docKind === 'kwitansi' ? kwNumber : baNumber;
  const verificationCode = `P3N-ARS-${drawYear}-${winner.roundNumber.toString().padStart(2, '0')}-${winner.memberId.replace(/[^a-zA-Z0-9]/g, '')}`;

  // 1. Background Fill & Double Frame
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#fbfcfd';
  ctx.fillRect(20, 20, width - 40, height - 40);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(32, 32, width - 64, height - 64);

  // Outer Decorative Borders
  ctx.strokeStyle = '#0f172a'; // Slate 900
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = '#059669'; // Emerald 600
  ctx.lineWidth = 1.5;
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // Corner Ornaments
  const drawCorner = (x: number, y: number) => {
    ctx.fillStyle = '#059669';
    ctx.fillRect(x - 4, y - 4, 8, 8);
  };
  drawCorner(44, 44);
  drawCorner(width - 44, 44);
  drawCorner(44, height - 44);
  drawCorner(width - 44, height - 44);

  // 2. Render Official KOP SURAT
  const bodyTop = await drawOfficialKopSurat(ctx, profile, width, 65);

  if (docKind === 'kwitansi') {
    // ==========================================
    // RENDER KWITANSI PEMENANG KOCOKAN ARISAN
    // ==========================================
    const titleY = bodyTop + 24;

    // Document Title Badge
    ctx.fillStyle = '#d1fae5'; // Emerald 100
    ctx.beginPath();
    ctx.roundRect(width / 2 - 190, titleY, 380, 28, [14]);
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUKTI RESMI TANDA TERIMA HAK ARISAN', width / 2, titleY + 19);

    // Heading
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('KWITANSI PEMBAYARAN GET ARISAN', width / 2, titleY + 60);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`Nomor Kwitansi: ${kwNumber}`, width / 2, titleY + 82);

    // Kwitansi Details Form Table Card
    const tableTop = titleY + 110;
    const tableWidth = width - 140;
    const tableHeight = 310;

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(70, tableTop, tableWidth, tableHeight, [16]);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Table Content Rows
    const drawKwitansiRow = (label: string, value: string, yPos: number, isBoldValue = false, valueColor = '#0f172a') => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(label, 100, yPos);

      ctx.fillStyle = '#64748b';
      ctx.fillText(':', 310, yPos);

      ctx.fillStyle = valueColor;
      ctx.font = isBoldValue ? '900 16px sans-serif' : '15px sans-serif';
      ctx.fillText(value, 330, yPos);

      // Row separator
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, yPos + 16);
      ctx.lineTo(width - 100, yPos + 16);
      ctx.stroke();
    };

    const memberNoStr = member?.no ? ` (No. Anggota #${member.no.toString().padStart(2, '0')})` : '';
    drawKwitansiRow('Telah Diserahkan Kepada', `${winner.memberName} - ${winner.memberCategory}${memberNoStr}`, tableTop + 45, true, '#064e3b');
    drawKwitansiRow('Uang Sejumlah', formatRupiah(winner.prizeAmount), tableTop + 95, true, '#047857');
    drawKwitansiRow('Terbilang', `"${terbilangRupiah(winner.prizeAmount)}"`, tableTop + 145, false, '#065f46');
    drawKwitansiRow('Guna Pembayaran', `Penyaluran Hak Dana Arisan (Get) Putaran #${winner.roundNumber} Tahun ${drawYear}`, tableTop + 195, true, '#0f172a');
    drawKwitansiRow('Tempat & Tanggal Undian', `${winner.notes || profile.meetingLocation || 'KUA Kec. Kedungbanteng'} • ${formatDateIndo(winner.drawDate)}`, tableTop + 245, false, '#334155');

    // Amount Callout Ribbon
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(100, tableTop + 270, 260, 42, [10]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(formatRupiah(winner.prizeAmount), 230, tableTop + 297);

    // Barcode & QR Code Section in Kwitansi
    const securityTop = tableTop + tableHeight + 25;
    const secBoxHeight = 135;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(70, securityTop, tableWidth, secBoxHeight, [14]);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 1D Barcode Graphic
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('BARCODE OTENTIKASI SISTEM KWITANSI', 96, securityTop + 24);

    const barPattern = [
      2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 2, 4, 1, 2, 3, 2, 1, 4, 2, 1, 3,
      2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1,
      4, 2, 1, 3, 2, 4, 1, 2, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2
    ];
    ctx.fillStyle = '#0f172a';
    let curX = 96;
    for (let i = 0; i < barPattern.length; i++) {
      const barW = barPattern[i] * 1.5;
      if (i % 2 === 0) {
        ctx.fillRect(curX, securityTop + 34, barW, 36);
      }
      curX += barW + 1.8;
    }
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#334155';
    ctx.fillText(`*${verificationCode}*`, 96 + 120, securityTop + 86);

    // QR Code
    try {
      const qrData = JSON.stringify({
        doc: kwNumber,
        tipe: 'KWITANSI RESMI HAK ARISAN',
        paguyuban: profile.name,
        putaran: winner.roundNumber,
        pemenang: winner.memberName,
        nominal: winner.prizeAmount,
        tanggal: winner.drawDate,
        ketua: profile.officialDocumentConfig.chairmanName,
        status: 'LUNAS & TERVERIFIKASI',
      });
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 90,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => { qrImg.onload = resolve; });
      ctx.drawImage(qrImg, width - 190, securityTop + 20, 95, 95);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('🛡 Validasi E-Kwitansi', width - 380, securityTop + 50);
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText('Sistem Digital Bani P3N', width - 380, securityTop + 68);
      ctx.font = '10px monospace';
      ctx.fillText(`Date: ${winner.drawDate}`, width - 380, securityTop + 86);
    } catch {}

    // Signatures
    const sigTop = securityTop + secBoxHeight + 30;
    await drawSignaturesBlock(ctx, profile, winner, width, sigTop);

  } else {
    // ==========================================
    // RENDER BERITA ACARA & SURAT KEPUTUSAN
    // ==========================================
    const titleY = bodyTop + 24;

    // Document Title Badge
    ctx.fillStyle = '#d1fae5'; // Emerald 100
    ctx.beginPath();
    ctx.roundRect(width / 2 - 170, titleY, 340, 28, [14]);
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SURAT KEPUTUSAN & BERITA ACARA RESMI', width / 2, titleY + 19);

    // Heading
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 22px sans-serif';
    ctx.fillText('PENGESAHAN PEMENANG KOCOKAN ARISAN', width / 2, titleY + 60);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`Nomor: ${baNumber}`, width / 2, titleY + 82);

    // Narrative
    const narTop = titleY + 115;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '15px/24px sans-serif';
    ctx.fillText(`Pada hari ini, ${formatDateIndo(winner.drawDate)}, telah dilaksanakan penarikan kocokan arisan putaran rutin bulanan`, 70, narTop);
    ctx.fillText(`${profile.name} periode tahun berjalan ${drawYear} secara terbuka, acak, dan disaksikan oleh seluruh anggota`, 70, narTop + 24);
    ctx.fillText(`yang hadir. Dengan ini menetapkan dan mengesahkan:`, 70, narTop + 48);

    // Highlighted Winner Card Box
    const cardTop = narTop + 72;
    const cardHeight = 220;
    const cardWidth = width - 140;

    ctx.fillStyle = '#ecfdf5'; // Emerald 50
    ctx.beginPath();
    ctx.roundRect(70, cardTop, cardWidth, cardHeight, [16]);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Round badge in card
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(width - 240, cardTop + 16, 150, 30, [15]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PUTARAN #${winner.roundNumber}`, width - 165, cardTop + 36);

    // Left Column
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('NAMA PENERIMA / PEMENANG ARISAN:', 96, cardTop + 40);

    ctx.fillStyle = '#064e3b';
    ctx.font = '900 26px sans-serif';
    ctx.fillText(winner.memberName, 96, cardTop + 74);

    ctx.fillStyle = '#334155';
    ctx.font = '14px sans-serif';
    const memberNoStr = member?.no ? ` • No. Anggota: #${member.no.toString().padStart(2, '0')}` : '';
    ctx.fillText(`Kategori: ${winner.memberCategory}${memberNoStr} • Status: Aktif`, 96, cardTop + 102);

    // Right Column
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('HAK PEROLEHAN DANA ARISAN (GET):', width - 96, cardTop + 72);

    ctx.fillStyle = '#047857';
    ctx.font = '900 32px monospace';
    ctx.fillText(formatRupiah(winner.prizeAmount), width - 96, cardTop + 110);

    ctx.fillStyle = '#065f46';
    ctx.font = 'italic 13px sans-serif';
    ctx.fillText(`(${terbilangRupiah(winner.prizeAmount)})`, width - 96, cardTop + 134);

    // Inner Card Footer
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(96, cardTop + 160);
    ctx.lineTo(width - 96, cardTop + 160);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = '13px sans-serif';
    const locNote = winner.notes || profile.meetingLocation || 'Pertemuan Rutin KUA Kedungbanteng';
    ctx.fillText(`Tempat Penarikan: ${locNote}`, 96, cardTop + 190);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('✔ Status: SAH, LENGKAP & DISETUJUI', width - 96, cardTop + 190);

    // Barcode & QR Code Section
    const securityTop = cardTop + cardHeight + 25;
    const secBoxHeight = 150;

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(70, securityTop, cardWidth, secBoxHeight, [14]);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 1D Barcode
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('BARCODE AUTENTIKASI DOKUMEN SISTEM', 96, securityTop + 28);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(96, securityTop + 38, 380, 75, [8]);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    const barPattern = [
      2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 2, 4, 1, 2, 3, 2, 1, 4, 2, 1, 3,
      2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1,
      4, 2, 1, 3, 2, 4, 1, 2, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2
    ];
    ctx.fillStyle = '#0f172a';
    let curX = 115;
    for (let i = 0; i < barPattern.length; i++) {
      const barW = barPattern[i] * 1.6;
      if (i % 2 === 0) {
        ctx.fillRect(curX, securityTop + 48, barW, 40);
      }
      curX += barW + 1.8;
    }
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#334155';
    ctx.fillText(`*${verificationCode}*`, 96 + 190, securityTop + 104);

    // QR Code
    try {
      const qrData = JSON.stringify({
        doc: baNumber,
        paguyuban: profile.name,
        putaran: winner.roundNumber,
        pemenang: winner.memberName,
        nominal: winner.prizeAmount,
        tanggal: winner.drawDate,
        ketua: profile.officialDocumentConfig.chairmanName,
        status: 'TERVERIFIKASI SAH',
      });
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 100,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => { qrImg.onload = resolve; });
      ctx.drawImage(qrImg, width - 210, securityTop + 24, 100, 100);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('🛡 E-Verifikasi Sah', width - 420, securityTop + 55);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('Sistem Digital Bani P3N', width - 420, securityTop + 76);
      ctx.font = '11px monospace';
      ctx.fillText(`Date: ${winner.drawDate}`, width - 420, securityTop + 96);
    } catch {}

    // Signatures
    const sigTop = securityTop + secBoxHeight + 35;
    await drawSignaturesBlock(ctx, profile, winner, width, sigTop);
  }

  // 9. Document Footer
  const footerY = height - 60;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, footerY);
  ctx.lineTo(width - 70, footerY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.fillText('Sistem Digital Arisan Bani P3N KUA Kedungbanteng • Dokumen Resmi Terbit Otomatis', 70, footerY + 20);

  ctx.textAlign = 'right';
  ctx.font = '11px monospace';
  ctx.fillText(`Ref: ${activeDocNumber} • Generated: ${new Date().toISOString().split('T')[0]}`, width - 70, footerY + 20);

  return canvas;
}

/**
 * Initiates direct download of high-resolution .JPG or .PNG certificate file.
 */
export async function downloadCertificateFile(
  winner: LotteryWinner,
  profile: PaguyubanProfile,
  format: 'jpeg' | 'png',
  member?: Member,
  docKind: DocKind = 'kwitansi'
) {
  const canvas = await generateCertificateCanvas(winner, profile, member, docKind);
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const extension = format === 'jpeg' ? 'jpg' : 'png';
  const dataUrl = canvas.toDataURL(mimeType, 0.96);

  const cleanName = winner.memberName.replace(/[^a-zA-Z0-9]/g, '_');
  const docTitlePrefix = docKind === 'kwitansi' ? 'Kwitansi_KopSurat' : 'Berita_Acara';
  const filename = `${docTitlePrefix}_Kocokan_Putaran_${winner.roundNumber}_${cleanName}.${extension}`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
