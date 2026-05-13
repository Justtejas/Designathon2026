import { useTheme } from "../ThemeContext";

const UseDarkMode = () => {
    const { darkMode, setDarkMode } = useTheme();

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-full
      bg-blue-600 text-white shadow-lg
      hover:scale-105 transition"
        >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
    );
};

export default UseDarkMode;