import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Filter, 
  ExternalLink, 
  MessageCircle, 
  Sparkles, 
  Building2, 
  RefreshCw, 
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  PlusCircle,
  X
} from 'lucide-react';
import { ChatMessage, Member, PaguyubanProfile } from '../types';
import { 
  getStoredChatMessages, 
  addAdminReply, 
  updateMessageStatus, 
  deleteChatMessage,
  addMemberMessage
} from '../utils/chatManager';

interface AdminChatViewProps {
  members: Member[];
  profile: PaguyubanProfile;
  activeYear?: number;
}

export const AdminChatView: React.FC<AdminChatViewProps> = ({
  members,
  profile,
  activeYear = 2026,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredChatMessages());
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Baru' | 'Diproses' | 'Dibalas' | 'Selesai'>('all');
  const [filterRecipient, setFilterRecipient] = useState<'all' | 'bendahara' | 'ketua' | 'sekretariat'>('all');
  
  // Admin Reply Input State
  const [replyText, setReplyText] = useState('');
  const [adminSenderRole, setAdminSenderRole] = useState<'Bendahara' | 'Ketua' | 'Sekretariat'>('Bendahara');
  const [replyStatus, setReplyStatus] = useState<'Diproses' | 'Dibalas' | 'Selesai'>('Dibalas');
  const [showToast, setShowToast] = useState<string | null>(null);

  // New Broadcast / Direct Message Modal
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [newMsgMemberId, setNewMsgMemberId] = useState<string>('');
  const [newMsgTopic, setNewMsgTopic] = useState('');
  const [newMsgContent, setNewMsgContent] = useState('');

  // Sync when custom events happen or on mount
  useEffect(() => {
    const handleChatUpdated = () => {
      setMessages(getStoredChatMessages());
    };
    window.addEventListener('paguyuban_chat_updated', handleChatUpdated);
    return () => {
      window.removeEventListener('paguyuban_chat_updated', handleChatUpdated);
    };
  }, []);

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        msg.memberName.toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q) ||
        (msg.topic && msg.topic.toLowerCase().includes(q)) ||
        msg.category.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Filter status
      if (filterStatus !== 'all' && msg.status !== filterStatus) return false;

      // Filter recipient
      if (filterRecipient !== 'all' && msg.recipient !== filterRecipient) return false;

      return true;
    });
  }, [messages, searchQuery, filterStatus, filterRecipient]);

  // Selected Message
  const selectedMessage = useMemo(() => {
    if (!selectedMessageId) {
      return filteredMessages.length > 0 ? filteredMessages[0] : null;
    }
    return messages.find((m) => m.id === selectedMessageId) || filteredMessages[0] || null;
  }, [selectedMessageId, messages, filteredMessages]);

  // Auto select first message if none selected
  useEffect(() => {
    if (!selectedMessageId && filteredMessages.length > 0) {
      setSelectedMessageId(filteredMessages[0].id);
    }
  }, [filteredMessages, selectedMessageId]);

  // Corresponding Member profile for selected message
  const selectedMemberProfile = useMemo(() => {
    if (!selectedMessage) return null;
    return members.find((m) => m.id === selectedMessage.memberId);
  }, [selectedMessage, members]);

  // Status Counts
  const counts = useMemo(() => {
    const baru = messages.filter((m) => m.status === 'Baru').length;
    const diproses = messages.filter((m) => m.status === 'Diproses').length;
    const dibalas = messages.filter((m) => m.status === 'Dibalas').length;
    const selesai = messages.filter((m) => m.status === 'Selesai').length;
    return { total: messages.length, baru, diproses, dibalas, selesai };
  }, [messages]);

  // Quick reply canned templates
  const cannedTemplates = [
    {
      title: '💳 Konfirmasi Transfer Selesai',
      text: `Wa'alaikumsalam. Alhamdulillah setoran transfer Anda telah kami verifikasi dan resmi tercatat lunas di buku kas paguyuban. Kuitansi ber-barcode digital sudah aktif dan dapat diunduh melalui portal anggota. Terima kasih.`,
      status: 'Selesai' as const,
    },
    {
      title: '📅 Info Jadwal Arisan',
      text: `Wa'alaikumsalam Wr. Wb. Pertemuan dan kocokan arisan putaran berikutnya insya Allah diselenggarakan di Aula KUA Kecamatan Kedungbanteng. Undangan resmi akan segera kami bagikan.`,
      status: 'Dibalas' as const,
    },
    {
      title: '🪪 Pas Foto KTA Diperbarui',
      text: `Wa'alaikumsalam. Permintaan pembaruan data dan pas foto Kartu Tanda Anggota (KTA) Anda telah berhasil diproses. Silakan cek dan cetak KTA versi terbaru di portal anggota.`,
      status: 'Selesai' as const,
    },
    {
      title: '🤝 Persetujuan Kas Sosial',
      text: `Wa'alaikumsalam. Pengajuan permohonan dana sosial kas paguyuban Anda telah disetujui pengurus. Dana santunan akan segera disalurkan. Semoga berkah dan bermanfaat.`,
      status: 'Diproses' as const,
    }
  ];

  // Trigger Toast Notification
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Submit Admin Reply
  const handleSendReply = () => {
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      alert('Silakan tulis pesan balasan terlebih dahulu.');
      return;
    }

    let adminName = 'Admin Paguyuban';
    if (adminSenderRole === 'Bendahara') {
      adminName = profile.contact?.treasurerName || 'Darsito (Bendahara)';
    } else if (adminSenderRole === 'Ketua') {
      adminName = profile.contact?.chairmanName || 'H. Lubab Habib, S.Ag (Ketua)';
    } else {
      adminName = 'Sekretariat KUA Kedungbanteng';
    }

    const updated = addAdminReply(
      selectedMessage.id,
      replyText,
      adminName,
      adminSenderRole,
      replyStatus
    );
    setMessages(updated);
    setReplyText('');
    triggerToast('Balasan berhasil disimpan & diteruskan ke portal anggota!');
  };

  // Send Reply via WhatsApp
  const handleSendWhatsAppReply = () => {
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      alert('Silakan tulis isi balasan sebelum meneruskan ke WhatsApp.');
      return;
    }

    const phoneTarget = selectedMessage.memberPhone || selectedMemberProfile?.phone;
    if (!phoneTarget) {
      alert('Nomor WhatsApp anggota tidak ditemukan.');
      return;
    }

    const cleanPhone = phoneTarget.replace(/[^0-9]/g, '').replace(/^0/, '62');
    
    let adminName = 'Pengurus Paguyuban';
    if (adminSenderRole === 'Bendahara') {
      adminName = `${profile.contact?.treasurerName || 'Darsito'} (Bendahara)`;
    } else if (adminSenderRole === 'Ketua') {
      adminName = `${profile.contact?.chairmanName || 'H. Lubab Habib, S.Ag'} (Ketua)`;
    } else {
      adminName = 'Sekretariat KUA Kedungbanteng';
    }

    const waText = `*RESPON RESMI PENGURUS PAGUYUBAN BANI P3N*\n` +
      `-----------------------------------------\n` +
      `👤 *Penerima*: ${selectedMessage.memberName}\n` +
      `📌 *Topik Pengajuan*: ${selectedMessage.topic || selectedMessage.category}\n` +
      `📅 *Waktu*: ${new Date().toLocaleString('id-ID')}\n` +
      `👔 *Petugas*: ${adminName}\n` +
      `-----------------------------------------\n` +
      `💬 *Tanggapan / Jawaban Pengurus*:\n${replyText}\n` +
      `-----------------------------------------\n` +
      `_Pesan resmi dari Sistem Informasi Paguyuban Bani P3N KUA Kedungbanteng_`;

    // Also auto-save to thread
    handleSendReply();

    // Open WhatsApp
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`, '_blank');
  };

  // Change Status
  const handleChangeStatus = (status: 'Baru' | 'Diproses' | 'Dibalas' | 'Selesai') => {
    if (!selectedMessage) return;
    const updated = updateMessageStatus(selectedMessage.id, status);
    setMessages(updated);
    triggerToast(`Status pesan diubah menjadi: ${status}`);
  };

  // Delete message
  const handleDeleteMessage = (id: string) => {
    if (window.confirm('Hapus pesan ini dari riwayat obrolan?')) {
      const updated = deleteChatMessage(id);
      setMessages(updated);
      if (selectedMessageId === id) {
        setSelectedMessageId(null);
      }
      triggerToast('Pesan berhasil dihapus.');
    }
  };

  // Create new direct message to member
  const handleCreateNewMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgMemberId || !newMsgContent.trim()) {
      alert('Silakan pilih anggota dan tulis isi pesan.');
      return;
    }

    const targetMember = members.find((m) => m.id === newMsgMemberId);
    if (!targetMember) return;

    const timeNow = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date()) + ' WIB';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      memberId: targetMember.id,
      memberName: targetMember.name,
      memberCategory: targetMember.category,
      memberNo: targetMember.no,
      memberPhone: targetMember.phone,
      recipient: 'bendahara',
      recipientName: profile.contact?.treasurerName || 'Bendahara Paguyuban',
      recipientPhone: profile.contact?.treasurerPhone || '',
      category: 'Pemberitahuan / Pengumuman Pengurus',
      topic: newMsgTopic || 'Pemberitahuan Resmi Paguyuban',
      message: newMsgContent,
      timestamp: timeNow,
      status: 'Dibalas',
      adminReply: newMsgContent,
      adminRepliedAt: timeNow,
      adminRepliedBy: 'Pengurus Paguyuban',
      replies: [
        {
          id: `rep-${Date.now()}`,
          sender: 'admin',
          senderName: 'Pengurus Paguyuban',
          senderRole: 'Admin',
          message: newMsgContent,
          timestamp: timeNow,
        }
      ]
    };

    const updated = addMemberMessage(newMsg);
    setMessages(updated);
    setSelectedMessageId(newMsg.id);
    setShowNewMsgModal(false);
    setNewMsgTopic('');
    setNewMsgContent('');
    triggerToast('Pesan berhasil dikirim ke portal anggota!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 text-white dark:bg-emerald-600 px-5 py-3.5 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 dark:text-amber-300" />
          <span className="text-sm font-bold">{showToast}</span>
        </div>
      )}

      {/* Header View Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-200 border border-emerald-400/30">
              <MessageSquare className="h-4 w-4 text-amber-300" />
              Pusat Layanan Chat & Pengajuan Anggota
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Inbox & Respon Pengurus Paguyuban
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-2xl">
              Pantau dan tanggapi pesan konfirmasi pembayaran, jadwal pertemuan arisan, update KTA, serta santunan kas sosial dari anggota secara terpadu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNewMsgModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 text-xs shadow-lg shadow-amber-500/30 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Kirim Pesan ke Anggota</span>
            </button>
            <button
              type="button"
              onClick={() => setMessages(getStoredChatMessages())}
              className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2.5 text-xs border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
              title="Muat Ulang Pesan"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Counter Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div 
            onClick={() => setFilterStatus('all')}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              filterStatus === 'all' ? 'bg-white/20 border border-white/40 ring-2 ring-amber-400/50' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Total Masuk</p>
            <p className="text-xl font-extrabold mt-0.5">{counts.total}</p>
          </div>

          <div 
            onClick={() => setFilterStatus('Baru')}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              filterStatus === 'Baru' ? 'bg-rose-500/30 border border-rose-400/50 ring-2 ring-rose-400' : 'bg-rose-500/15 hover:bg-rose-500/25'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-200">Belum Dibalas</p>
              {counts.baru > 0 && <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />}
            </div>
            <p className="text-xl font-extrabold mt-0.5 text-rose-200">{counts.baru}</p>
          </div>

          <div 
            onClick={() => setFilterStatus('Diproses')}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              filterStatus === 'Diproses' ? 'bg-amber-500/30 border border-amber-400/50 ring-2 ring-amber-400' : 'bg-amber-500/15 hover:bg-amber-500/25'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Diproses</p>
            <p className="text-xl font-extrabold mt-0.5 text-amber-200">{counts.diproses}</p>
          </div>

          <div 
            onClick={() => setFilterStatus('Selesai')}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              filterStatus === 'Selesai' ? 'bg-emerald-500/30 border border-emerald-400/50 ring-2 ring-emerald-400' : 'bg-emerald-500/15 hover:bg-emerald-500/25'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Selesai / Lunas</p>
            <p className="text-xl font-extrabold mt-0.5 text-emerald-200">{counts.selesai}</p>
          </div>
        </div>
      </div>

      {/* Main Two-Pane Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Inbox List & Filters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama anggota, topik, atau kata kunci..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs & Recipient Dropdown */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <select
                value={filterRecipient}
                onChange={(e: any) => setFilterRecipient(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden"
              >
                <option value="all">Semua Tujuan</option>
                <option value="bendahara">Khusus Bendahara</option>
                <option value="ketua">Khusus Ketua</option>
                <option value="sekretariat">Khusus Sekretariat</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e: any) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden"
              >
                <option value="all">Semua Status</option>
                <option value="Baru">🔴 Baru</option>
                <option value="Diproses">🟡 Diproses</option>
                <option value="Dibalas">🔵 Dibalas</option>
                <option value="Selesai">🟢 Selesai</option>
              </select>
            </div>
          </div>

          {/* List of Messages */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[620px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <MessageSquare className="h-10 w-10 mx-auto opacity-40 text-slate-400" />
                <p className="font-bold text-sm text-slate-600 dark:text-slate-400">Tidak Ada Pesan</p>
                <p className="text-xs">Tidak ditemukan pesan yang sesuai dengan filter pencarian.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const statusColors = {
                  Baru: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                  Diproses: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                  Dibalas: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                  Selesai: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                };

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessageId(msg.id)}
                    className={`p-4 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-extrabold text-xs shrink-0">
                          {msg.memberNo ? `#${msg.memberNo.toString().padStart(2, '0')}` : 'AG'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            {msg.memberName}
                            {msg.memberCategory && (
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                ({msg.memberCategory})
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-400">{msg.timestamp}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusColors[msg.status]}`}>
                        {msg.status}
                      </span>
                    </div>

                    <div className="mt-2 pl-10 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <span className="text-teal-600 dark:text-teal-400">Tujuan:</span>
                        <span className="capitalize font-bold">{msg.recipient}</span>
                        <span>&bull;</span>
                        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{msg.category}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Message Detail, Thread & Action Response Box (7 cols) */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden flex flex-col min-h-[620px]">
              
              {/* Card Header: Member Info & Actions */}
              <div className="p-5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                    {selectedMessage.memberNo ? `#${selectedMessage.memberNo.toString().padStart(2, '0')}` : 'KUA'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {selectedMessage.memberName}
                      </h3>
                      {selectedMessage.memberCategory && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                          {selectedMessage.memberCategory}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>No. WA: {selectedMessage.memberPhone || selectedMemberProfile?.phone || '-'}</span>
                      {selectedMemberProfile?.address && (
                        <>
                          <span>&bull;</span>
                          <span>{selectedMemberProfile.address}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick WhatsApp Link & Status Setter */}
                <div className="flex items-center gap-2">
                  {(selectedMessage.memberPhone || selectedMemberProfile?.phone) && (
                    <a
                      href={`https://wa.me/${(selectedMessage.memberPhone || selectedMemberProfile?.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Assalamu'alaikum ${selectedMessage.memberName}, kami dari Pengurus Paguyuban Bani P3N KUA Kedungbanteng...`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                      title="Buka Chat WhatsApp Langsung"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={() => handleChangeStatus('Diproses')}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedMessage.status === 'Diproses' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      Proses
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeStatus('Selesai')}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedMessage.status === 'Selesai' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      Selesai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Hapus Pesan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inquiry Topic Info Banner */}
              <div className="px-6 py-3 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-semibold">
                  <span className="p-1 rounded-lg bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  <span>Kategori: <strong>{selectedMessage.category}</strong></span>
                  <span>&bull;</span>
                  <span>Tujuan Pengurus: <strong className="capitalize">{selectedMessage.recipient}</strong></span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{selectedMessage.timestamp}</span>
              </div>

              {/* Conversation Messages Thread Area */}
              <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[380px] bg-slate-50/40 dark:bg-slate-900/40">
                
                {/* Initial Member Inquiry Bubble */}
                <div className="flex flex-col items-start max-w-[88%] space-y-1">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{selectedMessage.memberName}</span>
                    <span className="text-[10px] text-slate-400">{selectedMessage.timestamp}</span>
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    {selectedMessage.topic && (
                      <p className="font-extrabold text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-slate-700/60 pb-1.5">
                        📌 {selectedMessage.topic}
                      </p>
                    )}
                    <p className="whitespace-pre-line">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Additional Replies from Thread */}
                {selectedMessage.replies && selectedMessage.replies.map((reply) => {
                  if (reply.sender === 'user') return null; // Already rendered as top message

                  return (
                    <div key={reply.id} className="flex flex-col items-end max-w-[88%] ml-auto space-y-1">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          {reply.senderName} ({reply.senderRole || 'Pengurus'})
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl rounded-tr-xs bg-emerald-600 text-white shadow-md space-y-1 text-xs leading-relaxed">
                        <p className="whitespace-pre-line">{reply.message}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Single admin reply fallback if not in replies list */}
                {(!selectedMessage.replies || selectedMessage.replies.length <= 1) && selectedMessage.adminReply && (
                  <div className="flex flex-col items-end max-w-[88%] ml-auto space-y-1">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] text-slate-400">{selectedMessage.adminRepliedAt || selectedMessage.timestamp}</span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        {selectedMessage.adminRepliedBy || 'Pengurus Paguyuban'}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl rounded-tr-xs bg-emerald-600 text-white shadow-md space-y-1 text-xs leading-relaxed">
                      <p className="whitespace-pre-line">{selectedMessage.adminReply}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Template Selector */}
              <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Template Tanggapan Cepat:
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {cannedTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setReplyText(tpl.text);
                        setReplyStatus(tpl.status);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:border-emerald-500 shrink-0 transition-colors cursor-pointer text-[11px]"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Compose Form */}
              <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Kirim Atas Nama:</span>
                    <select
                      value={adminSenderRole}
                      onChange={(e: any) => setAdminSenderRole(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="Bendahara">Bendahara ({profile.contact?.treasurerName || 'Darsito'})</option>
                      <option value="Ketua">Ketua ({profile.contact?.chairmanName || 'H. Lubab Habib'})</option>
                      <option value="Sekretariat">Sekretariat KUA Kedungbanteng</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Ubah Status Jadi:</span>
                    <select
                      value={replyStatus}
                      onChange={(e: any) => setReplyStatus(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="Dibalas">Dibalas</option>
                      <option value="Selesai">Selesai / Lunas</option>
                      <option value="Diproses">Sedang Diproses</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Tulis balasan atau penjelasan untuk ${selectedMessage.memberName}...`}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400">
                    Balasan akan langsung tersimpan di portal akun anggota dan dapat diteruskan ke WhatsApp.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendWhatsAppReply}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                      title="Simpan & Buka WhatsApp untuk kirim balasan"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Kirim ke WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendReply}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                      <span>Kirim Balasan Sistem</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-400 space-y-3 min-h-[500px] flex flex-col items-center justify-center">
              <MessageSquare className="h-16 w-16 opacity-30 text-emerald-500 mb-2" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Pilih Pesan Masuk untuk Ditanggapi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Klik salah satu pesan anggota di sebelah kiri untuk membaca rincian pengajuan dan mengirimkan respon konfirmasi dari pengurus.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Message / Broadcast Modal */}
      {showNewMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PlusCircle className="h-5 w-5 text-amber-300" />
                <h3 className="font-extrabold text-base">Kirim Pesan / Pengumuman ke Anggota</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewMsgModal(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMessage} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Anggota Penerima
                </label>
                <select
                  value={newMsgMemberId}
                  onChange={(e) => setNewMsgMemberId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                  required
                >
                  <option value="">-- Pilih Nama Anggota --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      #{m.no.toString().padStart(2, '0')} - {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topik / Subjek Pesan
                </label>
                <input
                  type="text"
                  value={newMsgTopic}
                  onChange={(e) => setNewMsgTopic(e.target.value)}
                  placeholder="Contoh: Konfirmasi Pelunasan Arisan / Info Pertemuan"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Isi Pesan Pengurus
                </label>
                <textarea
                  rows={4}
                  value={newMsgContent}
                  onChange={(e) => setNewMsgContent(e.target.value)}
                  placeholder="Tuliskan informasi resmi atau pengumuman yang ingin disampaikan..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewMsgModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Kirim Pesan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
