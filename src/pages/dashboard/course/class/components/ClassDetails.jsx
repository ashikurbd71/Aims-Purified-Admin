import { Card, CardContent } from "@/components/ui/card";
import React, { useContext, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Eye, Plus } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ClassUpdate from "@/pages/dashboard/components/update/forms/class/ClassUpdate";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ChapterClass from "@/pages/dashboard/components/forms/class/ChapterClass";
import { AuthContext } from "@/contexts/AuthContext";
import Loading from "@/components/global/Loading";

const ClassDetails = () => {
  const { id } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const handleChapterClassClose = () => {
    setIsModalOpen(false);
  };
  const handleUpdateModalClose = () => {
    setIsUpdateModalOpen(false);
  };

  const location = useLocation(); // Access the full location object
  const queryParams = new URLSearchParams(location.search); // Parse the query string
  const axiosSecure = useAxiosSecure()
  const courseId = queryParams.get("courseId"); // Get the `courseId` value

  const { data: item, refetch, isLoading } = useQuery({
    queryKey: ["classssssDetails"],
    queryFn: async () => {
      try {
        const response = await axiosSecure.post(`/class`, { chapterId: id });
        ("Response data:", response.data);
        return response?.data?.data; // Return the fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Ensure errors are properly thrown
      }
    },
    enabled: !!id, // Only run query if courseId exists
  });
  (item);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    (id);
    setIsDeleting(true);
    try {
      const response = await axiosSecure.delete(`/class/${id}`);
      if (response.status === 200) {
        toast.success("Class deleted successfully!");
        refetch();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
  (item);

  const { authdata } = useContext(AuthContext);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-gray-600">All Classes</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger>
            <Button variant={"default"} size={"sm"} className={"rounded-3xl"}>
              Add New Class
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-screen overflow-auto min-w-[45%]">
            <ChapterClass
              onClose={handleChapterClassClose}
              courseId={courseId}
              refetch={refetch}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-6">
          {/* Fallback for empty data */}
          {item?.map((itemclass) => (
            <Card className="border bg-[#392d55] text-white border-gray-200" key={itemclass.id}>
              <img
                src={itemclass?.featuredImgUrl || "https://via.placeholder.com/150"}
                alt="class image"
                className="w-full h-48 object-cover rounded-tl-md rounded-tr-md"
              />


              <CardContent className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col break-all">
                    <p className="text-[16px] font-bold mb-2">
                      {itemclass.title}
                    </p>
                    <p className="text-[15px] font-normal">
                      {itemclass.description}
                    </p>
                  </div>

                  <div> <Link to={`/view-class/${itemclass?._id}`}>
                    <Button variant="outline" size="sm" className="text-purple-700 border-purple-200 hover:bg-purple-50">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link></div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <EllipsisVertical className="p-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-12">
                      {/* Update class */}
                      <Dialog
                        open={isUpdateModalOpen}
                        onOpenChange={setIsUpdateModalOpen}
                      >
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <span>Update</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-h-screen min-w-[45%] overflow-auto">
                          <ClassUpdate
                            onClose={handleUpdateModalClose}
                            classData={itemclass}
                            refetch={refetch}
                          />
                        </DialogContent>
                      </Dialog>

                      {/* Delete chapter */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          {["ADMIN", "DEVELOPER"].includes(authdata?.role) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-1"
                              disabled={isDeleting}
                            >
                              Delete
                            </Button>
                          )}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-black">
                              This action cannot be undone. It will permanently
                              delete this course and remove its data from your
                              servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(itemclass?._id)}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-500"
                            >
                              {isDeleting ? "Deleting..." : "Yes, Delete it!"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassDetails;
