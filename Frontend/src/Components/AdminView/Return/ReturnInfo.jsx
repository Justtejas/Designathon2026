import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import CloseIcon from '@mui/icons-material/Close';
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
    const [returnRequest, setReturnRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssetDetails = async () => {
            const token = Cookies.get('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`https://localhost:7287/api/ReturnRequests/GetByReturnId/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                console.log(response.data);

                setReturnRequest(response.data);
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
        navigate('/admin/return');
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!returnRequest) return <Typography>Asset not found</Typography>;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
                                    src={`https://localhost:7287/api/Assets/get-image/${returnRequest.assetId}`}
                                    sx={{ width: 120, height: 120, mr: 3 }}
                                />
                                <Box>
                                    <Typography variant="h4">{returnRequest.assetName}</Typography>
                                    <Chip
                                        label={returnRequest.returnStatusName}
                                        color="secondary"
                                        sx={{
                                            mt: 1,
                                            backgroundColor: returnRequest.returnStatusName === 'Sent' ? '#36A2EB' : returnRequest.returnStatusName === 'Approved' ? '#0BDA51' : returnRequest.returnStatusName === 'Returned' ? '#FF7518' : '#D2042D',
                                            color: '#000000' ,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <InfoItem label="Return ID" value={returnRequest.returnId} />
                                <InfoItem label="User Id" value={returnRequest.userId || 'N/A'} />
                                <InfoItem label="User Name" value={returnRequest.userName || ''} />
                                <InfoItem label="Asset Id" value={returnRequest.assetId || 'N/A'} />  
                                <InfoItem label="Asset Name" value={returnRequest.assetName } />
                                <InfoItem label="Category" value={returnRequest.categoryName} />
                                <InfoItem label="Return Date" value={returnRequest.returnDate} />
                                <InfoItem label="Reason" value={returnRequest.reason} />
                                <InfoItem label="Condition" value={returnRequest.condition} />
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
