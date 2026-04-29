import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    MenuItem,
} from '@mui/material';
import ToastNotification, { showToast } from '../../Utils/ToastNotification';

const AddAudit = () => {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        AssetId: '',
        UserId: '',
        AuditDate: new Date().toISOString().split('T')[0], 
        AuditMessage: '',
        Audit_Status: 'Sent',
    });

    const [users, setUsers] = useState([]);
    const [allocatedAssets, setAllocatedAssets] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsersAndAllocatedAssets = async () => {
            try {
                const userResponse = await axios.get('https://localhost:7287/api/Users');
                console.log('User Response:', userResponse.data);
                setUsers(userResponse.data.$values || []);

                const assetResponse = await axios.get('https://localhost:7287/api/Audits/allocated-assets');
                console.log('Allocated Assets Response:', assetResponse.data);
                setAllocatedAssets(assetResponse.data.$values || []);
            } catch (error) {
                console.error('Error fetching users and allocated assets:', error);
                setUsers([]);
                setAllocatedAssets([]);
            }
        };
        fetchUsersAndAllocatedAssets();
    }, []);

    useEffect(() => {
        const selectedAsset = allocatedAssets.find(asset => asset.assetId === formData.AssetId);
        if (selectedAsset) {
            const associatedUser = users.find(user => user.userId === selectedAsset.userId);
            setFilteredUsers(associatedUser ? [associatedUser] : []);
        } else {
            setFilteredUsers([]);
        }
    }, [formData.AssetId, allocatedAssets, users]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleClose = () => {
        navigate('/admin/audit');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`https://localhost:7287/api/Audits`, formData);
            setTimeout(() => {
                showToast('Audit Added Successfully', 'success');
            }, 2000)
            navigate('/admin/audit');
            setFormData({
                AssetId: '',
                UserId: '',
                AuditDate: new Date().toISOString().split('T')[0], 
                AuditMessage: '', 
                Audit_Status: 'Sent',
            });
        } catch (error) {
            console.error('Error adding audit:', error);
            showToast('Audit Failed', 'error');
            alert('Failed to add audit. Please try again.');
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
            <Box sx={{ display: 'flex', flex: 1 }}>
            <ToastNotification />
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
                                Add Audit
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            name="AssetId"
                                            label="Select Asset"
                                            value={formData.AssetId}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        >
                                            {allocatedAssets.map((asset) => (
                                                <MenuItem key={asset.assetId} value={asset.assetId}>
                                                    {asset.assetName}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            name="UserId"
                                            label="Select User"
                                            value={formData.UserId}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        >
                                            {filteredUsers.map((user) => (
                                                <MenuItem key={user.userId} value={user.userId}>
                                                    {user.userName}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="AuditDate"
                                            label="Audit Date"
                                            value={formData.AuditDate}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            name="AuditMessage"
                                            label="Audit Message"
                                            value={formData.AuditMessage}
                                            variant="outlined"
                                            multiline
                                            rows={4}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            select
                                            name="Audit_Status"
                                            label="Audit Status"
                                            value={formData.Audit_Status}
                                            onChange={handleChange}
                                            variant="outlined"
                                            InputProps={{ readOnly: true }} 
                                        >
                                            <MenuItem value="Sent">Sent</MenuItem>
                                        </TextField>
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
                                            Add Audit
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

export default AddAudit;
