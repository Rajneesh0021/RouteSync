import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export const ProtectedRoute = ({ roles, publicOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // If page is only for non-authenticated users (Login/Register/Home)
  if (publicOnly && isAuthenticated) {
    if (user?.role === 'driver') return <Navigate to="/driver" replace />;
    if (user?.role === 'passenger') return <Navigate to="/ride" replace />;
    return <Navigate to="/" replace />;
  }

  // If a protected page requires authentication
  if (!publicOnly && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role validation is required
  if (!publicOnly && roles && !roles.includes(user?.role)) {
    if (user?.role === 'driver') return <Navigate to="/driver" replace />;
    if (user?.role === 'passenger') return <Navigate to="/ride" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
