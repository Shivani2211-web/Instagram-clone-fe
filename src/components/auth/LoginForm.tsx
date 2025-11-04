import * as React from 'react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

const handleFacebookLogin = () => {
  console.log('Facebook login clicked');
  window.location.href ='https://www.facebook.com/' ;
}
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Debug log form data
    console.log('Form data before validation:', formData);
    
    // Basic client-side validation
    if (!formData.emailOrUsername || !formData.password) {
      const missingFields = [];
      if (!formData.emailOrUsername) missingFields.push('email or username');
      if (!formData.password) missingFields.push('password');
      setError(`Please enter both email/username and password. Missing: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting to login with:', formData);
      // Add a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Debug log the arguments being passed to login
      console.log('Calling login with:', { 
        emailOrUsername: formData.emailOrUsername, 
        hasPassword: !!formData.password 
      });
      
      await login({
        emailOrUsername: formData.emailOrUsername,
        password: formData.password
      });
      console.log('Login successful, navigating to home...');
      window.location.href = '/';
    } catch (err: any) {
      console.error('Login error details:', {
        name: err.name,
        message: err.message,
        response: {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers
        },
        request: err.request ? 'Request object exists' : 'No request object',
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers,
          data: err.config?.data
        }
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid email or password format';
          console.error('Bad Request Details:', {
            requestData: err.config?.data,
            responseData: err.response.data
          });
        } else if (err.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 4
    }}>
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1200px',
        gap: { md: 8, lg: 12 },
        px: { xs: 2, sm: 4 },
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Left side - Image */}
        <Box sx={{ 
          flex: 1, 
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '600px',
          height: '600px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3
        }}>
          <Box 
            component="img"
            src="/pictures/landing-2x.png" 
            alt="Instagram Preview"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 3
            }}
          />
        </Box>
        
        {/* Right side - Login Form */}
        <Paper elevation={6} sx={{ 
          p: { xs: 3, sm: 4, md: 5 },
          width: { xs: '100%', sm: '420px', md: '450px' },
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Iconify 
            icon="skill-icons:instagram" 
            width={40} 
            height={40} 
            sx={{ 
              mb: 2,
              color: 'primary.main'
            }} 
          />
        </Box>
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          noValidate 
          sx={{ 
            width: '100%',
            '& .MuiTextField-root': {
              mb: 2
            }
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: '#262626',
              mb: 4,
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              lineHeight: 1.2
            }}
          >
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3} width="100%" mb={3} sx={{fontFamily:'Poppins', fontWeight:400}}>
            <TextField
              id="emailOrUsername"
              name="emailOrUsername"
              label="Email or Username"
              type="text"
              fullWidth
              required
              autoComplete="username"
              value={formData.emailOrUsername}
              onChange={handleChange}
              variant="outlined"
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                    borderRadius: '12px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#757575',
                },
                '& .MuiInputBase-input': {
                  color: '#212121',
                },
                marginTop: 2,
                fontFamily: 'Poppins',
                width: '100%',
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                    borderRadius: '12px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#757575',
                },
                '& .MuiInputBase-input': {
                  color: '#212121',
                },
                marginTop: 2,
                fontFamily: 'Poppins',
                width: '100%',
              }}
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
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5, 
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                }
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <Stack>
              <Typography variant='body2' sx={{ textAlign: 'center', m:2, fontWeight:600 }}>
             Or
              </Typography>
            <Button color="primary" fullWidth sx={{ borderRadius: '12px' }} onClick={handleFacebookLogin}>
             <Iconify icon="logos:facebook" width={20} height={20} color="white" sx={{mr:2}} /> Login with Facebook
              </Button>              
            </Stack>
          </Stack>

          {/* <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Don't have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/register" 
                underline="hover"
                fontWeight={600}
                sx={{ color: '#1976d2', '&:hover': { color: '#1565c0' } }}
              >
                Sign up
              </Link>
            </Typography>
          </Box> */}
        </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginForm;
