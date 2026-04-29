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

const AssetInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
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
                const response = await axios.get(`https://localhost:7287/api/Assets/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                console.log(response.data);

                setAsset(response.data);
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
        navigate('/admin/asset');
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!asset) return <Typography>Asset not found</Typography>;

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
                                    src={`https://localhost:7287/api/Assets/get-image/${id}`}
                                    sx={{ width: 120, height: 120, mr: 3 }}
                                />
                                <Box>
                                    <Typography variant="h4">{asset.assetName}</Typography>
                                    <Chip
                                        label={asset.assetStatusName}
                                        color="secondary"
                                        sx={{
                                            mt: 1,
                                            backgroundColor: asset.assetStatusName === 'Allocated' ? '#0BDA51' :
                                                asset.assetStatusName === 'OpenToRequest' ? '#36A2EB' : '#FF7518',
                                            color: '#000000' ,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <InfoItem label="Asset ID" value={asset.assetId} />
                                <InfoItem label="Asset Name" value={asset.assetName} />
                                <InfoItem label="Description" value={asset.assetDescription || 'N/A'} />
                                <InfoItem label="Category" value={asset.categoryName} />
                                <InfoItem label="Sub Category" value={asset.subCategoryName} />
                                <InfoItem label="Serial Number" value={asset.serialNumber || 'N/A'} />
                                <InfoItem label="Model" value={asset.model || 'N/A'} />
                                <InfoItem label="Location" value={asset.location} />
                                <InfoItem label="Value" value={asset.value} />
                                <InfoItem label="Manufacturing Date" value={new Date(asset.manufacturingDate).toLocaleDateString() || 'N/A'} />
                                <InfoItem label="Expiry Date" value={asset.expiry_Date ? new Date(asset.expiry_Date).toLocaleDateString() : 'N/A'} />
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

export default AssetInfo;
