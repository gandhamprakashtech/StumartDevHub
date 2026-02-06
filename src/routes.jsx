import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import MyPosts from "./pages/MyPosts";
import CustomerFeedback from "./pages/CustomerFeedback";
import AdminPINManagement from "./pages/AdminPINManagement";
import AdminProducts from "./pages/AdminProducts";
import AdminProductDetail from "./pages/AdminProductDetail";
import LikedPost from "./pages/Likedpost";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

export const routes = [
  { path: "/", element: <Home /> },

  { path: "/about", element: <AboutUs /> },
  { path: "/contact", element: <ContactUs /> },

  { path: "/products", element: <Products /> },
  { path: "/products/:id", element: <ProductDetail /> },

  {
    path: "/liked-post",
    element: (
      <ProtectedRoute>
        <LikedPost />
      </ProtectedRoute>
    ),
  },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/Profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },

  {
    path: "/create-post",
    element: (
      <ProtectedRoute>
        <CreatePost />
      </ProtectedRoute>
    ),
  },

  {
    path: "/MyPosts",
    element: (
      <ProtectedRoute>
        <MyPosts />
      </ProtectedRoute>
    ),
  },

  { path: "/admin/login", element: <AdminLogin /> },

  {
    path: "/admin/dashboard",
    element: (
      <ProtectedAdminRoute>
        <AdminDashboard />
      </ProtectedAdminRoute>
    ),
  },

  {
    path: "/admin/pin-management",
    element: (
      <ProtectedAdminRoute>
        <AdminPINManagement />
      </ProtectedAdminRoute>
    ),
  },

  {
    path: "/admin/products",
    element: (
      <ProtectedAdminRoute>
        <AdminProducts />
      </ProtectedAdminRoute>
    ),
  },

  {
    path: "/admin/products/:id",
    element: (
      <ProtectedAdminRoute>
        <AdminProductDetail />
      </ProtectedAdminRoute>
    ),
  },

  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/customer-feedback", element: <CustomerFeedback /> },
];
