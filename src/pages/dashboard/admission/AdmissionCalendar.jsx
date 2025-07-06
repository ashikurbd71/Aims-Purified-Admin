import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { EllipsisVertical, Eye, Pen, Plus, Trash, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Loading from "@/components/global/Loading";

const AddmissionCalendar = () => {
  // Delete Functionality
  const axiosSecure = useAxiosSecure()
  const navigate = useNavigate();

  const {
    data: Addmission,
    refetch,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["admesioncalender"],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get("/admissionCalender");
        (res.data);

        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
    retry:false
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await axiosSecure.delete(`/admissionCalender/${id}`);
      if (response.status === 200) {
        toast.success("Calendar deleted successfully!");

        await refetch();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting Admission Calendar:", error);
      // toast.error('Failed to delete Admission Calendar Notice. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <CustomMetaTag title={"Calender  List"} />

      <div>
        <div className="flex items-center lg:flex-row flex-col gap-5 lg:gap-0 justify-between ">
          <h1 className="text-xl  font-medium text-gray-600 ">
            Admission Calendar
          </h1>
          <Link to="/admission-form" className="flex items-center gap-2 ">
            <Button className={"rounded-3xl"}>
              Add New Admission
              <Plus />
            </Button>
          </Link>
        </div>
        <div className="border rounded-2xl mt-8">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 ">
              <h1 className="text-lg font-bold">Exams </h1>
              <span className="bg-gray-100 dark:text-gray-700 px-2 rounded-3xl text-sm font-semibold">
                {Addmission?.length} Total
              </span>
            </div>
            <p className="text-gray-600 ">
              You can manage exams here seamlessly
            </p>
          </div>
          {isLoading ? (
            <Loading />
          ) : (
            <div className="  ">
              <div className="overflow-x-auto rounded-tr-xl rounded-tl-xl">
                <Table className="table-auto w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900 px-6">
                      <TableHead className="text-gray-800 dark:text-gray-100 font-bold">
                        Exam Name
                      </TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-l">
                        Exam Date
                      </TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-l">
                        Exam Time
                      </TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-l text-center">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  {Addmission?.length > 0 ? (
                    <TableBody>
                      {Addmission?.map((exam, index) => (
                        <TableRow key={index}>
                          <TableCell className="border-r ">
                            <div>
                              <p className="font-semibold">{exam.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="border-r">
                            {exam.applicationInfo?.startTime?.split("T")[0]}
                          </TableCell>
                          <TableCell className="border-r">
                            {exam.applicationInfo?.deadline?.split("T")[0]}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-center gap-2 ">
                              {/* Admission details */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Link to={`/admission-details/${exam._id}`}>
                                      <Eye className="p-1 " />
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* update */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Link
                                      to={`/admissionUpdate-form/${exam._id}`}
                                    >
                                      <Pen className="p-1 " />
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Update</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {/* delete */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="hover:text-red-500">
                                    <Trash className="p-1 " />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-black">
                                      This action cannot be undone. This will
                                      permanently delete this information.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleting}>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(exam._id)}
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  ) : (
                    <p> </p>
                  )}
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddmissionCalendar;
