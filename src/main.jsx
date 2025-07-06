// Importing necessary libraries and modules
import React from "react"; // Core React library for building user interfaces
import ReactDOM from "react-dom/client"; // React's package for DOM rendering in modern React applications
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // React Query for managing server state effectively
import "./index.css"; // Global CSS stylesheet for the application
import { HelmetProvider } from "react-helmet-async"; // Library for managing document head, such as meta tags and titles
import { RouterProvider } from "react-router-dom"; // React Router for client-side navigation
import Router from "@/routes/Route.jsx"; // Custom-defined routes for the application
import { Toaster } from "sonner"; // A toast notification library for displaying feedback messages
import AuthContextProvider from "@/contexts/AuthContext"; // Custom context provider for managing user authentication state
import { ThemeProvider } from "@/components/theme-provider"; // Custom theme provider for managing application themes
import { Provider } from "react-redux"; //provider from redux-toolkit
import store from "./redux/store"; //store from redux
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; //devtools for react-query

// Creating an instance of QueryClient
// QueryClient is used to configure caching, fetching, and updating data when using React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode is a developer tool that highlights potential problems in the app during development
  <React.StrictMode>
    {/* AuthContextProvider provides global authentication state and methods */}
    <AuthContextProvider>
      {/* QueryClientProvider makes the QueryClient instance available throughout the application */}
      <QueryClientProvider client={queryClient}>
        {/* HelmetProvider enables management of changes to the document head */}
        <HelmetProvider>
          {/* ThemeProvider provides a consistent theme across the application */}
          <ThemeProvider defaultTheme="light" storageKey="theme">
            {/* RouterProvider initializes the routing system based on the custom Router configuration */}
            <Provider store={store}>
              <RouterProvider router={Router} />
            </Provider>
            {/* Toaster component displays toast notifications with rich colors and a default duration */}
            <Toaster position="top-right" richColors duration={2000} />
          </ThemeProvider>
        </HelmetProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
