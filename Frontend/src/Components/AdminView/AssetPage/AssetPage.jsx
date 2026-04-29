import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import PaginationRounded from '../../Utils/Pagination';
import usePagination from '../../Utils/usePagination';
import RadioButton from '../../Utils/RadioButton';
import { jwtToken } from '../../Utils/utils';
import ConfirmationDialog from '../../Utils/Dialog';
import Cookies from 'js-cookie';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Toolbar,
    Autocomplete,
    TextField,
    IconButton,
    Drawer,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Slider,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export default function AssetPage() {
    const { darkMode } = useTheme();
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValue, setSelectedValue] = useState(null);
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(1000000);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetsResponse, categoriesResponse] = await Promise.all([
                    axios.get('https://localhost:7287/api/Assets/assetall'),
                    axios.get('https://localhost:7287/api/Categories/all-categories'),
                ]);
                setAssets(assetsResponse.data.$values || []);
                setCategories(categoriesResponse.data.$values || []);
            } catch (error) {
                console.error('Error fetching assets or categories:', error);
            }
        };

        fetchData();
    }, []);

    const fetchSubCategories = async (categoryId) => {
        if (!categoryId) {
            setSubCategories([]);
            return;
        };

        const url = `https://localhost:7287/api/SubCategories/by-category-name?categoryName=${categoryId}`;
        try {
            const response = await axios.get(url);
            const fetchedSubCategories = response.data.$values || [];
            setSubCategories(fetchedSubCategories);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setSubCategories([]);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setSelectedSubCategory('');
        const categoryList = categories.find(c => c.categoryName === categoryId);
        if (categoryList) {
            fetchSubCategories(categoryId);
        } else {
            setSubCategories([]);
        }
    };

    const handleDeleteConfirmation = (id) => {
        setDeleteId(id);
        setOpenDialog(true);
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedSubCategory('');
        setSubCategories([]);
        setSelectedStatus('');
        setCurrentPage(1);
        setMinValue(0);
        setMaxValue(1000000);
        setFilterDrawerOpen(false);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await axios.delete(`https://localhost:7287/api/Assets/${deleteId}`);
                setAssets(prevAssets => prevAssets.filter((asset) => asset.assetId !== deleteId));
                setOpenDialog(false);
                setDeleteId(null);
            } catch (error) {
                console.error('Error deleting asset:', error);
                setErrorMessage('Error deleting asset. Please try again.');
            }
        }
    };

    const filteredAssets = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        return assets.filter((asset) => {
            const categoryMatch = selectedCategory ? asset.categoryName === selectedCategory : true;
            const subCategoryMatch = selectedSubCategory ? asset.subCategoryName === selectedSubCategory : true;
            const ValueMatch = asset.value >= minValue && asset.value <= maxValue;
            const statusMatch = selectedStatus ? asset.assetStatusName === selectedStatus : true;
            return (
                categoryMatch &&
                subCategoryMatch &&
                ValueMatch &&
                statusMatch &&
                (
                    asset.assetName.toLowerCase().includes(searchLower) ||
                    asset.assetId.toString().includes(searchLower) ||
                    asset.location.toLowerCase().includes(searchLower)
                )
            );
        });
    }, [assets, searchTerm, selectedCategory, selectedSubCategory, minValue, maxValue, selectedStatus]);

    const { currentItems, paginate, pageCount, setCurrentPage, currentPage } = usePagination(itemsPerPage, filteredAssets);

    const handleSearch = (event, newValue) => {
        setSearchTerm(newValue);
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedSubCategory, minValue, maxValue, selectedStatus]);

    const toggleFilterDrawer = () => {
        setFilterDrawerOpen(!filterDrawerOpen);
    };

    const handleSlider = (e, newValue) => {
        setMinValue(newValue[0]);
        setMaxValue(newValue[1]);
    }


    const logo = "/Images/logo.png";
    const generatePDF = async() => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4'
        });

        const tableColumn = ["Asset ID", "Name", "Location", "Value", "Category", "Subcategory", "Status"];
        const tableRows = [];

        filteredAssets.forEach(asset => {
            const assetData = [
                asset.assetId,
                asset.assetName,
                asset.location,
                asset.value,
                asset.categoryName,
                asset.subCategoryName,
                asset.assetStatusName
            ];
            tableRows.push(assetData);
        });
        let img;
    try {
        img = await loadImage(logo);
    } catch (error) {
        console.error("Error loading the logo image:", error);
        return;
    }
    const companyInfo = {
        address: "No.4, West Mada Church Street, Royapuram, Chennai, Tamil Nadu, 600013",
        phoneNumber: "Phone: 044 3355 3355  Email: hexawarehub@gmail.com",
        website: "website: HexaHub.in"
    }
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 100,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 5},
            columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' } },
            didDrawPage: function (data) {
                if (doc.internal.getNumberOfPages() === 1) {
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    // doc.addImage(img, 'PNG', 10, 10, 30, 30);
                    doc.setDrawColor(153, 0, 0);
                    doc.setLineWidth(10);
                    doc.line(0, 0, pageWidth, 0);
                    doc.addImage(img, 'PNG', pageWidth - 135, 7, 30, 30);
                    doc.setFontSize(18);
                    doc.text("HexaHub", pageWidth - 100, 27);
                    doc.setFontSize(18);
                    doc.text("Asset List", 40, 65);
                    doc.setFontSize(10);
                    let filterText = `Filters: ${selectedCategory ? `Category: ${selectedCategory}, ` : ''}${selectedSubCategory ? `Subcategory: ${selectedSubCategory}, ` : ''}${selectedStatus ? `Status: ${selectedStatus}, ` : ''}Value Range: ${minValue} - ${maxValue}`;
                    doc.text(filterText, 40, 80);
                    doc.setDrawColor(153, 0, 0);
                    doc.setLineWidth(2);
                    doc.line(0, pageHeight - 50, pageWidth, pageHeight - 50);

                    doc.setFontSize(8);
                    const getTextWidth = (text) => {
                        return doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                    };
                    
                    const centerText = (text, y) => {
                        const textWidth = getTextWidth(text);
                        const textX = (pageWidth - textWidth) / 2;
                        doc.text(text, textX, y);
                    };
                    
                    centerText(companyInfo.address, pageHeight - 35);
                    centerText(companyInfo.phoneNumber, pageHeight - 25);
                    centerText(companyInfo.website, pageHeight - 15);
                }
            },
        });

        doc.save("asset_list.pdf");
    };

    const loadImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                console.log("Image loaded successfully");
                resolve(img);
            };
            img.onerror = (err) => {
                console.error("Error loading image:", err);
                reject(err);
            };
        });
    };
    

    return (
        <Box
            sx={{
                bgcolor: darkMode ? 'background.paper' : 'background.default',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'fit-content',
            }}
        >
            <Box sx={{ display: 'flex', flex: 1 }}>
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
                    <Typography variant="h4" gutterBottom>
                        Asset Management
                    </Typography>
                    {errorMessage && <Typography color="error">{errorMessage}</Typography>}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            disableClearable
                            options={assets.map((option) => option.assetName)}
                            onInputChange={handleSearch}
                            renderInput={(params) => (
                                <TextField
                                    placeholder="by Name, ID, Location"
                                    {...params}
                                    label="Search"
                                    InputProps={{
                                        ...params.InputProps,
                                        type: 'search',
                                        endAdornment: (
                                            <IconButton>
                                                <SearchIcon />
                                            </IconButton>
                                        ),
                                    }}
                                    sx={{ width: 300 }}
                                />
                            )}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <IconButton onClick={toggleFilterDrawer}>
                                <FilterListIcon />
                            </IconButton>
                            <IconButton onClick={generatePDF}>
                                <PictureAsPdfIcon />
                            </IconButton>
                            <Link to={'/admin/asset/add'}>
                                <IconButton>
                                    <AddIcon />
                                </IconButton>
                            </Link>
                            {selectedValue != null && (
                                <>
                                    <Link to={`/admin/asset/update/${selectedValue}`}>
                                        <IconButton>
                                            <EditIcon />
                                        </IconButton>
                                    </Link>
                                    <IconButton onClick={() => handleDeleteConfirmation(selectedValue)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>

                    <Drawer
                        anchor="right"
                        open={filterDrawerOpen}
                        onClose={toggleFilterDrawer}
                    >
                        <Box sx={{ width: 250, padding: 2, marginTop: '64px' }}>
                            <Typography variant="h6">Filters</Typography>
                            <FormControl sx={{ minWidth: 150, mb: 2 }}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    label="Category"
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category.categoryId} value={category.categoryName}>
                                            {category.categoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel>Subcategory</InputLabel>
                                <Select
                                    value={selectedSubCategory}
                                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    label="Subcategory"
                                >
                                    {!selectedCategory && (<MenuItem value="">Select an Category</MenuItem>)}
                                    {subCategories.map((subCategory) => (
                                        <MenuItem key={subCategory.subCategoryId} value={subCategory.subCategoryName}>
                                            {subCategory.subCategoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ mt: 2, width: 195 }}>
                                <Typography gutterBottom>Value Range</Typography>
                                <Slider
                                    value={[minValue, maxValue]}
                                    onChange={handleSlider}
                                    valueLabelDisplay='auto'
                                    min={0}
                                    max={100000}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <TextField
                                        label="Min Value"
                                        type="number"
                                        value={minValue}
                                        onChange={(e) => setMinValue(Number(e.target.value))}
                                        inputProps={{ min: 0, max: 200000 }}
                                        sx={{ width: '45%' }}
                                    />
                                    <TextField
                                        label="Max Value"
                                        type="number"
                                        value={maxValue}
                                        onChange={(e) => setMaxValue(Number(e.target.value))}
                                        inputProps={{ min: 0, max: 200000 }}
                                        sx={{ width: '45%' }}
                                    />
                                </Box>
                                <FormControl sx={{ minWidth: 150, mt: 2 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="OpenToRequest">Open to Request</MenuItem>
                                        <MenuItem value="Allocated">Allocated</MenuItem>
                                        <MenuItem value="InMaintenance">In Maintenance</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Button variant="outlined" onClick={clearFilters} sx={{ mt: 2 }}>
                                Clear Filters
                            </Button>
                        </Box>
                    </Drawer>

                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="asset table">
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Asset ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Subcategory</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((asset) => (
                                        <TableRow key={asset.assetId}>
                                            <TableCell>
                                                <RadioButton
                                                    selectedValue={selectedValue}
                                                    onChange={setSelectedValue}
                                                    value={asset.assetId}
                                                />
                                            </TableCell>
                                            <TableCell>{asset.assetId}</TableCell>
                                            <TableCell>{asset.assetName}</TableCell>
                                            <TableCell>{asset.location}</TableCell>
                                            <TableCell>{asset.value}</TableCell>
                                            <TableCell>{asset.categoryName}</TableCell>
                                            <TableCell>{asset.subCategoryName}</TableCell>
                                            <TableCell sx={{ color: asset.assetStatusName === 'Allocated' ? '#0BDA51' : asset.assetStatusName === 'OpenToRequest' ? '#36A2EB' : '#FF7518', fontWeight: 'bold' }}>
                                                {asset.assetStatusName}
                                            </TableCell>
                                            <TableCell>
                                                <Link to={`/admin/asset/${asset.assetId}`}>
                                                    <IconButton>
                                                        <InfoIcon />
                                                    </IconButton>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">No assets found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <PaginationRounded count={pageCount} page={currentPage} onChange={(_, page) => setCurrentPage(page)} />
                </Box>
            </Box>
            <ConfirmationDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this asset?"
            />
        </Box>
    );
}