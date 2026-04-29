

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto text-center">
        <h3 className="text-lg font-semibold mb-4">Connect with Us</h3>
        <div className="flex justify-center mb-4">
          <a href="#" className="mx-2 text-gray-400 hover:text-white">
            Facebook
          </a>
          <a href="#" className="mx-2 text-gray-400 hover:text-white">
            Twitter
          </a>
          <a href="#" className="mx-2 text-gray-400 hover:text-white">
            LinkedIn
          </a>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} HexaHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
