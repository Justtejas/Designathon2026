import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ServicePage from './Service';
import UpdateService from './UpdateService';
import ServiceInfo from './ServiceInfo';

const AssetLink = () => {
    return (
        <Routes>
           <Route path="/" element={<ServicePage />} />
               <Route path="update/:id" element={<UpdateService />} />
              <Route path=":id" element={<ServiceInfo />} /> 
        </Routes>
    );
};

export default AssetLink;