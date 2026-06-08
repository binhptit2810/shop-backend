import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { getProductImageUrl } from '../../services/api';

const statusConfig = {
  PENDING: { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fef3c7' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#dbeafe' },
  SHIPPING: { label: 'Đang giao', color: '#8b5cf6', bg: '#ede9fe' },
  DELIVERED: { label: 'Đã giao', color: '#10b981', bg: '#d1fae5' },
  COMPLETED: { label: 'Hoàn thành', color: '#059669', bg: '#d1fae5' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = React.useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!chatOrder) return;
    fetchChatMessages(chatOrder.id);
    const interval = setInterval(() => fetchChatMessages(chatOrder.id), 5000);
    return () => clearInterval(interval);
  }, [chatOrder]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/seller');
      setOrders(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchChatMessages = async (orderId) => {
    try {
      const buyerId = chatOrder?.userId || chatOrder?.user?.id;
      const url = buyerId ? `/messages/order/${orderId}?withUserId=${buyerId}` : `/messages/order/${orderId}`;
      const res = await API.get(url);
      setChatMessages(res.data || []);
      await API.put(`/messages/order/${orderId}/read`);
    } catch {}
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatOrder || sending) return;
    setSending(true);
    try {
      const buyerId = chatOrder.userId || chatOrder.user?.id;
      await API.post('/messages', { receiverId: buyerId, orderId: chatOrder.id, content: chatInput.trim() });
      setChatInput('');
      fetchChatMessages(chatOrder.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div><p style={{ color: '#888' }}>Đang tải đơn hàng...</p></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 180px)' }}>
      {/* Orders List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>Đơn hàng của tôi</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>{orders.length} đơn hàng</p>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Chưa có đơn hàng nào</h3>
            <p style={{ color: '#888' }}>Khi có người mua sản phẩm của bạn, đơn hàng sẽ hiện ở đây</p>
          </div>
        ) : (
          orders.map(order => {
            const s = statusConfig[order.status] || { label: order.status, color: '#888', bg: '#f3f4f6' };
            const isSelected = selectedOrder?.id === order.id;
            return (
              <div
                key={order.id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '12px',
                  boxShadow: isSelected ? '0 4px 20px rgba(233,69,96,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                  border: isSelected ? '1.5px solid #e94560' : '1.5px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedOrder(isSelected ? null : order)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e' }}>Đơn hàng #{order.id}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '-'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#e94560' }}>{(order.totalPrice || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                  📍 {order.shippingAddress} &nbsp;|&nbsp; 📞 {order.phoneNumber}
                </div>

                {/* Order Items */}
                {order.orderItems?.slice(0, 2).map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <img src={getProductImageUrl(item.imageUrl)} alt={item.productName} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=100'; }} />
                    <div style={{ flex: 1, fontSize: '13px' }}>
                      <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{item.productName}</div>
                      <div style={{ color: '#888' }}>x{item.quantity} • {(item.price || 0).toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                ))}
                {order.orderItems?.length > 2 && (
                  <div style={{ fontSize: '12px', color: '#888' }}>+{order.orderItems.length - 2} sản phẩm khác</div>
                )}

                {isSelected && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setChatOrder(order); setChatMessages([]); }}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1.5px solid #e94560', background: '#fff', color: '#e94560', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                    >
                      💬 Nhắn tin với người mua
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Chat Panel (inline) */}
      {chatOrder && (
        <div style={{
          width: '340px',
          flexShrink: 0,
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Chat Header */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>💬 Chat với người mua</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Đơn #{chatOrder.id}</div>
            </div>
            <button onClick={() => setChatOrder(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', padding: '40px 0', fontSize: '13px' }}>Chưa có tin nhắn</div>
            ) : chatMessages.map(msg => {
              const storedUserId = localStorage.getItem('userId');
              const currentId = storedUserId ? parseInt(storedUserId) : null;
              const isMine = msg.senderId === currentId;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '80%', background: isMine ? 'linear-gradient(135deg, #e94560, #c0392b)' : '#fff', color: isMine ? '#fff' : '#1a1a2e', padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: '10px', color: '#aaa', marginTop: '3px' }}>
                    {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendChat} style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
            />
            <button type="submit" disabled={!chatInput.trim() || sending} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: chatInput.trim() && !sending ? 'linear-gradient(135deg, #e94560, #c0392b)' : '#e2e8f0', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>➤</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
