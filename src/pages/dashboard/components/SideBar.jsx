import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "/male.png";
import FeaturedImage from "../../../assets/logo-aims.jpg";
import {
  AppWindow,
  BookOpen,
  BookOpenText,
  Box,
  Calendar,
  CalendarDays,
  ChartCandlestick,
  ChartNoAxesCombined,
  ClipboardList,
  ClipboardPen,
  ClipboardPenLine,
  Component,
  Container,
  FolderKanban,
  List,
  LogOut,
  ShoppingCart,
  Star,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { AuthContext } from "@/contexts/AuthContext";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import "./sideBar.css";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
const currentYear = new Date().getFullYear();

const NAVIGATION_ITEMS = [
  {
    to: "/overview",
    icon: <ChartNoAxesCombined />,
    label: "Overview",
  },
  // {
  //   to: "/team",
  //   icon: <UsersRound />,
  //   label: "Team Management",
  // },
  // category - management
  {
    to: "/category-management",
    icon: <ClipboardPen />,
    label: "Category Management",
  },
  // {
  //   to: "/notice",
  //   icon: <Box />,
  //   label: "Notice Management",
  // },
  {
    to: "/products-management",
    icon: <Container />,
    label: "Products Management",
  },


  // {
  //   to: "/coupon",
  //   icon: <Component />,
  //   label: "Coupon Management",
  // },

  // {
  //   to: "/student-review",
  //   icon: <Star />,
  //   label: "Student Review",
  // },



  {
    to: "/order-management",
    icon: <ShoppingCart />,
    label: "Orders Management",
  },



  // book
];

const SideBar = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { logout, user } = useAuth();
  const handleLogout = async () => {
    try {
      // Use AuthContext to logout
      logout();

      // Redirect to login page
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const location = useLocation();
  // const { user, authdata } = useContext(AuthContext);
  // const { data: items } = useQuery({
  //   queryKey: ["singleteamManagement"],
  //   queryFn: async () => {
  //     try {
  //       const res = await useAxiosSecure.get(`/admin/${authdata?._id}`);
  //       (res.data);
  //       return res?.data?.data;
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       throw error;
  //     }
  //   },
  // });
  return (
    <aside className="h-screen bg-[#F8FAFC] w-[250px] lg:w-[312px]  dark:bg-gray-900 flex flex-col px-2 lg:px-4 overflow-auto sidebarr">
      {/* Logo  */}
      <Link to={"/"}>
        <div className=" lg:mb-2 px-3">
          <img
            src={FeaturedImage || "https://via.placeholder.com/150"}
            alt="English Healer"
            className="h-24 lg:ml-16 ml-10 object-contain w-28"
          />
        </div>
      </Link>

      {/* Navigation Links */}
      <div nav className="flex-1">
        <ul className="space-y-3 pb-2">
          {NAVIGATION_ITEMS?.map((item, index) => {
            // Remove this block if you want all users to see all items
            // if (
            //   (item.label === "Coupon Management" ||
            //     item.label === "Team Management") &&
            //   !authdata?.role?.includes("ADMIN", "DEVELOPER")
            // ) {
            //   return null;
            // }

            const isActive = location.pathname === item.to;

            return (
              <li key={index}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-2 p-3 font-bold rounded-lg transition-colors text-sm lg:text-base duration-150 
        ${isActive
                      ? "bg-gradient-to-r from-[#007b45] to-[#363836] text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900"
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Profile */}
      <div
        div
        className="py-2 border-y border-gray-300 flex items-center justify-between"
      >
        <div className="flex gap-1 lg:gap-3 items-center">
          <Link to={"/profile"}>
            <div className="w-10 h-10 rounded-full">
              <img
                src={Avatar}
                alt="User"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </Link>

          <div className="break-all pr-2">
            <h4 className="text-sm lg:text-base font-bold">{user?.name || 'Admin'}</h4>
            <p className="text-xs text-gray-500">{user?.email || 'admin@gmail.com'}</p>
          </div>
        </div>

        {/* Logout  */}
        <button onClick={handleLogout}>
          <LogOut />
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
