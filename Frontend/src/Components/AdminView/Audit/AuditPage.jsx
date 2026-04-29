import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import PaginationRounded from '../../Utils/Pagination';
import usePagination from '../../Utils/usePagination';
import ConfirmationDialog from '../../Utils/Dialog';
import DeleteIcon from '@mui/icons-material/Delete';
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
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Drawer,
    Button,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import RadioButton from '../../Utils/RadioButton';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const token = Cookies.get('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default function AuditPage() {
    const { darkMode } = useTheme();
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [audits, setAudits] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null);
    const [minDate, setMinDate] = useState('');
    const [maxDate, setMaxDate] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const decodedToken = jwtToken();
            if (!decodedToken) {
                console.error('No valid token found.');
                return;
            }
            try {
                const response = await axios.get('https://localhost:7287/api/Audits');
                setAudits(response.data.$values || []);
            } catch (error) {
                console.error('Error fetching audits:', error);
            }
        };

        fetchData();
    }, []);

    const filteredRequests = useMemo(() => {
        return audits.filter((audit) => {
            const searchLower = searchTerm.toLowerCase();
            const dateMatch = (!minDate || new Date(audit.assetReqDate) >= new Date(minDate)) &&
                (!maxDate || new Date(audit.assetReqDate) <= new Date(maxDate));
            const statusMatch = !selectedStatus || audit.audit_Status === selectedStatus; 
            return (
                (
                    audit.userName.toLowerCase().includes(searchLower) ||
                    audit.auditId.toString().includes(searchLower) ||
                    audit.assetName.toLowerCase().includes(searchLower)) &&
                dateMatch &&
                statusMatch 
            );
        });
    }, [audits, searchTerm, minDate, maxDate, selectedStatus]);

    const { currentItems, setCurrentPage, currentPage, pageCount } = usePagination(itemsPerPage, filteredRequests);

    const handleSearch = (event, newValue) => {
        setSearchTerm(newValue);
        setCurrentPage(1);
    };

    const logo = "/Images/logo.png";
    const generatePDF = async() =>{
        const doc = new jsPDF({
            orientation: 'landscape',
            unit:'pt',
            format: 'a4'
        });

        const tableColumn = ["Audit ID", "Audit Date", "Asset Name", "User Name", "Status"];
        const tableRows = [];

        filteredRequests.forEach(auditRequest =>{
            const RequestData = [
                auditRequest.auditId,
                auditRequest.auditDate,
                auditRequest.assetName,
                auditRequest.userName,
                auditRequest.audit_Status
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
            didDrawPage :function(data){
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
                doc.text("Audit List", 40, 60);
                doc.setFontSize(10);
                let filterText = `Filters: Date Range: ${minDate ? new Date(minDate).toLocaleDateString() : 'N/A'} - ${maxDate ? new Date(maxDate).toLocaleDateString() : 'N/A'}${selectedStatus ? `, Status: ${selectedStatus}` : ''}`;
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
        doc.save("audit_List.pdf");
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
        setMinDate('');
        setMaxDate('');
        setSearchTerm('');
        setSelectedStatus('');
        setCurrentPage(1);
    };

    const handleRadioBtn = (newValue) => {
        setSelectedValue(newValue);
    };

    const handleDeleteConfirmation = (id) => {
        setDeleteId(id);
        setOpenDialog(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await axios.delete(`https://localhost:7287/api/Audits/${deleteId}`);
                setAudits(audits.filter(audit => audit.auditId !== deleteId));
                setOpenDialog(false);
                setDeleteId(null);
            } catch (error) {
                console.error("Error deleting audit:", error);
            }
        }
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
                        Audits
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            disableClearable
                            options={audits.map((option) => option.userName)}
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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={toggleFilterDrawer}>
                                <FilterListIcon />
                            </IconButton>
                            <IconButton onClick={generatePDF}>
                                <PictureAsPdfIcon />
                            </IconButton>
                            <Link to={'/admin/audit/add'}>
                                <IconButton>
                                    <AddIcon />
                                </IconButton>
                            </Link>
                            {selectedValue != null && (
                                <IconButton onClick={() => handleDeleteConfirmation(selectedValue)}>
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Drawer
                            anchor="right"
                            open={filterDrawerOpen}
                            onClose={toggleFilterDrawer}
                        >
                            <Box sx={{ width: 250, padding: 2, marginTop: '64px' }}>
                                <Typography variant="h6">Filters</Typography>
                                <FormControl sx={{ minWidth: 150, mt: 2 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="Completed">Completed</MenuItem>
                                        <MenuItem value="Sent">Sent</MenuItem>
                                        <MenuItem value="InProgress">InProgress</MenuItem>
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
                    </Box>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="Audit table">
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Audit ID</TableCell>
                                    <TableCell>Audit Date</TableCell>
                                    <TableCell>User Name</TableCell>
                                    <TableCell>Asset Name</TableCell>
                                    <TableCell>Asset Status</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((audit) => (
                                        <TableRow key={audit.auditId}>
                                            <TableCell>
                                                <RadioButton
                                                    selectedValue={selectedValue}
                                                    onChange={handleRadioBtn}
                                                    value={audit.auditId}
                                                />
                                            </TableCell>
                                            <TableCell>{audit.auditId}</TableCell>
                                            <TableCell>{audit.auditDate}</TableCell>
                                            <TableCell>{audit.userName}</TableCell>
                                            <TableCell>{audit.assetName}</TableCell>
                                            <TableCell sx={{
                                                color: audit.audit_Status === 'Sent' ? '#36A2EB' : audit.audit_Status === 'InProgress' ? '#FF7518':'#0BDA51',
                                            }}>{audit.audit_Status}</TableCell>
                                            <TableCell>
                                                <Link to={`/admin/audit/${audit.auditId}`}>
                                                    <IconButton>
                                                        <InfoIcon />
                                                    </IconButton>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">No Audits found</TableCell>
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
                message="Are you sure you want to delete this audit?"
            />
        </Box>
    );
}
