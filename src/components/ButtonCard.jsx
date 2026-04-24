import { Link } from 'react-router-dom';

const ButtonCard = ({ title, path }) => {
  return (
    <Link to={path} className="button-card">
      <div className="button-card-content">
        <h3>{title}</h3>
        <span className="arrow">→</span>
      </div>
    </Link>
  );
};

export default ButtonCard;
