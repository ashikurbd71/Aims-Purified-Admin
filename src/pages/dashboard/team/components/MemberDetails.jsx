import { useContext } from "react";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { AuthContext } from "@/contexts/AuthContext";
import Avatar from "/male.png";

const MemberDetails = () => {
  const { authdata } = useContext(AuthContext);
  const teamId = useParams();
  const axiosSecure = useAxiosSecure()
  const { data: item, refetch } = useQuery({
    queryKey: ["deatilsteamManagement", teamId],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get(`/admin/${teamId?.id}`);
        (res.data);
        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
  });

  (item);

  return (
    <>
      <CustomMetaTag title={"Member Details"} />

      <div className="flex items-center justify-center my-8">
        <div className="w-full lg:w-[40%] bg-gradient-to-br from-indigo-50 via-white to-[#dcb7e4] shadow-xl rounded-xl overflow-hidden border border-gray-200 break-all">
          {/* Cover Photo with Update Button */}

          {/* Profile Details */}
          <div className="p-6">
            <div className="flex items-center flex-col justify-center space-y-4">
              <img
                src={item?.photoURL || Avatar}
                alt={`${item?.name}'s photo`}
                className="w-28 h-28 rounded-full object-cover border-2 border-[#6E297C] shadow-md"
              />
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {item?.name || "Anonymous"}
                </h2>

                <p className="text-sm text-[#6E297C] font-medium">
                  {item?.role || "No role defined"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-gray-700">
              <p className="text-sm flex items-center">
                <span className="font-bold">Email:</span>
                <span className="ml-2">{item?.email || "Not available"}</span>
              </p>
              <p className="text-sm flex items-center">
                <span className="font-bold">Phone:</span>
                <span className="ml-2">
                  {item?.phoneNumber || "Not available"}
                </span>
              </p>
              <p className="text-sm flex items-center">
                <span className="font-bold">DOB:</span>
                <span className="ml-2">
                  {item?.dateOfBirth?.split("T")[0] || "Not available"}
                </span>
              </p>
            </div>

            {/* Bio Section */}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800">Bio</h3>
              <p className="text-sm text-gray-700 mt-1">
                {item?.bio || "No bio available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberDetails;
