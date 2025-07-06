import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EllipsisVertical, FolderOpen } from "lucide-react";
import React, { useState } from "react";
import Frame from "/Frame.png";
import { Link, useParams } from "react-router-dom";
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
import ChapterUpdate from "../../components/update/forms/chapter/ChapterUpdate";
import UpdateSubject from "../../components/update/forms/subject/UpdateSubject";

const AllChapter = ({ item, refetch }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { courseId } = useParams();
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const axiosSecure = useAxiosSecure()
  const handleChapterModalClose = () => {
    setIsChapterModalOpen(false);
  };
  const handleSubjectModalClose = () => {
    setIsSubjectModalOpen(false);
  };

  (courseId);
  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await axiosSecure.delete(`/chapter/${id}`);
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

  const handleSubjectDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await axiosSecure.delete(`/subject/${id}`);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {/* Display all chapters */}

      {item?.chapters?.length > 0 && (
        <>

          {item.chapters.map((chapter) => (
            <Card className="border bg-[#392d55] text-white border-gray-200" key={chapter._id}>


              <Link to={`/class-details/${chapter._id}?courseId=${courseId}`}>

                <img
                  src={chapter.featuredImgUrl}
                  alt={chapter.name}
                  className="w-full h-48 object-cover rounded-tl-md rounded-tr-md"
                />
              </Link>

              <CardContent className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/class-details/${chapter._id}?courseId=${courseId}`}
                  >
                    <p className="text-sm font-bold break-all">{chapter.name}</p>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <EllipsisVertical className="p-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-12">
                      {/* Update Chapter */}
                      <Dialog
                        open={isChapterModalOpen}
                        onOpenChange={setIsChapterModalOpen}
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
                            onClose={handleChapterModalClose}
                          />
                        </DialogContent>
                      </Dialog>
                      {/* Delete Chapter */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <p
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
                              delete this chapter and remove its data.
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
        </>
      )}

      {/* Display all subjects */}
      {item?.subjects?.length > 0 && (
        <>

          {item.subjects.map((subject) => (
            <Card className="border bg-[#392d55] text-white border-gray-200" key={subject._id}>
              <Link to={`/subject-chapter/${subject._id}?courseId=${courseId}`}> <img
                src={subject.featuredImgUrl || Frame}
                alt={subject.name || "Subject Image"}
                className="w-full h-48 object-cover rounded-tl-md rounded-tr-md"
              /></Link>
              <CardContent className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/subject-chapter/${subject._id}?courseId=${courseId}`}
                  >
                    <p className="text-sm font-bold break-all">{subject.name}</p>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <EllipsisVertical className="p-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-12">
                      {/* Update Subject */}
                      <Dialog
                        open={isSubjectModalOpen}
                        onOpenChange={setIsSubjectModalOpen}
                      >
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <span>Update</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-h-screen min-w-[45%] overflow-auto">
                          <UpdateSubject
                            refetch={refetch}
                            subject={subject}
                            onClose={handleSubjectModalClose}
                          />
                        </DialogContent>
                      </Dialog>
                      {/* Delete Subject */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <p
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
                              delete this subject and remove its data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleSubjectDelete(subject?._id)}
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
        </>
      )}

      {/* Fallback if no data */}
      {!item?.chapters?.length && !item?.subjects?.length && (
        <p className="col-span-full text-center">
          No chapters or subjects available
        </p>
      )}
    </div>
  );
};

export default AllChapter;
