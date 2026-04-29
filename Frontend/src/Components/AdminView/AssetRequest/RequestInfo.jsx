import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
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

const RequestInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [mobileOpen, setMobileOpen] = useState(false);

    // const handleDrawerToggle = () => {
    //     setMobileOpen(!mobileOpen);
    // };

    useEffect(() => {
        const fetchAssetDetails = async () => {
            const token = Cookies.get('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`https://localhost:7287/api/AssetRequests/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                console.log(response.data);

                setRequest(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching asset details:', err);
                setError('Failed to fetch asset data. Please try again later.');
                setLoading(false);
            }
        };

        fetchAssetDetails();
    }, [id, navigate]);

    const handleClose = () => {
        navigate('/admin/request');
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!request) return <Typography>Asset not found</Typography>;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* <Header handleDrawerToggle={handleDrawerToggle} />
            <Navbar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} /> */}
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
                                    src={`https://localhost:7287/api/Assets/get-image/${request.assetId}`}
                                    sx={{ width: 120, height: 120, mr: 3 }}
                                />
                                <Box>
                                    <Typography variant="h4">{request.assetName}</Typography>
                                    <Chip
                                        label={request.requestStatusName}
                                        color="secondary"
                                        sx={{
                                            mt: 1,
                                            backgroundColor: request.requestStatusName === 'Allocated' ? '#0BDA51' :
                                            request.requestStatusName === 'Pending' ? '#36A2EB' : '#D2042D',
                                            color: '#000000' ,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <InfoItem label="Request ID" value={request.assetReqId} />
                                <InfoItem label="User Id" value={request.userId || 'N/A'} />
                                <InfoItem label="User Name" value={request.userName} />
                                <InfoItem label="Asset Id" value={request.assetId || 'N/A'} />  
                                <InfoItem label="Asset Name" value={request.assetName } />
                                <InfoItem label="Category" value={request.categoryName} />
                                <InfoItem label="Request Date" value={request.assetReqDate} />
                                <InfoItem label="Request Reason" value={request.assetReqReason} />
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};

const InfoItem = ({ label, value }) => (
    <Grid item xs={12} sm={6}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2">
                <strong>{label}:</strong> {value}
            </Typography>
        </Box>
    </Grid>
);

export default RequestInfo;
