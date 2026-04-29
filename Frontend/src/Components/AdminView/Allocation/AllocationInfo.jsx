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
    CircularProgress,
    Toolbar,
    IconButton
} from '@mui/material';

const AllocationInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [allocation, setAllocation] = useState(null);
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
                const response = await axios.get(`https://localhost:7287/api/AssetAllocations/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                console.log('Response data:', response.data);
                setAllocation(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching asset details:', err);
                const errorMessage = err.response?.data?.message || 'Failed to fetch asset data. Please try again later.';
                setError(errorMessage); 
                setLoading(false);
            }
        };

        fetchAssetDetails();
    }, [id, navigate]);

    const handleClose = () => {
        navigate('/admin/allocation');
    };

    if (loading) {
        console.log('Loading...');
        return <CircularProgress />;
    }
    if (error) {
        console.error('Error:', error);
        return <Typography color="error">{error}</Typography>;
    }
    if (!allocation) {
        console.log('Allocations not found'); 
        return <Typography>Allocations not found</Typography>;
    }
    
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
                                    src={`https://localhost:7287/api/Assets/get-image/${allocation.assetId}`}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'path/to/placeholder/image.jpg'; }}
                                    sx={{ width: 120, height: 120, mr: 3 }}
                                />
                                <Box>
                                    <Typography variant="h4">{allocation.assetName}</Typography>
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <InfoItem label="Allocation ID" value={allocation.allocationId} />
                                <InfoItem label="Request ID" value={allocation.assetReqId} />
                                <InfoItem label="User Id" value={allocation.userId || 'N/A'} />
                                <InfoItem label="User Name" value={allocation.userName} />
                                <InfoItem label="Asset Name" value={allocation.assetName} />
                                <InfoItem label="Asset Id" value={allocation.assetId || 'N/A'} />
                                <InfoItem label="Category" value={allocation.categoryName} />
                                <InfoItem label="Sub Category" value={allocation.categoryName} />
                                <InfoItem label="Request Date" value={new Date(allocation.assetReqDate).toLocaleDateString()} />
                                <InfoItem label="Allocated Date" value={new Date(allocation.allocatedDate).toLocaleDateString()} />
                                {/* <InfoItem label="Request Reason" value={allocation.assetReqReason} /> */}
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

export default AllocationInfo;
