/**
 * Router Configuration for the Application
 *
 * This file sets up client-side routing for the application using React Router.
 * It defines the paths, layouts, and route protection mechanisms for public and private routes.
 *
 * Features:
 * - Public and private routes.
 * - Protected routes for authenticated users.
 * - Modular and maintainable layout structure.
 *
 * Dependencies:
 * - `react-router-dom`: Provides routing capabilities.
 * - `ProtectedRoutes`: Custom components for route protection.
 */

// Importing necessary modules and components for routing.

// import DashboardHome from "@/pages/dashboard/home/Home";
import DashboardLayout from "@/pages/dashboard/Layout";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/PrivateRoute";
import PublicRoute from "@/components/PublicRoute";

import Login from "@/pages/auth/Login";
import Home from "@/pages/dashboard/home/Home";
import CategoryManagement from "@/pages/dashboard/category/CategoryManagement";
import ProductsManagement from "@/pages/dashboard/course/ProductsManagement";
import ProductSetting from "@/pages/dashboard/components/forms/products/ProductSetting";
import OrderList from "@/pages/dashboard/Order/OrderList";
import SliderManagement from "@/pages/dashboard/slider/SliderManagement";
import CouponManagement from "@/pages/dashboard/coupon/CouponManagement";
import PaymentManagement from "@/pages/dashboard/payment/PaymentManagement";


// Define the routing structure using `createBrowserRouter`.
const Router = createBrowserRouter([
  {
    /**
     * Public Route - Login Page
     *
     * Path: "/login"
     * This route is protected by `PublicRoute` to prevent access for already authenticated users.
     * Renders the `Login` component.
     */
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    /**
     * Private Route - Dashboard
     *
     * Path: "/"
     * This route is accessible only to authenticated users.
     * It uses the `PrivateRoute` component to enforce route protection.
     * Renders the `DashboardLayout` as the parent layout.
     */
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    // errorElement: <NotFoundPage />,
    children: [
      {
        /**
         * Child Route - Dashboard Home
         *
         * The default child of the dashboard route, rendering the `Home` component.
         */
        path: "/",
        element: <Home />,
      },
      {
        path: "/products-management",
        element: <ProductsManagement />,
      },


      {
        path: "/products-management/:id",
        element: <ProductSetting />,
      },
      {
        path: "/overview",
        element: <Home />,
      },



      // {
      //   path: "/team",
      //   element: (
      //     <PrivateRoutes>
      //       <TeamManage />
      //     </PrivateRoutes>
      //   ),
      // },

      {
        path: "/category-management",
        element: <CategoryManagement />,
      },
      // course details



      // admission routs


      {
        path: "/order-management",
        element: <OrderList />,
      },

      {
        path: "/slider-management",
        element: <SliderManagement />,
      },
      {
        path: "/coupon-management",
        element: <CouponManagement />,

      },
      {
        path: "/payment-management",
        element: <PaymentManagement />,
      }





      // // member details
      // {
      //   path: "/member-details/:id",
      //   element: (
      //     <PrivateRoutes>
      //       <MemberDetails />
      //     </PrivateRoutes>
      //   ),
      // },
      // {
      //   path: "/profile",
      //   element: (
      //     <PrivateRoutes>
      //       <Profile />
      //     </PrivateRoutes>
      //   ),
      // },







    ],
  },
  {
    /**
     * Catch-all route - Redirect to login
     *
     * This route catches any unknown paths and redirects to the login page.
     */
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

// Export the configured router to be used in the application.
export default Router;

/**
 * Key Notes:
 *
 * 1. **Protected Routes**:
 *    - `SignedInProtectedRoutes`: Prevents already authenticated users from accessing public routes like sign-in.
 *    - `PrivateRoutes`: Ensures that only authenticated users can access the dashboard and its child routes.
 *
 * 2. **Layouts**:
 *    - `Layout`: Base layout for public pages, including the home page.
 *    - `DashboardLayout`: Layout specific to the dashboard area, rendered only for authenticated users.
 *
 * 3. **Extensibility**:
 *    - To add new public routes, include them as children under the root path ("/") in the `Layout`.
 *    - For dashboard-specific pages, add them as children under the `/dashboard` path.
 *
 * 4. **Code Splitting**:
 *    - Ensure lazy loading is used for heavy components to optimize performance in production.
 *
 * 5. **Maintenance**:
 *    - Maintain a consistent structure for routes and layouts to ensure scalability.
 *    - Update `PrivateRoutes` and `SignedInProtectedRoutes` as per authentication logic changes.
 */
