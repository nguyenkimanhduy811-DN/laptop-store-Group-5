import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

/**
 * F5. Đọc thông báo được gửi kèm khi navigate.
 * Hiển thị Toast một lần rồi xóa state để không hiện lại khi tải trang.
 */
export default function useFlashMessage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const shownKey = useRef(null);

  useEffect(() => {
    const message = location.state?.message;

    if (!message || shownKey.current === location.key) {
      return;
    }

    shownKey.current = location.key;

    showToast(message, location.state.variant || 'success');

    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: null,
    });
  }, [location, navigate, showToast]);
}