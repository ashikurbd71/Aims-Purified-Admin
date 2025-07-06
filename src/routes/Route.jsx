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
import SignInPage from "@/pages/auth/signIn/SignIn";
import DashboardHome from "@/pages/dashboard/home/Home";
import DashboardLayout from "@/pages/dashboard/Layout";
import { createBrowserRouter } from "react-router-dom";
import { PrivateRoutes, SignedInProtectedRoutes } from "./ProtectedRoutes";
import Course from "@/pages/dashboard/course/CourseManagement";

import NoticeManagement from "@/pages/dashboard/notice/NoticeManagement";
import TeamManage from "@/pages/dashboard/team/TeamManage";

import CourseDetails from "@/pages/dashboard/course/components/CourseDetails";
import AdmissionForm from "@/pages/dashboard/components/forms/admission/AdmissionForm";
import AdmissionUpdate from "@/pages/dashboard/components/update/forms/admission/AdmissionUpdate";

import MemberDetails from "@/pages/dashboard/team/components/MemberDetails";
import ClassDetails from "@/pages/dashboard/course/class/components/ClassDetails";

import Profile from "@/pages/dashboard/team/components/Profile";
import CouponManagement from "@/pages/dashboard/category/CategoryManagement";
import SubjectChapter from "@/pages/dashboard/course/class/components/SubjectChapter";
import NotFoundPage from "@/components/global/NotFound";
import StudentReview from "@/pages/dashboard/student-review/StudentReview";
import BookList from "@/pages/dashboard/Book/BookList";
import ShipmentList from "@/pages/dashboard/Shipment/ShipmentList";
import ViewClass from "@/pages/dashboard/course/class/components/ViewClass";


// Define the routing structure using `createBrowserRouter`.
const Router = createBrowserRouter([
  {
    /**
     * Public Route - Sign In Page
     *
     * Path: "/sign-in"
     * This route is protected by `SignedInProtectedRoutes` to prevent access for already signed-in users.
     * Renders the `SignInPage` component.
     */
    path: "/sign-in",
    element: (
      <SignedInProtectedRoutes>
        <SignInPage />
      </SignedInProtectedRoutes>
    ),
  },
  {
    /**
     * Private Route - Dashboard
     *
     * Path: "/dashboard"
     * This route is accessible only to authenticated users.
     * It uses the `PrivateRoutes` component to enforce route protection.
     * Renders the `DashboardLayout` as the parent layout.
     */
    path: "/",
    element: (
      // <PrivateRoutes>
      <PrivateRoutes>
        <DashboardLayout />
      </PrivateRoutes>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        /**
         * Child Route - Dashboard Home
         *
         * The default child of the dashboard route, rendering the `DashboardHome` component.
         */
        path: "/",
        element: (
          <PrivateRoutes>
            <DashboardHome />
          </PrivateRoutes>
        ),
      },
      {
        path: "/course",
        element: (
          <PrivateRoutes>
            <Course />
          </PrivateRoutes>
        ),
      },


      {
        path: "/notice",
        element: (
          <PrivateRoutes>
            <NoticeManagement />
          </PrivateRoutes>
        ),
      },
      {
        path: "/team",
        element: (
          <PrivateRoutes>
            <TeamManage />
          </PrivateRoutes>
        ),
      },

      {
        path: "/category-management",
        element: (
          <PrivateRoutes>
            <CouponManagement />
          </PrivateRoutes>
        ),
      },
      // course details
      {
        path: "/course/:courseId",
        element: (
          <PrivateRoutes>
            <CourseDetails />
          </PrivateRoutes>
        ),
      },
      // class details
      {
        path: "/class-details/:id",
        element: (
          <PrivateRoutes>
            <ClassDetails />
          </PrivateRoutes>
        ),
      },
      {
        path: "/subject-chapter/:id",
        element: (
          <PrivateRoutes>
            <SubjectChapter />
          </PrivateRoutes>
        ),
      },
      // admission routs
      {
        path: "/admission-form",
        element: (
          <PrivateRoutes>
            <AdmissionForm />
          </PrivateRoutes>
        ),
      },

      {
        path: "/shipments",
        element: (
          <PrivateRoutes>
            <ShipmentList />
          </PrivateRoutes>
        ),
      },
      {
        path: "/view-class/:id",
        element: (
          <PrivateRoutes>
            <ViewClass />
          </PrivateRoutes>
        ),
      },


      // ViewClass
      {
        path: "/admissionUpdate-form/:id",
        element: <AdmissionUpdate />,
      },

      // member details
      {
        path: "/member-details/:id",
        element: (
          <PrivateRoutes>
            <MemberDetails />
          </PrivateRoutes>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoutes>
            <Profile />
          </PrivateRoutes>
        ),
      },

      {
        path: "/book",
        element: (
          <PrivateRoutes>
            <BookList />
          </PrivateRoutes>
        ),
      },



      {
        path: "student-review",
        element: (
          <PrivateRoutes>
            <StudentReview />
          </PrivateRoutes>
        ),
      },


    ],
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
