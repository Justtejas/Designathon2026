import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MaventoryLandingPage from './Components/LandingPage/HomePage';
import SignInPage from './Components/SignInPage/Signin';
import Privacy from './Components/PrivacyTerms/Privacy';
import Terms from './Components/PrivacyTerms/Terms';
import AdminDashboard from './Components/AdminView/DashBoard/DashBoard';
import EmpDashboard from './Components/ExecutiveView/EmpDashboard/EmpDashboard';
import ServiceRequest from './Components/ExecutiveView/ServicePage/ServiceRequest';
import ReturnRequest from './Components/ExecutiveView/ReturnRequest/ReturnRequest';
import EAssetPage from './Components/ExecutiveView/EAssetPage/EAssetPage';
import Notification from './Components/ExecutiveView/Notification/Notification';
import Profile from './Components/ExecutiveView/Profile/Profile';
import Settings from './Components/ExecutiveView/SettingsPage/SettingsPage';
import { ThemeProvider } from './Components/ThemeContext';
import AdminEmp from './Components/AdminView/EmployeePage/EmpLink';
import AdminAsset  from './Components/AdminView/AssetPage/AssetLink';
import AdminRequest from './Components/AdminView/AssetRequest/RequestLink';
import AdminAllocation from './Components/AdminView/Allocation/AllocationLink';
import AdminReturn from './Components/AdminView/Return/ReturnLink';
import AdminAudit from './Components/AdminView/Audit/AuditLink';
import AdminService from './Components/AdminView/ServicePage/ServiceLink';
import AdminMaintenance from './Components/AdminView/Maintenance/MaintenanceLink';
import AdminHeader from './Components/AdminView/AdminHeader';
import AdminNavbar from './Components/AdminView/AdminNavBar';
import ManagerDashboard from './Components/ManagerView/DashBoard/DashBoard';
import ManagerAsset  from './Components/ManagerView/AssetPage/AssetLink';
import ManagerRequest from './Components/ManagerView/AssetRequest/RequestLink';
import ManagerAllocation from './Components/ManagerView/Allocation/AllocationLink';
import ManagerReturn from './Components/ManagerView/Return/ReturnLink';
import ManagerHeader from './Components/ManagerView/ManagerHeader';
import ManagerNavbar from './Components/ManagerView/ManagerNavBar';

import { Box } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EmployeeRoute, AdminRoute,ManagerRoute } from './Components/PrivateRoute';

const AdminLayout = ({ mobileOpen, handleDrawerToggle }) => (
  <>
    <AdminHeader handleDrawerToggle={handleDrawerToggle} />
    <AdminNavbar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Outlet />
    </Box>
  </>
);
const ManagerLayout = ({ mobileOpen, handleDrawerToggle }) => (
  <>
    <ManagerHeader handleDrawerToggle={handleDrawerToggle} />
    <ManagerNavbar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
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
            <Route path="/" element={<MaventoryLandingPage />} />
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

            <Route path="manager" element={<ManagerLayout mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />}>
              <Route path="Dashboard" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />
              <Route path="asset/*" element={<ManagerRoute><ManagerAsset /></ManagerRoute>} />
              <Route path="request/*" element={<ManagerRoute><ManagerRequest /></ManagerRoute>} />
              <Route path="allocation/*" element={<ManagerRoute><ManagerAllocation /></ManagerRoute>} />
              <Route path="return/*" element={<ManagerRoute><ManagerReturn /></ManagerRoute>} />
            </Route>

            <Route path="admin" element={<AdminLayout mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />}>
              <Route path="Dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="users/*" element={<AdminRoute><AdminEmp /></AdminRoute>} />
              <Route path="asset/*" element={<AdminRoute><AdminAsset /></AdminRoute>} />
              <Route path="request/*" element={<AdminRoute><AdminRequest /></AdminRoute>} />
              <Route path="allocation/*" element={<AdminRoute><AdminAllocation /></AdminRoute>} />
              <Route path="return/*" element={<AdminRoute><AdminReturn /></AdminRoute>} />
              <Route path="audit/*" element={<AdminRoute><AdminAudit /></AdminRoute>} />
              <Route path="service/*" element={<AdminRoute><AdminService /></AdminRoute>} />
              <Route path="maintenance/*" element={<AdminRoute><AdminMaintenance /></AdminRoute>} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
