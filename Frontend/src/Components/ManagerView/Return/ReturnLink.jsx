import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ReturnPage from './ReturnPage';
import ReturnInfo from './ReturnInfo';
import UpdateReturn from './UpdateReturn';

const ReturnLink = () => {
    return (
        <Routes>
            <Route path="/" element={<ReturnPage />} />
            <Route path=":id" element={<ReturnInfo />} />
            <Route path="update/:id" element={<UpdateReturn />} />
        </Routes>
    );
};

export default ReturnLink;