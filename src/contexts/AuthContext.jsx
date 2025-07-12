// /* eslint-disable react-refresh/only-export-components */

// // Importing required modules and hooks.
// import { createContext, useEffect, useState } from "react";
// import PropTypes from "prop-types";
// // Import Firebase configuration. Replace or remove this import if using a custom authentication service.
// // import app from "./../../firebase.config";
// import {
//   getAuth,
//   onAuthStateChanged,
//   sendPasswordResetEmail,
//   signInWithEmailAndPassword,
//   signOut,
//   updatePassword,
// } from "firebase/auth";
// import useAxiosSecure from "@/hooks/useAxiosSecure";

// // Note: Uncomment and modify the following imports only if Firebase is being used for authentication services.
// // import {
// //   signOut,
// //   useAxiosSecure,
// //   updatePassword,
// //   signInWithPopup,
// //   GoogleAuthProvider,
// // } from "firebase/auth";

// // If Axios is used for secure API calls, you can uncomment and configure this import.
// // import { useAxiosSecure } from "@/hooks/useAxiosSecure";

// // Creating a Context for Authentication data and methods.
// export const AuthContext = createContext(null);

// /**
//  * AuthContextProvider Component
//  *
//  * This component provides authentication state and methods to the application.
//  * It uses React Context to share authentication-related data and operations globally.
//  *
//  * @param {Object} props - Component props.
//  * @param {React.ReactNode} props.children - The child components that require access to authentication data.
//  * @returns {JSX.Element} A context provider component for authentication.
//  */
// const AuthContextProvider = ({ children }) => {
//   const axiosSecure = useAxiosSecure()
//   // State for the currently logged-in user.
//   const [user, setUser] = useState(null);

//   // State for the loading status, useful for handling asynchronous operations.
//   const [loading, setLoading] = useState(true);

//   const auth = getAuth(app);

//   // use the following variable if Firebase's current authenticated user is needed.
//   const currentUsingUser = auth.currentUser;

//   const logIn = (email, password) => {
//     setLoading(true);
//     return signInWithEmailAndPassword(auth, email, password);
//   };

//   /**
//    * Function to log out the current user.
//    * Replace this with custom logout logic if using a custom authentication service.
//    */
//   const logOut = async () => {
//     setLoading(true);
//     // Example for secure API logout: adjust URL as needed for custom auth service.
//     await axiosSecure.get("/sign-out");
//     return signOut(auth);
//   };

//   // * Function to log out the current user.
//   // * Replace this with custom logout logic if using a custom authentication service.
//   const resetPassword = (email) => {
//     setLoading(true);
//     return sendPasswordResetEmail(auth, email);
//   };

//   /**
//    * Function to update the password for the current user.
//    * Replace this with a custom implementation if using a custom authentication service.
//    */
//   const setPassword = (password) => {
//     setLoading(true);
//     return updatePassword(currentUsingUser, password);
//   };

//   const [authdata, setAuthData] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       setLoading(true); // Ensure loading state reflects the API processing.

//       const loggedUser = {
//         email: currentUser?.email || user?.email,
//         name: currentUser?.displayName || user?.displayName,
//       };

//       setUser(currentUser); // Update the local user state.

//       try {
//         if (currentUser) {
//           // Replace with custom API for user authorization.
//           const response = await axiosSecure.post("/admin/auth", loggedUser);

//           // Assuming the API responds with additional user data.
//           setAuthData(response?.data?.data); // Set `authdata` from the API response.
//         } else {
//           // Replace with custom API for user sign-out.
//           await axiosSecure.get("/admin/sign-out");

//           // Clear auth data on sign-out.
//           setAuthData(null);
//         }
//       } catch (error) {
//         console.error("Error during authentication:", error);
//       } finally {
//         // Ensure loading is set to false after processing.
//         setLoading(false);
//       }
//     });

//     // Cleanup function to unsubscribe from authentication state listener.
//     return () => {
//       unsubscribe();
//     };
//   }, [auth, user?.displayName, user?.email]);


//   // Object containing all authentication-related states and methods to be shared via context.
//   const authInfo = {
//     user,
//     authdata,// Current authenticated user
//     logIn, // Method to log in the user
//     logOut, // Method to log out the user
//     loading, // Loading status for authentication processes
//     setLoading, // Method to update loading state manually
//     setPassword, // Method to update user's password
//     resetPassword, // Method to reset user's password
//   };

//   // Return a context provider component, passing down the authInfo object.
//   return (
//     <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
//   );
// };

// // Define PropTypes for the component to ensure proper usage.
// AuthContextProvider.propTypes = {
//   /**
//    * Child components that will consume the authentication context.
//    */
//   children: PropTypes.node,
// };

// // Export the AuthContextProvider to be used in other parts of the application.
// export default AuthContextProvider;

// /**
//  * IMPORTANT:
//  * To switch to a custom authentication service:
//  * 1. Replace all Firebase-related imports (e.g., auth, signOut, useAxiosSecure, etc.) with your custom auth logic.
//  *    [LINE 6-8]: Replace or remove Firebase config import.
//  *    [LINE 19-21]: Replace sign-in logic (signInWithPopup) with a custom API call.
//  *    [LINE 25-27]: Replace sign-out logic with a custom logout API.
//  *    [LINE 31-51]: Replace the useAxiosSecure logic with a custom listener or API call to detect user state changes.
//  * 2. Update the authInfo object to include methods specific to the custom service.
//  * 3. Ensure secure communication with the backend for authentication and user management.
//  */
