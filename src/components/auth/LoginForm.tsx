import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../../api/endpoints';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Iconify } from '../../iconify';
const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    const response = await authAPI.login({
      email: formData.email,
      password: formData.password
    });
    
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    
    // Store user data in context or state management if needed
    console.log('Logged in user:', user);
    
    // Redirect to home or dashboard
    navigate('/posts');
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, width: '100% ' }}>
        <Iconify icon="skill-icons:instagram" width={30} height={30} alignItems="center" justifyContent="center" />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400 }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3} width="100%" mb={3}>
            <TextField
              id="email"
              name="email"
              label="Email address"
              type="email"
              fullWidth
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              size="medium"
              sx={{ borderRadius:2, marginTop:2, fontFamily:'Poppins', fontWeight:400}}
            />

            <TextField
              id="password"
              name="password"
              label="Password"
              type="password"
              fullWidth
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              size="medium"
              sx={{ borderRadius:2, marginTop:2 }}
            />

            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <FormControlLabel 
                control={<Checkbox id="remember-me" name="remember-me" size="small" />} 
                label="Remember me" 
              />
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                underline="hover"
                variant="body2"
              >
                Forgot your password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ 
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>

          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/register" 
                underline="hover"
                fontWeight={600}
                color="primary"
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginForm;
