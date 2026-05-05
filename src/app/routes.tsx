import { createBrowserRouter } from "react-router";
import { Gallery } from "./App";
import { Admin } from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Gallery,
  },
  {
    path: "/admin",
    Component: Admin,
  }
]);