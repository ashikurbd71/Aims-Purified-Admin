import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EllipsisVertical, FolderOpen } from "lucide-react";
import React from "react";
import Frame from "/Frame.png";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import CustomMetaTag from "@/components/global/CustomMetaTags";

const AllClasses = () => {
  // const { data: item, refetch } = useQuery({
  //   queryKey: ["teammember"],
  //   queryFn: async () => {
  //     try {
  //       const res = await useAxiosSecure.get("/");
  //       (res.data);
  //       return res.data;
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       throw error;
  //     }
  //   },
  // });

  return (
    <>
      <CustomMetaTag title={'Class List'} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* Card for Classes */}
        <Card className="border bg-[#392d55] text-white  border-gray-200">
          <img
            src={Frame || "https://via.placeholder.com/150"}
            alt="GK Course by Tushar Bhaiya"
            className="w-full h-48 object-cover rounded-tl-md rounded-tr-md"
          />
          <CardContent className="px-2 py-2">
            <div className=" flex items-center justify-between">
              <p className="text-sm font-medium">GK Class</p>

              <Button variant={"ghost"} size={"sm"} className={"px-0"}>
                <EllipsisVertical />
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Card for Archive Classes */}
        <Card className="border bg-[#392d55] text-white border-gray-200">
          <div className="w-full h-48 bg-gray-100  rounded-tl-md rounded-tr-md flex items-center justify-center">
            {/* icon */}
            <FolderOpen className="text-gray-600 " size={32} />
          </div>
          <CardContent className="px-2 py-2">
            <div className=" flex items-center justify-between">
              <p className="text-sm font-medium">Archive Class</p>

              <Button variant={"ghost"} size={"sm"} className={"px-0"}>
                <EllipsisVertical />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>

  );
};

export default AllClasses;
