import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            StuMart
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10">
          Your campus marketplace for buying and selling academic essentials. Connect with verified students and exchange items safely.
        </p>
        <Link
          to="/products"
          className="inline-block px-10 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          View Products
        </Link>
      </section>

      {/* Why Choose StuMart Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
          Why Choose StuMart?
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 text-center">
              Verified Student Network
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Only registered students with verified credentials can access the platform, ensuring a safe and trusted environment.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 text-center">
              Campus-Based Exchange
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              No shipping fees or online payment hassles. Meet face-to-face and exchange items directly within your college campus.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 text-center">
              Affordable & Sustainable
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Save money by purchasing used items at great prices while promoting environmental sustainability.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
          How It Works
        </h2>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Register & Login</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create your account using your student email and verify your credentials.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Post or Browse</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              List items you want to sell with photos, or browse available products from other students.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Contact Seller</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Reach out directly to sellers through the platform to ask questions and negotiate.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              4
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Meet & Exchange</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Arrange a safe meeting on campus to complete the transaction in person.
            </p>
          </div>
        </div>
      </section>

      
    </div>
  );
}
