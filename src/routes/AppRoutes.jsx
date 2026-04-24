import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import ComingSoon from '../pages/ComingSoon';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import DashboardLayout from '../layouts/DashboardLayout';
import Profile from '../pages/dashboard/Profile';
import KYCUpload from '../pages/dashboard/KYCUpload';
import PostListing from '../pages/PostListing';
import ListingDetails from '../pages/ListingDetails';
import SearchDiscover from '../pages/SearchDiscover';
import Messages from '../pages/Messages';
import DealPipeline from '../pages/DealPipeline';
import MyListings from '../pages/dashboard/MyListings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coming-soon" element={<ComingSoon />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/post-listing" element={<PostListing />} />
      <Route path="/listing/:id" element={<ListingDetails />} />
      <Route path="/search" element={<SearchDiscover />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/deals" element={<DealPipeline />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Profile />} />
        <Route path="kyc" element={<KYCUpload />} />
        <Route path="my-listings" element={<MyListings />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
