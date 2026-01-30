import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-900 via-purple-800 to-purple-900">
      <div className="w-full py-4 lg:py-8 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Logo, Heading and Text - Left */}
          <div className="flex items-start gap-4 flex-1">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/stumart.jpg" 
                alt="StuMart Logo" 
                className="w-14 h-14 object-contain drop-shadow-lg"
              />
            </div>
            
            {/* Heading and Text */}
            <div className="flex flex-col justify-start">
              <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                Built for Students, by Students
              </h2>
              <p className="text-xs md:text-sm text-blue-100 leading-snug">
                Sell your extra items now.
              </p>
            </div>
          </div>

          {/* Support & Follow Us - Right */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 text-blue-100">
            {/* Support Section */}
            <div>
              <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">Support</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors duration-300">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors duration-300">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Us Section */}
            <div>
              <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">Follow Us</h3>
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.instagram.com/prakash_gandham_/" 
                  aria-label="Instagram" 
                  className="text-blue-100 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 2C4.239 2 2 4.239 2 7v10c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H7zm10 2a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-2.75a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
                  </svg>
                </a>
                <a 
                  href="#" 
                  aria-label="X" 
                  className="text-blue-100 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2H21l-6.52 7.455L22 22h-6.253l-4.89-6.4L5.48 22H2l7.02-8.02L2 2h6.373l4.42 5.828L18.244 2z" />
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/gandhamkumarnslprakash/" 
                  aria-label="LinkedIn" 
                  className="text-blue-100 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.123 2.062 2.062 0 01-.001 4.123zM6.814 20.452H3.86V9h2.954v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/15 bg-black/20">
        <div className="w-full px-4 py-3 text-center text-xs md:text-sm text-blue-100/80">
          © {new Date().getFullYear()} StuMart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}