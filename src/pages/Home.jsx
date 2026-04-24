import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';

const Home = () => {
  return (
    <div className="indiamart-layout">
      <Header />
      <main>
        <HeroBanner />
        <div className="main-content-wrapper">
          <CategoryGrid />
        </div>
      </main>
      
      <footer className="site-footer">
        <p>© 2026 MediMart B2B Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
