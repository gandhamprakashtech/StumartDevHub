import { Link } from "react-router";

export default function Navbar() {
  return (
    <nav className="w-full bg-blue-50 text-lg border-b py-1 border-blue-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/StumartTransparent.png" 
            alt="StuMart Logo" 
            className="h-16 w-auto"
          />
        </Link>

        <div className="flex gap-6 text-gray-600">
          <Link to="/" className="hover:text-black">
            Home
          </Link>
          <Link to="/login" className="hover:text-black">
            Login
          </Link>
          <Link to="/register" className="hover:text-black">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
