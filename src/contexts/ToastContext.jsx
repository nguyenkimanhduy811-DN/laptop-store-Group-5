import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

const TITLES = {
  success: 'Thành công',
  danger: 'Lỗi',
  warning: 'Lưu ý',
  info: 'Thông báo',
};

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, variant = 'success') => {
    setToasts((list) => [
      ...list,
      { id: nextId++, message, variant },
    ]);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <ToastContainer
        position="top-end"
        containerPosition="fixed"
        className="p-3"
        style={{ zIndex: 2000 }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            bg={toast.variant}
            autohide
            delay={3000}
            onClose={() => removeToast(toast.id)}
          >
            <Toast.Header>
              <strong className="me-auto">
                {TITLES[toast.variant] ?? 'Thông báo'}
              </strong>
            </Toast.Header>

            <Toast.Body
              className={
                ['danger', 'success'].includes(toast.variant)
                  ? 'text-white'
                  : ''
              }
            >
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);