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
    Grid,
    IconButton,
} from '@mui/material';
import ToastNotification, { showToast } from '../../Utils/ToastNotification';

const AddEmployee = () => {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        UserName: '',
        UserMail: '',
        PhoneNumber: '',
        Branch: '',
        Password: "Hexahub@123",
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleClose = () => {
        navigate('/admin/employee');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Create a new object that includes the default password
        const dataToSend = {
            ...formData,
            Password: "Hexahub@123",  // Add the default password here
        };

        try {
            await axios.post('https://localhost:7287/api/Users', dataToSend);
            alert('Employee added successfully!');
            navigate('/admin/employee');
            setFormData({
                UserName: '',
                UserMail: '',
                PhoneNumber: '',
                Branch: '',
            });
        } catch (error) {
            console.error("Error adding employee:", error);
            showToast('Employee Addition Failed', 'error');
            alert('Failed to add employee. Please try again.');
        }
    };

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
                            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                                Add Employee
                            </Typography>
                            
                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="UserName"
                                            label="User Name"
                                            value={formData.UserName}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="UserMail"
                                            label="User Email"
                                            type="email"
                                            value={formData.UserMail}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="PhoneNumber"
                                            label="Phone Number"
                                            type="tel"
                                            value={formData.PhoneNumber}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="Branch"
                                            label="Branch"
                                            value={formData.Branch}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
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
