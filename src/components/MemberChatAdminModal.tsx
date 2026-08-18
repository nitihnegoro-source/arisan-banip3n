import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Phone, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Receipt, 
  UserCheck, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Member, PaguyubanProfile, ChatMessage } from '../types';
import { getStoredChatMessages, addMemberMessage } from '../utils/chatManager';

interface MemberChatAdminModalProps {
  member: Member;
  profile: PaguyubanProfile;
  onClose: () => void;
}

export const MemberChatAdminModal: React.FC<MemberChatAdminModalProps> = ({
  member,
  profile,
  onClose,
}) => {
  const [recipient, setRecipient] = useState<'bendahara' | 'ketua' | 'sekretariat'>('bendahara');
  const [category, setCategory] = useState<string>('Konfirmasi Pembayaran Transfer');
  const [message, setMessage] = useState<string>('');
  
  // Load member history from unified chat store
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    return getStoredChatMessages().filter((m) => m.memberId === member.id);
  });

  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [isSuccessSent, setIsSuccessSent] = useState(false);

  // Sync on event
  useEffect(() => {
    const handleChatUpdated = () => {
      setHistory(getStoredChatMessages().filter((m) => m.memberId === member.id));
    };
    window.addEventListener('paguyuban_chat_updated', handleChatUpdated);
    return () => {
      window.removeEventListener('paguyuban_chat_updated', handleChatUpdated);
    };
  }, [member.id]);

  // Quick message templates
  const templates = [
    {
      title: '💳 Konfirmasi Transfer',
      text: `Assalamu'alaikum Pengurus Paguyuban Bani P3N, saya ${member.name} (No. #${member.no.toString().padStart(2, '0')}) mengonfirmasi telah melakukan transfer setoran arisan & iuran bulan ini. Mohon verifikasi & kuitansinya. Terima kasih.`,
      cat: 'Konfirmasi Pembayaran Transfer',
      rec: 'bendahara' as const,
    },
    {
      title: '❓ Tanya Jadwal Pertemuan',
      text: `Assalamu'alaikum Bapak/Ibu Pengurus, saya ${member.name} ingin menanyakan kepastian jadwal & lokasi pertemuan silaturahmi arisan paguyuban Bani P3N berikutnya. Terima kasih.`,
      cat: 'Jadwal & Agenda Pertemuan',
      rec: 'ketua' as const,
    },
    {
      title: '📝 Update Data & Foto KTA',
      text: `Assalamu'alaikum Admin, saya ${member.name} (No. Urut #${member.no.toString().padStart(2, '0')}) bermaksud mengajukan pembaharuan data diri / pas foto Kartu Tanda Anggota (KTA) saya.`,
      cat: 'Perbaikan Data Anggota / KTA',
      rec: 'sekretariat' as const,
    },
    {
      title: '🤝 Permohonan Kas Sosial',
      text: `Assalamu'alaikum Pengurus Paguyuban Bani P3N, saya ${member.name} ingin mengajukan permohonan santunan/bantuan dana sosial kas paguyuban terkait keperluan keluarga. Mohon informasi syarat dan prosedurnya.`,
      cat: 'Permohonan Dana Kas Sosial',
      rec: 'ketua' as const,
    },
  ];

  // Recipients info
  const recipientsData = {
    bendahara: {
      role: 'Bendahara Paguyuban',
      name: profile.contact?.treasurerName || 'Darsito',
      phone: profile.contact?.treasurerPhone || '0812-3456-7001',
      focus: 'Urusan Setoran Arisan, Iuran Kas, Kuitansi & Keuangan',
    },
    ketua: {
      role: 'Ketua Paguyuban',
      name: profile.contact?.chairmanName || 'H. Lubab Habib, S.Ag',
      phone: profile.contact?.chairmanPhone || '0812-3456-7010',
      focus: 'Kebijakan, Kocokan Arisan, Pertemuan & Dana Sosial',
    },
    sekretariat: {
      role: 'Sekretariat KUA',
      name: 'Admin Layanan KUA Kedungbanteng',
      phone: '0812-3456-7010',
      focus: 'Data Keanggotaan, Sertifikat, KTA Digital & Umum',
    },
  };

  const currentRecInfo = recipientsData[recipient];

  // Handle WhatsApp Direct Send & Save to Admin Inbox
  const handleSendWhatsApp = () => {
    if (!message.trim()) {
      alert('Silakan tulis pesan atau pilih template pesan terlebih dahulu.');
      return;
    }

    const cleanPhone = currentRecInfo.phone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const timeNow = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date()) + ' WIB';

    const formattedText = `*LAYANAN CHAT & PENGAJUAN ANGGOTA PAGUYUBAN BANI P3N*\n` +
      `-----------------------------------------\n` +
      `👤 *Nama*: ${member.name}\n` +
      `🔢 *No. Urut*: #${member.no.toString().padStart(2, '0')}\n` +
      `🏷️ *Kategori*: ${member.category}\n` +
      `📌 *Kategori Pesan*: ${category}\n` +
      `📅 *Waktu*: ${timeNow}\n` +
      `-----------------------------------------\n` +
      `💬 *Pesan Pengajuan*:\n${message}\n` +
      `-----------------------------------------\n` +
      `_Pesan dikirim melalui Portal Anggota Resmi Paguyuban Bani P3N KUA Kedungbanteng_`;

    // Save to unified chat manager (visible to Admin dashboard)
    const newSubmission: ChatMessage = {
      id: `chat-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberCategory: member.category,
      memberNo: member.no,
      memberPhone: member.phone,
      recipient,
      recipientName: currentRecInfo.name,
      recipientPhone: currentRecInfo.phone,
      category,
      topic: category,
      message,
      timestamp: timeNow,
      status: 'Baru',
      replies: [
        {
          id: `rep-${Date.now()}`,
          sender: 'user',
          senderName: member.name,
          senderRole: `Anggota (#${member.no.toString().padStart(2, '0')})`,
          message,
          timestamp: timeNow,
        }
      ]
    };

    addMemberMessage(newSubmission);
    setIsSuccessSent(true);

    // Open WhatsApp
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-white border border-white/20 shadow-md">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Layanan Chat & Pengajuan ke Admin
                </h3>
                <span className="rounded-full bg-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-200 uppercase">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-teal-100/80">
                Pengirim: <strong>{member.name}</strong> (No. #{member.no.toString().padStart(2, '0')})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('form'); setIsSuccessSent(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Tulis Chat / Pengajuan Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Riwayat & Tanggapan Admin ({history.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'form' ? (
            <>
              {isSuccessSent && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3 text-xs">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Pesan Berhasil Tersimpan & Diteruskan ke Pengurus!</p>
                    <p className="mt-0.5 text-emerald-700 dark:text-emerald-300">
                      Pesan Anda telah masuk ke Inbox Dashboard Admin Paguyuban dan jendela WhatsApp resmi pengurus telah dibuka. Anda dapat memantau jawaban respon admin pada tab <strong>Riwayat & Tanggapan Admin</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Pilih Penerima Pengurus */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  1. Pilih Pengurus Penerima:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['bendahara', 'ketua', 'sekretariat'] as const).map((key) => {
                    const r = recipientsData[key];
                    const isSelected = recipient === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRecipient(key)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {r.role}
                        </p>
                        <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold truncate mt-0.5">
                          {r.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {r.focus}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Template Cepat */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>2. Pilih Kategori & Template Pesan Cepat:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCategory(tpl.cat);
                        setMessage(tpl.text);
                        setRecipient(tpl.rec);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-500 text-left transition-all cursor-pointer group"
                    >
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">{tpl.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{tpl.cat}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Tulis Pesan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    3. Isi Pesan / Catatan Pengajuan:
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {message.length} karakter
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Tulis pesan atau pertanyaan Anda kepada ${currentRecInfo.name}...`}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 leading-relaxed font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Format pesan resmi dengan identitas anggota Anda.</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex-1 sm:flex-none text-center"
                  >
                    Tutup
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95 cursor-pointer flex-1 sm:flex-none"
                  >
                    <Send className="h-4 w-4" />
                    <span>Kirim Pesan ke Pengurus</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* History Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Daftar Pesan & Tanggapan Admin ({history.length})
                </h4>
                <p className="text-[11px] text-slate-400">Terhubung langsung dengan Dashboard Admin</p>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                  <MessageSquare className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-600 dark:text-slate-400">Belum ada riwayat pesan yang diajukan.</p>
                  <p className="text-[11px]">Gunakan formulir untuk mengirimkan pesan ke pengurus paguyuban.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Kepada: {item.recipientName}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">({item.recipient})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Selesai' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'Dibalas'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : item.status === 'Diproses'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Member's original message */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                      <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mb-1">
                        📌 {item.topic || item.category}
                      </p>
                      {item.message}
                    </div>

                    {/* Admin Reply Box if present */}
                    {item.adminReply && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1.5 animate-in fade-in">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            Respon Admin ({item.adminRepliedBy || 'Pengurus'})
                          </span>
                          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                            {item.adminRepliedAt || item.timestamp}
                          </span>
                        </div>
                        <p className="text-emerald-900 dark:text-emerald-100 font-medium whitespace-pre-line leading-relaxed">
                          {item.adminReply}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Kategori: {item.category}
                      </span>
                      {item.recipientPhone && (
                        <a
                          href={`https://wa.me/${item.recipientPhone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>Hubungi Pengurus di WA</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
