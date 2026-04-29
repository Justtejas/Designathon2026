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


const UpdateAssetRequest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [assetRequest, setAssetRequest] = useState({
        assetReqId: '',
        userName: '',
        assetName: '',
        userId: '',
        assetId: '',
        categoryName: '',
        assetReqDate: new Date().toISOString().split('T')[0],
        assetReqReason: '',
        requestStatus: 'Pending',
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssetRequestDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7287/api/AssetRequests/${id}`);
                const data = response.data;
                console.log(data);
                setAssetRequest({
                    assetReqId: data.assetReqId,
                    userName: data.userName,
                    assetName: data.assetName,
                    userId: data.userId ,
                    assetId: data.assetId,
                    categoryName: data.categoryName,
                    assetReqDate: new Date(data.assetReqDate).toISOString().split('T')[0],
                    assetReqReason: data.assetReqReason,
                    requestStatus: data.requestStatus === 0 ? "Pending" : data.requestStatus === 1 ? "Allocated" : "Rejected", 
                });
            } catch (error) {
                console.error('Error fetching asset request details:', error);
                setError('Failed to fetch asset request data. Please try again later.');
            }
        };

        fetchAssetRequestDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAssetRequest((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Updating asset request with details:", assetRequest);
        try {
            await axios.put(`https://localhost:7287/api/AssetRequests/${id}`, {
                assetReqId: assetRequest.assetReqId,
                userName: assetRequest.userName,
                assetName: assetRequest.assetName,
                userId: assetRequest.userId,
                assetId: assetRequest.assetId,
                categoryName: assetRequest.categoryName,
                assetReqDate: assetRequest.assetReqDate,
                assetReqReason: assetRequest.assetReqReason,
                requestStatus: assetRequest.requestStatus === "Pending" ? 0 : assetRequest.requestStatus === "Allocated" ? 1 : 2,
            });
            setTimeout(() => {
                showToast('Request Updated Successfully', 'success');
            }, 2000);
            navigate('/admin/request');
        } catch (error) {
            console.error('Error updating asset request details:', error.response?.data || error.message);
            showToast('Request Updated Failed', 'error');
            setError('Failed to update asset request. Please check your input and try again.');
        }
    };

    const handleClose = () => {
        navigate('/admin/request');
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
                        <Typography variant="h4">Update Asset Request</Typography>
                        <IconButton onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6">Request ID: {assetRequest.assetReqId}</Typography>
                        <TextField
                            label="User Name"
                            name="userName"
                            value={assetRequest.userName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Asset Name"
                            name="assetName"
                            value={assetRequest.assetName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Category Name"
                            name="categoryName"
                            value={assetRequest.categoryName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Request Date"
                            name="assetReqDate"
                            type="date"
                            value={assetRequest.assetReqDate}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Request Reason"
                            name="assetReqReason"
                            value={assetRequest.assetReqReason}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="request-status-label">Request Status</InputLabel>
                            <Select
                                labelId="request-status-label"
                                name="requestStatus"
                                value={assetRequest.requestStatus}
                                onChange={handleChange}
                                disabled={assetRequest.requestStatus === 'Allocated' || assetRequest.requestStatus === 'Rejected'}
                            >
                                {assetRequest.requestStatus === 'Pending' ? (
                                    [
                                        <MenuItem key="allocate" value="Allocated">Allocate</MenuItem>,
                                        <MenuItem key="reject" value="Rejected">Reject</MenuItem>
                                    ]
                                ) : (
                                    [
                                        <MenuItem key="allocated" value="Allocated">Allocated</MenuItem>,
                                        <MenuItem key="rejected" value="Rejected">Rejected</MenuItem>
                                    ]
                                )}
                            </Select>
                        </FormControl>

                        {(assetRequest.requestStatus === 'Allocated' || assetRequest.requestStatus === 'Rejected') && (
                            <Typography variant="body2" color="text.secondary">
                                Current Status: {assetRequest.requestStatus}
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

export default UpdateAssetRequest;
