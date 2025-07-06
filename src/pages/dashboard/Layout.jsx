import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/SideBar";
import ProfileBar from "./components/ProfileBar";
import ServerUpgradeWarning from "@/shares/ServerUpgradeWarning";
const currentYear = new Date().getFullYear();

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0  lg:w-[312px]   transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform lg:translate-x-0 lg:static lg:inset-0`}
      >
        <Sidebar />
      </div>
      <div className="flex flex-col w-full min-h-screen overflow-auto">
        {/* Profile Bar */}
        <ProfileBar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

        {/* Main Content */}
        <ServerUpgradeWarning />
        <div className="p-3 md:p-6 flex-grow">
          <Outlet />
        </div>
        {/* Copy right notice */}
        <div className="bg-gray-50  text-center text-[11px] text-gray-800 py-2">
          <p className="">
            &copy; {currentYear} {""}
            <a href="#" className="font-semibold underline" target="_blank">
              English Healer {""}
            </a>
            | All Rights Reserved |<span className=""> Developed by</span>{" "}
            <a
              href="https://www.durdomcrafters.com"
              className="font-semibold underline"
              target="_blank"
            >
              Team Durdom Crafters
            </a>
          </p>
        </div>
      </div>

      {/* Backdrop for Sidebar in mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
