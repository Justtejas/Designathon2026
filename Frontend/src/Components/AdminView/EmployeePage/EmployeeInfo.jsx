/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtToken } from '../../Utils/utils';
import CloseIcon from '@mui/icons-material/Close';
// import Header from '../AdminHeader';
// import Navbar from '../AdminNavBar';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Grid,
    Chip,
    CircularProgress,
    Toolbar,
    IconButton
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    Work as WorkIcon
} from '@mui/icons-material';

const token = Cookies.get('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [mobileOpen, setMobileOpen] = useState(false);
    // const handleDrawerToggle = () => {
    //     setMobileOpen(!mobileOpen);
    // };
    useEffect(() => {
        const fetchUserDetails = async () => {
            const decodedToken = jwtToken();
            if (!decodedToken) {
                console.error('No valid token found.');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`https://localhost:7287/api/Users/${id}`);
                setUser(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Failed to fetch user data. Please try again later.');
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [id, navigate]);

    const handleClose = () => {
        navigate('/admin/employee');
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!user) return <Typography>User not found</Typography>;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* <Header handleDrawerToggle={handleDrawerToggle} />
            <Navbar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle}/> */}
            <Box sx={{ display: 'flex', flex: 1 }}>
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` }, marginLeft: { sm: '240px' } }}>
                    <Toolbar />
                    <Card
                        sx={{
                            maxWidth: 800,
                            margin: 'auto',
                            mt: 4,
                            p: 2,
                            boxShadow: 3,
                            borderRadius: 2,
                        }}
                    >
                        <IconButton onClick={handleClose} aria-label="close" sx={{ float: 'right' }}>
                            <CloseIcon />
                        </IconButton>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                    src={`https://localhost:7287/api/Users/${id}/profileImage`}
                                    sx={{ width: 120, height: 120, mr: 3 }}
                                />
                                <Box>
                                    <Typography variant="h4">{user.userName}</Typography>
                                    <Chip
                                        label="Employee"
                                        color="secondary"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <InfoItem icon={<EmailIcon />} label="Email" value={user.userMail} />
                                <InfoItem icon={<PersonIcon />} label="Gender" value={user.gender} />
                                <InfoItem icon={<BusinessIcon />} label="Department" value={user.dept} />
                                <InfoItem icon={<WorkIcon />} label="Designation" value={user.designation} />
                                <InfoItem icon={<PhoneIcon />} label="Phone" value={user.phoneNumber} />
                                <InfoItem icon={<LocationIcon />} label="Address" value={user.address} />
                                <InfoItem icon={<BusinessIcon />} label="Branch" value={user.branch} />
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
const InfoItem = ({ icon, label, value }) => (
    <Grid item xs={12} sm={6}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(icon, { sx: { mr: 1 } })}
            <Typography variant="body2">
                <strong>{label}:</strong> {value}
            </Typography>
        </Box>
    </Grid>
);

export default UserDetails;
