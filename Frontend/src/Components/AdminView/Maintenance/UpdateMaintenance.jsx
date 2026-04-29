import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    TextField,
    Button,
    Typography,
    Box,
    Toolbar,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../../ThemeContext';
import ToastNotification, { showToast } from '../../Utils/ToastNotification';

const UpdateMaintenanceLog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [maintenanceLog, setMaintenanceLog] = useState({
        maintenanceId: '',
        assetId: '',
        userId: '',
        assetName: '',
        userName: '',
        maintenance_date: new Date().toISOString().split('T')[0],
        cost: '',
        maintenance_Description: '',
    });
    const [error, setError] = useState(null);

    // Fetch maintenance log details
    useEffect(() => {
        const fetchMaintenanceLogDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7287/api/MaintenanceLogs/id/${id}`);
                const data = response.data;

                setMaintenanceLog({
                    maintenanceId: data.maintenanceId,
                    assetId: data.assetId,
                    userId: data.userId,
                    assetName: data.assetName,
                    userName: data.userName,
                    maintenance_date: new Date(data.maintenance_date).toISOString().split('T')[0],
                    cost: data.cost || '',
                    maintenance_Description: data.maintenance_Description || '',
                });
            } catch (error) {
                console.error('Error fetching maintenance log details:', error);
                setError('Failed to fetch maintenance log data. Please try again later.');
            }
        };

        fetchMaintenanceLogDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMaintenanceLog((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const dataToUpdate = {
            maintenanceId: maintenanceLog.maintenanceId, // Ensure all required fields are included
            assetId: maintenanceLog.assetId,
            assetName: maintenanceLog.assetName,
            userName: maintenanceLog.userName,
            userId: maintenanceLog.userId,
            maintenance_date: maintenanceLog.maintenance_date,
            cost: parseFloat(maintenanceLog.cost) || 0, // Ensure cost is a number
            maintenance_Description: maintenanceLog.maintenance_Description,
        };
    
        console.log('Data to update:', dataToUpdate); // Log the data being sent
    
        try {
            await axios.put(`https://localhost:7287/api/MaintenanceLogs/${id}`, dataToUpdate);
            setTimeout(() => {
                showToast('Maintenance Updated Successfully', 'success');
            }, 2000);
            navigate('/admin/maintenance'); 
        } catch (error) {
            console.error('Error updating maintenance log details:', error.response?.data || error.message);
            showToast('Maintenance Update Failed', 'error');
            setError('Failed to update maintenance log. Please check your input and try again.');
        }
    };
    

    const handleClose = () => {
        navigate('/admin/maintenance');
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
            <Box sx={{ display: 'flex', flex: 1 }}>
            <ToastNotification />
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
                        <Typography variant="h4">Update Maintenance Log</Typography>
                        <IconButton onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6">Maintenance ID: {maintenanceLog.maintenanceId}</Typography>
                        <TextField
                            label="Asset Name"
                            name="assetName"
                            value={maintenanceLog.assetName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }} // Assuming the asset name shouldn't be edited
                        />
                        <TextField
                            label="User Name"
                            name="userName"
                            value={maintenanceLog.userName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }} // Assuming the user name shouldn't be edited
                        />
                        <TextField
                            label="Maintenance Date"
                            name="maintenance_date"
                            type="date"
                            value={maintenanceLog.maintenance_date}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Cost"
                            name="cost"
                            type="number"
                            value={maintenanceLog.cost}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Maintenance Description"
                            name="maintenance_Description"
                            value={maintenanceLog.maintenance_Description}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />

                        <Button type="submit" variant="contained" color="primary">
                            Update Log
                        </Button>
                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default UpdateMaintenanceLog;
