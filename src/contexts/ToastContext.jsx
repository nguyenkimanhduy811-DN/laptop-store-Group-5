import { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, variant = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 2000, position: 'fixed' }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            bg={toast.variant}
            onClose={() => removeToast(toast.id)}
            delay={3000}
            autohide
          >
            <Toast.Header closeButton>
              <strong className="me-auto">
                {toast.variant === 'success' && 'Thành công'}
                {toast.variant === 'danger' && 'Lỗi'}
                {toast.variant === 'warning' && 'Cảnh báo'}
                {toast.variant === 'info' && 'Thông báo'}
              </strong>
            </Toast.Header>

            <Toast.Body className="text-white">
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }

  return context;
}