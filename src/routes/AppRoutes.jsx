import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import ComingSoon from '../pages/ComingSoon';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import DashboardLayout from '../layouts/DashboardLayout';
import Profile from '../pages/dashboard/Profile';
import KYCUpload from '../pages/dashboard/KYCUpload';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coming-soon" element={<ComingSoon />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Profile />} />
        <Route path="kyc" element={<KYCUpload />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
