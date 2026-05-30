import React, { useState, useEffect } from "react";
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
  Replay as ReturnIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";

const ReturnRequest = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [assetAllocations, setAssetAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    assetId: "",
    userId: "",
    assetName: "",
    returnDate: new Date().toISOString().split("T")[0],
    Condition: "",
    Reason: "",
    returnStatus: "",
  });

  const conditionMapping = {
    0: "Working",
    1: "Damaged",
    2: "Broken",
  };

  const statusConfig = {
    Sent: { color: "#3b82f6", bg: "#dbeafe", label: "Sent" },
    Approved: { color: "#f59e0b", bg: "#fef3c7", label: "Approved" },
    Returned: { color: "#10b981", bg: "#d1fae5", label: "Returned" },
    Rejected: { color: "#ef4444", bg: "#fee2e2", label: "Rejected" },
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

      const [returnRes, assetRes] = await Promise.all([
        axiosInstance.get("/ReturnRequests"),
        axiosInstance.get(`/AssetAllocations/user/${userId}`),
      ]);

      const returnData = returnRes?.data?.data || returnRes?.data || [];
      const myReturns = returnData.filter(r => r.userId === userId);
      setReturnRequests(myReturns);

      const assetData = assetRes?.data?.data || assetRes?.data || [];
      setAssetAllocations(assetData);

    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAssetChange = (e) => {
    const name = e.target.value;
    const asset = assetAllocations.find((a) => a.assetName === name);
    setFormData({
      ...formData,
      assetName: name,
      assetId: asset ? asset.assetId : "",
      categoryId: asset ? asset.categoryId : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.assetId || !formData.Condition || !formData.Reason) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/ReturnRequests", formData);
      setShowForm(false);
      setSuccessMessage("Return request submitted successfully!");

      setTimeout(() => {
        setSuccessMessage("");
        fetchData();
      }, 2000);

    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit return request");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    return statusConfig[status] || statusConfig.Sent;
  };

  const getConditionLabel = (condition) => {
    return conditionMapping[condition] || "Unknown";
  };

  const currentRequests = returnRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const guidelinesData = [
    { label: "Condition", value: "Original/Acceptable", color: "#ef4444" },
    { label: "Response Time", value: "~ 1 Week", color: "#f59e0b" },
    { label: "Damages", value: "Charges May Apply", color: "#8b5cf6" },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <EmployeeHeader />
      <Toolbar sx={{ height: 80 }} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e2a55', mb: 1 }}>
            Return Requests
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Submit and track your asset return requests
          </Typography>
        </Box>

        {/* Error Message */}
        <Box sx={{ mb: 3 }}>
          {error && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fee2e2', borderRadius: 2, borderLeft: '4px solid #ef4444' }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          )}
        </Box>

        {/* Success Message */}
        <Box sx={{ mb: 3 }}>
          {successMessage && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#d1fae5', borderRadius: 2, borderLeft: '4px solid #10b981' }}>
              <Typography sx={{ color: '#065f46', fontWeight: 600 }}>{successMessage}</Typography>
            </Paper>
          )}
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = returnRequests.filter(r => r.returnStatus === status).length;
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>Return Request History</Typography>
          </Box>

          {loading && !showForm ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
              <CircularProgress sx={{ color: '#1e2a55' }} />
            </Box>
          ) : (
            <Box>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#1e2a55' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Return ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Asset</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Condition</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Reason</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="text.secondary">No return requests found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentRequests.map((r, i) => {
                        const statusStyle = getStatusStyle(r.returnStatus);
                        return (
                          <TableRow key={i} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{r.returnId}</TableCell>
                            <TableCell>
                              <Chip label={r.assetName || "N/A"} size="small" sx={{ bgcolor: '#e0e7ff', color: '#1e2a55' }} />
                            </TableCell>
                            <TableCell>
                              {r.returnDate ? new Date(r.returnDate).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Chip label={getConditionLabel(r.Condition)} size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e' }} />
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200 }}>
                              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.Reason || "No reason"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={statusStyle.label} size="small" sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {returnRequests.length > rowsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Button onClick={() => setPage(page - 1)} disabled={page === 0} sx={{ mr: 1 }}>
                    Previous
                  </Button>
                  <Typography sx={{ alignSelf: 'center', mx: 2 }}>
                    Page {page + 1} of {Math.ceil(returnRequests.length / rowsPerPage)}
                  </Typography>
                  <Button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(returnRequests.length / rowsPerPage) - 1} sx={{ ml: 1 }}>
                    Next
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        {/* Guidelines & Action Button */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e2a55', mb: 2 }}>Terms and Conditions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {guidelinesData.map((item, i) => (
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
              <ReturnIcon sx={{ fontSize: 60, color: '#1e2a55', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e2a55', mb: 2 }}>Need to Return an Asset?</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)} sx={{ bgcolor: '#1e2a55', color: 'white', px: 4, py: 1.5, borderRadius: 2, fontWeight: 600 }}>
                Raise Return Request
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Form Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1e2a55', color: 'white', borderRadius: '12px 12px 0 0', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>↩️ New Return Request</Typography>
          <IconButton onClick={() => setShowForm(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>User ID</InputLabel>
              <Select value={formData.userId} label="User ID" disabled>
                <MenuItem value={formData.userId}>{formData.userId}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Select Asset</InputLabel>
              <Select value={formData.assetName} onChange={handleAssetChange} label="Select Asset">
                {assetAllocations.length === 0 ? (
                  <MenuItem disabled>No assets available</MenuItem>
                ) : (
                  assetAllocations.map((a) => (
                    <MenuItem key={a.assetId} value={a.assetName}>{a.assetName}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Asset Condition</InputLabel>
              <Select value={formData.Condition} onChange={(e) => setFormData({ ...formData, Condition: e.target.value })} label="Asset Condition">
                {Object.entries(conditionMapping).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField fullWidth label="Return Date" value={formData.returnDate} disabled />

            <TextField fullWidth multiline rows={4} label="Return Reason" value={formData.Reason} onChange={(e) => setFormData({ ...formData, Reason: e.target.value })} required />

            <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#1e2a55', color: 'white', py: 1.5, fontWeight: 600 }}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default ReturnRequest;