/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
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
    TableRow,
    Chip // <--- Added Missing Import
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
    Cell,
    AreaChart, // <--- Added Missing Import
    Area // <--- Added Missing Import
} from 'recharts';
import axios from 'axios';
import {
    Inventory as AssetsIcon,
    AssignmentTurnedIn as RequestIcon,
    AccountTree as AllocationIcon,
    Build as BuildIcon,
} from '@mui/icons-material';

const token = Cookies.get('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
const drawerWidth = 240;

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const CHART_COLORS = {
    requests: '#8b5cf6',
    allocated: '#34d399'
};

export default function Dashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [totalAssets, setTotalAssets] = useState(0);
    const [allocatedAssets, setAllocatedAssets] = useState(0);
    const [totalExecutives, setTotalExecutives] = useState(0);
    const [loading, setLoading] = useState(true);
    const [auditTableData, setAuditTableData] = useState([]);
    const [maintenanceLog, setMaintenanceLog] = useState(0);
    const [serviceData, setServiceData] = useState([]);
    const [assetRequestData, setAssetRequestData] = useState([]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            const token = Cookies.get('token');

            if (!token) {
                console.error('No valid token found.');
                setLoading(false);
                return;
            }

            const api = axios.create({
                baseURL: 'http://localhost:7287/api',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                signal: controller.signal
            });

            const safeGet = async (url, fallback = []) => {
                try {
                    const response = await api.get(url);
                    return Array.isArray(response.data) ? response.data : fallback;
                } catch (error) {
                    // Ignore cancel errors
                    if (!axios.isCancel(error)) {
                        console.error(`Error fetching ${url}:`, error.message);
                    }
                    return fallback;
                }
            };

            try {
                const [audits, assets, allocated, users, logs] = await Promise.all([
                    safeGet('/Audits/All'),
                    safeGet('/Assets'),
                    safeGet('/Assets/Status?status=Allocated'),
                    safeGet('/users'),
                    safeGet('/ServiceRequests/Status/UnderReview')
                ]);

                setAuditTableData(audits);
                setTotalAssets(assets.length);
                setAllocatedAssets(allocated.length);
                setTotalExecutives(users.length);
                setMaintenanceLog(logs.length);

                // Service Status
                const statuses = ['UnderReview', 'Approved', 'Completed'];
                const serviceResult = await Promise.all(
                    statuses.map(s => safeGet(`/ServiceRequests/Status/${s}`))
                );
                setServiceData(serviceResult.map((data, i) => ({
                    name: statuses[i],
                    value: data.length
                })));

                // Monthly Data
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthly = await Promise.all(
                    months.map(async (m) => {
                        const [r, a] = await Promise.all([
                            safeGet(`/AssetRequests/filter-by-month?month=${m}`),
                            safeGet(`/AssetAllocations/filter-by-month?month=${m}`)
                        ]);
                        return { name: m, AssetRequest: r.length, Allocated: a.length };
                    })
                );
                setAssetRequestData(monthly);

            } catch (error) {
                console.error("Unexpected error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => controller.abort();
    }, []);

    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                marginLeft: { sm: `${drawerWidth}px` },
                bgcolor: 'background.default',
                minHeight: '100vh'
            }}
        >
           

            {/* HEADER */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                    Manager Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Here's your inventory overview.
                </Typography>
            </Box>

            {/* STAT CARDS */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { title: 'Total Assets', value: totalAssets, color: '#4f46e5', icon: <AssetsIcon />, bg: '#e0e7ff' },
                    { title: 'In Use', value: allocatedAssets, color: '#059669', icon: <AllocationIcon />, bg: '#d1fae5' },
                    { title: 'Maintenance', value: maintenanceLog, color: '#d97706', icon: <BuildIcon />, bg: '#fef3c7' },
                    { title: 'Executives', value: totalExecutives, color: '#7c3aed', icon: <RequestIcon />, bg: '#ede9fe' },
                ].map((stat, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Paper elevation={0} sx={{ 
                            p: 3, borderRadius: 3, display: 'flex', alignItems: 'center',
                            border: '1px solid', borderColor: 'divider',
                            transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                        }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: stat.bg, color: stat.color, mr: 2, display:'flex' }}>
                                {stat.icon}
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    {loading ? <CircularProgress size={20} /> : stat.value}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* CHARTS */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Monthly Trends</Typography>
                        {loading ? (
                            <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height: 300 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={assetRequestData}>
                                    <defs>
                                        <linearGradient id="colReq" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.requests} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={CHART_COLORS.requests} stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colAlloc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.allocated} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={CHART_COLORS.allocated} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Area type="monotone" dataKey="AssetRequest" stroke={CHART_COLORS.requests} fill="url(#colReq)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="Allocated" stroke={CHART_COLORS.allocated} fill="url(#colAlloc)" strokeWidth={3} />
                                    <Legend />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Service Status</Typography>
                        {loading ? (
                            <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height: 300 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={serviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
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
            </Grid>

            {/* AUDIT TABLE */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="bold">Recent Audit Trail</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Asset</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {auditTableData.slice(0, 5).map((row) => (
                                <TableRow key={row.auditId} hover>
                                    <TableCell>#{row.auditId}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{row.assetName || '-'}</TableCell>
                                    <TableCell>{row.userName || '-'}</TableCell>
                                    <TableCell>{row.auditMessage || '-'}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.auditStatus || 'Unknown'} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: row.auditStatus === 'Completed' ? '#d1fae5' : '#fef3c7',
                                                color: row.auditStatus === 'Completed' ? '#065f46' : '#92400e',
                                                fontWeight: 'bold'
                                            }} 
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}