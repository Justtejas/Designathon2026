import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuditPage from './AuditPage';
import AddAudit from './AddAudit';
// import UpdateAsset from './UpdateAsset';
import AuditInfo from './AuditInfo';

const AssetLink = () => {
    return (
        <Routes>
           <Route path="/" element={<AuditPage />} />
             <Route path="add" element={<AddAudit />} />
               {/* <Route path="update/:id" element={<UpdateAsset />} />*/}
              <Route path=":id" element={<AuditInfo />} /> 
        </Routes>
    );
};

export default AssetLink;