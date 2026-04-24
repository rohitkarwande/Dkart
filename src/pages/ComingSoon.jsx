import { Link } from 'react-router-dom';

const ComingSoon = () => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-card">
        <div className="icon">🚧</div>
        <h2>Feature Coming Soon</h2>
        <p>We are currently working hard to build this feature. Check back later!</p>
        <Link to="/" className="back-button">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
