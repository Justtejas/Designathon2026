import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import PaginationRounded from '../../Utils/Pagination';
import usePagination from '../../Utils/usePagination';
import RadioButton from '../../Utils/RadioButton';
import { jwtToken } from '../../Utils/utils';
import Cookies from 'js-cookie';
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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';


const token = Cookies.get('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default function AssetPage() {
    const { darkMode } = useTheme();
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(null);
    const [assetsRequest, setAssetsRequest] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [minDate, setMinDate] = useState('');
    const [maxDate, setMaxDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const decodedToken = jwtToken();
            if (!decodedToken) {
                console.error('No valid token found.');
                return;
            }
            try {
                const response = await axios.get('https://localhost:7287/api/AssetRequests');
                console.log('Fetched Assets Response:', JSON.stringify(response.data));
                setAssetsRequest(response.data.$values || []);
            } catch (error) {
                console.error('Error fetching assets:', error);
            }
        };

        fetchData();
    }, []);

    const filteredRequests = useMemo(() => {
        return assetsRequest.filter((assetsRequest) => {
            const searchLower = searchTerm.toLowerCase();
            const dateMatch = (!minDate || new Date(assetsRequest.assetReqDate) >= new Date(minDate)) &&
                (!maxDate || new Date(assetsRequest.assetReqDate) <= new Date(maxDate));
            return (
                (
                    assetsRequest.userName.toLowerCase().includes(searchLower) ||
                    assetsRequest.assetReqId.toString().includes(searchLower) ||
                    assetsRequest.assetName.toLowerCase().includes(searchLower)) &&
                (selectedStatus ? assetsRequest.requestStatusName === selectedStatus : true) &&
                dateMatch
            );
        });
    }, [assetsRequest, searchTerm, selectedStatus, minDate, maxDate]);

    const { currentItems, setCurrentPage, currentPage, pageCount } = usePagination(itemsPerPage, filteredRequests);

    const handleSearch = (event, newValue) => {
        setSearchTerm(newValue);
        setCurrentPage(1);
    };

    const handleRadioBtn = (newValue) => {
        console.log(`Selected value changed to: ${newValue}`);
        setSelectedValue(newValue);
        const selectedAsset = assetsRequest.find(req => req.assetReqId === newValue);
        if (selectedAsset && (selectedAsset.requestStatusName === 'Allocated' || selectedAsset.requestStatusName === 'Rejected')) {
            console.log('Cannot edit this request as it is Allocated or Rejected.');
        }
    };

    const logo = "/Images/logo.png";
    const generatePDF = async() =>{
        const doc = new jsPDF({
            orientation: 'landscape',
            unit:'pt',
            format: 'a4'
        });

        const tableColumn = ["Request ID", "User Name", "Asset Name", "Request Date", "Status"];
        const tableRows = [];

        filteredRequests.forEach(assetsRequest =>{
            const RequestData = [
                assetsRequest.assetReqId,
                assetsRequest.userName,
                assetsRequest.assetName,
                assetsRequest.assetReqDate,
                assetsRequest.requestStatusName
            ];
            tableRows.push(RequestData);
        });
        let img;
    try {
        img = await loadImage(logo);
    } catch (error) {
        console.error("Error loading the logo image:", error);
        return;
    }
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 100,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 5},
            columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' } },
            didDrawPage :function(data){
                if (doc.internal.getNumberOfPages() === 1) {
                    doc.addImage(img, 'PNG', 10, 10, 30, 30);
                doc.setFontSize(18);
                doc.text("HexaHub", 50, 30);
                doc.setFontSize(20);
                doc.text("Asset Request List", 40, 60);
                doc.setFontSize(10);
                let filterText = `Filters: Date Range: ${minDate ? new Date(minDate).toLocaleDateString() : 'N/A'} - ${maxDate ? new Date(maxDate).toLocaleDateString() : 'N/A'}${selectedStatus ? `, Status: ${selectedStatus}` : ''}`;
                doc.text(filterText, 40, 80);
                }
            },
        });
        doc.save("assetRequest_List.pdf");
    }

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

    const toggleFilterDrawer = () => {
        setFilterDrawerOpen(!filterDrawerOpen);
    };

    const clearFilters = () => {
        setSelectedStatus('');
        setMinDate('');
        setMaxDate('');
        setSearchTerm('');
        setCurrentPage(1);
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
                        Asset Requests
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            disableClearable
                            options={assetsRequest.map((option) => option.assetName)}
                            onInputChange={handleSearch}
                            renderInput={(params) => (
                                <TextField
                                    placeholder="by Name, ID"
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
                        <Box>
                            <IconButton onClick={toggleFilterDrawer}>
                                <FilterListIcon />
                            </IconButton>
                            <IconButton onClick={generatePDF}>
                                <PictureAsPdfIcon />
                            </IconButton>
                            {selectedValue != null && (
                                <Link to={`/admin/request/update/${selectedValue}`}>
                                    <IconButton>
                                        <EditIcon />
                                    </IconButton>
                                </Link>
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
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    label="Status"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="Allocated">Allocated</MenuItem>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                    <MenuItem value="Rejected">Rejected</MenuItem>
                                </Select>
                            </FormControl>
                            <Box sx={{ mb: 2 }}>
                                <Typography gutterBottom>Request Date</Typography>
                                <TextField
                                    label="Min Date"
                                    type="date"
                                    value={minDate}
                                    onChange={(e) => setMinDate(e.target.value)}
                                    sx={{ width: '100%', mb: 1 }}
                                />
                                <TextField
                                    label="Max Date"
                                    type="date"
                                    value={maxDate}
                                    onChange={(e) => setMaxDate(e.target.value)}
                                    sx={{ width: '100%' }}
                                />
                            </Box>

                            <Button variant="outlined" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </Box>
                    </Drawer>

                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="asset table">
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Request ID</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Asset</TableCell>
                                    <TableCell>Request Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((assetsRequest) => (
                                        <TableRow key={assetsRequest.assetReqId}>
                                            <TableCell>
                                                <RadioButton
                                                    selectedValue={selectedValue}
                                                    onChange={handleRadioBtn}
                                                    value={assetsRequest.assetReqId}
                                                />
                                            </TableCell>
                                            <TableCell>{assetsRequest.assetReqId}</TableCell>
                                            <TableCell>{assetsRequest.userName}</TableCell>
                                            <TableCell>{assetsRequest.assetName}</TableCell>
                                            <TableCell>{assetsRequest.assetReqDate}</TableCell>
                                            <TableCell sx={{
                                                color: assetsRequest.requestStatusName === 'Allocated' ? '#0BDA51' :
                                                    assetsRequest.requestStatusName === 'Pending' ? '#36A2EB' : '#D2042D',
                                            }}>
                                                {assetsRequest.requestStatusName}
                                            </TableCell>
                                            <TableCell>
                                                <Link to={`/admin/request/${assetsRequest.assetReqId}`}>
                                                    <IconButton>
                                                        <InfoIcon />
                                                    </IconButton>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">No Requests found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <PaginationRounded count={pageCount} page={currentPage} onChange={(_, page) => setCurrentPage(page)} />
                </Box>
            </Box>
        </Box>
    );
}
