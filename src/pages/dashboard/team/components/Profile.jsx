// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { AuthContext } from "@/contexts/AuthContext";
// import { Edit, Pen } from "lucide-react";
// import React, { useContext, useState } from "react";
// import UpdateProfile from "../../components/update/forms/profile/ProfileUpdate";
// import Avatar from "/male.png";
// import { useQuery } from "@tanstack/react-query";
// import useAxiosSecure from "@/hooks/useAxiosSecure";

// export default function Profile() {
//   const { authdata } = useContext(AuthContext);
//   const axiosSecure = useAxiosSecure();
//   const { data: items } = useQuery({
//     queryKey: ["singleteamManagement"],
//     queryFn: async () => {
//       try {
//         const res = await axiosSecure.get(`/admin/${authdata?._id}`);
//         (res.data);
//         return res?.data?.data;
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         throw error;
//       }
//     },
//   });

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const handleModalClose = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <div className="flex items-center justify-center my-8">
//       <div className=" lg:w-[40%] bg-gradient-to-br from-indigo-50 via-white to-[#dcb7e4] shadow-xl rounded-xl overflow-hidden border border-gray-200">
//         {/* Cover Photo with Update Button */}
//         <div className="relative">

//           {/* <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger> */}
//           <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//             <DialogTrigger asChild>
//               <button className="absolute top-3 right-3 bg-[#9a47aa]  text-white p-2 rounded-full shadow  transition-all">
//                 <Edit size={18} />
//               </button>
//             </DialogTrigger>
//             <DialogContent className="max-h-screen overflow-auto">
//               <UpdateProfile
//                 teamData={items?._id}
//                 onClose={handleModalClose}
//               />
//             </DialogContent>
//           </Dialog>
//           {/* </TooltipTrigger>
//             <TooltipContent>
//               <span>Edit Profile</span>
//             </TooltipContent>
//           </Tooltip>
//         </TooltipProvider> */}
//         </div>

//         {/* Profile Details */}
//         <div className="p-6">
//           <div className="flex items-center flex-col justify-center space-y-4">
//             <img
//               src={items?.photoURL || Avatar}
//               alt={`${items?.name}'s photo`}
//               className="w-28 h-28 rounded-full object-cover border-2 border-[#6E297C] shadow-md"
//             />
//             <div className="flex flex-col items-center">
//               <h2 className="text-xl font-bold text-gray-800">
//                 {items?.name || "Anonymous"}
//               </h2>

//               <p className="text-sm text-[#6E297C] font-medium">
//                 {items?.role || "No role defined"}
//               </p>
//             </div>
//           </div>

//           <div className="mt-4 space-y-2 text-gray-700">
//             <p className="text-sm flex items-center">
//               <span className="font-bold">Email:</span>
//               <span className="ml-2">{items?.email || "Not available"}</span>
//             </p>
//             <p className="text-sm flex items-center">
//               <span className="font-bold">Phone:</span>
//               <span className="ml-2">
//                 {items?.phoneNumber || "Not available"}
//               </span>
//             </p>
//             <p className="text-sm flex items-center">
//               <span className="font-bold">DOB:</span>
//               <span className="ml-2">
//                 {items?.dateOfBirth?.split("T")[0] || "Not available"}
//               </span>
//             </p>
//           </div>

//           {/* Bio Section */}
//           <div className="mt-6">
//             <h3 className="text-md font-semibold text-gray-800">Bio</h3>
//             <p className="text-sm text-gray-700 mt-1">
//               {items?.bio || "No bio available."}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
