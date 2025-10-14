import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../Navbar.css";
import { FaHome, FaUser, FaSignOutAlt, FaCompass } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { Iconify } from "../../iconify";
const Navbar: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Check if current route matches the nav item
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <Link to="/" className="navbar__brand">
          <Iconify icon="skill-icons:instagram" width={30} height={30} alignItems="center" justifyContent="center" />
          Instagram
        </Link>
      </div>
      
      <div className="navbar__icons">
        <Link to="/" className={`navbar__icon ${isActive('/')}`}>
          <FaHome />
        </Link>
        
        <Link to="/explore" className={`navbar__icon ${isActive('/explore')}`}>
          <FaCompass />
        </Link>
        
        {/* <Link to="/create" className={`navbar__icon ${isActive('/create')}`}>
          <FaPlusSquare />
          <span className="notification-badge">3</span>
        </Link>
        
        <Link to="/activity" className={`navbar__icon ${isActive('/activity')}`}>
          <FaHeart />
          <span className="notification-badge">5</span>
        </Link> */}
        
        <Link 
          to={currentUser ? `/${currentUser.username}` : '/login'} 
          className={`navbar__icon ${isActive(`/${currentUser?.username}`)}`}
        >
          <FaUser />
        </Link>
        
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
