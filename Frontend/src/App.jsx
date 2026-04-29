import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HexaHubLandingPage from './Components/LandingPage/HomePage';
import SignInPage from './Components/SignInPage/Signin';
import Privacy from './Components/PrivacyTerms/Privacy';
import Terms from './Components/PrivacyTerms/Terms';
import Dashboard from './Components/AdminView/DashBoard/DashBoard';
import EmpDashboard from './Components/EmployeeView/EmpDashboard/EmpDashboard';
import ServiceRequest from './Components/EmployeeView/ServicePage/ServiceRequest';
import ReturnRequest from './Components/EmployeeView/ReturnRequest/ReturnRequest';
import EAssetPage from './Components/EmployeeView/EAssetPage/EAssetPage';
import Notification from './Components/EmployeeView/Notification/Notification';
import Profile from './Components/EmployeeView/Profile/Profile';
import Settings from './Components/EmployeeView/SettingsPage/SettingsPage';
import { ThemeProvider } from './Components/ThemeContext';
import EmpLink from './Components/AdminView/EmployeePage/EmpLink';
import AssetLink from './Components/AdminView/AssetPage/AssetLink';
import RequestLink from './Components/AdminView/AssetRequest/RequestLink';
import AllocationLink from './Components/AdminView/Allocation/AllocationLink';
import ReturnLink from './Components/AdminView/Return/ReturnLink';
import AuditLink from './Components/AdminView/Audit/AuditLink';
import ServiceLink from './Components/AdminView/ServicePage/ServiceLink';
import MaintenanceLink from './Components/AdminView/Maintenance/MaintenanceLink';
import Header from './Components/AdminView/AdminHeader';
import Navbar from './Components/AdminView/AdminNavBar';
import { Box } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EmployeeRoute, AdminRoute } from './Components/PrivateRoute';

const AdminLayout = ({ mobileOpen, handleDrawerToggle }) => (
  <>
    <Header handleDrawerToggle={handleDrawerToggle} />
    <Navbar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Outlet />
    </Box>
  </>
);

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider >
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <ToastContainer />

          <Routes>
            <Route path="/" element={<HexaHubLandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="Privacy" element={<Privacy />} />
            <Route path="Terms" element={<Terms />} />
            <Route path="dashboard" element={<EmployeeRoute><EmpDashboard /></EmployeeRoute>} />
            <Route path="ServiceRequest" element={<EmployeeRoute><ServiceRequest /></EmployeeRoute>} />
            <Route path="ReturnRequest" element={<EmployeeRoute><ReturnRequest /></EmployeeRoute>} />
            <Route path="Asset" element={<EmployeeRoute><EAssetPage /></EmployeeRoute>} />
            <Route path="Notification" element={<EmployeeRoute><Notification /></EmployeeRoute>} />
            <Route path="Profile" element={<EmployeeRoute><Profile /></EmployeeRoute>} />
            <Route path="Settings" element={<EmployeeRoute><Settings /></EmployeeRoute>} />

            <Route path="admin" element={<AdminLayout mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />}>
              <Route path="Dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="employee/*" element={<AdminRoute><EmpLink /></AdminRoute>} />
              <Route path="asset/*" element={<AdminRoute><AssetLink /></AdminRoute>} />
              <Route path="request/*" element={<AdminRoute><RequestLink /></AdminRoute>} />
              <Route path="allocation/*" element={<AdminRoute><AllocationLink /></AdminRoute>} />
              <Route path="return/*" element={<AdminRoute><ReturnLink /></AdminRoute>} />
              <Route path="audit/*" element={<AdminRoute><AuditLink /></AdminRoute>} />
              <Route path="service/*" element={<AdminRoute><ServiceLink /></AdminRoute>} />
              <Route path="maintenance/*" element={<AdminRoute><MaintenanceLink /></AdminRoute>} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
