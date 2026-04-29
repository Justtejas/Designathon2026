import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MaintenancePage from './MaintenancePage';
import UpdateMaintenance from './UpdateMaintenance';
import MaintenanceInfo from './MaintenanceInfo';

const AssetLink = () => {
    return (
        <Routes>
           <Route path="/" element={<MaintenancePage />} />
            <Route path="update/:id" element={<UpdateMaintenance />} />
                <Route path=":id" element={<MaintenanceInfo />} /> 
        </Routes>
    );
};

export default AssetLink;