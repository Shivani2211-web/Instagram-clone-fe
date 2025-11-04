import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSignOutAlt,
  FaRegPaperPlane,
  FaHeart,
  FaRegUser,
  FaPlayCircle,
  FaRegBell,
  FaBell,
} from "react-icons/fa";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications, useUnreadNotifications } from "../../contexts/NotificationContext";
import { useMessages } from "../../contexts/MessageContext";
import { Iconify } from "../../iconify";
import "../../Navbar.css";

const Navbar: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Use notification context
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const { conversations } = useMessages();
  const unreadNotifications = useUnreadNotifications();
  
  // Calculate total unread messages across all conversations
  const totalUnreadMessages = conversations.reduce(
    (total, conversation) => total + (conversation.unreadCount || 0), 
    0
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) =>
    location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__brand">
          <Iconify
            icon="skill-icons:instagram"
            width={26}
            height={26}
            style={{ marginRight: "6px" }}
          />
          <span>Instagram</span>
        </Link>

        {/* Icons */}
        <div className="navbar__icons">
          {/* Home */}
          <Link to="/" className={`navbar__icon ${isActive("/")}`} title="Home">
            <svg
              aria-label="Home"
              fill="#262626"
              height="22"
              viewBox="0 0 48 48"
              width="22"
            >
              <path d="M45.5 48H30.1c-.8 0-1.5-.7-1.5-1.5V34.2c0-2.6-2.1-4.6-4.6-4.6s-4.6 2.1-4.6 4.6v12.3c0 .8-.7 1.5-1.5 1.5H2.5c-.8 0-1.5-.7-1.5-1.5V23c0-.4.2-.8.4-1.1L22.9.4c.6-.6 1.6-.6 2.1 0l21.5 21.5c.3.3.4.7.4 1.1v23.5c.1.8-.6 1.5-1.4 1.5z"></path>
            </svg>
          </Link>

          {/* Reels */}
          <Link to="/reels" className={`navbar__icon ${isActive("/reels")}`} title="Reels">
            <FaPlayCircle size={22} />
          </Link>

          {/* Messages */}
          <div className="navbar__dropdown">
            <button
              className="navbar__icon"
              title="Messages"
              onClick={() => navigate("/messages")}
            >
              <FaRegPaperPlane />
              {totalUnreadMessages > 0 && (
                <span className="navbar__badge">
                  {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                </span>
              )}
            </button>
          </div>

          {/* Notifications */}
          <div className="navbar__dropdown" ref={notificationsRef}>
            <button
              className="navbar__icon"
              title="Notifications"
              onClick={() => {
                setShowNotifications((p) => !p);
                if (!showNotifications && unreadNotifications.length > 0) {
                  markAllAsRead();
                }
              }}
            >
              {showNotifications ? (
                <FaBell style={{ color: "#0095f6" }} />
              ) : (
                <>
                  <FaRegBell />
                  {unreadNotifications.length > 0 && (
                    <span className="navbar__badge">{unreadNotifications.length}</span>
                  )}
                </>
              )}
            </button>
            
            {showNotifications && (
              <div className="navbar__dropdown-content notification-dropdown">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  {unreadNotifications.length > 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="mark-all-read"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((n) => (
                      <Link 
                        key={n.id} 
                        to={n.postId ? `/p/${n.postId}` : '#'}
                        className={`notification-item ${n.read === 'unread' ? 'unread' : ''}`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="notification-icon">
                          {n.type === 'like' && <FaHeart style={{ color: '#ed4956' }} />}
                          {n.type === 'follow' && <FaUser style={{ color: '#0095f6' }} />}
                          {!n.type && <FaBell style={{ color: '#8e8e8e' }} />}
                        </div>
                        <div className="notification-content">
                          <p>{n.text}</p>
                          <small>
                            {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                          </small>
                        </div>
                        {n.read === 'unread' && <div className="unread-dot"></div>}
                      </Link>
                    ))
                  ) : (
                    <div className="empty-notifications">
                      <FaBell size={24} style={{ opacity: 0.5 }} />
                      <p>No notifications yet</p>
                      <small>When you get notifications, they'll appear here</small>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <Link to="/notifications" className="view-all">
                    View all notifications
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          {/* Profile Dropdown */}
          <div className="navbar__dropdown" ref={profileRef}>
            <button
              className="navbar__icon"
              title="Profile"
              onClick={() => setShowProfileMenu((p) => !p)}
            >
              {showProfileMenu ? <FaUser /> : <FaRegUser />}
            </button>

            {showProfileMenu && (
              <div className="navbar__dropdown-content">
                <Link
                  to={`/profile/${currentUser?.username || ""}`}
                  className="dropdown-item"
                >
                  <FaUser className="icon-sm" /> Profile
                </Link>

                <Link to="/settings" className="dropdown-item">
                  ⚙️ Settings
                </Link>

                <button onClick={handleLogout} className="dropdown-item logout">
                  <FaSignOutAlt className="icon-sm" /> Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
