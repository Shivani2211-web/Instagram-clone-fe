import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/layout/Navbar';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Home from './pages/Home';
import Direct from './pages/Direct';
import Settings from './pages/Settings';
import CreatePost from './pages/CreatePost';
import NotificationsPage from './pages/NotificationPage';
import MessagesPage from './pages/MessagesPage';
import ReelsPage from './pages/ReelsPage';
import SearchResults from './pages/SearchResults';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

/* -------------------- ROUTE GUARDS -------------------- */

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
};

/* -------------------- MAIN APP CONTENT -------------------- */

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-container">
      <NotificationProvider>
        
        {!hideNavbar && <Navbar />}

        <main className={!hideNavbar ? "with-navbar" : ""}>
          <div className="content-wrapper">
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />

              {/* PROTECTED ROUTES */}
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/reels" element={<PrivateRoute><ReelsPage /></PrivateRoute>} />
              <Route path="/direct" element={<PrivateRoute><Direct /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
              <Route path="/messages/:userId" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
              <Route path="/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
              <Route path="/user/:username" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              
              {/* SEARCH */}
              <Route path="/search" element={<SearchResults />} />
              
              {/* CATCH ALL ROUTE */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>    
        </main>           
      </NotificationProvider>
    </div>
  );
}

/* -------------------- APP WRAPPER -------------------- */

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* FIX: Router MUST wrap AppContent */}
      <Router>
        <AuthProvider>
          <MessageProvider>
            <AppContent />
          </MessageProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
