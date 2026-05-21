import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AllocationPage from './AllocationPage';
import AllocationInfo from './AllocationInfo';

const AllocationLink = () => {
    return (
        <Routes>
            <Route path="/" element={<AllocationPage />} />
            <Route path=":id" element={<AllocationInfo />} />
        </Routes>
    );
};

export default AllocationLink;