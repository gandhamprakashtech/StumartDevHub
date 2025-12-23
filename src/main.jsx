import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "./routes";
import Layout from "./pages/layout";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: routes,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
