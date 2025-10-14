import { useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../api/api';

import {
  Alert,
  Box,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
// Import icons from their direct paths to avoid index export issues
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoadingButton from '@mui/lab/LoadingButton';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Refs for keyboard navigation
  const fullNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const fieldsOrder = [fullNameRef, usernameRef, emailRef, passwordRef];

  // Accept HTMLElement because MUI TextField's onKeyDown is on a wrapper div
  const handleKeyNav = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = fieldsOrder[index + 1]?.current;
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = fieldsOrder[index - 1]?.current;
      prev?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, width: '100%' }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
          Create your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.25}>
            <TextField
              inputRef={fullNameRef}
              label="Full Name"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyNav(e, 0)}
              required
              fullWidth
              sx={{ borderRadius:2}}
              autoComplete="name"
            />

            <TextField
              inputRef={usernameRef}
              label="Username"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyNav(e, 1)}
              required
              fullWidth
              autoComplete="username"
              sx={{ borderRadius:2}}
            />

            <TextField
              inputRef={emailRef}
              label="Email address"
              id="email-address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyNav(e, 2)}
              required
              fullWidth
              autoComplete="email"
              sx={{ borderRadius:2}}
            />

            <TextField
              inputRef={passwordRef}
              label="Password"
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyNav(e, 3)}
              required
              fullWidth
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(s => !s)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius:2}}
            />

            <LoadingButton
              type="submit"
              loading={isLoading}
              variant="contained"
              size="large"
              fullWidth
              sx={{borderRadius:2}}
              >
              Sign up
            </LoadingButton>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default RegisterForm;
