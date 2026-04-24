import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import ComingSoon from '../pages/ComingSoon';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coming-soon" element={<ComingSoon />} />
      {/* Add future routes here, e.g. */}
      {/* <Route path="/auth" element={<Auth />} /> */}
    </Routes>
  );
};

export default AppRoutes;
