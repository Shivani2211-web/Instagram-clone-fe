import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  TextField, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Switch,
  IconButton,
  InputAdornment
} from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import { 
  Edit as EditIcon, 
  Lock as LockIcon, 
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const Settings = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: 'johndoe',
    fullName: 'John Doe',
    email: 'john@example.com',
    bio: 'Digital creator | Photography enthusiast',
    website: 'johndoe.design',
    phone: '+1 (555) 123-4567',
    notifications: true,
    privateAccount: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogout = () => {
    // Handle logout logic
    navigate('/login');
  };

  return (
    <Box maxWidth={800} mx="auto" p={3}>
      <Typography variant="h5" fontWeight={600} mb={4}>
        Edit Profile
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #dbdbdb', borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar 
            src="/default-avatar.jpg" 
            sx={{ width: 90, height: 90, mr: 4 }}
          />
          <Box>
            <Typography variant="h6">johndoe</Typography>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<EditIcon />}
              sx={{ mt: 1 }}
            >
              Change Profile Photo
            </Button>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" mb={3}>
          <Typography width={150} fontWeight={500}>Name</Typography>
          <TextField
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" mb={3}>
          <Typography width={150} fontWeight={500}>Username</Typography>
          <TextField
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" mb={3}>
          <Typography width={150} fontWeight={500}>Website</Typography>
          <TextField
            name="website"
            value={formData.website}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Box>

        <Box display="flex" mb={3}>
          <Typography width={150} fontWeight={500} mt={1}>Bio</Typography>
          <TextField
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
        </Box>

        <Box display="flex" alignItems="center" mb={3}>
          <Typography width={150} fontWeight={500}>Email</Typography>
          <TextField
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" mb={3}>
          <Typography width={150} fontWeight={500}>Phone</Typography>
          <TextField
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" mb={3}>
          <Typography width={150} fontWeight={500}>Password</Typography>
          <TextField
            type={showPassword ? 'text' : 'password'}
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #dbdbdb', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={3}>Account Settings</Typography>
        
        <List>
          {/* Non-clickable items with switches can remain plain ListItem */}
          <ListItem>
            <ListItemIcon><LockIcon /></ListItemIcon>
            <ListItemText 
              primary="Private Account" 
              secondary="Only people you approve can see your photos and videos"
            />
            <Switch 
              checked={formData.privateAccount} 
              onChange={handleChange}
              name="privateAccount"
            />
          </ListItem>
          
          <Divider component="li" variant="inset" />
          
          <ListItem>
            <ListItemIcon><NotificationsIcon /></ListItemIcon>
            <ListItemText 
              primary="Push Notifications" 
              secondary="Receive notifications when you get new followers, likes, and comments"
            />
            <Switch 
              checked={formData.notifications} 
              onChange={handleChange}
              name="notifications"
            />
          </ListItem>
          
          <Divider component="li" variant="inset" />

          {/* Clickable rows use ListItemButton */}
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon><SecurityIcon /></ListItemIcon>
              <ListItemText 
                primary="Privacy and Security" 
                secondary="Manage your account's privacy and security settings"
              />
            </ListItemButton>
          </ListItem>
          
          <Divider component="li" variant="inset" />
          
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon><HelpIcon /></ListItemIcon>
              <ListItemText 
                primary="Help Center" 
                secondary="Get help with your account"
              />
            </ListItemButton>
          </ListItem>
          
          <Divider component="li" variant="inset" />

          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText 
                primary="Log Out" 
                primaryTypographyProps={{ color: 'error' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Settings;
