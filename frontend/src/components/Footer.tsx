import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-zinc-950 text-gray-500 dark:text-gray-400 border-t border-gray-155 dark:border-zinc-900 text-xs py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Top footer sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
          
          {/* Column 1: Chăm sóc khách hàng */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-250 mb-4.5 uppercase tracking-wider text-[11px]">Chăm sóc khách hàng</h4>
            <ul className="space-y-3 font-semibold text-gray-650 dark:text-gray-400">
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Shopee Blog</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Shopee Mall</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Chính sách vận chuyển</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Trả hàng & Hoàn tiền</a></li>
            </ul>
          </div>

          {/* Column 2: Về chúng tôi */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-250 mb-4.5 uppercase tracking-wider text-[11px]">Về ShopeeShop</h4>
            <ul className="space-y-3 font-semibold text-gray-650 dark:text-gray-400">
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Giới thiệu ShopeeShop</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Tuyển dụng nhân tài</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Kênh người bán chính hãng</a></li>
              <li><a href="#" className="hover:text-shopee hover:underline transition-all">Liên hệ với truyền thông</a></li>
            </ul>
          </div>

          {/* Column 3: Thanh toán & Vận chuyển */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-250 mb-4.5 uppercase tracking-wider text-[11px]">Thanh toán & Giao nhận</h4>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2.5">
                {["VISA", "MC", "JCB", "COD", "MOMO", "ZALO"].map((method, idx) => (
                  <span 
                    key={idx} 
                    className="bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 py-2 rounded-xl text-center font-black text-gray-750 dark:text-gray-300 text-[9px] shadow-xs select-none"
                  >
                    {method}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-bold bg-green-50 dark:bg-green-950/20 p-2.5 rounded-xl border border-green-100 dark:border-green-950/50">
                <ShieldCheck size={16} className="flex-shrink-0" />
                <span className="text-[10px]">Giao dịch bảo mật SSL 100%</span>
              </div>
            </div>
          </div>

          {/* Column 4: Theo dõi */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-250 mb-4.5 uppercase tracking-wider text-[11px]">Theo dõi chúng tôi</h4>
            <div className="flex flex-col gap-3 font-semibold text-gray-650 dark:text-gray-400">
              <a href="#" className="hover:text-shopee flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>
              <a href="#" className="hover:text-shopee flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4 text-pink-600 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>Instagram</span>
              </a>
              <a href="#" className="hover:text-shopee flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.525 3.545 12 3.545 12 3.545s-7.525 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.863.508 9.388.508 9.388.508s7.525 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Youtube</span>
              </a>
              <a href="#" className="hover:text-shopee flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764.784.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
              <a href="#" className="hover:text-shopee flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4 text-sky-500 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Twitter / X</span>
              </a>
            </div>
          </div>

          {/* Column 5: Tải ứng dụng */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-250 mb-4.5 uppercase tracking-wider text-[11px]">Tải ứng dụng ShopeeShop</h4>
            <div className="flex gap-3">
              <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-2 rounded-xl flex items-center justify-center shadow-xs">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-750 rounded-lg flex items-center justify-center font-bold text-gray-400 text-[10px] uppercase select-none">
                  QR Code
                </div>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <a href="#" className="bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 px-3 py-2 rounded-xl text-[9px] font-black text-gray-700 dark:text-gray-300 shadow-xs text-center transition-colors">
                  App Store
                </a>
                <a href="#" className="bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 px-3 py-2 rounded-xl text-[9px] font-black text-gray-700 dark:text-gray-300 shadow-xs text-center transition-colors">
                  Google Play
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom footer copyright */}
        <div className="mt-14 pt-8 border-t border-gray-150 dark:border-zinc-900 flex justify-between items-center flex-wrap gap-4 text-gray-400 font-bold text-[11px]">
          <p>&copy; {new Date().getFullYear()} ShopeeShop. Dự án mô phỏng E-Commerce chất lượng cao. Tất cả các quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-shopee transition-colors">Quốc gia & Khu vực: Việt Nam</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
