import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import Cookies from 'js-cookie';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    Grid,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import ToastNotification, { showToast } from '../../Utils/ToastNotification';


const UpdateAsset = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [formData, setFormData] = useState({
        assetName: '',
        assetDescription: '',
        categoryId: '',
        subCategoryId: '',
        serialNumber: '',
        Model: '',
        manufacturingDate: '',
        Location: '',
        Value: '',
        expiryDate: '',
    });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [assetImage, setassetImage] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchAsset();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:7287/api/Categories/all-categories');
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setErrorMessage('Error fetching categories. Please try again.');
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            const response = await axios.get(`http://localhost:7287/api/SubCategories?categoryId=${categoryId}`);
            setSubCategories(response.data || []);
            setFormData((prev) => ({ ...prev, subCategoryId: '' }));
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setErrorMessage('Error fetching subcategories. Please try again.');
        }
    };

    const fetchassetImage = async (assetId) => {
        try {
            const response = await axios.get(`http://localhost:7287/api/Assets/get-image/${assetId}`, { responseType: 'blob' });
            setassetImage(URL.createObjectURL(new Blob([response.data])));
        } catch (error) {
            console.error('Error fetching asset image:', error);
            setErrorMessage('Error fetching asset image. Please try again.');
        }
    };

    const fetchAsset = async () => {
        try {
            const response = await axios.get(`http://localhost:7287/api/Assets/${id}`);
            setFormData({
                assetName: response.data.assetName,
                assetDescription: response.data.assetDescription,
                categoryId: response.data.categoryId || '',
                subCategoryId: response.data.subCategoryId || '',
                serialNumber: response.data.serialNumber,
                Model: response.data.Model,
                manufacturingDate: response.data.manufacturingDate,
                Location: response.data.Location,
                Value: response.data.Value,
                expiryDate: response.data.expiryDate,
            });

            if (response.data.categoryId) {
                fetchSubCategories(response.data.categoryId);
            }
            
            fetchassetImage(response.data.assetId);
        } catch (error) {
            console.error('Error fetching asset:', error);
            setErrorMessage('Error fetching asset. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'categoryId') {
            fetchSubCategories(value);
        }
    };

    const handleClose = () => {
        navigate('/admin/asset');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = Cookies.get('token');
        const payload = {
            assetId: id, 
            assetName: formData.assetName,
            assetDescription: formData.assetDescription,
            categoryId: formData.categoryId,
            subCategoryId: formData.subCategoryId,
            serialNumber: formData.serialNumber,
            Model: formData.Model,
            manufacturingDate: formData.manufacturingDate,
            Location: formData.Location,
            Value: parseFloat(formData.Value),
            expiryDate: formData.expiryDate,
        };
    
        console.log('Payload being sent:', JSON.stringify(payload, null, 2));
    
        try {
            const response = await axios.put(`http://localhost:7287/api/Assets/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log(response.data);
            setTimeout(() => {
                showToast('Asset Updated Successfully', 'success');
            }, 2000)
            navigate('/admin/asset');
        } catch (error) {
            console.error("Error updating asset:", error);
            showToast('Asset Updated Failed', 'error');
            if (error.response && error.response.data) {
                console.error("Server error response:", error.response.data);
                setErrorMessage(`Error: ${error.response.data.title || 'Unknown error'}`);
            } else {
                setErrorMessage("Failed to update asset. Please check your input.");
            }
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
                                Update Asset
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 4 }}>Asset ID: {id}</Typography>
                            {errorMessage && <Typography color="error" align="center">{errorMessage}</Typography>}
                            
                            {assetImage && (
                                <Box sx={{ mb: 2, textAlign: 'center' }}>
                                    <img
                                        src={assetImage}
                                        alt="Asset"
                                        style={{ maxWidth: '40%', height: 'auto' }}
                                    />
                                </Box>
                            )}

                            <Box component="form" onSubmit={handleSubmit}>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="assetName"
                                            label="Asset Name"
                                            value={formData.assetName}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="serialNumber"
                                            label="Serial Number"
                                            value={formData.serialNumber}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="Model"
                                            label="Model"
                                            value={formData.Model}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="manufacturingDate"
                                            label="Manufacturing Date"
                                            type="date"
                                            value={formData.manufacturingDate}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="Location"
                                            label="Location"
                                            value={formData.Location}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="Value"
                                            label="Value"
                                            type="number"
                                            value={formData.Value}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth variant="outlined" required>
                                            <InputLabel>Category</InputLabel>
                                            <Select
                                                name="categoryId"
                                                value={formData.categoryId || ''}
                                                onChange={handleChange}
                                                label="Category"
                                            >
                                                {categories.map((category) => (
                                                    <MenuItem key={category.categoryId} value={category.categoryId}>
                                                        {category.categoryName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth variant="outlined" required>
                                            <InputLabel>SubCategory</InputLabel>
                                            <Select
                                                name="subCategoryId"
                                                value={formData.subCategoryId || ''}
                                                onChange={handleChange}
                                                label="SubCategory"
                                            >
                                                {subCategories.map((subCategory) => (
                                                    <MenuItem key={subCategory.subCategoryId} value={subCategory.subCategoryId}>
                                                        {subCategory.subCategoryName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            name="assetDescription"
                                            label="Asset Description"
                                            multiline
                                            rows={4}
                                            value={formData.assetDescription}
                                            onChange={handleChange}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="expiryDate"
                                            label="Expiry Date"
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            variant="outlined"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                    <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                                        Update Asset
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Container>
                </Box>
            </Box>
        </Box>
    );
};

export default UpdateAsset;
