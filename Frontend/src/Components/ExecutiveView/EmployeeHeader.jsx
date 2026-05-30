import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import { Box, Typography, IconButton, Avatar, Menu, MenuItem, AppBar, Toolbar } from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    ExitToApp as LogoutIcon,
    Assignment as AssetIcon,
    Build as ServiceIcon,
    KeyboardReturn as ReturnIcon,
    Settings as SettingsIcon,
    Dashboard as DashboardIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    CalendarToday as CalendarIcon
} from "@mui/icons-material";
import moment from "moment";
import { useTheme } from "../ThemeContext";
import { jwtToken } from "../Utils/utils";

const EmployeeHeader = () => {
    const navigate = useNavigate();
    const { darkMode, setDarkMode } = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifAnchor, setNotifAnchor] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const location = useLocation();
    const currentDate = moment().format("Do MMMM YYYY");
    const user = jwtToken();
    const userRole = Cookies.get('role') || 'Employee';
    const userEmail = user?.email || 'user@mavericks.com';
    const userInitial = userEmail.charAt(0).toUpperCase();

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) return handleLogout();

        const decoded = jwtDecode(token);
        const expiry = decoded.exp * 1000;

        const interval = setInterval(() => {
            const diff = Math.floor((expiry - Date.now()) / 1000);
            if (diff <= 0) {
                clearInterval(interval);
                handleLogout();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate]);

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("role");
        navigate('/signin');
    };

    const formatTime = () => {
        const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
        const s = String(timeLeft % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: 1300,
                bgcolor: '#1e2a55',
                color: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                height: 72  // Fixed height
            }}
        >
            <Toolbar sx={{ minHeight: '72px !important' }}>
                {/* Logo & Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        component="img"
                        src="/Images/logo.png"
                        alt="Maventory"
                        sx={{ width: 36, height: 36, borderRadius: 1 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, display: { xs: 'none', md: 'block' } }}>
                        MAVENTORY
                    </Typography>
                </Box>

                {/* Date */}
                <Typography variant="body2" sx={{ ml: 4, display: { xs: 'none', md: 'block', opacity: 0.8 } }}>
                    <CalendarIcon sx={{ fontSize: 16, mr: 1 }} />
                    {currentDate}
                </Typography>

                {/* Session Timer */}
                <Typography variant="body2" sx={{ ml: 2, display: { xs: 'none', lg: 'block' } }}>
                    Session: <Box component="span" sx={{ color: '#ff6b6b' }}>{formatTime()}</Box>
                </Typography>

                {/* Spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Dark Mode Toggle */}
                    <IconButton
                        onClick={() => setDarkMode(!darkMode)}
                        sx={{ color: 'white' }}
                        title={darkMode ? "Light Mode" : "Dark Mode"}
                    >
                        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    {/* Requests Menu - Highlight when active */}
                    <IconButton
                        component={Link}
                        to="/Asset"
                        sx={{
                            color: location.pathname === '/Asset' ? '#00b894' : 'white',
                            bgcolor: location.pathname === '/Asset' ? 'rgba(255,255,255,0.2)' : 'transparent',
                            borderRadius: 2
                        }}
                        title="Asset Requests"
                    >
                        <AssetIcon />
                    </IconButton>

                    {/* Return Menu */}
                    <IconButton
                        component={Link}
                        to="/ReturnRequest"
                        sx={{
                            color: location.pathname === '/ReturnRequest' ? '#00b894' : 'white',
                            bgcolor: location.pathname === '/ReturnRequest' ? 'rgba(255,255,255,0.2)' : 'transparent',
                            borderRadius: 2
                        }}
                        title="Return Requests"
                    >
                        <ReturnIcon />
                    </IconButton>

                    {/* Service Menu */}
                    <IconButton
                        component={Link}
                        to="/ServiceRequest"
                        sx={{
                            color: location.pathname === '/ServiceRequest' ? '#00b894' : 'white',
                            bgcolor: location.pathname === '/ServiceRequest' ? 'rgba(255,255,255,0.2)' : 'transparent',
                            borderRadius: 2
                        }}
                        title="Service Requests"
                    >
                        <ServiceIcon />
                    </IconButton>

                    {/* Notifications */}
                    <IconButton
                        onClick={(e) => setNotifAnchor(e.currentTarget)}
                        sx={{
                            color: location.pathname === '/Notification' ? '#00b894' : 'white',
                            bgcolor: location.pathname === '/Notification' ? 'rgba(255,255,255,0.2)' : 'transparent',
                            borderRadius: 2
                        }}
                        title="Notifications"
                    >
                        <NotificationsIcon />
                    </IconButton>

                    {/* Profile Avatar */}
                    <Box
                        onClick={handleMenuClick}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            ml: 1,
                            pl: 1,
                            pr: 1,
                            borderRadius: 2,
                            transition: '0.2s',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <Avatar sx={{ bgcolor: '#00b894', width: 30, height: 30, fontWeight: 700, fontSize: 13 }}>
                            {userInitial}
                        </Avatar>
                        <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                            {userEmail.split('@')[0]}
                        </Typography>
                    </Box>
                </Box>
            </Toolbar>

            {/* Notifications Menu */}
            <Menu
                anchorEl={notifAnchor}
                open={Boolean(notifAnchor)}
                onClose={() => setNotifAnchor(null)}
                PaperProps={{ sx: { width: 200, mt: 1 } }}
            >
                <MenuItem component={Link} to="/Notification">Notifications</MenuItem>
                <MenuItem component={Link} to="/Notification">Reminders</MenuItem>
            </Menu>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{ sx: { width: 220, mt: 1, bgcolor: '#1e2a55', color: 'white' } }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{userEmail.split('@')[0]}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>{userRole}</Typography>
                </Box>
                <MenuItem component={Link} to="/dashboard" onClick={handleClose} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    <DashboardIcon sx={{ mr: 2 }} /> Dashboard
                </MenuItem>
                <MenuItem component={Link} to="/Profile" onClick={handleClose} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    <PersonIcon sx={{ mr: 2 }} /> My Profile
                </MenuItem>
                <MenuItem component={Link} to="/Asset" onClick={handleClose} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    <AssetIcon sx={{ mr: 2 }} /> My Assets
                </MenuItem>
                <MenuItem component={Link} to="/Settings" onClick={handleClose} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    <SettingsIcon sx={{ mr: 2 }} /> Settings
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: '#ff6b6b', '&:hover': { bgcolor: '#ff6b6b', color: 'white' } }}>
                    <LogoutIcon sx={{ mr: 2 }} /> Logout
                </MenuItem>
            </Menu>
        </AppBar>
    );
};

export default EmployeeHeader;