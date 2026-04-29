
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
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Person as EmployeeIcon,
    Inventory as AssetsIcon,
    AssignmentTurnedIn as RequestIcon,
    AccountTree as AllocationIcon,
    KeyboardReturn as ReturnIcon,
    Gavel as AuditIcon,
    Engineering as ServiceIcon,
    Build as MaintenanceIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/Dashboard' },
    { text: 'Employee', icon: <EmployeeIcon />, path: '/admin/employee' },
    { text: 'Assets', icon: <AssetsIcon />, path: '/admin/asset' },
    { text: 'Request', icon: <RequestIcon />, path: '/admin/request' },
    { text: 'Allocation', icon: <AllocationIcon />, path: '/admin/allocation' },
    { text: 'Return', icon: <ReturnIcon />, path: '/admin/return' },
    { text: 'Audit', icon: <AuditIcon />, path: '/admin/audit' },
    { text: 'Service', icon: <ServiceIcon />, path: '/admin/service' },
    { text: 'Maintenance', icon: <MaintenanceIcon />, path: '/admin/maintenance' },
];

const Navbar = ({ mobileOpen, handleDrawerToggle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const drawer = (
        <div>
            <Toolbar />
            <List>
                {navItems.map((item) => (
                    <ListItem
                        
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        className="cursor-pointer"
                        sx={{
                            
                            backgroundColor: location.pathname === item.path ? '#ffffff' : 'transparent',
                            color: location.pathname === item.path ? '#000000' : '#ffffff',
                            '&:hover': {
                                
                                backgroundColor: location.pathname === item.path ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{
                keepMounted: true, 
            }}
            sx={{
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    backgroundColor: '#1e2a55',
                    color: 'white',
                },
            }}
        >
            {drawer}
        </Drawer>
    );
};

export default Navbar;
