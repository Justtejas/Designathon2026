import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import PaginationRounded from '../../Utils/Pagination';
import usePagination from '../../Utils/usePagination';
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
    Button,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';


const token = Cookies.get('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default function AllocationPage() {
    const { darkMode } = useTheme();
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [allocation, setAllocation] = useState([]);
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
                const response = await axios.get('https://localhost:7287/api/AssetAllocations');
                console.log('Fetched Assets Response:', JSON.stringify(response.data));
                setAllocation(response.data.$values || []);
            } catch (error) {
                console.error('Error fetching assets:', error);
            }
        };

        fetchData();
    }, []);

    const filteredRequests = useMemo(() => {
        return allocation.filter((allocation) => {
            const searchLower = searchTerm.toLowerCase();
            const dateMatch = (!minDate || new Date(allocation.assetReqDate) >= new Date(minDate)) &&
                (!maxDate || new Date(allocation.assetReqDate) <= new Date(maxDate));
            return (
                (
                    allocation.userName.toLowerCase().includes(searchLower) ||
                    allocation.assetReqId.toString().includes(searchLower) ||
                    allocation.allocationId.toString().includes(searchLower) ||
                    allocation.assetName.toLowerCase().includes(searchLower)) &&
                dateMatch
            );
        });
    }, [allocation, searchTerm, minDate, maxDate]);

    const { currentItems, setCurrentPage, currentPage, pageCount } = usePagination(itemsPerPage, filteredRequests);

    const handleSearch = (event, newValue) => {
        setSearchTerm(newValue);
        setCurrentPage(1);
    };

    const toggleFilterDrawer = () => {
        setFilterDrawerOpen(!filterDrawerOpen);
    };
    const logo = "/Images/logo.png";
    const generatePDF = async () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4'
        });

        const tableColumn = ["Allocation ID", "Request ID", "Asset Name", "UserName", "Allocated Date"];
        const tableRows = [];

        filteredRequests.forEach(allocation => {
            const allocData = [
                allocation.allocationId,
                allocation.assetReqId,
                allocation.assetName,
                allocation.userName,
                allocation.allocatedDate
            ];
            tableRows.push(allocData);
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
            styles: { fontSize: 8, cellPadding: 5 },
            columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' } },
            didDrawPage: function (data) {
                if (doc.internal.getNumberOfPages() === 1) {
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    // doc.addImage(img, 'PNG', 10, 10, 30, 30);
                    doc.setDrawColor(153, 0, 0);
                    doc.setLineWidth(10);
                    doc.line(0, 0, pageWidth, 0);
                    // doc.line(0, 40, pageWidth, 40);
                    doc.addImage(img, 'PNG', pageWidth - 135, 7, 30, 30);
                    doc.setFontSize(18);
                    doc.text("HexaHub", pageWidth - 100, 27);
                    doc.setFontSize(20);
                    doc.text("Allocation List", 40, 60);
                    doc.setFontSize(10);
                    let filterText = `Filters: Date Range: ${minDate ? new Date(minDate).toLocaleDateString() : 'N/A'} - ${maxDate ? new Date(maxDate).toLocaleDateString() : 'N/A'}`;
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
        doc.save("allocation_List.pdf");
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

    const clearFilters = () => {
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
                        Allocation
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            disableClearable
                            options={allocation.map((option) => option.assetName)}
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
                        </Box>
                    </Box>

                    <Drawer
                        anchor="right"
                        open={filterDrawerOpen}
                        onClose={toggleFilterDrawer}
                    >
                        <Box sx={{ width: 250, padding: 2, marginTop: '64px' }}>
                            <Typography variant="h6">Filters</Typography>

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
                                    <TableCell>Allocation ID</TableCell>
                                    <TableCell>Request ID</TableCell>
                                    <TableCell>Asset Name</TableCell>
                                    <TableCell>User Name</TableCell>
                                    <TableCell>Allocated Date</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((allocation) => (
                                        <TableRow key={allocation.allocationId}>
                                            <TableCell>
                                            </TableCell>
                                            <TableCell>{allocation.allocationId}</TableCell>
                                            <TableCell>{allocation.assetReqId}</TableCell>
                                            <TableCell>{allocation.assetName}</TableCell>
                                            <TableCell>{allocation.userName}</TableCell>
                                            <TableCell>{allocation.allocatedDate}</TableCell>
                                            <TableCell>
                                                <Link to={`/admin/allocation/${allocation.allocationId}`}>
                                                    <IconButton>
                                                        <InfoIcon />
                                                    </IconButton>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">No Allocations found</TableCell>
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
