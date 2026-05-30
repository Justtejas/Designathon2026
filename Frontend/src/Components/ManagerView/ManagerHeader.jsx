import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    IconButton, 
    Box, 
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { 
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    ExitToApp as ExitToAppIcon,
    Close as CloseIcon,
    VpnKey as VpnKeyIcon,
    Image as ImageIcon,
    Person as PersonIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { jwtToken } from '../Utils/utils';
import { useTheme } from '../ThemeContext';

const ManagerHeader = ({ handleDrawerToggle }) => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  
  const user = jwtToken();
  const userRole = Cookies.get('role') || 'Manager';
  const userEmail = user?.email || 'manager@mavericks.com';
  const userInitial = userEmail.charAt(0).toUpperCase();

  const closeProfile = () => setProfileOpen(false);

  const handleLogout = (e) => {
    e.preventDefault();
    closeProfile();
    Cookies.remove('token');
    Cookies.remove('role');
    navigate('/signin');
  };

  const handleProfileAction = (action) => {
    console.log(`${action} clicked`);
    closeProfile();
  };

  return (
    <>
    <AppBar 
        position="fixed" 
        sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: '#1e2a55', // Same as Admin Header
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
    >
      <Toolbar sx={{ minHeight: '80px !important' }}>
        
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title - Changed to white */}
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" noWrap component="div" sx={{ 
                fontWeight: 800,
                letterSpacing: '0.5px',
                color: 'white'
            }}>
                Mavericks Inventory
            </Typography>
        </Box>

        {/* User Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            {/* Dark/Light Mode Toggle Button */}
            <IconButton 
                onClick={() => setDarkMode(!darkMode)}
                sx={{ color: 'white' }}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton color="inherit">
                <NotificationsIcon />
            </IconButton>

            {/* User Box */}
            <Box 
                onClick={() => setProfileOpen(true)}
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 2,
                    transition: '0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
            >
                <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                        {userEmail.split('@')[0]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                        {userRole}
                    </Typography>
                </Box>
                {/* Avatar - Different Color (Teal/Green) for contrast */}
                <Avatar sx={{ 
                    bgcolor: '#00b894', // Different from header (teal)
                    width: 38, 
                    height: 38, 
                    fontWeight: 700,
                    color: 'white'
                }}>
                    {userInitial}
                </Avatar>
            </Box>
        </Box>
      </Toolbar>
    </AppBar>

    {/* PROFILE PANEL OVERLAY */}
    <Box
        onClick={closeProfile}
        sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: profileOpen ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0)',
            transition: 'background 220ms ease',
            pointerEvents: profileOpen ? 'auto' : 'none',
            zIndex: 1299,
            display: profileOpen ? 'block' : 'none'
        }}
    />

    {/* PROFILE PANEL */}
    <Box sx={{
        position: 'fixed',
        right: profileOpen ? '0' : '-420px',
        top: 0,
        height: '100vh',
        width: { xs: '100%', sm: '360px' },
        maxWidth: '90vw',
        bgcolor: '#ffffff',
        boxShadow: '-10px 0 30px rgba(2,6,23,0.12)',
        transition: 'right 280ms cubic-bezier(.2,.9,.2,1)',
        zIndex: 1300,
        p: 3,
        pt: 4,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Profile Avatar - Gradient */}
                <Avatar sx={{ 
                    width: 70, 
                    height: 70, 
                    bgcolor: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', 
                    fontSize: '1.5rem', 
                    fontWeight: 700 
                }}>
                    {userInitial}
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        {userEmail.split('@')[0]}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {userRole}
                    </Typography>
                </Box>
            </Box>
            <IconButton onClick={closeProfile}>
                <CloseIcon />
            </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List sx={{ flex: 1 }}>
            <ListItem button onClick={() => handleProfileAction('Profile')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                <ListItemIcon><PersonIcon sx={{ color: '#636e72' }} /></ListItemIcon>
                <ListItemText primary="Profile Details" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
            <ListItem button onClick={() => handleProfileAction('Password')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                <ListItemIcon><VpnKeyIcon sx={{ color: '#636e72' }} /></ListItemIcon>
                <ListItemText primary="Change Password" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
            <ListItem button onClick={() => handleProfileAction('Image')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                <ListItemIcon><ImageIcon sx={{ color: '#636e72' }} /></ListItemIcon>
                <ListItemText primary="Change Profile Image" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
        </List>

        <Box onClick={handleLogout} sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', p: 1.5, borderRadius: 2, bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, cursor: 'pointer', mt: 'auto', transition: '0.2s', '&:hover': { bgcolor: '#fecaca' } }}>
            <ExitToAppIcon />
            <Typography variant="button">Logout</Typography>
        </Box>
    </Box>
    </>
  );
};

export default ManagerHeader;