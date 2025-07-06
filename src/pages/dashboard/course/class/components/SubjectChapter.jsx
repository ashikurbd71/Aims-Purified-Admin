import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EllipsisVertical, FolderOpen, Plus } from "lucide-react";
import React, { useState } from "react";
import Frame from "/Frame.png";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import ChapterUpdate from "@/pages/dashboard/components/update/forms/chapter/ChapterUpdate";
import AddNewChaptar from "@/pages/dashboard/components/forms/chaptar/AddNewChaptar";
import Loading from "@/components/global/Loading";

const SubjectChapter = () => {
  const { id } = useParams();
  const location = useLocation(); // Access the full location object
  const queryParams = new URLSearchParams(location.search); // Parse the query string
  const axiosSecure = useAxiosSecure()
  const courseId = queryParams.get("courseId"); // Get the `courseId` value

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleUpdateModalClose = () => {
    setIsUpdateModalOpen(false);
  };

  const {
    data: item,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["subchaptersss", id],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get(`/subject/${id}`);
        ("Response data:", response.data);
        return response?.data?.data; // Return the fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Ensure errors are properly thrown
      }
    },
    enabled: !!id, // Only run query if courseId exists
  });
  (courseId);

  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async (chapterId) => {
    setIsDeleting(true);
    try {
      const response = await axiosSecure.delete(`/chapter/${chapterId}`);
      if (response.status === 200) {
        toast.success("Course deleted successfully!");
        refetch();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      // toast.error("Failed to delete course. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  (item);
  return (
    <>
      <div className="flex items-center mb-7 justify-between">
        <h1 className="text-2xl text-gray-600">{item?.name}-Chapters</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger>
            <Button variant={"default"} size={"sm"} className={"rounded-3xl"}>
              Add New Chapter
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-screen overflow-auto">
            <AddNewChaptar
              onClose={handleModalClose}
              subjectId={id}
              refetch={refetch}
              courseId={courseId}
            />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Fallback for empty data */}
          {item?.chapters?.map((chapter) => (
            <Card className="border border-gray-200" key={chapter._id}>

              <Link to={`/class-details/${chapter._id}?courseId=${courseId}`}> <img
                src={chapter.featuredImgUrl || Frame}
                alt={chapter.name || "Class Image"}
                className="w-full h-48 object-cover rounded-tl-md rounded-tr-md"
              /></Link>

              <CardContent className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <Link to={`/class-details/${chapter._id}?courseId=${courseId}`}>
                    <p className="text-sm font-medium">{chapter.name}</p>
                  </Link>

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
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <span>Update</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-h-screen min-w-[45%] overflow-auto">
                          <ChapterUpdate
                            refetch={refetch}
                            chapter={chapter}
                            onClose={handleUpdateModalClose}
                          />
                        </DialogContent>
                      </Dialog>

                      {/* Delete chapter */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <p
                            variant="ghost"
                            size="sm"
                            className="px-2 cursor-pointer hover:text-red-500"
                            disabled={isDeleting}
                          >
                            Delete
                          </p>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-black">
                              This action cannot be undone. It will permanently
                              delete this chapter and remove its data from your
                              servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(chapter?._id)}
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
    </>
  );
};

export default SubjectChapter;
