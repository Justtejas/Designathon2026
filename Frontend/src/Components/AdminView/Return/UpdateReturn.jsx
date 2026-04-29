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

const UpdateReturn = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [returnRequest, setReturnRequest] = useState({
        returnId: '',
        userId: '',
        userName: '',
        assetName: '',
        assetId: '',
        categoryName: '',
        categoryId:'',
        returnDate: new Date().toISOString().split('T')[0],
        reason: '',
        condition: '',
        returnStatus: 'Sent',
    });
    const [error, setError] = useState(null);

    const statusMap = {
        0: 'Sent',
        1: 'Approved',
        2: 'Returned',
        3: 'Rejected',
    };

    const statusMapReverse = {
        'Sent': 0,
        'Approved': 1,
        'Returned': 2,
        'Rejected': 3,
    };

    useEffect(() => {
        const fetchReturnRequestDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7287/api/ReturnRequests/GetByReturnId/${id}`);
                const data = response.data;
                console.log(data)
                setReturnRequest({
                    returnId: data.returnId,
                    userId: data.userId, 
                    userName: data.userName, 
            assetName: data.assetName,
                    assetId: data.assetId,
                    categoryName: data.category ? data.categoryName : '',
                    categoryId: data.categoryId,
                    returnDate: new Date(data.returnDate).toISOString().split('T')[0],
                    reason: data.reason,
                    condition: data.condition,
                    returnStatus: statusMap[data.returnStatus],
                });
            } catch (error) {
                console.error('Error fetching return request details:', error);
                setError('Failed to fetch return request data. Please try again later.');
            }
        };

        fetchReturnRequestDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReturnRequest((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://localhost:7287/api/ReturnRequests/${id}`, {
                returnId: returnRequest.returnId,
                userId: returnRequest.userId,
                assetId: returnRequest.assetId, 
                userName: returnRequest.userName, 
                assetName: returnRequest.assetName, 
                categoryName: returnRequest.categoryName, 
                categoryId: returnRequest.categoryId,
                returnDate: returnRequest.returnDate,
                reason: returnRequest.reason,
                condition: returnRequest.condition,
                returnStatus: statusMapReverse[returnRequest.returnStatus],
            });
            setTimeout(() => {
                showToast('Return Updated Successfully', 'success');
            }, 2000)
            navigate('/admin/return');
        } catch (error) {
            console.error('Error updating return request details:', error.response?.data || error.message);
            showToast('Return Updated Failed', 'error');
            setError('Failed to update return request. Please check your input and try again.');
        }
    };

    const handleClose = () => {
        navigate('/admin/return');
    };

    if (error) return <Typography color="error">{error}</Typography>;

    const getStatusOptions = () => {
        if (returnRequest.returnStatus === 'Sent') {
            return ['Approved', 'Rejected'];
        } else if (returnRequest.returnStatus === 'Approved') {
            return ['Returned'];
        } else {
            return [];
        }
    };

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
                        <Typography variant="h4">Update Return Request</Typography>
                        <IconButton onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6">Return ID: {returnRequest.returnId}</Typography>
                        <TextField
                            label="User ID"
                            name="userId"
                            value={returnRequest.userId}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="User Name"
                            name="userName"
                            value={returnRequest.userName || ''}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Asset Name"
                            name="assetName"
                            value={returnRequest.assetName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Asset ID"
                            name="assetId"
                            value={returnRequest.assetId}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Category ID"
                            name="categoryId"
                            value={returnRequest.categoryId}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Category Name"
                            name="categoryName"
                            value={returnRequest.categoryName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Return Date"
                            name="returnDate"
                            type="date"
                            value={returnRequest.returnDate}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Reason"
                            name="reason"
                            value={returnRequest.reason}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Condition"
                            name="condition"
                            value={returnRequest.condition}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="return-status-label">Return Status</InputLabel>
                            <Select
                                labelId="return-status-label"
                                name="returnStatus"
                                value={returnRequest.returnStatus}
                                onChange={handleChange}
                                disabled={
                                    returnRequest.returnStatus === 'Rejected' ||
                                    returnRequest.returnStatus === 'Returned'
                                }
                            >
                                {getStatusOptions().map((status) => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {(returnRequest.returnStatus === 'Approved' ||
                            returnRequest.returnStatus === 'Rejected' ||
                            returnRequest.returnStatus === 'Returned') && (
                            <Typography variant="body2" color="text.secondary">
                                Current Status: {returnRequest.returnStatus}
                            </Typography>
                        )}

                        <Button type="submit" variant="contained" color="primary">
                            Update Return Request
                        </Button>
                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default UpdateReturn;
