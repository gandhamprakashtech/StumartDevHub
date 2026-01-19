import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            StuMart
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10">
          A student-to-student marketplace designed exclusively for your college.
          Buy and sell academic essentials easily within your campus.
        </p>

        <Link
          to="/products"
          className="inline-block px-10 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl
                     hover:bg-indigo-700 transition shadow-lg hover:shadow-xl"
        >
          Explore Marketplace
        </Link>
      </section>

      {/* Why StuMart Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Why Choose StuMart?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Verified Student Network
            </h3>
            <p className="text-gray-600">
              Only registered students can access the platform, ensuring a safe
              and trusted environment.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Campus-Based Exchange
            </h3>
            <p className="text-gray-600">
              No shipping or online payments. Meet and exchange items directly
              within your college.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Affordable & Sustainable
            </h3>
            <p className="text-gray-600">
              Save money by reusing items and promote sustainability among
              students.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          How StuMart Works
        </h2>

        <div className="grid gap-6 md:grid-cols-4 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="font-semibold text-gray-800">Register & Login</p>
            <p className="text-gray-600 text-sm mt-2">
              Sign in using your email to access StuMart.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="font-semibold text-gray-800">Post or Browse Items</p>
            <p className="text-gray-600 text-sm mt-2">
              List items you want to sell or explore available products.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="font-semibold text-gray-800">Contact the Seller</p>
            <p className="text-gray-600 text-sm mt-2">
              Communicate directly with the seller for details.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="font-semibold text-gray-800">Meet & Exchange</p>
            <p className="text-gray-600 text-sm mt-2">
              Complete the transaction safely on campus.
            </p>
          </div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Built by Students, for Students
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          StuMart helps students save money, reduce waste, and connect with
          peers through a trusted campus marketplace.
        </p>
      </section>
    </div>
  );
}
