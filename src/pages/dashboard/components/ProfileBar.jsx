import React, { useContext } from "react";
import Avatar from "/Avatar.png";
import ThemeToggle from "./ThemeToggle";
import { Menu } from "lucide-react";
import FeaturedImage from "../../../assets/logo-aims.jpg";
import { Button } from "@/components/ui/button";
// import { AuthContext } from "@/contexts/AuthContext";

const ProfileBar = ({ toggleSidebar }) => {
  // const { user } = useContext(AuthContext);

  return (
    <div className="w-full border-b lg:bg-white bg-[#F8FAFC] h-12 md:h-24 flex items-center justify-between py-8 px-2 lg:p-8 ">
      <div className="  flex items-center">
        <img
          src={FeaturedImage || "https://via.placeholder.com/150"}
          alt="English Healer"
          className="h-16 object-contain w-16 mr-2 block md:hidden "
        />
        {/* <h1 className="text-sm md:text-xl font-bold hidden md:block">
          Welcome Back, {user?.reloadUserInfo?.displayName}
        </h1> */}
      </div>
      <div className="flex  items-center gap-1 lg:gap-2">
        {/* <ThemeToggle /> */}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={toggleSidebar}
            className="lg:hidden focus:outline-none focus:ring"
          >
            <Menu />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileBar;
