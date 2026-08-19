import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getProductImageUrl } from '../services/api';
import { Product } from '../types';
import { Bot, User, X, Sparkles, ShoppingCart, Send, Loader2, MinusCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'AI' | 'USER';
  text: string;
  products?: Product[];
  orders?: any[];
  vouchers?: any[];
  redirectUrl?: string;
}

const AIChatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'AI',
      text: 'Xin chào! Mình là trợ lý mua sắm AI. Mình có thể giúp bạn tìm kiếm laptop, điện thoại, hay bất kỳ sản phẩm nào bạn cần. Bạn đang tìm gì thế?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: Date.now().toString(), sender: 'USER', text: userMessage }
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Map conversation history for backend context
      const historyPayload = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await API.post('/ai/chat', { 
        message: userMessage,
        history: historyPayload
      });
      
      setMessages([
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          text: response.data.reply || response.data.message,
          products: response.data.products,
          orders: response.data.orders,
          vouchers: response.data.vouchers,
          redirectUrl: response.data.redirectUrl
        }
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          text: 'Xin lỗi, hệ thống AI đang bận hoặc có lỗi kết nối. Vui lòng thử lại sau.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 animate-bounce"
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] bg-white dark:bg-zinc-900 rounded-sm shadow-lg flex flex-col z-50 overflow-hidden border border-gray-200 dark:border-zinc-800 animate-slide-up">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-sm">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Shopping Assistant</h3>
                <p className="text-[10px] text-indigo-100">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-sm transition-colors"
            >
              <MinusCircle size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50 dark:bg-zinc-950/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-sm text-sm ${
                    msg.sender === 'USER' 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-zinc-700 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                
                {/* Render Products if AI returns them */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 flex gap-3 overflow-x-auto w-full pb-2 scrollbar-thin">
                    {msg.products.map(p => {
                      const activePrice = p.discountPrice !== null ? p.discountPrice : p.price;
                      return (
                        <div 
                          key={p.id}
                          onClick={() => navigate(`/products/${p.id}`)}
                          className="min-w-[140px] max-w-[140px] bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 rounded-sm overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-400 transition-all flex-shrink-0"
                        >
                          <div className="aspect-square bg-gray-100 overflow-hidden relative">
                            {p.imageUrl ? (
                              <img src={getProductImageUrl(p.imageUrl.split(';')[0])} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingCart size={20} />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <h4 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 line-clamp-2 h-[32px]">{p.name}</h4>
                            <p className="text-xs font-black text-indigo-600 mt-1">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activePrice)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Render Orders if AI returns them */}
                {msg.orders && msg.orders.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 w-full">
                    {msg.orders.map(order => (
                      <div 
                        key={order.id}
                        className="p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-sm text-xs flex flex-col gap-1 shadow-sm"
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-gray-800 dark:text-gray-200">Đơn hàng #{order.id}</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{order.status || order.orderStatus}</span>
                        </div>
                        <div className="text-gray-500 flex justify-between">
                          <span>Tổng tiền:</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Vouchers if AI returns them */}
                {msg.vouchers && msg.vouchers.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 w-full">
                    {msg.vouchers.map(voucher => (
                      <div 
                        key={voucher.id}
                        className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-dashed border-indigo-300 dark:border-indigo-800 rounded-sm text-xs flex justify-between items-center shadow-sm"
                      >
                        <div>
                          <div className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">{voucher.code}</div>
                          <div className="text-gray-500 text-[10px] mt-0.5">
                            Giảm {new Intl.NumberFormat('vi-VN').format(voucher.discountAmount)}
                            {voucher.discountType === 'PERCENTAGE' ? '%' : 'đ'} (Đơn tối thiểu {new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue)}đ)
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(voucher.code);
                            alert('Đã copy mã voucher: ' + voucher.code);
                          }}
                          className="px-2 py-1 bg-indigo-600 text-white rounded-sm text-[10px] font-bold hover:bg-indigo-700 transition-colors"
                        >
                          Lấy mã
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Redirect Button if AI returns redirectUrl */}
                {msg.redirectUrl && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate(msg.redirectUrl || '');
                    }}
                    className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm shadow-sm transition-colors w-full"
                  >
                    {msg.redirectUrl === '/login' ? 'Đăng nhập ngay' : 'Đi tới trang liên kết'}
                  </button>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start gap-2">
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-sm rounded-bl-sm border border-gray-100 dark:border-zinc-700 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                  <span className="text-xs text-gray-500">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
            <form onSubmit={handleSend} className="flex items-center gap-2 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập nhu cầu của bạn..." 
                className="flex-1 bg-gray-100 dark:bg-zinc-800 border-none rounded-full py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-gray-200"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="absolute right-1 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full disabled:opacity-50 transition-colors"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default AIChatbox;
