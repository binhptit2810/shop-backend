import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';

import './App.css';

function App() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type } = e.detail;
      const id = Date.now();
      
      setToasts((prev) => [...prev, { id, message, type }]);
      
      // Tự động xóa thông báo sau 3 giây
      setTimeout(() => {
        setToasts((prev) => prev.filter(t => t.id !== id));
      }, 3000);
    };

    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
          
          {/* Custom Toast notifications */}
          <div className="toast-container">
            {toasts.map(toast => (
              <div key={toast.id} className={`toast toast-${toast.type}`}>
                <span>{toast.message}</span>
              </div>
            ))}
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
