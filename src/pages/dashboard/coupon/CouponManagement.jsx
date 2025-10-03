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

import { Eye, Pen, Plus, Trash, ToggleLeft, ToggleRight } from "lucide-react";
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

import { toast } from "sonner";
import Loading from "@/components/global/Loading";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import CouponUpdate from "./CouponUpdate";

const CouponManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleUpdateModalOpen = (couponId) => {
    setSelectedCouponId(couponId);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateModalClose = () => {
    setIsUpdateModalOpen(false);
    setSelectedCouponId(null);
  };

  const axiosSecure = useAxiosSecure();

  const {
    data: coupons,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["couponsManagement"],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get("/coupon");
        return res?.data;
      } catch (error) {
        console.error("Error fetching coupons:", error);
        throw error;
      }
    },
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await axiosSecure.delete(`/coupon/${id}`);
      if (response.data) {
        toast.success("Coupon deleted successfully!");
        refetch();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Coupon doesn't exist!");
        refetch();
      } else if (error.response?.status === 500) {
        toast.error("Server Error!");
      } else {
        toast.error("Failed to delete coupon. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (id) => {
    setIsToggling(true);
    try {
      const response = await axiosSecure.patch(`/coupon/${id}/toggle`);
      if (response.data) {
        toast.success(`Coupon ${response.data.isActive ? 'activated' : 'deactivated'} successfully!`);
        refetch();
      }
    } catch (error) {
      toast.error("Failed to toggle coupon status. Please try again.");
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div>
      <CustomMetaTag title={"Coupon Management"} />
      <div className="flex items-center lg:flex-row flex-col lg:gap-0 gap-5 justify-between">
        <h1 className="text-2xl text-gray-600">Coupon Management</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size={"sm"} className="rounded-3xl">
              Add new Coupon
              <Plus className="ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-8 min-w-[50%] max-h-screen overflow-auto">
            <CouponCreateForm
              refetch={refetch}
              onClose={handleModalClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-3xl mt-6">
        {/* Header section */}
        <div className="p-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-1 space-y-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Total Coupons</h1>
              <span className="bg-gray-100 dark:text-gray-700 px-2 rounded-3xl text-sm font-semibold">
                {coupons?.length || 0} Total
              </span>
            </div>
            <p className="text-gray-600">
              You can manage coupons here seamlessly
            </p>
          </div>
        </div>

        {/* Coupons table */}
        {isLoading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-auto w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900 px-6">
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Coupon Code
                  </TableHead>
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Discount
                  </TableHead>
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Expiry Date
                  </TableHead>
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Usage
                  </TableHead>
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-800 text-center dark:text-gray-100 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons?.map((coupon, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-3 border-r">
                      <div>
                        <p className="font-semibold">{coupon?.code}</p>
                        {coupon?.description && (
                          <p className="text-sm text-gray-500">{coupon.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r">
                      <div>
                        <p className="font-semibold">{coupon?.amount}%</p>
                        {coupon?.minimumOrderAmount > 0 && (
                          <p className="text-sm text-gray-500">
                            Min: ${coupon.minimumOrderAmount}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r">
                      <div>
                        <p className={isExpired(coupon?.expiredate) ? "text-red-500" : "text-green-600"}>
                          {formatDate(coupon?.expiredate)}
                        </p>
                        {isExpired(coupon?.expiredate) && (
                          <p className="text-xs text-red-500">Expired</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r">
                      <div>
                        <p className="font-semibold">
                          {coupon?.usageCount || 0} / {coupon?.usageLimit || 1}
                        </p>
                        <p className="text-sm text-gray-500">times used</p>
                      </div>
                    </TableCell>
                    <TableCell className="border-r">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          coupon?.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon?.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {isExpired(coupon?.expiredate) && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            Expired
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Action buttons */}
                    <TableCell>
                      <div className="flex gap-2 items-center justify-center">
                        {/* Toggle Active/Inactive */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <button
                                onClick={() => handleToggleActive(coupon?.id)}
                                disabled={isToggling}
                                className="hover:text-blue-500"
                              >
                                {coupon?.isActive ? (
                                  <ToggleRight className="p-1" />
                                ) : (
                                  <ToggleLeft className="p-1" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{coupon?.isActive ? 'Deactivate' : 'Activate'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Update */}
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
                                    onClick={() => handleUpdateModalOpen(coupon.id)}
                                  />
                                </DialogTrigger>
                                <DialogContent className="p-8 min-w-[50%] max-h-screen overflow-auto">
                                  {isUpdateModalOpen && selectedCouponId && (
                                    <CouponUpdate
                                      refetch={refetch}
                                      couponId={selectedCouponId}
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

                        {/* Delete */}
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
                                permanently delete this coupon.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isDeleting}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(coupon?.id)}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-500"
                              >
                                {isDeleting ? "Deleting..." : "Yes, Delete it!"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
