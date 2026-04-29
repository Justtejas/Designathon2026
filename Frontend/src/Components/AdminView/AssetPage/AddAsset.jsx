import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import Cookies from 'js-cookie';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import ToastNotification, { showToast } from '../../Utils/ToastNotification';

const AddAsset = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        AssetName: '',
        AssetDescription: '',
        CategoryId: '',
        SubCategoryId: '',
        SerialNumber: '',
        Model: '',
        ManufacturingDate: '',
        Location: '',
        Value: '',
        Expiry_Date: '',
        AssetImage: null,
    });
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [newCategoryDialog, setNewCategoryDialog] = useState(false);
    const [newSubCategoryDialog, setNewSubCategoryDialog] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newSubCategory, setNewSubCategory] = useState({ name: '', categoryId: '', quantity: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState({ started: false, pc: 0 });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://localhost:7287/api/Categories/all-categories');
            setCategories(response.data.$values || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setErrorMessage('Error fetching categories. Please try again.');
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            const response = await axios.get(`https://localhost:7287/api/SubCategories?categoryId=${categoryId}`);
            setSubCategories(response.data.$values || []);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setErrorMessage('Error fetching subcategories. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'CategoryId') {
            fetchSubCategories(value);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
        } else {
            console.error('No file selected');
            setFile(null);
        }
    };

    const handleClose = () => {
        navigate('/admin/asset');
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = Cookies.get('token');
        const assetData = new FormData();
        for (const key in formData) {
            assetData.append(key, formData[key]);
        }
        if (file) {
            assetData.append('AssetImage', file);
        }

        try {
            const assetResponse = await axios.post('https://localhost:7287/api/Assets', assetData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(assetResponse.data);
            const assetId = assetResponse.data.assetId;

            if (file) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);

                await axios.post(`https://localhost:7287/api/Assets/upload-image/${assetId}`, uploadFormData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },

                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress({ started: true, pc: percentCompleted });
                    }

                });
                console.log(uploadFormData);
            }
            setTimeout(() => {
                showToast('Asset Added Successfully', 'success');
            }, 2000)
            navigate('/admin/asset');
        } catch (error) {
            console.error("Error adding asset:", error);
            showToast('Failed to add Asset. Please try again', 'error');
        }
    };

    const handleAddCategory = async () => {
        try {
            const response = await axios.post('https://localhost:7287/api/Categories', { CategoryName: newCategory });
            setCategories([...categories, response.data]);
            setNewCategoryDialog(false);
            setNewCategory('');
            setTimeout(() => {
                showToast('Category Added Successfully', 'success');
            }, 2000)
        } catch (error) {
            console.error('Error adding category:', error);
            showToast('Failed  to add Category', 'error');
        }
    };

    const handleAddSubCategory = async () => {
        try {
            const response = await axios.post('https://localhost:7287/api/SubCategories', {
                SubCategoryName: newSubCategory.name,
                CategoryId: newSubCategory.categoryId,
                Quantity: newSubCategory.quantity,
            });
            setSubCategories([...subCategories, response.data]);
            setNewSubCategoryDialog(false);
            setNewSubCategory({ name: '', categoryId: '', quantity: '' });
        } catch (error) {
            console.error('Error adding subcategory:', error);
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
                    <ToastNotification />
                    <Container maxWidth="md" sx={{ mt: 10 }}>
                        <Paper elevation={3} sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <IconButton onClick={handleClose} aria-label="close">
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                                Add Asset
                            </Typography>

                            {errorMessage && <Typography color="error" align="center">{errorMessage}</Typography>}

                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="AssetName"
                                            label="Asset Name"
                                            value={formData.AssetName}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="SerialNumber"
                                            label="Serial Number"
                                            value={formData.SerialNumber}
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
                                        <TextField
                                            fullWidth
                                            name="ManufacturingDate"
                                            label="Manufacturing Date"
                                            type="date"
                                            value={formData.ManufacturingDate}
                                            onChange={handleChange}
                                            required
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            name="Expiry_Date"
                                            label="Expiry Date"
                                            type="date"
                                            value={formData.Expiry_Date}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            name="AssetDescription"
                                            label="Asset Description"
                                            value={formData.AssetDescription}
                                            onChange={handleChange}
                                            variant="outlined"
                                            multiline
                                            rows={4}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel>Category</InputLabel>
                                            <Select
                                                name="CategoryId"
                                                value={formData.CategoryId || ''}
                                                onChange={handleChange}
                                                label="Category"
                                                required
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
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel>Subcategory</InputLabel>
                                            <Select
                                                name="SubCategoryId"
                                                value={formData.SubCategoryId || ''}
                                                onChange={handleChange}
                                                label="Subcategory"
                                                required
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
                                        <input
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            type="file"
                                        />

                                    </Grid>
                                </Grid>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        startIcon={<AddIcon />}
                                        color="primary"
                                    >
                                        Add Asset
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        sx={{ ml: 2 }}
                                        onClick={() => setNewCategoryDialog(true)}
                                    >
                                        Add Category
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        sx={{ ml: 2 }}
                                        onClick={() => setNewSubCategoryDialog(true)}
                                    >
                                        Add Subcategory
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Container>
                </Box>
            </Box>
            <ToastNotification />
            <Dialog open={newCategoryDialog} onClose={() => setNewCategoryDialog(false)}>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Category Name"
                        fullWidth
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewCategoryDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddCategory} color="primary">Add</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={newSubCategoryDialog} onClose={() => setNewSubCategoryDialog(false)}>
                <DialogTitle>Add New Subcategory</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Subcategory Name"
                        fullWidth
                        value={newSubCategory.name}
                        onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                    />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={newSubCategory.categoryId}
                            onChange={(e) => setNewSubCategory({ ...newSubCategory, categoryId: e.target.value })}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Quantity"
                        type="number"
                        fullWidth
                        value={newSubCategory.quantity}
                        onChange={(e) => setNewSubCategory({ ...newSubCategory, quantity: parseInt(e.target.value) })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewSubCategoryDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddSubCategory} color="primary">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddAsset;