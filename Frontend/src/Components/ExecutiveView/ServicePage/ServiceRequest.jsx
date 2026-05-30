import React, { useEffect, useState } from "react";
import axiosInstance from "../../Utils/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import EmployeeHeader from "../EmployeeHeader";
import Footer from "../../LandingPage/Footer";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Build as BuildIcon,
} from "@mui/icons-material";

const ServiceRequest = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [assetAllocations, setAssetAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    serviceId: 0,
    userId: "",
    assetName: "",
    assetId: "",
    serviceRequestDate: new Date().toISOString().split("T")[0],
    issueType: "",
    serviceDescription: "",
    serviceReqStatus: "UnderReview",
  });

  const issueTypeMapping = {
    1: "Malfunction",
    2: "Repair",
    3: "Installation",
  };

  const statusConfig = {
    UnderReview: { color: "#3b82f6", bg: "#dbeafe", label: "Under Review" },
    Approved: { color: "#f59e0b", bg: "#fef3c7", label: "Approved" },
    Rejected: { color: "#ef4444", bg: "#fee2e2", label: "Rejected" },
    Completed: { color: "#10b981", bg: "#d1fae5", label: "Completed" },
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = Cookies.get("token");
      if (!token) {
        setError("No token found");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.userId;

      setFormData((prev) => ({ ...prev, userId }));

      // Fetch in parallel
      const [serviceRes, assetRes] = await Promise.all([
        axiosInstance.get("/ServiceRequests"),
        axiosInstance.get(`/AssetAllocations/user/${userId}`),
      ]);

      // Handle service requests
      const serviceData = serviceRes?.data?.data || serviceRes?.data || [];
      const myServiceRequests = serviceData.filter(r => r.userId === userId);
      setServiceRequests(myServiceRequests);

      // Handle asset allocations
      const assetData = assetRes?.data?.data || assetRes?.data || [];
      setAssetAllocations(assetData);

    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAssetChange = (e) => {
    const name = e.target.value;
    const asset = assetAllocations.find((a) => a.assetName === name);
    setFormData({
      ...formData,
      assetName: name,
      assetId: asset ? asset.assetId : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.assetId || !formData.issueType || !formData.serviceDescription) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/ServiceRequests", formData);
      setShowForm(false);
      setSuccessMessage("Service request submitted successfully!");
      
      setTimeout(() => {
        setSuccessMessage("");
        fetchData(); // Refresh data
      }, 2000);
      
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit service request");
    } finally {
      setLoading(false);
    }
  };

  // Get status style
  const getStatusStyle = (status) => {
    return statusConfig[status] || statusConfig.UnderReview;
  };

  // Get issue type label
  const getIssueLabel = (type) => {
    return issueTypeMapping[type] || "Unknown";
  };

  // Paginated data
  const currentRequests = serviceRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <EmployeeHeader />
      <Toolbar sx={{ height: 80 }} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        {/* Header Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e2a55', mb: 1 }}>
            Service Requests
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Manage your asset maintenance and repair requests
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fee2e2', borderRadius: 2, borderLeft: '4px solid #ef4444' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {/* Success Message */}
        {successMessage && (
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#d1fae5', borderRadius: 2, borderLeft: '4px solid #10b981' }}>
            <Typography sx={{ color: '#065f46', fontWeight: 600 }}>{successMessage}</Typography>
          </Paper>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(statusConfig).map(([status, config], index) => {
            const count = serviceRequests.filter(r => r.serviceReqStatus === status).length;
            return (
              <Grid item xs={6} md={3} key={status}>
                <Paper 
                  elevation={0} 
                  sx={{
                    p: 3, 
                    borderRadius: 3, 
                    bgcolor: config.bg,
                    border: `1px solid ${config.color}30`,
                    transition: 'all 0.3s', 
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 }
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 800, color: config.color }}>{count}</Typography>
                  <Typography variant="body2" sx={{ color: config.color, fontWeight: 500 }}>{config.label}</Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Table */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ p: 3, bgcolor: '#1e2a55', borderRadius: '12px 12px 0 0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>Request History</Typography>
          </Box>

          {loading && !showForm ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
              <CircularProgress sx={{ color: '#1e2a55' }} />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#1e2a55' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Asset</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Issue</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="text.secondary">No service requests found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentRequests.map((r, i) => {
                        const statusStyle = getStatusStyle(r.serviceReqStatus);
                        return (
                          <TableRow key={i} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{r.serviceId}</TableCell>
                            <TableCell>
                              <Chip 
                                label={r.assetName || "N/A"} 
                                size="small" 
                                sx={{ bgcolor: '#e0e7ff', color: '#1e2a55' }} 
                              />
                            </TableCell>
                            <TableCell>
                              {r.serviceRequestDate ? new Date(r.serviceRequestDate).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={getIssueLabel(r.issueType)} 
                                size="small" 
                                sx={{ bgcolor: '#fef3c7', color: '#92400e' }} 
                              />
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200 }}>
                              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.serviceDescription || "No description"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={statusStyle.label}
                                size="small"
                                sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }} 
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {serviceRequests.length > rowsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Button 
                    onClick={(e) => handleChangePage(e, page - 1)}
                    disabled={page === 0}
                    sx={{ mr: 1 }}
                  >
                    Previous
                  </Button>
                  <Typography sx={{ alignSelf: 'center', mx: 2 }}>
                    Page {page + 1} of {Math.ceil(serviceRequests.length / rowsPerPage)}
                  </Typography>
                  <Button 
                    onClick={(e) => handleChangePage(e, page + 1)}
                    disabled={page >= Math.ceil(serviceRequests.length / rowsPerPage) - 1}
                    sx={{ ml: 1 }}
                  >
                    Next
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>

        {/* Guidelines & Action Button */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e2a55', mb: 2 }}>Service Guidelines</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: "Issue Types", value: "Malfunction, Repair, Install", color: "#ef4444" },
                  { label: "Response Time", value: "~ 2 Weeks", color: "#f59e0b" },
                  { label: "Priority", value: "High for Malfunctions", color: "#8b5cf6" },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 2, bgcolor: '#f8fafc', borderLeft: `3px solid ${item.color}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: item.color }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <BuildIcon sx={{ fontSize: 60, color: '#1e2a55', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e2a55', mb: 2 }}>Need Maintenance?</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => setShowForm(true)} 
                sx={{ 
                  bgcolor: '#1e2a55', 
                  color: 'white', 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 2, 
                  fontWeight: 600, 
                  '&:hover': { bgcolor: '#2d3a6a', transform: 'translateY(-2px)', boxShadow: 3} 
                }} 
              >
                Raise Service Request
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Form Dialog */}
      <Dialog 
        open={showForm} 
        onClose={() => setShowForm(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1e2a55', color: 'white', borderRadius: '12px 12px 0 0', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>New Service Request</Typography>
          <IconButton onClick={() => setShowForm(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Asset</InputLabel>
              <Select 
                value={formData.assetName} 
                onChange={handleAssetChange} 
                label="Select Asset"
              >
                {assetAllocations.length === 0 ? (
                  <MenuItem disabled>No assets available</MenuItem>
                ) : (
                  assetAllocations.map((a) => (
                    <MenuItem key={a.assetId} value={a.assetName}>
                      {a.assetName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Select Issue Type</InputLabel>
              <Select 
                value={formData.issueType} 
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })} 
                label="Select Issue Type"
              >
                {Object.entries(issueTypeMapping).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField 
              fullWidth 
              multiline 
              rows={4} 
              label="Describe the Issue" 
              value={formData.serviceDescription} 
              onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })} 
              required
            />

            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ 
                bgcolor: '#1e2a55', 
                color: 'white', 
                py: 1.5, 
                fontWeight: 600, 
                '&:hover': { bgcolor: '#2d3a6a' },
                '&:disabled': { bgcolor: '#9ca3af' }
              }} 
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default ServiceRequest;