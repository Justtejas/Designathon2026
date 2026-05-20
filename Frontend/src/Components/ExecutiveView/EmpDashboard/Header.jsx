// import React, { useState, useRef, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSun, faMoon, faUserCircle, faSignOutAlt, faBell, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
// import moment from 'moment';
// import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons/faCalendarAlt';
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import { jwtDecode } from 'jwt-decode';

// const Header = () => {
//   // Get current date dynamically
//   const currentDate = moment().format('Do MMMM YYYY');
//   const [isDropdownOpen, setDropdownOpen] = useState(false);
//   const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
//   const [isRequestDropdownOpen, setRequestDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const profileDropdownRef = useRef(null);
//   const RequestDropdownRef = useRef(null);
//   const [isLogDropdownOpen, setLogDropdownOpen] = useState(false);
//   const logDropdownRef = useRef(null);
//   const navigate = useNavigate();
//   const [isDarkMode, setDarkMode] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(3600);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Second useEffect for handling clicks outside the profile dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
//         setProfileDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (RequestDropdownRef.current && !RequestDropdownRef.current.contains(event.target)) {
//         setRequestDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (logDropdownRef.current && !logDropdownRef.current.contains(event.target)) {
//         setLogDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);



//   // Toggle dropdown visibility
//   const toggleDropdown = () => {
//     setDropdownOpen((prev) => {
//       if (prev) {
//         setProfileDropdownOpen(false); // Close profile dropdown if it's open
//         return false;
//       }
//       setProfileDropdownOpen(false); // Close profile dropdown if it's not open
//       return true;
//     });
//   };

//   const toggleProfileDropdown = () => {
//     setProfileDropdownOpen((prev) => {
//       if (prev) {
//         setDropdownOpen(false); // Close notification dropdown if it's open
//         return false;
//       }
//       setDropdownOpen(false); // Close notification dropdown if it's not open
//       return true;
//     });
//   };


//   const toggleRequestDropdown = () => {
//     setRequestDropdownOpen((prev) => {
//       if (prev) {
//         setDropdownOpen(false); // Close notification dropdown if it's open
//         return false;
//       }
//       setDropdownOpen(false); // Close notification dropdown if it's not open
//       return true;
//     });
//   };


//   const toggleLogDropdown = () => {
//     setLogDropdownOpen((prev) => {
//       if (prev) {
//         setDropdownOpen(false); // Close notification dropdown if it's open
//         return false;
//       }
//       setDropdownOpen(false); // Close notification dropdown if it's not open
//       return true;
//     });
//   };

//   const toggleDarkMode = () => {
//     setDarkMode((prev) => !prev);
//     document.body.classList.toggle('dark-mode', !isDarkMode);
//   };

//   useEffect(() => {
//     // Check if the token exists and get its expiration
//     const token = Cookies.get('token');
//     if (token) {
//       const decoded = jwtDecode(token);
//       const expirationTime = decoded.exp * 1000; // Convert expiration time to milliseconds
//       const currentTime = Date.now(); // Current time in milliseconds

//       // Calculate time left in seconds
//       const initialTimeLeft = Math.floor((expirationTime - currentTime) / 1000);
//       if (initialTimeLeft > 0) {
//         setTimeLeft(initialTimeLeft);
//       } else {
//         // Token has expired, handle logout
//         handleLogout();
//       }
//     } else {
//       // Token does not exist, handle logout
//       handleLogout();
//     }

//     // Timer function to decrease time left every second
//     const timer = setInterval(() => {
//       setTimeLeft(prevTime => {
//         if (prevTime <= 1) {
//           clearInterval(timer);
//           handleLogout(); // Log out when the timer reaches 0
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000); // Update every second

//     return () => clearInterval(timer); // Clean up the interval on unmount
//   }, []);

//   const handleLogout = () => {
//     // Clear the token and redirect to the landing page
//     Cookies.remove('token');
//     Cookies.remove('role');

//     navigate('/');
//   };

//   // Convert timeLeft in seconds to mm:ss format
//   const formatTimeLeft = () => {
//     const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
//     const seconds = String(timeLeft % 60).padStart(2, '0');
//     return `${minutes}:${seconds}`;
//   };

//   const { minutes, seconds } = formatTimeLeft();

//   return (
//     <header className="flex justify-between items-center p-4 bg-white shadow-md">
//       {/* Logo and Branding */}
//       <div className="flex items-center space-x-4">
//         <img
//           src="/Images/logo.png"
//           alt="Maventory Logo"
//           className="h-16 w-16"  // Adjusted size for dashboard layout
//         />
//         <h2 className="text-2xl font-bold text-indigo-950">Maventory</h2>
//       </div>

//       {/* Date and Calendar */}
//       <div className="flex items-center space-x-2">
//         <FontAwesomeIcon icon={faCalendarAlt} className="text-xl text-indigo-950" />
//         <span className="text-indigo-950 font-medium">{currentDate}</span>
//       </div>

//       <div className="session-timer font-medium">
//         <p className="text-black">
//           Session Expires In: <span className="text-red-500"> {formatTimeLeft()}</span>
//         </p>
//       </div>

//       {/* Action Icons */}
//       <div className="flex items-center space-x-4 ">

//         <FontAwesomeIcon icon={faPaperPlane} className="text-xl text-indigo-950 hover:text-indigo-700 cursor-pointer" title="Request" onClick={toggleRequestDropdown} />
//         <FontAwesomeIcon icon={faBell} className="text-xl text-red-400 hover:text-red-500 cursor-pointer" title="Notifications" onClick={toggleDropdown} />
//         <FontAwesomeIcon
//           icon={isDarkMode ? faSun : faMoon}
//           className={`text-xl cursor-pointer ${isDarkMode ? 'text-indigo-950' : 'text-indigo-950'} hover:text-indigo-700`}
//           title="Toggle Theme"
//           onClick={toggleDarkMode}
//         />
//         <FontAwesomeIcon icon={faUserCircle} className="text-xl text-red-400 hover:text-red-500 cursor-pointer" title="Profile" onClick={toggleProfileDropdown} />

//         <FontAwesomeIcon icon={faSignOutAlt} className="text-xl text-indigo-950 hover:text-indigo-700 cursor-pointer" title="Logout" onClick={toggleLogDropdown} />
//         <div className="relative">
//           {isDropdownOpen && (
//             <div ref={dropdownRef} className="absolute right-0 mt-5 w-48 bg-indigo-950 border rounded-lg shadow-lg z-10">
//               <ul className="py-2">
//                 <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
//                   <Link to="/Notification" className="block text-slate-200 hover:text-indigo-950 w-full h-full">Notifications</Link>
//                 </li>
//                 <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
//                   <Link to="/Notification" className="block text-slate-200 hover:text-indigo-950 w-full h-full">Reminders</Link>
//                 </li>

//               </ul>
//             </div>
//           )}
//         </div>
//         <div className="relative">
//           {isProfileDropdownOpen && (
//             <div ref={profileDropdownRef} className="absolute right-0 mt-5 w-48 bg-indigo-950 border rounded-lg shadow-lg z-10">
//               <ul className="py-2">
//                 <li className="px-4 py-2 text-slate-200 hover:bg-red-500 cursor-pointer">
//                   <Link to="/Profile" className="block text-slate-200 hover:text-indigo-950 w-full h-full">My Profile</Link>
//                 </li>
//                 <li className="px-4 py-2 text-slate-200 hover:bg-red-500 cursor-pointer">
//                   <Link to="/Asset" className="block text-slate-200 hover:text-indigo-950 w-full h-full">My Assets</Link>
//                 </li>

//                 <li className="px-4 py-2 text-slate-200 hover:bg-red-500 cursor-pointer">
//                   <Link to="/Settings" className="block text-slate-200 hover:text-indigo-950 w-full h-full">Settings</Link>
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>

//         <div className="relative">
//           {isRequestDropdownOpen && (
//             <div ref={RequestDropdownRef} className="absolute right-0 mt-5 w-48 bg-indigo-950 border rounded-lg shadow-lg z-10">
//               <ul className="py-2">
//                 <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
//                   <Link to="/Asset" className="block text-slate-200 hover:text-indigo-950 w-full h-full">Asset Request</Link>
//                 </li>
//                 <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
//                   <Link to="/ServiceRequest" className="block text-slate-200 hover:text-indigo-950 w-full h-full">Service Request</Link>
//                 </li>

//                 <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
//                   <Link to="/ReturnRequest" className="block text-slate-200 hover:text-indigo-950 w-full h-full">Return Request</Link>
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
//         <div className="relative">
//           {isLogDropdownOpen && (
//             <div ref={logDropdownRef} className="absolute right-0 mt-5 w-48 bg-indigo-950 border rounded-lg shadow-lg z-10" onClick={handleLogout}>
//               <ul className="py-2">
//                 <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
//                   <Link to="/" className="block text-slate-200 hover:text-indigo-950 w-full h-full">Logout</Link>
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>


//     </header>
//   );
// };

// export default Header;
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSun,
  faMoon,
  faUserCircle,
  faSignOutAlt,
  faBell,
  faPaperPlane,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const currentDate = moment().format('Do MMMM YYYY');
  const navigate = useNavigate();

  const [isDarkMode, setDarkMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [openMenu, setOpenMenu] = useState(null);
  const dropdownRef = useRef(null);

  /* ---------------- DARK MODE : FULL PAGE ---------------- */
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    const close = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  /* ---------------- SESSION TIMER ---------------- */
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) return handleLogout();

    const decoded = jwtDecode(token);
    const expiry = decoded.exp * 1000;

    const timer = setInterval(() => {
      const diff = Math.floor((expiry - Date.now()) / 1000);
      if (diff <= 0) {
        clearInterval(timer);
        handleLogout();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    navigate('/');
  };

  const formatTime = () =>
    `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(
      timeLeft % 60
    ).padStart(2, '0')}`;

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white dark:bg-gray-900 shadow-md">

      {/* LOGO */}
      <div className="flex items-center gap-4">
        <img src="/Images/logo.png" alt="logo" className="h-14 w-14" />
        <h2 className="text-2xl font-bold text-indigo-950 dark:text-white">
          Maventory
        </h2>
      </div>

      {/* DATE */}
      <div className="hidden md:flex items-center gap-2 text-indigo-950 dark:text-gray-300">
        <FontAwesomeIcon icon={faCalendarAlt} />
        {currentDate}
      </div>

      {/* SESSION */}
      <div className="hidden lg:block text-sm text-gray-700 dark:text-gray-300">
        Session expires in :
        <span className="text-red-500 ml-1">{formatTime()}</span>
      </div>

      {/* ICONS */}
      <div className="flex items-center gap-5 relative" ref={dropdownRef}>
        <Icon icon={faPaperPlane} onClick={() => setOpenMenu(openMenu === 'request' ? null : 'request')} />
        <Icon icon={faBell} color="red" onClick={() => setOpenMenu(openMenu === 'notif' ? null : 'notif')} />
        <Icon icon={isDarkMode ? faSun : faMoon} onClick={toggleDarkMode} />
        <Icon icon={faUserCircle} color="red" onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')} />
        <Icon icon={faSignOutAlt} onClick={() => setOpenMenu(openMenu === 'logout' ? null : 'logout')} />

        {/* DROPDOWNS */}
        {openMenu && (
          <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
            {openMenu === 'request' && (
              <>
                <MenuLink to="/Asset" text="Asset Request" />
                <MenuLink to="/ServiceRequest" text="Service Request" />
                <MenuLink to="/ReturnRequest" text="Return Request" />
              </>
            )}

            {openMenu === 'notif' && (
              <>
                <MenuLink to="/Notification" text="Notifications" />
                <MenuLink to="/Notification" text="Reminders" />
              </>
            )}

            {openMenu === 'profile' && (
              <>
                <MenuLink to="/Profile" text="My Profile" />
                <MenuLink to="/Asset" text="My Assets" />
                <MenuLink to="/Settings" text="Settings" />
              </>
            )}

            {openMenu === 'logout' && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-600 dark:hover:text-white"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

/* -------- SMALL COMPONENTS -------- */
const Icon = ({ icon, onClick, color }) => (
  <FontAwesomeIcon
    icon={icon}
    onClick={onClick}
    className={`text-xl cursor-pointer transition
      ${color === 'red'
        ? 'text-red-400 hover:text-red-600'
        : 'text-indigo-950 dark:text-gray-200 hover:text-indigo-600'}
    `}
  />
);

const MenuLink = ({ to, text }) => (
  <Link
    to={to}
    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-700 hover:text-indigo-900 dark:hover:text-white"
  >
    {text}
  </Link>
);

export default Header;