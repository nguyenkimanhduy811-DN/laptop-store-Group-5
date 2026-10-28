import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import cartApi from '../api/cartApi';
import { getErrorMessage, isCancel } from '../api/axiosClient';
import { getSellingPrice } from '../utils/format';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

/** Bỏ các dòng có laptop đã bị xoá khỏi hệ thống (_expand trả về undefined) */
const validItems = (items) => items.filter((item) => item.laptop);

/**
 * G1. Giỏ hàng lưu thật trong json-server (/cartItems).
 * Mỗi item: { id, userId, laptopId, quantity, laptop }
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // id của user đã tải xong giỏ – tránh 1 lần render "giỏ rỗng" trước khi effect chạy
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Bản mới nhất của items, dùng trong các hàm async và optimistic update
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Đăng nhập / đăng xuất → tải lại giỏ
  useEffect(() => {
    if (!user) {
      setItems([]);
      return undefined;
    }

    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await cartApi.getByUser(user.id, controller.signal);
        setItems(validItems(data));
      } catch (err) {
        if (isCancel(err)) return;
        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadedUserId(user.id);
        }
      }
    };
    load();
    return () => controller.abort();
  }, [user, reloadKey]);

  /** Dùng sau khi đặt hàng: giỏ đã được xoá trên server */
  const clearLocal = useCallback(() => setItems([]), []);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const isLoading = loading || (Boolean(user) && loadedUserId !== user.id);

  const value = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + getSellingPrice(item.laptop) * item.quantity, 0);
    return {
      items,
      totalQuantity,
      totalPrice,
      loading: isLoading,
      error,
      clearLocal,
      reload,
    };
  }, [items, isLoading, error, clearLocal, reload]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
