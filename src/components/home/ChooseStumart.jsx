import React from 'react'

export default function ChooseStumart() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8 md:py-12 lg:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-2 md:mb-3 lg:mb-4">
          Why Choose StuMart?
        </h2>
        <p className="text-center text-gray-600 mb-6 md:mb-12 max-w-2xl mx-auto">
          A trusted platform that connects verified students within the campus.

        </p>
        <div className="grid gap-6 md:gap-8 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-normal mb-3 text-gray-900 text-center">
              Verified Student Network
            </h3>
            <p className="text-base font-normal text-gray-600 text-center leading-relaxed">
              Only registered students with verified credentials can access the platform, ensuring a safe and trusted environment.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-normal mb-3 text-gray-900 text-center">
              Campus-Based Exchange
            </h3>
            <p className="text-base font-normal text-gray-600 text-center leading-relaxed">
              A simple, safe, and campus-focused platform designed exclusively for students.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-normal mb-3 text-gray-900 text-center">
              Affordable & Sustainable
            </h3>
            <p className="text-base font-normal text-gray-600 text-center leading-relaxed">
              Save money by purchasing used items at great prices while promoting environmental sustainability.
            </p>
          </div>
        </div>
      </section>
  )
}
