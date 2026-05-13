'use client'
import { useNavigate } from "react-router-dom";
import UseDarkMode from "../Utils/UseDarkMode";

export default function Header() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/signin');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-950 transition-colors">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div
          className="flex flex-row items-center gap-2 cursor-pointer"
          onClick={handleLogoClick}
        >
          <span className="sr-only">Maventory</span>

          <img
            src="/Images/Maventory_light.png"
            alt="Maventory Logo"
            className="h-12 w-auto dark:hidden"
          />

          <img
            src="/Images/maventory1.png"
            alt="Maventory Logo"
            className="h-12 w-auto hidden dark:block"
          />

          <p className="text-3xl m-2 pt-2 font-semibold leading-6
            text-gray-900 dark:text-white">
            Maventory
          </p>
        </div>

        <div className="flex items-center gap-4">
          <UseDarkMode />

          <button
            onClick={handleLoginClick}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white
            bg-[#F87060] hover:bg-[#D65B4D] transition-colors"
          >
            Log in <span aria-hidden="true">→</span>
          </button>
        </div>
      </nav>

      <div className="border-b border-gray-300 dark:border-gray-800" />
    </header>
  );
}