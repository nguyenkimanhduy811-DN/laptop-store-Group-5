import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * F2 + BR-09. Route bảo vệ.
 * <ProtectedRoute />              → yêu cầu đăng nhập
 * <ProtectedRoute roles={['admin']} /> → yêu cầu đúng vai trò
 * Hỗ trợ cả children và Outlet.
 */
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          message: 'Bạn không có quyền truy cập',
          variant: 'danger',
        }}
      />
    );
  }

  return children ?? <Outlet />;
}