import { Navigate } from 'react-router-dom';

const Index = () => {
  const isAuth = localStorage.getItem('parking_admin_auth') === 'true';
  return isAuth ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default Index;
