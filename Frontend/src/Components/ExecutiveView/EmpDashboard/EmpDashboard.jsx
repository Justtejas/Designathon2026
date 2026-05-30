import React, { useEffect, useMemo, useState } from "react";
import EmployeeHeader from "../EmployeeHeader";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";
import { jwtToken } from "../../Utils/utils";
import axiosInstance from "../../Utils/api";
import moment from "moment";
import Footer from "../../LandingPage/Footer";
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Chip,
    Toolbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {
    Inventory as AssetsIcon,
    Assignment as RequestIcon,
    AssignmentReturn as ReturnIcon,
    Build as BuildIcon
} from "@mui/icons-material";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Filler,
    Tooltip,
    Legend,
);

const StatCard = ({ icon, value, label, color, bgColor, delay }) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
            animation: `fadeInUp 0.5s ${delay} ease-out`,
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 },
            '@keyframes fadeInUp': {
                '0%': { opacity: 0, transform: 'translateY(20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
            }
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.25)' }}>
                {React.cloneElement(icon, { sx: { fontSize: 28, color: 'white' } })}
            </Box>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                    {value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {label}
                </Typography>
            </Box>
        </Box>
    </Paper>
);

const AnimatedGauge = ({ value = 0, label, color, delay }) => {
    const percentage = Math.min(value * 10, 100);
    
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${color}30`,
                animation: `fadeInUp 0.5s ${delay} ease-out`,
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', width: 110, height: 110 }}>
                    <svg viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            fill="none" stroke={color} strokeWidth="3" 
                            strokeDasharray={`${percentage},100`} strokeLinecap="round" />
                    </svg>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: color }}>{value}</Typography>
                    </Box>
                </Box>
                <Typography variant="subtitle1" sx={{ mt: 1.5, fontWeight: 600, color: '#374151' }}>{label}</Typography>
            </Box>
        </Paper>
    );
};

const EmpDashboard = () => {
    const [assets, setAssets] = useState([]);
    const [assetReqData, setAssetReqData] = useState([]);
    const [serviceReqData, setServiceReqData] = useState([]);
    const [requestsCount, setRequestsCount] = useState(0);
    const [returnedCount, setReturnedCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

    const extractSettledData = (result) => {
        if (result.status === "fulfilled") {
            const res = result.value;
            if (Array.isArray(res?.data)) return res.data;
            if (Array.isArray(res?.data?.data)) return res.data.data;
        }
        return [];
    };

    useEffect(() => {
        const decoded = jwtToken();
        if (!decoded?.userId) return;

        const userId = decoded.userId;

        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const results = await Promise.allSettled([
                    axiosInstance.get(`/AssetAllocations/user/${userId}`),
                    axiosInstance.get(`/AssetRequests`),
                    axiosInstance.get(`/ServiceRequests`),
                    axiosInstance.get(`/ReturnRequests`),
                ]);

                const [assetAllocRes, assetReqRes, serviceReqRes, returnReqRes] = results;
                const myAssets = extractSettledData(assetAllocRes);
                const assetRequests = extractSettledData(assetReqRes);
                const serviceRequests = extractSettledData(serviceReqRes);
                const returnRequests = extractSettledData(returnReqRes);

                const assetReq = assetRequests.filter(r => r.userId === userId);
                const serviceReq = serviceRequests.filter(r => r.userId === userId);
                const returns = returnRequests.filter(r => r.userId === userId && r.returnStatus === 2);

                setAssets(myAssets);
                setReturnedCount(returns.length);
                setRequestsCount(assetReq.length + serviceReq.length + returns.length);
                setAssetReqData(groupByWeek(assetReq));
                setServiceReqData(groupByWeek(serviceReq));
            } catch (err) {
                console.error("Dashboard API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const groupByWeek = (data = []) => {
        const weeks = Array(5).fill(0);
        data.forEach(item => {
            const diff = moment(item.requestDate).week() - moment().startOf("month").week();
            if (diff >= 0 && diff < 5) weeks[diff]++;
        });
        return weeks;
    };

    const chartData = useMemo(() => ({
        labels: weekLabels,
        datasets: [
            {
                label: "Asset Requests",
                data: assetReqData,
                borderColor: "#1e2a55",
                backgroundColor: "rgba(30, 42, 85, 0.1)",
                fill: true,
                tension: 0.4,
            },
            {
                label: "Service Requests",
                data: serviceReqData,
                borderColor: "#00b894",
                backgroundColor: "rgba(0, 184, 148, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    }), [assetReqData, serviceReqData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
            x: { grid: { display: false } }
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <EmployeeHeader />
            
            {/* Add Toolbar to create space below fixed header */}
            <Toolbar />

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <CircularProgress size={60} sx={{ color: '#1e2a55' }} />
                    </Box>
                ) : (
                    <>
                        {/* HEADER */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e2a55', mb: 1 }}>
                                Welcome Back! 👋
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                Here's your inventory overview
                            </Typography>
                        </Box>

                        {/* STAT CARDS */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard icon={<AssetsIcon />} value={assets.length} label="My Assets" color="#ffffff" bgColor="#1e2a55" delay="0s" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard icon={<RequestIcon />} value={requestsCount} label="Total Requests" color="#ffffff" bgColor="#00b894" delay="0.1s" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard icon={<ReturnIcon />} value={returnedCount} label="Returned" color="#ffffff" bgColor="#f59e0b" delay="0.2s" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard icon={<BuildIcon />} value={serviceReqData.reduce((a, b) => a + b, 0)} label="Services" color="#ffffff" bgColor="#8b5cf6" delay="0.3s" />
                            </Grid>
                        </Grid>

                        {/* GAUGES */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <AnimatedGauge value={assets.length} label="Assets Possessed" color="#1e2a55" delay="0.4s" />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <AnimatedGauge value={requestsCount} label="Requests Raised" color="#00b894" delay="0.5s" />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <AnimatedGauge value={returnedCount} label="Assets Returned" color="#f59e0b" delay="0.6s" />
                            </Grid>
                        </Grid>

                        {/* TABLE AND CHART */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e2a55', mb: 2 }}>
                                        My Assets
                                    </Typography>
                                    {assets.length === 0 ? (
                                        <Box sx={{ p: 4, textAlign: 'center' }}>
                                            <Typography color="text.secondary">No assets allocated yet</Typography>
                                        </Box>
                                    ) : (
                                        <TableContainer>
                                            <Table>
                                                <TableHead sx={{ bgcolor: '#1e2a55' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Value</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Model</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Allocated</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {assets.map((a, i) => (
                                                        <TableRow key={i} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                                            <TableCell sx={{ fontWeight: 500 }}>{a.assetName}</TableCell>
                                                            <TableCell><Chip label={a.categoryName} size="small" sx={{ bgcolor: '#e0e7ff', color: '#1e2a55' }} /></TableCell>
                                                            <TableCell>${a.Value || 0}</TableCell>
                                                            <TableCell>{a.Model || '-'}</TableCell>
                                                            <TableCell>{new Date(a.allocatedDate).toLocaleDateString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} lg={6}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e2a55', mb: 2, textAlign: 'center' }}>
                                        Requests Overview
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        <Line data={chartData} options={chartOptions} />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>

            <Footer />
        </Box>
    );
};

export default EmpDashboard;