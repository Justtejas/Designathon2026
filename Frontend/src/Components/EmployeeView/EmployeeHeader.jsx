import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserCircle,
    faSignOutAlt,
    faBell,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons/faCalendarAlt";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import UseDarkMode from "../Utils/UseDarkMode";

const EmployeeHeader = () => {
    const navigate = useNavigate();
    const currentDate = moment().format("Do MMMM YYYY");

    const [openMenu, setOpenMenu] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const notifRef = useRef(null);
    const profileRef = useRef(null);
    const requestRef = useRef(null);
    const logoutRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (
                !notifRef.current?.contains(e.target) &&
                !profileRef.current?.contains(e.target) &&
                !requestRef.current?.contains(e.target) &&
                !logoutRef.current?.contains(e.target)
            ) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) return handleLogout();

        const decoded = jwtDecode(token);
        const expiry = decoded.exp * 1000;

        const interval = setInterval(() => {
            const diff = Math.floor((expiry - Date.now()) / 1000);
            if (diff <= 0) {
                clearInterval(interval);
                handleLogout();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/");
    };

    const formatTime = () => {
        const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
        const s = String(timeLeft % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <header
            className="sticky top-0 z-50 w-full
      bg-white dark:bg-slate-950
      border-b border-gray-200 dark:border-slate-800
      transition-colors"
        >
            <div className="max-w-7xl mx-auto px-6 py-4
        flex items-center justify-between">

                <div className="flex items-center gap-4">
                    <img
                        src="/Images/logo.png"
                        alt="Maventory"
                        className="h-12 w-12"
                    />
                    <h2 className="text-xl font-bold
            text-indigo-950 dark:text-slate-100">
                        Maventory
                    </h2>
                </div>

                <div className="hidden md:flex items-center gap-2
          text-gray-700 dark:text-slate-300">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{currentDate}</span>
                </div>

                <div className="flex items-center gap-5">

                    <UseDarkMode />

                    <span className="text-sm text-gray-700 dark:text-slate-300">
                        Session: <span className="text-red-500">{formatTime()}</span>
                    </span>

                    {/* REQUEST */}
                    <div className="relative" ref={requestRef}>
                        <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="cursor-pointer text-indigo-700 dark:text-indigo-400"
                            onClick={() => setOpenMenu(openMenu === "request" ? null : "request")}
                        />
                        {openMenu === "request" && (
                            <Dropdown>
                                <DropdownLink to="/Asset">Asset Request</DropdownLink>
                                <DropdownLink to="/ReturnRequest">Return Request</DropdownLink>
                                <DropdownLink to="/ServiceRequest" className="block text-slate-200 hover:text-indigo-950 w-full h-full">Service Request</DropdownLink>
                            </Dropdown>
                        )}
                    </div>

                    <div className="relative" ref={notifRef}>
                        <FontAwesomeIcon
                            icon={faBell}
                            className="cursor-pointer text-red-500"
                            onClick={() => setOpenMenu(openMenu === "notif" ? null : "notif")}
                        />
                        {openMenu === "notif" && (
                            <Dropdown>
                                <DropdownLink to="/Notification">Notifications</DropdownLink>
                                <DropdownLink to="/Notification">Reminders</DropdownLink>
                            </Dropdown>
                        )}
                    </div>

                    {/* PROFILE */}
                    <div className="relative" ref={profileRef}>
                        <FontAwesomeIcon
                            icon={faUserCircle}
                            className="cursor-pointer text-indigo-700 dark:text-indigo-400"
                            onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}
                        />
                        {openMenu === "profile" && (
                            <Dropdown>
                                <DropdownLink to="/Profile">My Profile</DropdownLink>
                                <DropdownLink to="/Asset">My Assets</DropdownLink>
                                <DropdownLink to="/dashboard">Dashboard</DropdownLink>
                                <DropdownLink to="/Settings">Settings</DropdownLink>
                            </Dropdown>
                        )}
                    </div>

                    {/* LOGOUT */}
                    <div className="relative" ref={logoutRef}>
                        <FontAwesomeIcon
                            icon={faSignOutAlt}
                            className="cursor-pointer text-indigo-700 dark:text-indigo-400"
                            onClick={() => setOpenMenu(openMenu === "logout" ? null : "logout")}
                        />
                        {openMenu === "logout" && (
                            <Dropdown>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2
                  hover:bg-red-500 hover:text-white">
                                    Logout
                                </button>
                            </Dropdown>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
};

const Dropdown = ({ children }) => (
    <div className="absolute right-0 mt-3 w-48
    bg-indigo-950 dark:bg-slate-900
    text-slate-200 rounded-lg shadow-lg overflow-hidden">
        {children}
    </div>
);

const DropdownLink = ({ to, children }) => (
    <Link
        to={to}
        className="block px-4 py-2 hover:bg-red-500 hover:text-white"
    >
        {children}
    </Link>
);

export default EmployeeHeader;