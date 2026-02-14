import { Link } from "react-router";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Hero */}
        <header className="text-center mb-16 md:mb-20">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-600 mb-3">
            About StuMart
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Built by students, for students
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            The official campus marketplace for GVL Polytechnic (AANM & VVRSR), designed and developed by CSE final-year students.
          </p>
        </header>

        {/* Our story */}
        <section className="mb-14">
          <div className="border-l-4 border-indigo-600 pl-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Our story
            </h2>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              Designed by CSE students — 2023 batch, final year
            </h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              StuMart was conceived, designed, and developed by{" "}
              <strong className="text-gray-900">Computer Science & Engineering (CSE) students</strong> of the{" "}
              <strong className="text-gray-900">2023
                 batch</strong> in their final year—a real-world project that serves their own campus community.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We believe in <strong className="text-gray-900">students helping students</strong>. Whether it’s books, stationery, electronics, or other essentials, StuMart makes it simple to buy and sell within the college community in a safe, trusted environment.
            </p>
          </div>
        </section>

        {/* What we bring */}
        <section className="mb-14">
          <div className="border-l-4 border-indigo-600 pl-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              What we bring
            </h2>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              Student strengths
            </h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <p className="text-gray-600 mb-6">
              The team combined technical skills and dedication to deliver a full marketplace from concept to launch.
            </p>
            <ul className="space-y-4">
              {[
                { title: "Full-stack development", desc: "Design, frontend, backend, and database" },
                { title: "Problem-solving", desc: "Understanding campus needs and turning them into features" },
                { title: "Collaboration", desc: "Working as a team to ship on time" },
                { title: "Initiative", desc: "Building a platform for the entire polytechnic community" },
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">{item.title}</span>
                    <span className="text-gray-600"> — {item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Department support */}
        <section className="mb-14">
          <div className="border-l-4 border-indigo-600 pl-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Acknowledgement
            </h2>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              Department support
            </h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <p className="text-gray-700 leading-relaxed">
              This project would not have been possible without the guidance and support of our department. From concept to deployment, the encouragement and mentorship provided helped us stay on track and deliver a platform we are proud to offer to AANM & VVRSR Polytechnic students.
            </p>
          </div>
        </section>

        {/* CTA */}
        <footer className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600 mb-5">Questions or feedback? We’d like to hear from you.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Contact us
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </footer>
      </div>
    </div>
  );
}
