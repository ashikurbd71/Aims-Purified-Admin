import { Button } from "@/components/ui/button";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import AddNewNotice from "../components/forms/notice/AddNewNotice";
import NoticeUpdate from "../components/update/forms/notice/NoticeUpdate";
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
import { Bell, Pen, Plus, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import { toast } from "sonner";
import useNoticeData from "@/hooks/useNoticeData";

const NoticeManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const axiosSecure = useAxiosSecure()
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleUpdateModal = () => {
    setIsUpdateModal(false);
  };

  const [noticeData, noticeRefetch] = useNoticeData();

  // Delete Functionality
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await axiosSecure.delete(`/notice/${id}`);
      if (response.status === 200) {
        toast.success("Notice deleted successfully!");
        noticeRefetch();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error(
        "Failed to delete Notice. Please try again. Error " +
        error.response.message
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <CustomMetaTag title={"Notice  List"} />

      <div>
        <div className="flex items-center lg:flex-row flex-col gap-5 lg:gap-0 justify-between">
          <div>
            <p className="text-xl font-medium text-gray-600">All Notices</p>
          </div>

          {/* dialog for add notice */}

          <div>
            {" "}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger>
                <Button size={"sm"} className={"rounded-3xl"}>
                  Add Notice
                  <Plus />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-screen overflow-auto">
                <AddNewNotice
                  refetch={noticeRefetch}
                  onClose={handleModalClose}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Notice */}
        <div className="mt-6">
          <Accordion type="single" collapsible>
            {noticeData?.map((notice, index) => (
              <AccordionItem
                key={index}
                value={`item-${index + 1}`}
                className="bg-[#F0FDF4] border-b-0 border border-green-200 rounded-2xl px-3 mb-4"
              >
                <AccordionTrigger>
                  <div className="flex">
                    <div>
                      <h2 className="font-semibold flex items-center gap-2">
                        <span className="bg-green-500 h-5 w-5 rounded-full flex items-center justify-center p-1 mt-1">
                          <Bell className="text-gray-100" />
                        </span>
                        {notice.title}
                      </h2>
                      <p className="text-gray-600 text-sm text-start font-semibold pl-7">
                        {notice.time}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center justify-between">
                    {/* Description */}
                    {notice.description}
                    <div className="flex items-center gap-2">
                      {/* update */}
                      <Dialog
                        open={isUpdateModal}
                        onOpenChange={setIsUpdateModal}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <DialogTrigger className="mt-2">
                                <Pen className="p-1" />
                              </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Update</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <DialogContent className="max-h-screen overflow-auto">
                          <NoticeUpdate
                            refetch={noticeRefetch}
                            noticeData={notice?._id}
                            onClose={handleUpdateModal}
                          />
                        </DialogContent>
                      </Dialog>

                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="hover:text-red-500"
                            disabled={isDeleting}
                          >
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
                              permanently delete your notice.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(notice?._id)}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-500"
                            >
                              {isDeleting ? "Deleting..." : "Yes, Delete it!"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </>
  );
};

export default NoticeManagement;
