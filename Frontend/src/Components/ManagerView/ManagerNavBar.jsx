import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme,
    Toolbar,
    Box,
    IconButton,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as AssetsIcon,
    AssignmentTurnedIn as RequestIcon,
    AccountTree as AllocationIcon,
    KeyboardReturn as ReturnIcon,
    Gavel as AuditIcon,
    ChevronLeft as ChevronLeftIcon,
    Menu as MenuIcon
} from '@mui/icons-material';

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager/Dashboard', color: '#818cf8' },
    { text: 'Assets', icon: <AssetsIcon />, path: '/manager/asset', color: '#34d399' },
    { text: 'Requests', icon: <RequestIcon />, path: '/manager/request', color: '#f472b6' },
    { text: 'Allocation', icon: <AllocationIcon />, path: '/manager/allocation', color: '#60a5fa' },
    { text: 'Return', icon: <ReturnIcon />, path: '/manager/return', color: '#fbbf24' },
    { text: 'Audit Trail', icon: <AuditIcon />, path: '/manager/audit', color: '#f87171' },
];

const ManagerNavbar = ({ collapsed, onToggle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const drawerWidth = collapsed ? 80 : 260;

    const drawerContent = (
        <Box sx={{ overflow: 'auto', mt: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Brand Section with Toggle Button */}
            <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: collapsed ? 'center' : 'space-between',
                minHeight: 64 
            }}>
                {!collapsed && (
                    <Box sx={{ fontWeight: 'bold', color: 'white', letterSpacing: 1 }}>
                        {/* MAVENTORY */}
                        MENU
                    </Box>
                )}
                <IconButton 
                    onClick={onToggle} 
                    sx={{ 
                        color: 'white', 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                >
                    {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>

            {/* Navigation Items */}
            <List sx={{ px: 1 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            sx={{
                                my: 0.5,
                                borderRadius: 2,
                                display: 'flex',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                px: collapsed ? 1 : 2,
                                py: 1.5,
                                transition: 'all 0.3s ease',
                                backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                borderLeft: isActive ? `4px solid ${item.color}` : '4px solid transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    transform: 'translateX(5px)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ 
                                color: isActive ? item.color : 'white', 
                                minWidth: collapsed ? 0 : 40,
                                justifyContent: 'center'
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText 
                                    primary={item.text} 
                                    primaryTypographyProps={{ 
                                        fontWeight: isActive ? 'bold' : 'normal',
                                        color: 'white',
                                        fontSize: '0.9rem'
                                    }} 
                                />
                            )}
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? true : true}
            onClose={() => {}}
            ModalProps={{ keepMounted: true }}
            sx={{
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    backgroundColor: '#1e2a55',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    transition: 'width 0.24s ease', // Smooth animation
                    overflowX: 'hidden'
                },
            }}
        >
            <Toolbar />
            {drawerContent}
        </Drawer>
    );
};

export default ManagerNavbar;