import React, { useState } from 'react';
import axios from 'axios';
// import Header from '../AdminHeader';
import { useNavigate } from 'react-router-dom';
// import Navbar from '../AdminNavBar';
import { useTheme } from '../../ThemeContext';
import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import ToastNotification, { showToast } from '../../Utils/ToastNotification';

import Grid from '@mui/material/Grid2';


const AddEmployee = () => {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        userName: '',
        userMail: '',
        phoneNumber: '',
        branch: '',
        Role: "Executive",
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleClose = () => {
        navigate('/admin/users');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Create a new object that includes the default password
        const dataToSend = {
            ...formData,
            Password: "Maventory@123",  // Add the default password here
        };

        try {
            await axios.post('http://localhost:7287/api/users', dataToSend);
            showToast('Executive added successfully!', 'success');
            navigate('/admin/users');
            setFormData({
                userName: '',
                userMail: '',
                phoneNumber: '',
                branch: '',
            });
        } catch (error) {
            console.error("Error adding executive:", error);
            showToast('Executive Addition Failed', 'error');
        }
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailError =
      formData.userMail !== '' && !emailRegex.test(formData.userMail);
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: darkMode ? 'background.paper' : 'background.default',
            }}
        >
            {/* <Header /> */}
            <Box sx={{ display: 'flex', flex: 1 }}>
                {/* <Navbar /> */}
                <ToastNotification/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { sm: `calc(100% - 240px)` },
                        ml: { sm: `240px` },
                    }}
                >
                    
                    <Container maxWidth="md" sx={{ mt: 10 }}>
                        
                        <Paper elevation={3} sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <IconButton onClick={handleClose} aria-label="close">
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Typography variant="h4" gutterBottom color="text.primary"align="center" sx={{ mb: 4 }}>
                                Add Employee
                            </Typography>
                            
                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            name="userName"
                                            label="User Name"
                                            value={formData.userName}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
<Grid item size={{ xs: 12, sm: 6 }}>
  <TextField
    fullWidth
    name="userMail"
    label="User Email"
    type="email"
    value={formData.userMail}
    onChange={handleChange}
    required
    variant="outlined"
    error={emailError}
    helperText={emailError ? 'Please enter a valid email address' : ''}
  />
</Grid>
                                    <Grid item size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth variant="outlined">
                                            <InputLabel>Category</InputLabel>
                                            <Select
                                                name="Role"
                                                value={formData.Role}
                                                onChange={handleChange}
                                                label="Role"
                                                required
                                            >
                                                <MenuItem key="Executive" value="Executive">Executive</MenuItem>
                                                <MenuItem key="Manager" value="Manager">Manager</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            name="phoneNumber"
                                            label="Phone Number"
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            name="branch"
                                            label="branch"
                                            value={formData.branch}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12 }}>
                                        <Button 
                                            type="submit" 
                                            variant="contained" 
                                            color="primary" 
                                            size="large" 
                                            fullWidth
                                            sx={{ mt: 2 }}
                                        >
                                            Add Employee
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Container>
                </Box>
            </Box>
        </Box>
    );
};

export default AddEmployee;
