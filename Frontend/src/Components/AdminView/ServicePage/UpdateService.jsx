import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    TextField,
    Button,
    Typography,
    Box,
    Toolbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../../ThemeContext';
import ToastNotification, { showToast } from '../../Utils/ToastNotification';

const UpdateServiceRequest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [serviceRequest, setServiceRequest] = useState({
        serviceId: '',
        userName: '',
        assetName: '',
        userId: '',
        assetId: '',
        serviceRequestDate: new Date().toISOString().split('T')[0],
        issue_Type: '',
        serviceDescription: '',
        serviceReqStatus: 'UnderReview', // Set initial state as needed
    });
    const [error, setError] = useState(null);

    // Fetch service request details
    useEffect(() => {
        const fetchServiceRequestDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7287/api/ServiceRequests/${id}`);
                const data = response.data;

                setServiceRequest({
                    serviceId: data.serviceId,
                    userName: data.userName,
                    assetName: data.assetName,
                    userId: data.userId,
                    assetId: data.assetId,
                    serviceRequestDate: new Date(data.serviceRequestDate).toISOString().split('T')[0],
                    issue_Type: data.issueTypeName,
                    serviceDescription: data.serviceDescription,
                    serviceReqStatus: data.serviceReqStatusName || 'UnderReview',
                });
            } catch (error) {
                console.error('Error fetching service request details:', error);
                setError('Failed to fetch service request data. Please try again later.');
            }
        };

        fetchServiceRequestDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setServiceRequest((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToUpdate = {
            serviceId: serviceRequest.serviceId,
            assetId: serviceRequest.assetId,
            userId: serviceRequest.userId,
            userName: serviceRequest.userName,
            assetName: serviceRequest.assetName,
            serviceRequestDate: serviceRequest.serviceRequestDate,
            issueType: serviceRequest.issue_Type,
            serviceDescription: serviceRequest.serviceDescription,
            serviceReqStatus:
                serviceRequest.serviceReqStatus === 'UnderReview' ? 0 :
                    serviceRequest.serviceReqStatus === 'Approved' ? 1 :
                        serviceRequest.serviceReqStatus === 'Completed' ? 2 :
                            serviceRequest.serviceReqStatus === 'Rejected' ? 3 : 'Undefined',
        };

        try {
            await axios.put(`https://localhost:7287/api/ServiceRequests/${id}`, dataToUpdate);
            setTimeout(() => {
                showToast('Category Added Successfully', 'success');
            }, 2000);
            navigate('/admin/service');
        } catch (error) {
            console.error('Error updating service request details:', error.response?.data || error.message);
            showToast('Service Updated Failed', 'error');
            setError('Failed to update service request. Please check your input and try again.');
        }
    };

    const handleClose = () => {
        navigate('/admin/service');
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
                        <Typography variant="h4">Update Service Request</Typography>
                        <IconButton onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6">Service ID: {serviceRequest.serviceId}</Typography>
                        <TextField
                            label="User Name"
                            name="userName"
                            value={serviceRequest.userName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Asset Name"
                            name="assetName"
                            value={serviceRequest.assetName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Service Request Date"
                            name="serviceRequestDate"
                            type="date"
                            value={serviceRequest.serviceRequestDate}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Issue Type"
                            name="issue_Type"
                            value={serviceRequest.issue_Type}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Service Description"
                            name="serviceDescription"
                            value={serviceRequest.serviceDescription}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="service-status-label">Service Request Status</InputLabel>
                            <Select
                                labelId="service-status-label"
                                name="serviceReqStatus"
                                value={serviceRequest.serviceReqStatus}
                                onChange={handleChange}
                                disabled={serviceRequest.serviceReqStatus === 'Completed'}
                            >
                                {serviceRequest.serviceReqStatus === 'UnderReview' ? (
                                    [
                                        <MenuItem key="approve" value="Approved">Approve</MenuItem>,
                                        <MenuItem key="reject" value="Rejected">Reject</MenuItem>
                                    ]
                                ) : serviceRequest.serviceReqStatus === 'Approved' ? (
                                    <MenuItem key="completed" value="Completed">Completed</MenuItem>
                                ) : (
                                    [
                                        <MenuItem key="approved" value="Approved">Approved</MenuItem>,
                                        <MenuItem key="completed" value="Completed">Completed</MenuItem>,
                                        <MenuItem key="rejected" value="Rejected">Rejected</MenuItem>
                                    ]
                                )}
                            </Select>

                        </FormControl>

                        {serviceRequest.serviceReqStatus && (
                            <Typography variant="body2" color="text.secondary">
                                Current Status: {serviceRequest.serviceReqStatus}
                            </Typography>
                        )}

                        <Button type="submit" variant="contained" color="primary">
                            Update Request
                        </Button>
                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default UpdateServiceRequest;
