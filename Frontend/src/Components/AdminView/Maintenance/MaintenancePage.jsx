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

export default function MaintenancePage() {
    const { darkMode } = useTheme();
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(null);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
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
                const response = await axios.get('https://localhost:7287/api/MaintenanceLogs/AllLog');
                console.log('Fetched Maintenance Logs Response:', JSON.stringify(response.data));
                setMaintenanceLogs(response.data.$values || []); 
            } catch (error) {
                console.error('Error fetching maintenance logs:', error);
            }
        };

        fetchData();
    }, []);

    const filteredLogs = useMemo(() => {
        return maintenanceLogs.filter((log) => {
            const searchLower = searchTerm.toLowerCase();
            const dateMatch = (!minDate || new Date(log.maintenance_date) >= new Date(minDate)) &&
                (!maxDate || new Date(log.maintenance_date) <= new Date(maxDate));
            return (
                log.assetName.toLowerCase().includes(searchLower) &&
                (selectedStatus ? log.serviceReqStatusName === selectedStatus : true) &&
                dateMatch
            );
        });
    }, [maintenanceLogs, searchTerm, selectedStatus, minDate, maxDate]);

    const { currentItems, setCurrentPage, currentPage, pageCount } = usePagination(itemsPerPage, filteredLogs);

    const handleSearch = (event, newValue) => {
        setSearchTerm(newValue);
        setCurrentPage(1);
    };

    const logo = "/Images/logo.png";

    const generatePDF = async () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4'
        });
    
        const tableColumn = ["Maintenance ID", "User Name", "Asset Name", "Maintenance Date", "Description", "Cost"];
        const tableRows = [];
    
        filteredLogs.forEach(log => {
            const requestData = [
                log.maintenanceId,
                log.userName,
                log.assetName,
                log.maintenance_date,
                log.maintenance_Description,
                log.cost
            ];
            tableRows.push(requestData);
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
            website: "Website: HexaHub.in"
        };
    
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 120,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 5 },
            columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' } },
            didDrawPage: function (data) {
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
    
                if (doc.internal.getNumberOfPages() === 1) {
                    doc.setDrawColor(153, 0, 0);
                    doc.setLineWidth(10);
                    doc.line(0, 0, pageWidth, 0);
                    // doc.line(0, 40, pageWidth, 40);
                    doc.addImage(img, 'PNG', pageWidth - 135, 7, 30, 30);
                    doc.setFontSize(18);
                    doc.text("HexaHub", pageWidth - 100, 27);
                    doc.setFontSize(20);
                    doc.text("Maintenance Log List", 40, 80);
    
                    // Display filters above the table
                    doc.setFontSize(10);
                    const filterText = `Filters: Date Range: ${minDate ? new Date(minDate).toLocaleDateString() : 'N/A'} - ${maxDate ? new Date(maxDate).toLocaleDateString() : 'N/A'}${selectedStatus ? `, Status: ${selectedStatus}` : ''}`;
                    doc.text(filterText, 40, 100);
    
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
    
        doc.save("MaintenanceLog_List.pdf");
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
    

    const handleRadioBtn = (newValue) => {
        setSelectedValue(newValue);
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
                        Maintenance Logs
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            disableClearable
                            options={maintenanceLogs.map((option) => option.assetName)}
                            onInputChange={handleSearch}
                            renderInput={(params) => (
                                <TextField
                                    placeholder="by Asset Name"
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
                                <Link to={`/admin/maintenance/update/${selectedValue}`}>
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
                            <Box sx={{ mb: 2 }}>
                                <Typography gutterBottom>Maintenance Date</Typography>
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
                        <Table sx={{ minWidth: 650 }} aria-label="maintenance logs table">
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Maintenance ID</TableCell>
                                    <TableCell>Asset Name</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Maintenance Date</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((log) => (
                                        <TableRow key={log.maintenanceId}>
                                            <TableCell>
                                                <RadioButton
                                                    selectedValue={selectedValue}
                                                    onChange={handleRadioBtn}
                                                    value={log.maintenanceId}
                                                />
                                            </TableCell>
                                            <TableCell>{log.maintenanceId}</TableCell>
                                            <TableCell>{log.assetName}</TableCell>
                                            <TableCell>{log.userName}</TableCell>
                                            <TableCell>{new Date(log.maintenance_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{log.maintenance_Description}</TableCell>
                                            <TableCell>
                                                <Link to={`/admin/maintenance/${log.maintenanceId}`}>
                                                    <IconButton>
                                                        <InfoIcon />
                                                    </IconButton>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">No Logs found</TableCell>
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
