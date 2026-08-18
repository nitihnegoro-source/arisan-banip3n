import { ChatMessage, Member, PaguyubanProfile } from '../types';
import { INITIAL_CHAT_MESSAGES } from '../data/initialData';

const STORAGE_KEY = 'paguyuban_chat_messages_2026';

export const getStoredChatMessages = (): ChatMessage[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: ChatMessage[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading chat messages from storage:', err);
  }

  // Check if there are individual chat_history_* items in localStorage and migrate them
  try {
    const migrated: ChatMessage[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_history_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const items = JSON.parse(raw);
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              if (item && item.message) {
                migrated.push({
                  id: item.id || `migrated-${Date.now()}-${Math.random()}`,
                  memberId: item.memberId || key.replace('chat_history_', ''),
                  memberName: item.memberName || 'Anggota',
                  category: item.category || 'Pengajuan Umum',
                  recipient: item.recipient || 'bendahara',
                  recipientName: item.recipientName || 'Pengurus Paguyuban',
                  recipientPhone: item.recipientPhone || '',
                  message: item.message,
                  timestamp: item.timestamp || new Date().toLocaleString('id-ID'),
                  status: item.status === 'Selesai' ? 'Selesai' : 'Baru',
                  replies: item.message ? [
                    {
                      id: `rep-${Date.now()}`,
                      sender: 'user',
                      senderName: item.memberName || 'Anggota',
                      message: item.message,
                      timestamp: item.timestamp || new Date().toLocaleString('id-ID'),
                    }
                  ] : []
                });
              }
            });
          }
        }
      }
    }

    if (migrated.length > 0) {
      // Merge with initial messages (avoid duplicates by ID)
      const combined = [...migrated];
      INITIAL_CHAT_MESSAGES.forEach(msg => {
        if (!combined.some(m => m.id === msg.id)) {
          combined.push(msg);
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      return combined;
    }
  } catch (err) {
    console.error('Error migrating old chats:', err);
  }

  // Fallback to initial sample messages
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CHAT_MESSAGES));
  } catch {
    // ignore
  }
  return INITIAL_CHAT_MESSAGES;
};

export const saveChatMessages = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('paguyuban_chat_updated', { detail: messages }));
  } catch (err) {
    console.error('Error saving chat messages:', err);
  }
};

export const addMemberMessage = (newMessage: ChatMessage): ChatMessage[] => {
  const current = getStoredChatMessages();
  const updated = [newMessage, ...current];
  saveChatMessages(updated);

  // Also sync to member's personal history key for backwards-compatibility
  try {
    const memberKey = `chat_history_${newMessage.memberId}`;
    const memberHistory = updated.filter(m => m.memberId === newMessage.memberId);
    localStorage.setItem(memberKey, JSON.stringify(memberHistory));
  } catch {
    // ignore
  }

  return updated;
};

export const addAdminReply = (
  messageId: string, 
  replyText: string, 
  adminName: string, 
  adminRole: string,
  newStatus: 'Diproses' | 'Dibalas' | 'Selesai' = 'Dibalas'
): ChatMessage[] => {
  const current = getStoredChatMessages();
  const timeNow = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date()) + ' WIB';

  const updated = current.map((msg) => {
    if (msg.id === messageId) {
      const existingReplies = msg.replies || [
        {
          id: `init-${msg.id}`,
          sender: 'user' as const,
          senderName: msg.memberName,
          message: msg.message,
          timestamp: msg.timestamp,
        }
      ];

      const newReply = {
        id: `reply-${Date.now()}`,
        sender: 'admin' as const,
        senderName: adminName,
        senderRole: adminRole,
        message: replyText,
        timestamp: timeNow,
      };

      return {
        ...msg,
        status: newStatus,
        adminReply: replyText,
        adminRepliedAt: timeNow,
        adminRepliedBy: `${adminName} (${adminRole})`,
        replies: [...existingReplies, newReply],
      };
    }
    return msg;
  });

  saveChatMessages(updated);

  // Sync to target member's personal history
  const target = updated.find(m => m.id === messageId);
  if (target) {
    try {
      const memberKey = `chat_history_${target.memberId}`;
      const memberHistory = updated.filter(m => m.memberId === target.memberId);
      localStorage.setItem(memberKey, JSON.stringify(memberHistory));
    } catch {
      // ignore
    }
  }

  return updated;
};

export const updateMessageStatus = (messageId: string, status: 'Baru' | 'Diproses' | 'Dibalas' | 'Selesai'): ChatMessage[] => {
  const current = getStoredChatMessages();
  const updated = current.map(m => m.id === messageId ? { ...m, status } : m);
  saveChatMessages(updated);
  return updated;
};

export const deleteChatMessage = (messageId: string): ChatMessage[] => {
  const current = getStoredChatMessages();
  const updated = current.filter(m => m.id !== messageId);
  saveChatMessages(updated);
  return updated;
};
