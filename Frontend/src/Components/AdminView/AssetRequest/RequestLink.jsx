import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RequestPage from './RequestPage';
import RequestInfo from './RequestInfo';
import UpdateRequest from './UpdateRequest';

const RequestLink = () => {
    return (
        <Routes>
            <Route path="/" element={<RequestPage />} />
            <Route path=":id" element={<RequestInfo />} />
            <Route path="update/:id" element={<UpdateRequest />} />
        </Routes>
    );
};

export default RequestLink;