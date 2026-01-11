import { Outlet } from "react-router";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
  <script type="module" src="/auth.js"></script>

}
