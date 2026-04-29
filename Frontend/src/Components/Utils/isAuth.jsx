import Cookies from 'js-cookie';

export const isAuth = () => {
    const token = Cookies.get('token');
    const role = Cookies.get('role'); 
    console.log('Token in PrivateRoute:', token);
    console.log('Role in Token:', role);
    return { isAuthenticated: !!token, role };
};
