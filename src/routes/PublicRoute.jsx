import { Navigate } from 'react-router-dom';
import { useAuth } from 'hooks';
import Loader from 'components/Loader';

export const PublicRoute = ({ children, redirectTo = '/' }) => {
  const { isLoggedIn, isRefreshing } = useAuth();
  if (isRefreshing) return <Loader />;
  return isLoggedIn ? <Navigate to={redirectTo} /> : children;
};
