import hiwImage from '../assets/image/hiw.png';

const Header = () => {
  return (
      <div className="header">
        <div className="header-image-container">
          <img src={hiwImage} alt="ผักบุ้ง" className="header-image" />
          <div className="restaurant-overlay">
            <h1 className="restaurant-name">คลายหิว</h1>
            <span className="rating">⭐ 4.7</span>
          </div>
        </div>
      </div>
  );
};

export default Header;

