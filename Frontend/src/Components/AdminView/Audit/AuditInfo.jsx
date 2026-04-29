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

const AuditInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [audit, setAudit] = useState(null);
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
                const response = await axios.get(`https://localhost:7287/api/Audits/Audis/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                console.log(response.data);

                setAudit(response.data);
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
        navigate('/admin/audit');
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!audit) return <Typography>Audit not found</Typography>;

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
                                    src={`https://localhost:7287/api/Assets/get-image/${audit.assetId}`}
                                    sx={{ width: 120, height: 120, mr: 3 }}
                                />
                                <Box>
                                    <Typography variant="h4">{audit.assetName}</Typography>
                                    <Chip
                                        label={audit.audit_Status}
                                        color="secondary"
                                        sx={{
                                            mt: 1,
                                            backgroundColor: audit.audit_Status === 'Completed' ? '#0BDA51' :audit.audit_Status === 'InProgress' ? '#FF7518':
                                            '#36A2EB' ,
                                            color: '#000000' ,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <InfoItem label="Audit ID" value={audit.auditId} />
                                <InfoItem label="User Id" value={audit.userId || 'N/A'} />
                                <InfoItem label="User Name" value={audit.userName} />
                                <InfoItem label="Asset Id" value={audit.assetId || 'N/A'} />  
                                <InfoItem label="Asset Name" value={audit.assetName } />
                                <InfoItem label="Audit Date" value={audit.auditDate} />
                                <InfoItem label="Audit Message" value={audit.auditMessage} />
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

export default AuditInfo;
