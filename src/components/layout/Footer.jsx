export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-600 opacity-60">
        © {new Date().getFullYear()} StuMart. All rights reserved.
      </div>
    </footer>
  );
}
