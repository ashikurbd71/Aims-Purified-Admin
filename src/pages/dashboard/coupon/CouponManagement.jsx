import React, { useContext, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { Eye, Pen, Plus, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CouponCreateForm from "./CouponCreateForm";

import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import CouponUpdate from "../components/update/forms/coupon/CouponUpdate";
import { AuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Loading from "@/components/global/Loading";
import CustomMetaTag from "@/components/global/CustomMetaTags";


const CouponManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const axiosSecure = useAxiosSecure()

  // At the top of your component, add state for tracking the selected ID
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);

  // Create a function to handle opening the modal with specific ID
  const handleUpdateModalOpen = (couponId) => {
    setSelectedCouponId(couponId);
    setIsUpdateModalOpen(true);
  };

  // Modify your close handler to also reset the selected ID
  const handleUpdateModalClose = () => {
    setIsUpdateModalOpen(false);
    setSelectedCouponId(null);
  };

  const {
    data: item,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["couponManagement"],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get("/coupon");
        (res.data);
        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await axiosSecure.delete(`/coupon/${id}`);
      if (response.status === 200) {
        toast.success("Coupon  deleted successfully!");
        refetch();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      if (error.status === 404) {
        toast.error("Doesn't exist... 😅!");
        refetch();
      } else if (error.status === 500) {
        toast.error("Server Error... 😅!");
      }
    } finally {
      setIsDeleting(false);
    }
  };
  const { authdata } = useContext(AuthContext);
  (item);
  return (
    <div>
      <CustomMetaTag title={"Coupon List"} />
      <div className=" flex items-center lg:flex-row flex-col lg:gap-0 gap-5 justify-between">
        <h1 className="text-2xl text-gray-600">Coupon Management</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            {["ADMIN", "DEVELOPER"].includes(authdata?.role) && (
              <Button size={"sm"} className="rounded-3xl">
                Add new Coupon
                <Plus className="ml-2" />
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="p-8 min-w-[45%] max-h-screen overflow-auto">
            {/* Form */}

            <CouponCreateForm
              refetch={refetch}
              onClose={handleModalClose}
            ></CouponCreateForm>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-3xl mt-6">
        {/* Manage Team Header section */}
        <div className="p-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-1 space-y-2">
          <div>
            <div className="flex items-center gap-2 ">
              <h1 className="text-lg font-bold">Total Coupon</h1>
              <span className="bg-gray-100 dark:text-gray-700 px-2 rounded-3xl text-sm font-semibold">
                {item?.length} Total
              </span>
            </div>
            <p className="text-gray-600 ">
              You can manage coupons here seamlessly
            </p>
          </div>
        </div>

        {/* Team table */}

        {isLoading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto ">
            <Table className="table-auto w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900 px-6">
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Coupon Name
                  </TableHead>
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Coupon Create Date
                  </TableHead>
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Coupon Expire Date
                  </TableHead>
                  <TableHead className="text-gray-800 text-center dark:text-gray-100 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item?.map((coupon, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-3 border-r">
                      <div>
                        <p className="font-semibold">{coupon?.code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="border-r">
                      {coupon?.createdAt?.split("T")[0]}
                    </TableCell>
                    <TableCell className="border-r">
                      {" "}
                      {coupon?.expiresAt?.split("T")[0]}
                    </TableCell>

                    {/* Update and delete button */}

                    <TableCell>
                      <div className="flex gap-2 items-center justify-center">
                        {/* details */}
                        {/* <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Link to={`/member-details/${member?._id}`}>
                              <Eye className="p-1 " />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider> */}

                        {/* update */}
                        {["ADMIN", "DEVELOPER"].includes(authdata?.role) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Dialog
                                  open={isUpdateModalOpen}
                                  onOpenChange={setIsUpdateModalOpen}
                                >
                                  <DialogTrigger asChild>
                                    <Pen
                                      className="p-1 cursor-pointer"
                                      onClick={() =>
                                        handleUpdateModalOpen(coupon._id)
                                      }
                                    />
                                  </DialogTrigger>
                                  <DialogContent className="p-8 min-w-[45%] max-h-screen overflow-auto">
                                    {isUpdateModalOpen && selectedCouponId && (
                                      <CouponUpdate
                                        refetch={refetch}
                                        item={selectedCouponId}
                                        onClose={handleUpdateModalClose}
                                      />
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Update</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {["ADMIN", "DEVELOPER"].includes(authdata?.role) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="hover:text-red-500">
                                <Trash className="p-1" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-black">
                                  This action cannot be undone. This will
                                  permanently delete this coupon .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(coupon?._id)}
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-500"
                                >
                                  {isDeleting
                                    ? "Deleting..."
                                    : "Yes, Delete it!"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponManagement;
