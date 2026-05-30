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
  CircularProgress,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AuditIcon,
  Inventory as AssetIcon,
  Build as ServiceIcon,
  Replay as ReturnIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from "@mui/icons-material";

const Notifications = () => {
  const [notificationStatus, setNotificationStatus] = useState("inactive");
  const [showSuccessPrompt, setShowSuccessPrompt] = useState(false);
  const [showTrackDetails, setShowTrackDetails] = useState(false);
  const [assetAllocations, setAssetAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetImages, setAssetImages] = useState({});
  const [assetRequest, setAssetRequest] = useState([]);
  const [serviceRequest, setServiceRequest] = useState([]);
  const [returnRequest, setReturnRequest] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("asset");
  const [auditRequests, setAuditRequests] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [selectedauditId, setSelectedauditId] = useState(null);
  const [auditMessage, setAuditMessage] = useState("");
  const [auditStatus, setAuditStatus] = useState("");
  const [assetName, setAssetName] = useState("");
  const [nextauditDate, setNextauditDate] = useState(new Date());
  const [showAuditUpdateSuccess, setShowAuditUpdateSuccess] = useState(false);
  const [expandedAssetId, setExpandedAssetId] = useState(null);

  const defaultImage = "Images/AssetDefault.jpg";

  const statusConfig = {
    0: { color: "#f59e0b", bg: "#fef3c7", label: "Pending" },
    1: { color: "#10b981", bg: "#d1fae5", label: "Approved" },
    2: { color: "#ef4444", bg: "#fee2e2", label: "Rejected" },
    UnderReview: { color: "#3b82f6", bg: "#dbeafe", label: "Under Review" },
    Approved: { color: "#f59e0b", bg: "#fef3c7", label: "Approved" },
    Completed: { color: "#10b981", bg: "#d1fae5", label: "Completed" },
    Rejected: { color: "#ef4444", bg: "#fee2e2", label: "Rejected" },
    Sent: { color: "#3b82f6", bg: "#dbeafe", label: "Sent" },
    Allocated: { color: "#10b981", bg: "#d1fae5", label: "Allocated" },
    Returned: { color: "#8b5cf6", bg: "#ede9fe", label: "Returned" },
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAssetImage = async (assetId) => {
    try {
      const response = await fetch(`http://localhost:7287/api/Assets/get-image/${assetId}`);
      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
    return defaultImage;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      setUserId(userId);
      setUserName(decoded.unique_name);

      const [allocationRes, auditRes, assetReqRes, serviceReqRes, returnReqRes] = await Promise.all([
        axiosInstance.get(`/AssetAllocations/user/${userId}`),
        axiosInstance.get(`/Audits?userId=${userId}`),
        axiosInstance.get("/AssetRequests"),
        axiosInstance.get("/ServiceRequests"),
        axiosInstance.get("/ReturnRequests"),
      ]);

      const allocations = allocationRes?.data || [];
      const today = new Date();
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(today.getDate() - 5);

      const filteredAllocations = allocations.filter((a) => {
        const allocationDate = new Date(a.allocatedDate);
        return allocationDate >= fiveDaysAgo && allocationDate <= today;
      });

      setAssetAllocations(filteredAllocations);

      const images = {};
      for (const allocation of filteredAllocations) {
        images[allocation.assetId] = await fetchAssetImage(allocation.assetId);
      }
      setAssetImages(images);

      const audits = auditRes?.data || [];
      const filteredAudits = audits.filter((a) => {
        const auditDate = new Date(a.auditDate);
        return a.auditStatus === "Sent" && auditDate >= fiveDaysAgo && auditDate <= today;
      });

      if (filteredAudits.length > 0) {
        setAuditRequests(filteredAudits);
        setNotificationStatus("active");
      }

      setAssetRequest(assetReqRes?.data || []);
      setServiceRequest(serviceReqRes?.data || []);
      setReturnRequest(returnReqRes?.data || []);

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssetDetails = (assetId) => {
    setExpandedAssetId(expandedAssetId === assetId ? null : assetId);
  };

  const acceptAuditRequest = async (auditId, assetId) => {
    setSelectedauditId(auditId);
    setSelectedAssetId(assetId);
    setNotificationStatus("completed");
    setShowSuccessPrompt(true);
    setAuditMessage("");
    setAuditStatus("");

    try {
      const assetResponse = await axiosInstance.get(`/Assets/${assetId}`);
      if (assetResponse.status === 200) {
        setAssetName(assetResponse.data.assetName);
      }
    } catch (error) {
      console.error("Error fetching asset details:", error);
    }
  };

  const updateAudit = async () => {
    try {
      const auditUpdateData = {
        auditId: selectedauditId,
        assetId: selectedAssetId,
        userId: userId,
        auditDate: new Date().toISOString(),
        auditMessage: auditMessage,
        auditStatus: auditStatus,
        assetName: assetName,
        userName: userName,
      };

      await axiosInstance.put(`/Audits/${selectedauditId}`, auditUpdateData);
      setShowSuccessPrompt(false);
      setNotificationStatus("inactive");
      setShowAuditUpdateSuccess(true);

      setTimeout(() => {
        setShowAuditUpdateSuccess(false);
      }, 3000);

      fetchData();
    } catch (error) {
      console.error("Error updating audit:", error);
    }
  };

  const getStatusStyle = (status) => {
    return statusConfig[status] || statusConfig[0];
  };

  const totalAllocations = assetAllocations.length;
  const pendingRequests = assetRequest.filter((r) => r.requestStatus === 0).length;
  const activeAudits = auditRequests.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <EmployeeHeader />
      <Toolbar sx={{ height: 80 }} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e2a55', mb: 1 }}>
            🔔 Notifications
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            View your allocations, audits, and request status
          </Typography>
        </Box>

        {showAuditUpdateSuccess && (
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#d1fae5', borderRadius: 2, borderLeft: '4px solid #10b981' }}>
            <Typography sx={{ color: '#065f46', fontWeight: 600 }}>✅ Audit status updated successfully!</Typography>
          </Paper>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#1e2a55', color: 'white' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{totalAllocations}</Typography>
              <Typography variant="body2">New Allocations</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#fef3c7' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>{pendingRequests}</Typography>
              <Typography variant="body2" sx={{ color: '#f59e0b' }}>Pending Requests</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#fee2e2' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef4444' }}>{activeAudits}</Typography>
              <Typography variant="body2" sx={{ color: '#ef4444' }}>Active Audits</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#dbeafe' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#3b82f6' }}>{assetRequest.length + serviceRequest.length + returnRequest.length}</Typography>
              <Typography variant="body2" sx={{ color: '#3b82f6' }}>Total Requests</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ p: 3, bgcolor: '#1e2a55', borderRadius: '12px 12px 0 0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>📦 Recent Asset Allocations</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
              <CircularProgress sx={{ color: '#1e2a55' }} />
            </Box>
          ) : assetAllocations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No recent asset allocations found.</Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {assetAllocations.map((allocation) => (
                <Card key={allocation.assetId} elevation={0} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e5e7eb', transition: 'all 0.3s', '&:hover': { boxShadow: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckIcon sx={{ color: '#10b981' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        <Box component="span" sx={{ color: '#ef4444', fontWeight: 700 }}>ADMIN</Box> has allocated an asset to you
                      </Typography>
                    </Box>
                    <Button onClick={() => toggleAssetDetails(allocation.assetId)} endIcon={expandedAssetId === allocation.assetId ? <CollapseIcon /> : <ExpandIcon />} sx={{ color: '#1e2a55' }}>
                      {expandedAssetId === allocation.assetId ? 'Hide Details' : 'View Details'}
                    </Button>
                  </Box>

                  {expandedAssetId === allocation.assetId && (
                    <CardContent sx={{ borderTop: '1px solid #e5e7eb', mt: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Typography variant="body1"><strong>Asset Name:</strong> {allocation.assetName}</Typography>
                          <Typography variant="body1"><strong>Model:</strong> {allocation.Model}</Typography>
                          <Typography variant="body1"><strong>Allocation Date:</strong> {new Date(allocation.allocatedDate).toLocaleDateString()}</Typography>
                          <Typography variant="body1"><strong>Category:</strong> {allocation.categoryName}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box component="img" src={assetImages[allocation.assetId] || defaultImage} alt={allocation.assetName} sx={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 2 }} />
                        </Grid>
                      </Grid>
                    </CardContent>
                  )}
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ p: 3, bgcolor: '#1e2a55', borderRadius: '12px 12px 0 0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>📋 Audit Requests</Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            {notificationStatus === "active" ? (
              auditRequests.map((request) => (
                <Card key={request.auditId} elevation={0} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e5e7eb', transition: 'all 0.3s', '&:hover': { boxShadow: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AuditIcon sx={{ color: '#6b7280' }} />
                      <Typography>
                        <Box component="span" sx={{ color: '#ef4444', fontWeight: 700 }}>ADMIN</Box> has sent you an audit request
                      </Typography>
                    </Box>
                    <Button onClick={() => acceptAuditRequest(request.auditId, request.assetId)} variant="contained" sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
                      Accept
                    </Button>
                  </Box>
                </Card>
              ))
            ) : notificationStatus === "completed" && showSuccessPrompt ? (
              <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Update Audit Status</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>Asset ID: <Box component="span" sx={{ fontWeight: 700, color: '#f59e0b' }}>{selectedAssetId}</Box></Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>Asset Name: <Box component="span" sx={{ fontWeight: 700, color: '#f59e0b' }}>{assetName}</Box></Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Update Status</InputLabel>
                    <Select value={auditStatus} onChange={(e) => setAuditStatus(e.target.value)} label="Update Status">
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="InProgress">In Progress</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField fullWidth multiline rows={4} label="Audit Message" value={auditMessage} onChange={(e) => setAuditMessage(e.target.value)} placeholder="Enter audit message..." sx={{ mb: 2 }} />

                  <Button onClick={updateAudit} variant="contained" sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
                    Update Audit
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography color="text.secondary">No recent audit request found</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Request Tracking */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ p: 3, bgcolor: '#1e2a55', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>📊 Request Tracking</Typography>
            <Button onClick={() => setShowTrackDetails(!showTrackDetails)} sx={{ color: 'white' }}>
              {showTrackDetails ? 'Hide' : 'Show'}
            </Button>
          </Box>

          {showTrackDetails && (
            <Box sx={{ p: 3 }}>
              <Tabs value={selectedRequest} onChange={(e, newValue) => setSelectedRequest(newValue)} sx={{ mb: 3 }}>
                <Tab value="asset" label="Asset Request" icon={<AssetIcon />} />
                <Tab value="service" label="Service Request" icon={<ServiceIcon />} />
                <Tab value="return" label="Return Request" icon={<ReturnIcon />} />
              </Tabs>

              {selectedRequest === "asset" && (
                <Box>
                  {assetRequest.length === 0 ? (
                    <Typography color="text.secondary">No asset requests found</Typography>
                  ) : (
                    assetRequest.map((req) => {
                      const statusStyle = getStatusStyle(req.requestStatus);
                      return (
                        <Card key={req.assetReqId} elevation={0} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body1"><strong>Request Date:</strong> {new Date(req.assetReqDate).toLocaleDateString()}</Typography>
                                <Typography variant="body1"><strong>Asset Name:</strong> {req.assetName || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Chip label={statusStyle.label} size="small" sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }} />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </Box>
              )}

              {selectedRequest === "service" && (
                <Box>
                  {serviceRequest.length === 0 ? (
                    <Typography color="text.secondary">No service requests found</Typography>
                  ) : (
                    serviceRequest.map((req) => {
                      const statusStyle = getStatusStyle(req.serviceReqStatus);
                      return (
                        <Card key={req.serviceId} elevation={0} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body1"><strong>Request Date:</strong> {new Date(req.serviceRequestDate).toLocaleDateString()}</Typography>
                                <Typography variant="body1"><strong>Description:</strong> {req.serviceDescription || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Chip label={statusStyle.label} size="small" sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }} />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </Box>
              )}

              {selectedRequest === "return" && (
                <Box>
                  {returnRequest.length === 0 ? (
                    <Typography color="text.secondary">No return requests found</Typography>
                  ) : (
                    returnRequest.map((req) => {
                      const statusStyle = getStatusStyle(req.returnStatus);
                      return (
                        <Card key={req.returnId} elevation={0} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body1"><strong>Request Date:</strong> {new Date(req.returnDate).toLocaleDateString()}</Typography>
                                <Typography variant="body1"><strong>Asset Name:</strong> {req.assetName || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Chip label={statusStyle.label} size="small" sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }} />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </Box>
              )}
            </Box>
          )}
        </Paper>

        {/* Reminder */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#1e2a55', display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarIcon sx={{ color: '#ef4444', fontSize: 32 }} />
          <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
            Reminder: Your next audit is scheduled for <Box component="span" sx={{ fontWeight: 700, color: '#ef4444' }}>{nextauditDate.toLocaleDateString()}</Box>
          </Typography>
        </Paper>
      </Box>

      <Footer />
    </Box>
  );
};

export default Notifications;