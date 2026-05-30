import React, { useState, useEffect, useRef } from "react";
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
  Slider,
  CircularProgress,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardMedia,
  CardContent,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const Assets = () => {
  const [assetsData, setAssetsData] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);

  const [page, setPage] = useState(0);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    assetReqId: 0,
    assetId: "",
    userId: "",
    assetName: "",
    assetReqDate: new Date().toISOString().split("T")[0],
    assetReqReason: "",
    assetType: "",
    requestStatus: "Pending",
    categoryId: "",
  });

  const statusConfig = {
    OpenToRequest: { color: "#10b981", bg: "#d1fae5", label: "Available" },
    Allocated: { color: "#ef4444", bg: "#fee2e2", label: "Allocated" },
    UnderMaintenance: { color: "#f59e0b", bg: "#fef3c7", label: "Maintenance" },
  };

  useEffect(() => {
    fetchAssets();
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
    return "Images/AssetDefault.jpg";
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/Assets/assetall");
      const data = response?.data || [];

      const assetsWithImages = await Promise.all(
        data.map(async (asset) => ({
          ...asset,
          imageUrl: await fetchAssetImage(asset.assetId),
        }))
      );

      setAssetsData(assetsWithImages);
      setFilteredAssets(assetsWithImages);

      if (data.length > 0) {
        const values = data.map((asset) => asset.Value || 0);
        setPriceRange([Math.min(...values), Math.max(...values)]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const locations = [...new Set(assetsData.map((a) => a.Location))];
  const categories = [...new Set(assetsData.map((a) => a.categoryName))];
  const statuses = [...new Set(assetsData.map((a) => a.assetStatus))];

  useEffect(() => {
    let filtered = assetsData;

    if (searchTerm) {
      filtered = filtered.filter((asset) =>
        asset.assetName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedLocation) {
      filtered = filtered.filter((asset) => asset.Location === selectedLocation);
    }
    if (selectedCategory) {
      filtered = filtered.filter((asset) => asset.categoryName === selectedCategory);
    }
    if (selectedStatus) {
      filtered = filtered.filter((asset) => asset.assetStatus === selectedStatus);
    }
    filtered = filtered.filter(
      (asset) => asset.Value >= priceRange[0] && asset.Value <= priceRange[1]
    );

    setFilteredAssets(filtered);
  }, [searchTerm, selectedLocation, selectedCategory, selectedStatus, priceRange, assetsData]);

  const openPrompt = (asset) => {
    if (asset.assetStatus === "Allocated") {
      setError(`Asset "${asset.assetName}" is already allocated.`);
      return;
    }
    if (asset.assetStatus === "UnderMaintenance") {
      setError(`Asset "${asset.assetName}" is under maintenance.`);
      return;
    }
    setSelectedAsset(asset);
    setShowPrompt(true);
    setError("");
  };

  useEffect(() => {
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const confirmPrompt = () => {
    if (selectedAsset) {
      setFormData({
        ...formData,
        assetId: selectedAsset.assetId,
        assetName: selectedAsset.assetName,
        assetType: selectedAsset.categoryName,
        categoryId: selectedAsset.categoryId,
      });
      setShowPrompt(false);
      setShowForm(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/AssetRequests", formData);
      setShowForm(false);
      setSuccessMessage("Asset request submitted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit the asset request.");
    }
  };

  const getStatusStyle = (status) => {
    return statusConfig[status] || statusConfig.OpenToRequest;
  };

  const currentAssets = filteredAssets.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

  const totalAssets = assetsData.length;
  const availableAssets = assetsData.filter((a) => a.assetStatus === "OpenToRequest").length;
  const allocatedAssets = assetsData.filter((a) => a.assetStatus === "Allocated").length;
  const underMaintenance = assetsData.filter((a) => a.assetStatus === "UnderMaintenance").length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <EmployeeHeader />
      <Toolbar sx={{ height: 80 }} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e2a55', mb: 1 }}>
            Asset Requests
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Browse and request available assets
          </Typography>
        </Box>

        {error && (
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fee2e2', borderRadius: 2, borderLeft: '4px solid #ef4444' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {successMessage && (
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#d1fae5', borderRadius: 2, borderLeft: '4px solid #10b981' }}>
            <Typography sx={{ color: '#065f46', fontWeight: 600 }}>{successMessage}</Typography>
          </Paper>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#1e2a55', color: 'white' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{totalAssets}</Typography>
              <Typography variant="body2">Total Assets</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#d1fae5' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>{availableAssets}</Typography>
              <Typography variant="body2" sx={{ color: '#10b981' }}>Available</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#fee2e2' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef4444' }}>{allocatedAssets}</Typography>
              <Typography variant="body2" sx={{ color: '#ef4444' }}>Allocated</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#fef3c7' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>{underMaintenance}</Typography>
              <Typography variant="body2" sx={{ color: '#f59e0b' }}>Under Maintenance</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ color: '#6b7280', mr: 1 }} /> }} />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Location</InputLabel>
                <Select value={selectedLocation} label="Location" onChange={(e) => setSelectedLocation(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {locations.map((loc) => (<MenuItem key={loc} value={loc}>{loc}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {categories.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={selectedStatus} label="Status" onChange={(e) => setSelectedStatus(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {statuses.map((status) => (<MenuItem key={status} value={status}>{status}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <Box sx={{ px: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Price Range</Typography>
                <Slider value={priceRange} onChange={(e, newValue) => setPriceRange(newValue)} valueLabelDisplay="auto" min={priceRange[0]} max={priceRange[1]} sx={{ color: '#1e2a55' }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
            <CircularProgress sx={{ color: '#1e2a55' }} />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {currentAssets.length === 0 ? (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                  <Typography color="text.secondary">No assets found</Typography>
                </Paper>
              </Grid>
            ) : (
              currentAssets.map((asset) => {
                const statusStyle = getStatusStyle(asset.assetStatus);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={asset.assetId}>
                    <Card elevation={0} sx={{ borderRadius: 3, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 } }}>
                      <CardMedia component="img" height="180" image={asset.imageUrl || "Images/AssetDefault.jpg"} alt={asset.assetName} sx={{ objectFit: 'cover' }} />
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e2a55' }}>{asset.assetName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{asset.assetDescription?.substring(0, 50)}...</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                          <Chip label={asset.categoryName} size="small" sx={{ bgcolor: '#e0e7ff', color: '#1e2a55' }} />
                          <Chip label={asset.Location} size="small" sx={{ bgcolor: '#f3f4f6', color: '#374151' }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e2a55', mb: 1 }}>₹{asset.Value}</Typography>
                        <Chip label={statusStyle.label} size="small" sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }} />
                        <Button fullWidth variant="contained" onClick={() => openPrompt(asset)} sx={{ mt: 2, bgcolor: '#1e2a55', '&:hover': { bgcolor: '#2d3a6a' } }}>
                          Request Asset
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        )}

        {filteredAssets.length > itemsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Button onClick={() => setPage(page - 1)} disabled={page === 0} sx={{ mr: 1 }}>Previous</Button>
            <Typography sx={{ alignSelf: 'center', mx: 2 }}>Page {page + 1} of {Math.ceil(filteredAssets.length / itemsPerPage)}</Typography>
            <Button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(filteredAssets.length / itemsPerPage) - 1} sx={{ ml: 1 }}>Next</Button>
          </Box>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={showPrompt} onClose={() => setShowPrompt(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: '#1e2a55', color: 'white', borderRadius: '12px 12px 0 0', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Confirm Request</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to request the asset <strong>{selectedAsset?.assetName}</strong>?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setShowPrompt(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
            <Button variant="contained" onClick={confirmPrompt} sx={{ bgcolor: '#1e2a55' }}>Confirm</Button>
          </Box>
        </DialogContent>
      </Dialog>

            {/* Form Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1e2a55', color: 'white', borderRadius: '12px 12px 0 0', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Asset Request Form</Typography>
          <IconButton onClick={() => setShowForm(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField fullWidth label="Asset ID" value={formData.assetId} disabled />
            <TextField fullWidth label="User ID" value={formData.userId} disabled />
            <TextField fullWidth label="Asset Name" value={formData.assetName} disabled />
            <TextField fullWidth label="Request Date" value={formData.assetReqDate} disabled />
            <TextField fullWidth label="Asset Type" value={formData.assetType} disabled />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Request Reason"
              value={formData.assetReqReason}
              onChange={(e) => setFormData({ ...formData, assetReqReason: e.target.value })}
              required
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#1e2a55', color: 'white', py: 1.5, fontWeight: 600, '&:hover': { bgcolor: '#2d3a6a' } }}
            >
              Submit Request
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default Assets;