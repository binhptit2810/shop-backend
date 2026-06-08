import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';

const AdminMessages = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrderId) return;
    fetchMessages(selectedOrderId);
    const interval = setInterval(() => fetchMessages(selectedOrderId), 5000);
    return () => clearInterval(interval);
  }, [selectedOrderId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders');
      setOrders(res.data || []);
      if (res.data?.length > 0 && !selectedOrderId) {
        setSelectedOrderId(res.data[0].id);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const fetchMessages = async (orderId) => {
    try {
      const res = await API.get(`/messages/order/${orderId}`);
      setMessages(res.data || []);
      await API.put(`/messages/order/${orderId}/read`);
    } catch {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedOrderId || sending) return;
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;
    const buyerId = order.userId || order.user?.id;
    setSending(true);
    try {
      await API.post('/messages', { receiverId: buyerId, orderId: selectedOrderId, content: input.trim() });
      setInput('');
      fetchMessages(selectedOrderId);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const currentUserId = parseInt(localStorage.getItem('userId') || '0');

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>Phản hồi & Hỗ trợ</h2>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>Hỗ trợ khách hàng và trao đổi về đơn hàng</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 220px)', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
        {/* Conversation List */}
        <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid #f1f5f9', overflowY: 'auto', background: '#fafafa' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tất cả Đơn hàng ({orders.length})</h4>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '13px' }}>Đang tải...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
              <p style={{ margin: 0, fontSize: '13px' }}>Không có đơn hàng nào</p>
            </div>
          ) : orders.map(order => {
            const isActive = order.id === selectedOrderId;
            const statusLabels = { PENDING: 'Chờ', CONFIRMED: 'Xác nhận', SHIPPING: 'Giao hàng', DELIVERED: 'Đã giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: isActive ? 'var(--primary)' : '#1a1a2e' }}>Đơn #{order.id}</span>
                  <span style={{ fontSize: '11px', color: '#aaa' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>Người mua: {order.username}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Trạng thái: {statusLabels[order.orderStatus] || order.orderStatus}</div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(order.totalPrice || 0).toLocaleString('vi-VN')}đ
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Area */}
        {selectedOrderId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {selectedOrder?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Khách hàng: {selectedOrder?.username} – Đơn #{selectedOrderId}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Địa chỉ: {selectedOrder?.shippingAddress?.slice(0, 50)}...</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>Chưa có tin nhắn nào</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#bbb' }}>Bắt đầu hỗ trợ khách hàng bằng cách nhắn tin!</p>
                </div>
              ) : messages.map(msg => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '65%', background: isMine ? 'linear-gradient(135deg, var(--primary), #4f46e5)' : '#fff', color: isMine ? '#fff' : '#1a1a2e', padding: '10px 16px', borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px', fontSize: '14px', lineHeight: '1.5', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', padding: '0 4px' }}>
                      {!isMine && <span style={{ marginRight: '4px' }}>{msg.senderName} •</span>}
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Nhập tin nhắn phản hồi..."
                style={{ flex: 1, padding: '12px 18px', borderRadius: '25px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: input.trim() && !sending ? 'linear-gradient(135deg, var(--primary), #4f46e5)' : '#e2e8f0', color: '#fff', cursor: input.trim() && !sending ? 'pointer' : 'not-allowed', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}
              >
                {sending ? '⏳' : '➤'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
              <p>Chọn một đơn hàng để xem tin nhắn hỗ trợ</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
