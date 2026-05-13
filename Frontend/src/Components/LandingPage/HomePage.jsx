import Header from "./Header";
import Footer from "./Footer";
import UseDarkMode from "../Utils/UseDarkMode";

const MaventoryLandingPage = () => {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">

      <Header />

      <UseDarkMode />
      <section className="px-5 pt-20 pb-24">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">

          <div className="text-center md:text-left md:w-1/2 animate-fadeUp">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6
              text-gray-900 dark:text-white">
              Simplify your <br />
              <span className="text-blue-600">Asset Management</span>
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
              Track, manage, and audit company assets with one powerful,
              mobile‑friendly platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="px-6 py-3 rounded-lg bg-blue-600 text-white
                hover:bg-blue-700 transition shadow">
                Get Started
              </button>

              <button className="px-6 py-3 rounded-lg border
                border-gray-300 dark:border-gray-700
                text-gray-200 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                Demo
              </button>
            </div>
          </div>

          <div className="md:w-1/2 animate-float">
            <img
              src="../Images/Admin DashBoard.png"
              alt="Dashboard"
              className="rounded-2xl shadow-lg
              border dark:border-gray-800"
            />
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="px-5 py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center mb-16 animate-fadeIn">
          <p className="text-blue-600 font-semibold mb-2">FEATURES</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Designed for admins and employees with real‑time tracking,
            requests, and reporting.
          </p>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <img
            src="../Images/Assets.png"
            alt="Assets"
            className="rounded-xl shadow-md border
            dark:border-gray-800 hover:scale-105 transition md:w-1/2"
          />

          <div className="md:w-1/2 animate-fadeUp">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Smart Asset Control
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Track availability, maintenance, and lifecycle in one dashboard.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Reduce loss, prevent theft, and improve performance.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="px-5 py-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 animate-fadeUp">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              One platform for your entire team
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Executives, managers, and employees – everyone stays aligned.
            </p>
          </div>

          <img
            src="../Images/Employee-AdminView.png"
            alt="Team"
            className="rounded-xl shadow-md border
            dark:border-gray-800 hover:scale-105 transition md:w-1/2"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MaventoryLandingPage;