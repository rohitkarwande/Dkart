import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import ComingSoon from '../pages/ComingSoon';
import PostListing from '../pages/PostListing';
import ListingDetails from '../pages/ListingDetails';
import SearchDiscover from '../pages/SearchDiscover';
import Messages from '../pages/Messages';
import DealPipeline from '../pages/DealPipeline';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coming-soon" element={<ComingSoon />} />
      <Route path="/post-listing" element={<PostListing />} />
      <Route path="/listing/:id" element={<ListingDetails />} />
      <Route path="/search" element={<SearchDiscover />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/deals" element={<DealPipeline />} />
      {/* Add future routes here, e.g. */}
      {/* <Route path="/auth" element={<Auth />} /> */}
    </Routes>
  );
};

export default AppRoutes;
