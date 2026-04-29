import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AssetPage from './AssetPage';
import AddAsset from './AddAsset';
import UpdateAsset from './UpdateAsset';
import AssetInfo from './AssetInfo';

const AssetLink = () => {
    return (
        <Routes>
           <Route path="/" element={<AssetPage />} />
              <Route path="add" element={<AddAsset />} />
              <Route path="update/:id" element={<UpdateAsset />} />
              <Route path=":id" element={<AssetInfo />} />
        </Routes>
    );
};

export default AssetLink;