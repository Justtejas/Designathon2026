/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastNotification, { showToast } from '../Utils/ToastNotification';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import CloseIcon from '@mui/icons-material/Close';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = {
      UserMail: email,
      Password: password,
    };

    try {
      const response = await axios.post('https://localhost:7287/api/Auth', loginData);

      const { token } = response.data;
      Cookies.set('token', token);
      const decode = jwtDecode(token);
      const userRole = decode.role;
      Cookies.set('role' , userRole);
      console.log('Decoded Token:', decode); 
      console.log('Navigating to:', userRole === 'Admin' ? '/admin/Dashboard' : '/dashboard');
      setTimeout(() => {
        if (userRole === 'Admin') {
          navigate('/admin/Dashboard');
        } else if(userRole === 'Employee') {
          navigate('/dashboard');
        }
        else {
          alert('Unknown role.');
        }
      }, 2000);

      showToast('Login Successful!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      console.error('Error during login:', err);

      showToast('Failed to Log In. Please try again.', 'error');
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 h-400 bg-cover bg-center" style={{ backgroundImage: "url(https://cdn.mos.cms.futurecdn.net/5fz9SMYxWbv44jFVcD4vmd.jpg)" }}>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 h-1/2">
      <div className="flex items-start justify-start mt-4 mb-8">
          <img
            src="/Images/HEXA_HUB.png"
            alt="HexaHub Logo"
            className="h-20 w-20 mr-4" 
            onClick={handleLogoClick}
            
          />
        </div>
        <div className="w-full max-w-md mx-auto">
          <h2 className="mt-6 text-center text-2xl font-extrabold text-indigo-950">
            Welcome Back!
          </h2>

          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-transparent absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-indigo-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Sign In
                </button>
              </div>
            </form>
            <ToastNotification />
            <div className="mt-6 flex items-center justify-between text-sm">
              <a href="/Privacy" className="font-medium text-indigo-950 hover:text-cyan-500">Privacy</a>
              <a href="/Terms" className="font-medium text-indigo-950 hover:text-cyan-500">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;