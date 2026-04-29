import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Employee from './Employee';
import UpdateUser from './UpdateUser';
import AddEmployee from './AddEmployee';
import UserDetails from './EmployeeInfo';

const EmpLink = () => {
    return (
        <Routes>
            <Route path="/" element={<Employee />} />
            <Route path="update/:id" element={<UpdateUser />} />
            <Route path="add" element={<AddEmployee />} />
            <Route path=":id" element={<UserDetails />} />
        </Routes>
    );
};

export default EmpLink;