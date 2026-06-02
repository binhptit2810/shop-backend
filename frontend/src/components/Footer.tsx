import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-800 text-xs py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div>
          <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase">Chăm sóc khách hàng</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-shopee">Trung tâm trợ giúp</a></li>
            <li><a href="#" className="hover:text-shopee">Shopee Blog</a></li>
            <li><a href="#" className="hover:text-shopee">Shopee Mall</a></li>
            <li><a href="#" className="hover:text-shopee">Hướng dẫn mua hàng</a></li>
            <li><a href="#" className="hover:text-shopee">Thanh toán</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase">Về ShopeeShop</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-shopee">Giới thiệu về ShopeeShop</a></li>
            <li><a href="#" className="hover:text-shopee">Tuyển dụng</a></li>
            <li><a href="#" className="hover:text-shopee">Điều khoản Shopee</a></li>
            <li><a href="#" className="hover:text-shopee">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-shopee">Chính hãng</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase">Thanh toán & Vận chuyển</h4>
          <div className="grid grid-cols-3 gap-2">
            <span className="bg-white p-2 rounded shadow-sm text-center font-bold text-gray-800 text-[10px]">VISA</span>
            <span className="bg-white p-2 rounded shadow-sm text-center font-bold text-gray-800 text-[10px]">MASTERCARD</span>
            <span className="bg-white p-2 rounded shadow-sm text-center font-bold text-gray-800 text-[10px]">JCB</span>
            <span className="bg-white p-2 rounded shadow-sm text-center font-bold text-gray-800 text-[10px]">SPayLater</span>
            <span className="bg-white p-2 rounded shadow-sm text-center font-bold text-gray-800 text-[10px]">COD</span>
            <span className="bg-white p-2 rounded shadow-sm text-center font-bold text-gray-800 text-[10px]">MOMO</span>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase">Theo dõi chúng tôi</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-shopee">Facebook</a></li>
            <li><a href="#" className="hover:text-shopee">Instagram</a></li>
            <li><a href="#" className="hover:text-shopee">LinkedIn</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase">Tải ứng dụng</h4>
          <div className="flex gap-2">
            <div className="bg-white p-1 rounded shadow-sm">
              <span className="text-[9px] text-gray-800 block text-center font-bold">QR CODE</span>
            </div>
            <div className="flex flex-col gap-1.5 justify-center">
              <span className="bg-white px-2 py-1 rounded shadow-sm text-[8px] font-bold text-gray-800">App Store</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm text-[8px] font-bold text-gray-800">Google Play</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center flex-wrap gap-4 text-gray-400">
        <p>&copy; {new Date().getFullYear()} ShopeeShop. Tất cả các quyền được bảo lưu.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-shopee">Quốc gia & Khu vực: Việt Nam</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
