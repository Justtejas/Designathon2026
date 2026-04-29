/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
// import Header from '../AdminHeader';
// import Navbar from '../AdminNavBar';
import { jwtToken } from '../../Utils/utils';
import Cookies from 'js-cookie';
import {
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
    Grid,
    Paper,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import axios from 'axios';

const token = Cookies.get('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
const drawerWidth = 240;

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

export default function Dashboard() {
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    // const [mobileOpen, setMobileOpen] = useState(false);
    const [totalAssets, setTotalAssets] = useState(0);
    const [allocatedAssets, setAllocatedAssets] = useState(0);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [auditTableData, setAuditTableData] = useState([]);
    const [maintenanceLog, setMaintenanceLog] = useState(0);
    const [serviceData, setServiceData] = useState([]);
    const [assetRequestData, setAssetRequestData] = useState([]);
    const [assetAllocData, setAssetAllocData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = Cookies.get('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                console.error('No valid token found.');
                setLoading(false);
                return;
            }

            try {
                const auditResponse = await axios.get('https://localhost:7287/api/Audits/All');
                if (auditResponse.data && auditResponse.data.$values) {
                    setAuditTableData(auditResponse.data.$values);
                } else {
                    console.error('Expected an array for Audits, but got:', auditResponse.data)
                }

                //Fetching Asset data
                const assetResponse = await axios.get('https://localhost:7287/api/Assets');
                if (assetResponse.data && assetResponse.data.$values) {
                    setTotalAssets(assetResponse.data.$values.length);
                } else {
                    console.error('Expected an array for assets, but got:', assetResponse.data);
                }
                //Fetching Allcoated Assets data
                const allocatedResponse = await axios.get('https://localhost:7287/api/Assets/Status?status=Allocated');
                if (allocatedResponse.data && allocatedResponse.data.$values) {
                    setAllocatedAssets(allocatedResponse.data.$values.length);
                } else {
                    console.error('Expected an array for allocated assets, but got:', allocatedResponse.data);
                }

                //Fetching Users data
                const usersResponse = await axios.get('https://localhost:7287/api/Users');
                if (usersResponse.data && usersResponse.data.$values) {
                    setUsers(usersResponse.data.$values);
                    setTotalEmployees(usersResponse.data.$values.length);
                } else {
                    console.error('Expected an array for users, but got:', usersResponse.data);
                }

                //Fetching MaintenaceLog data
                const logResponse = await axios.get('https://localhost:7287/api/ServiceRequests/Status/UnderReview');
                if (logResponse.data && logResponse.data.$values) {
                    setMaintenanceLog(logResponse.data.$values.length);
                } else {
                    console.error('Expected an array for allocated asset, but got: ', logResponse.data);
                }

                //Fetching Service Requests data with status
                const statuses = ['UnderReview', 'Approved', 'Completed'];
                const serviceCounts = await Promise.all(
                    statuses.map(status => axios.get(`https://localhost:7287/api/ServiceRequests/Status/${status}`))
                );

                const newServiceData = serviceCounts.map((response, index) => ({
                    name: statuses[index],
                    value: response.data.$values ? response.data.$values.length : 0
                }));
                setServiceData(newServiceData);

                //Fetching Request and Allocation data filtered by month
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const requestCounts = await Promise.all(
                    months.map(async (month) => {
                        try {
                            const response = await axios.get(`https://localhost:7287/api/AssetRequests/filter-by-month?month=${month}`);
                            const responseAlloc = await axios.get(`https://localhost:7287/api/AssetAllocations/filter-by-month?month=${month}`);
                            return {
                                name: month,
                                AssetRequest: response.data.$values ? response.data.$values.length : 0,
                                Allocated: responseAlloc.data.$values ? responseAlloc.data.$values.length : 0,
                            };
                        } catch (error) {
                            console.error(`Error fetching data for month ${month}:`, error);
                            return { name: month, requests: 0, requestsAlloc: 0 };
                        }
                    })
                );
                setAssetRequestData(requestCounts);
                setAssetAllocData(requestCounts);
            } catch (error) {
                console.error('Error fetching data:', error.response ? error.response.data : error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getColor = (index) => {
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
        return colors[index % colors.length];
    };

    return (
        <Box sx={{ display: 'flex' }}>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    marginLeft: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar />
                <Typography variant="h5" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>
                    Asset Management
                </Typography>
                <Grid container spacing={3}>
                    {[{ title: 'Total Assets', value: totalAssets }, { title: 'Assets in use', value: allocatedAssets }, { title: 'Maintenance requests', value: maintenanceLog }, { title: 'Total Employees', value: totalEmployees }].map((item, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <Typography variant="subtitle1" gutterBottom>{item.title}</Typography>
                                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                    {loading ? (
                                        <CircularProgress size={80} />
                                    ) : (
                                        <>
                                            <CircularProgress
                                                variant="determinate"
                                                value={item.value > 100 ? 100 : item.value}
                                                size={80}
                                                thickness={4}
                                                sx={{
                                                    color: getColor(index),
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    top: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                    right: 0,
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="caption" component="div" color="text.secondary">
                                                    {item.value}
                                                </Typography>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    ))}

                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Asset Requests</Typography>
                            {loading ? (
                                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                                    <BarChart data={assetRequestData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div style={{
                                                            backgroundColor: '#fff',
                                                            border: '1px solid #ccc',
                                                            padding: '10px',
                                                            borderRadius: '4px',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                                        }}>
                                                            <p style={{ color: '#000' }}>{label}</p>
                                                            <p style={{ color: '#8884d8' }}>Requests: {payload[0].value}</p>
                                                            <p style={{ color: '#82ca9d' }}>Allocated: {payload[1].value}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />

                                        <Legend />
                                        <Bar dataKey="AssetRequest" fill="#8884d8" />
                                        <Bar dataKey="Allocated" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Service Requests</Typography>
                            {loading ? (
                                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                                    <PieChart>
                                        <Pie
                                            data={serviceData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={isMobile ? 60 : 80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {serviceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, overflowX: 'auto' }}>
                            <Typography variant="h6" gutterBottom>Audit List</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Audit ID</TableCell>
                                            <TableCell>Asset Name</TableCell>
                                            <TableCell>User Name</TableCell>
                                            <TableCell>Audit Date</TableCell>
                                            <TableCell>Audit Message</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {auditTableData.length > 0 ? (
                                            auditTableData.map((row) => (
                                                <TableRow key={row.auditId}>
                                                    <TableCell>{row.auditId}</TableCell>
                                                    <TableCell>{row.assetName || 'N/A'}</TableCell>
                                                    <TableCell>{row.userName || 'N/A'}</TableCell>
                                                    <TableCell>{row.auditDate ? new Date(row.auditDate).toLocaleDateString() : 'N/A'}</TableCell>
                                                    <TableCell>{row.auditMessage || 'N/A'}</TableCell>
                                                    <TableCell style={{ color: row.audit_Status === 'Completed' ? "#0BDA51" : "#36A2EB" }}>{row.audit_Status || 'N/A'}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6}>No audit data available</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}











