import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Profile from './pages/Profile';
import Home from './pages/Home';  // Add this import
import PostDetails from './pages/PostDetails';
import './App.css';
import Direct from './pages/Direct';
import Settings from './pages/Settings';  // Update this import (was from @mui/icons-material)
import CreatePost from './pages/CreatePost';

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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar fixed at top */}
      <Navbar />

      {/* Main content with top padding (to avoid overlap with navbar) */}
      <main className="pt-16">
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
            path="/direct"
            element={
              <PrivateRoute>
                <Direct />
              </PrivateRoute>
            }
          />
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
            path="/:username"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/p/:postId"
            element={
              <PrivateRoute>
                <PostDetails />
              </PrivateRoute>
            }
          />

          {/* Default route (404 redirect) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ✅ App wrapper with Router + AuthProvider
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
