import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuth } from './Utils/isAuth';
import Cookies from 'js-cookie';

const EmployeeRoute = ({ children }) => {
    const { isAuthenticated, role } = isAuth();
    useEffect(() => {
        if (!isAuthenticated || role !== 'Employee') {
            Cookies.remove('token');
            Cookies.remove('role');
        }
    }, [isAuthenticated, role]);
    return isAuthenticated && role === 'Employee' ? children : <Navigate to="/signin" />;
};

const AdminRoute = ({ children }) => {
    const { isAuthenticated, role } = isAuth();
    useEffect(() => {
        if (!isAuthenticated || role !== 'Admin') {
            Cookies.remove('token');
            Cookies.remove('role');
        }
    }, [isAuthenticated, role]);
    return isAuthenticated && role === 'Admin' ? children : <Navigate to="/signin" />;
}
export { EmployeeRoute, AdminRoute };