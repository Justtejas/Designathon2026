/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Typography, Box, Toolbar, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// import Header from '../AdminHeader';
// import Navbar from '../AdminNavBar';
import { useTheme } from '../../ThemeContext';

const UpdateUser = () => {
    // const [mobileOpen, setMobileOpen] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [userDetails, setUserDetails] = useState({
        userName: '',
        userMail: '',
        gender: '',
        dept: '',
        designation: '',
        phoneNumber: '',
        address: '',
        branch: '',
        user_Type: '',
    });
    const [error, setError] = useState(null);
    const [userTypes, setUserTypes] = useState([]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7287/api/Users/${id}`);
                setUserDetails(response.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
                setError('Failed to fetch user data. Please try again later.');
            }
        };

        const fetchUserTypes = () => {
            const mockUserTypes = [
                { id: '0', name: 'Employee' },
                { id: '1', name: 'Admin' }
            ];
            setUserTypes(mockUserTypes);
        };

        fetchUserDetails();
        fetchUserTypes();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };
    // const handleDrawerToggle = () => {
    //     setMobileOpen(!mobileOpen);
    // };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Updating user with details:", userDetails);

        try {
            await axios.put(`https://localhost:7287/api/Users/${id}`, {
                UserId: id,
                UserName: userDetails.userName,
                UserMail: userDetails.userMail,
                Gender: userDetails.gender,
                Dept: userDetails.dept,
                Designation: userDetails.designation,
                PhoneNumber: userDetails.phoneNumber,
                Address: userDetails.address,
                Branch: userDetails.branch,
                User_Type: userDetails.user_Type
            });
            navigate('/admin/employee');
        } catch (error) {
            console.error('Error updating user details:', error.response.data);
        }
    };

    const handleClose = () => {
        navigate('/admin/employee');
    };

    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box
            sx={{
                bgcolor: darkMode ? 'background.paper' : 'background.default',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            {/* <Header handleDrawerToggle={handleDrawerToggle} />
            <Navbar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} /> */}
            <Box sx={{ display: 'flex', flex: 1 }}>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { sm: `calc(100% - 240px)` },
                        marginLeft: { sm: '240px' },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4">Update User Type</Typography>
                        <IconButton onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6">User ID: {id}</Typography>
                        <TextField
                            label="Name"
                            name="userName"
                            value={userDetails.userName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Email"
                            name="userMail"
                            value={userDetails.userMail}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Gender"
                            name="gender"
                            value={userDetails.gender}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Department"
                            name="dept"
                            value={userDetails.dept}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Designation"
                            name="designation"
                            value={userDetails.designation}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Phone Number"
                            name="phoneNumber"
                            value={userDetails.phoneNumber}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Address"
                            name="address"
                            value={userDetails.address}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Branch"
                            name="branch"
                            value={userDetails.branch}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="user-type-label">Role</InputLabel>
                            <Select
                                labelId="user-type-label"
                                name="user_Type"
                                value={userDetails.user_Type}
                                onChange={handleChange}
                            >
                                {userTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button type="submit" variant="contained" color="primary">
                            Update Role
                        </Button>
                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default UpdateUser;
