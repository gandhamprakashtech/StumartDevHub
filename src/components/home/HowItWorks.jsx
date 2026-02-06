import React from 'react'

export default function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8 md:py-12 lg:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-2 md:mb-3 lg:mb-4">
          How It Works
        </h2>
        <p className="text-center text-gray-600 mb-6 md:mb-8 lg:mb-12 max-w-2xl mx-auto">
         Buy and sell academic essentials safely within your campus
        </p>
        <div className="grid gap-6 md:gap-8 md:grid-cols-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[140px] md:text-[200px] font-semibold text-transparent bg-gradient-to-br from-indigo-400 to-indigo-500 bg-clip-text opacity-20 select-none leading-none" style={{WebkitTextStroke: '1px rgba(129, 140, 248, 0.3)'}}>1</span>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-base font-normal mb-3 text-gray-900 text-center">Register & Login</h3>
              <p className="text-base font-normal text-gray-600 text-center leading-relaxed">
                Create your account using your student email and verify your credentials.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[140px] md:text-[200px] font-semibold text-transparent bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text opacity-20 select-none leading-none" style={{WebkitTextStroke: '1px rgba(168, 85, 247, 0.3)'}}>2</span>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-normal mb-3 text-gray-900 text-center">Post or Browse</h3>
              <p className="text-base font-normal text-gray-600 text-center leading-relaxed">
                List items you want to sell with photos, or browse available products from other students.
              </p>
            </div>
          </div>
           
          <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[140px] md:text-[200px] font-semibold text-transparent bg-gradient-to-br from-green-400 to-green-500 bg-clip-text opacity-20 select-none leading-none" style={{WebkitTextStroke: '1px rgba(74, 222, 128, 0.3)'}}>3</span>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-normal mb-3 text-gray-900 text-center">Contact Seller</h3>
              <p className="text-base font-normal text-gray-600 text-center leading-relaxed">
                Reach out directly to sellers through the platform to ask questions and negotiate.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[140px] md:text-[200px] font-semibold text-transparent bg-gradient-to-br from-pink-400 to-pink-500 bg-clip-text opacity-20 select-none leading-none" style={{WebkitTextStroke: '1px rgba(244, 114, 182, 0.3)'}}>4</span>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-base font-normal mb-3 text-gray-900 text-center">Meet & Exchange</h3>
              <p className="text-base font-normal text-gray-600 text-center leading-relaxed">
                Arrange a safe meeting on campus to complete the transaction in person.
              </p>
            </div>
          </div>
        </div>
      </section>
  )
}
