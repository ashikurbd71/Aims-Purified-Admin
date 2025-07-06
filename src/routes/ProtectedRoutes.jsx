/**
 * Route Protection Components
 *
 * This file defines route guards to ensure proper access control across the application.
 * It contains two main components:
 * 1. `PrivateRoutes`: Protects private routes to ensure only authenticated users can access them.
 * 2. `SignedInProtectedRoutes`: Prevents authenticated users from accessing routes meant for unauthenticated users, such as the sign-in page.
 *
 * Dependencies:
 * - `react-router-dom`: For navigation and route management.
 * - `useAuth`: A custom hook providing authentication status and user details.
 * - `Loading`: A global component for displaying a loading indicator.
 */

// Importing required modules and components
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import Loading from "@/components/global/Loading";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

// Private Route Component
/**
 * `PrivateRoutes`
 *
 * Purpose:
 * - Protects routes that require authentication.
 * - Redirects unauthenticated users to the sign-in page.
 *
 * Behavior:
 * - Displays a loading spinner while the authentication status is being determined.
 * - If the user is authenticated, renders the protected children components.
 * - If the user is not authenticated, navigates to the sign-in page, preserving the intended destination in state for redirection after login.
 *
 * Props:
 * - `children` (PropTypes.node): The components to render if the user is authenticated.
 *
 * Usage:
 * Wrap any private route or layout that requires authentication with `PrivateRoutes`.
 */
export const PrivateRoutes = ({ children }) => {

  const { user, loading } = useContext(AuthContext);
  const location = useLocation(); // Capture the current location for redirection

  // Show loading spinner if authentication status is being determined
  if (loading) {
    return <Loading />;
  }

  // Render the children if the user is authenticated
  if (user) {
    return <div>{children}</div>;
  }

  // Redirect to sign-in if not authenticated
  return <Navigate to={"/sign-in"} state={{ from: location }} replace />;
};

// Prop validation for PrivateRoutes
PrivateRoutes.propTypes = {
  children: PropTypes.node,
};

// Signed-In Protected Route Component
/**
 * `SignedInProtectedRoutes`
 *
 * Purpose:
 * - Restricts access to routes intended for unauthenticated users (e.g., sign-in page).
 * - Redirects authenticated users to the home page or a default route.
 *
 * Behavior:
 * - If the user is not authenticated, renders the children components.
 * - If the user is authenticated, redirects to the home page ("/").
 *
 * Props:
 * - `children` (PropTypes.node): The components to render if the user is not authenticated.
 *
 * Usage:
 * Wrap any route or component intended for unauthenticated users with `SignedInProtectedRoutes`.
 */
export const SignedInProtectedRoutes = ({ children }) => {
  const { user, } = useContext(AuthContext);

  // Render the children if the user is not authenticated
  if (!user) {
    return <div>{children}</div>;
  }

  // Redirect to the home page if authenticated
  return <Navigate to={"/"} />;
};

// Prop validation for SignedInProtectedRoutes
SignedInProtectedRoutes.propTypes = {
  children: PropTypes.node,
};

/**
 * Key Notes:
 *
 * 1. **PrivateRoutes**:
 *    - Used for routes or layouts requiring user authentication.
 *    - Redirects to the sign-in page if the user is not logged in.
 *    - Ensures seamless user experience by preserving the destination route in the state.
 *
 * 2. **SignedInProtectedRoutes**:
 *    - Used for routes or pages intended for unauthenticated users.
 *    - Prevents authenticated users from accessing routes like the sign-in page.
 *
 * 3. **Extensibility**:
 *    - Modify the redirect logic in both components to accommodate app-specific workflows (e.g., dynamic home pages based on user roles).
 *    - Customize the loading spinner by replacing the `Loading` component with an alternative if required.
 *
 * 4. **Scalability**:
 *    - Easily integrates with any authentication system.
 *    - Update the `useAuth` hook as per changes in authentication logic (e.g., switching from Firebase to a custom auth service).
 */
