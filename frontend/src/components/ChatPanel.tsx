import React, { useState, useEffect, useRef, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatPanelProps {
  orderId: number;
  receiverId: number;
  receiverName: string;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ orderId, receiverId, receiverName, onClose }) => {
  const { user } = useContext(AuthContext) as any;
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/order/${orderId}?withUserId=${receiverId}`);
      setMessages(res.data || []);
      // Mark as read
      await API.put(`/messages/order/${orderId}/read`);
    } catch {}
  };

  useEffect(() => {
    fetchMessages().finally(() => setLoading(false));
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      await API.post('/messages', { receiverId, orderId, content: content.trim() });
      setContent('');
      fetchMessages();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const currentUserId = user?.id;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '360px',
      height: '480px',
      background: '#fff',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      overflow: 'hidden',
      animation: 'slideUp 0.3s ease',
    }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .chat-msg-bubble { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #e94560, #c0392b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0,
        }}>
          {receiverName?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{receiverName}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Đơn hàng #{orderId}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '18px', lineHeight: 1 }}
        >✕</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: '#f8fafc',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>Đang tải tin nhắn...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>💬</div>
            <p style={{ margin: 0, fontSize: '13px' }}>Chưa có tin nhắn nào.<br />Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className="chat-msg-bubble"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMine ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  background: isMine ? 'linear-gradient(135deg, #e94560, #c0392b)' : '#fff',
                  color: isMine ? '#fff' : '#1a1a2e',
                  padding: '10px 14px',
                  borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '3px', padding: '0 4px' }}>
                  {!isMine && <span style={{ marginRight: '4px' }}>{msg.senderName} •</span>}
                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          gap: '8px',
          background: '#fff',
        }}
      >
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Nhập tin nhắn..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '20px',
            border: '1.5px solid #e2e8f0',
            fontSize: '13px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = '#e94560'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: content.trim() && !sending ? 'linear-gradient(135deg, #e94560, #c0392b)' : '#e2e8f0',
            color: '#fff',
            cursor: content.trim() && !sending ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          {sending ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
