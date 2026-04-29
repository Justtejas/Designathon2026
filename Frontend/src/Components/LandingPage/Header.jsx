'use client'
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLoginClick = () =>{
    navigate('/signin')
  }

  const handleLogoClick = () => {
    navigate('/');
  };
  return (
    <header className="bg-white">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex items-center lg:flex-1">
        <div className="flex flex-row items-center cursor-pointer" onClick={handleLogoClick}>
            <span className="sr-only">HexaHub</span>
            <img alt="HexaHub Logo" src="/Images/logo.png" className="h-12 w-auto" />
            <p className="text-xl font-semibold leading-6 text-gray-900">HexaHub</p>
          </div>
        </div>
        <div className=" lg:flex lg:flex-1 lg:justify-end">
          <button onClick={handleLoginClick} className="hover:text-white text-white text-sm font-semibold leading-6 px-4 py-2 rounded-lg text-gray-900 " style={{backgroundColor:'#F87060',transition:'background-color 0.3s'}}onMouseEnter={e =>      e.currentTarget.style.backgroundColor = '#D65B4D'} 
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F87060'} >
            Log in <span aria-hidden="true">&rarr;</span>
          </button>
        </div >
      </nav>
      <div className="border-b border-gray-300 opacity-100 " />
    </header>
  )
}
