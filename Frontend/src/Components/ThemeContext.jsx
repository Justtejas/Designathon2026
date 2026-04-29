
import React, { createContext, useState, useEffect, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';


const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode === 'true'; 
    });
    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    useEffect(() => {   
        document.body.classList.toggle('dark', darkMode);
        document.body.classList.toggle('light', !darkMode);
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    return (
        <MuiThemeProvider theme={theme}>
            <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
                {children}
            </ThemeContext.Provider>
        </MuiThemeProvider>
    );
};



export const useTheme = () => useContext(ThemeContext);