import React from 'react';
import './styles.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
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

// ✅ Private Route (for logged-in users)
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// ✅ Public Route (redirect if already logged in)
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
};

// ✅ Main app content structure
function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';
  
  return (
    <div className="min-h-screen bg-white">
      <NotificationProvider>
      {/* Navbar fixed at top - hidden on login/register pages */}
      {!hideNavbar && <Navbar />}

      {/* Main content with conditional padding */}
      <main className={!hideNavbar ? "pt-16 overflow-hidden" : "overflow-hidden"}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/reels"
            element={
              <PrivateRoute>
                <ReelsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/direct"
            element={
              <PrivateRoute>
                <Direct />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessagesPage />
              </PrivateRoute>
            }
          />
          <Route path="/messages/:userId" element={
            <PrivateRoute>
              <MessagesPage />
            </PrivateRoute>
          } />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            }
          />
          {/* User profile route */}
          <Route
            path="/user/:username"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          {/* Current user's profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="/search" element={<SearchResults />} />

          {/* Default route (404 redirect) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      </NotificationProvider>
    </div>
  );
}

// App wrapper with Router + AuthProvider
function App() {
  return (
    <Router>
      <AuthProvider>
        <MessageProvider>
          <AppContent />
        </MessageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
