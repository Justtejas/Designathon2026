/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { ThemeProvider } from '../ThemeContext';
import { useTheme } from '../ThemeContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import {
  Menu as MenuIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';

const Header = ({ handleDrawerToggle }) => {
  const navigate = useNavigate();
  const handleLogout = (e) => {
    e.preventDefault();
    Cookies.remove('token');
    Cookies.remove('role');
    navigate('/signin');
  };

  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#1e2a55' }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          HexaHub
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1">
            Welcome Admin
          </Typography>
        </Box>
        <IconButton onClick={toggleDarkMode} color="inherit">
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <IconButton onClick={handleLogout} color="inherit">
          <ExitToAppIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;