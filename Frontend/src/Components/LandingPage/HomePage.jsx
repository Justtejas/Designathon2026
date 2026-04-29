import Footer from "./Footer";
import Header from "./Header";


const HexaHubLandingPage = () => {
    return (
      <div className="bg-white min-h-screen ">
        <Header/>
        <main className="container mx-auto px-6 py-8">
          <section className="mb-16">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="flex flex-col text-4xl text-black font-bold mb-4">
                  Simplify your <span className="text-blue-600">Asset Management</span>
                </h1>
                <p className="text-gray-600 mb-4">
                  Streamline your company asset tracking, borrowing, and auditing processes with our comprehensive Asset Management System.
                </p>
              </div>
              <div className="md:w-1/2 text-center">
                <span className="sr-only">AdminDashboard</span>
                <img 
                  alt="AdminDashBoard" 
                  src="../Images/Admin DashBoard.png" 
                  className="h-auto w-full rounded-xl border" 
                />
              </div>
            </div>
          </section>
  
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Features</h2>
            <h3 className="text-2xl font-semibold mb-4 text-black">Everything you need to manage your assets</h3>
            <p className="text-gray-600 mb-8">
              Our comprehensive system provides tools for both employees and administrators to efficiently manage company assets.
            </p>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-4 md:mb-0">
                <img 
                  alt="AdminDashBoard" 
                  src="../Images/Assets.png" 
                  className="h-auto w-full rounded-xl border" 
                />
              </div>
              <div className="md:w-1/2 px-3">
                <h4 className="text-xl font-semibold mb-4 text-black">Asset</h4>
                <p className="mb-4 text-black">Easily submit and track service requests for assets that require maintenance or repair.</p>
                {/* <h4 className="text-xl font-semibold text-black">Asset Request</h4> */}
                <p className="text-black">Better asset tracking leads to better business performance – when you keep your equipment in working order and know where it is, you prevent losses from damage or theft.</p>
              </div>
            </div>
          </section>
  
          <section className="mb-16">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h3 className="text-2xl font-semibold mb-4  text-black">Get your entire team on the same page</h3>
                <p className="text-gray-600">
                  From the boardroom to the stockroom, our software benefits your entire organization. With unlimited users, your executives can easily view reports, your managers can see asset history, and your front-line workers can manage assets on the move.
                </p>
              </div>
              <div className="md:w-1/2 text-center">
                <span className="sr-only">EmployeeView</span>
                <img 
                  alt="AdminDashBoard" 
                  src="../Images/Employee-AdminView.png" 
                  className="h-auto w-full rounded-xl border" 
                />
              </div>
            </div>
          </section>
        </main>
        <Footer/>
      </div>
    );
  };
  
  export default HexaHubLandingPage;
  