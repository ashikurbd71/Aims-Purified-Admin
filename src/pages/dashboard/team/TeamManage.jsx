import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  BadgeCheck,
  Ban,
  CloudUpload,
  EllipsisVertical,
  Eye,
  Pen,
  Plus,
  Trash,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddNewUser from "../components/forms/team/AddNewUser";
import TeamUpdate from "../components/update/forms/team/UserUpdate";
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
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import { toast } from "sonner";
import Loading from "@/components/global/Loading";
import { AuthContext } from "@/contexts/AuthContext";
import avatar from "/male.png";
const TeamManage = () => {
  const [filteredProducts, setFilteredProducts] = useState();
  const axiosSecure = useAxiosSecure()
  const [isModalOpen, setIsModalOpen] = React.useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const handleAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleModalOpen = (id) => {
    setIsModalOpen(id); // Set the specific ID for the open modal
  };

  const handleModalClose = () => {
    setIsModalOpen(null); // Close any open modal
  };

  // Tanstack Query. Uncomment when use this Function

  const {
    data: item,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["teamManagement"],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get("/admin");
        res.data;
        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
  });
  console.log(item);

  // Delete Functionality
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await axiosSecure.delete(`/admin/${id}`);
      if (response.status === 200) {
        toast.success("Admin  deleted successfully!");
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

  // ban functionality

  const [isBan, setIsBan] = useState(false);

  const handleBan = async (data) => {
    setIsBan(true);
    try {
      const response = await axiosSecure.patch(`/admin/ban/${data?._id}`);

      if (response.status === 200) {
        const action = data?.isBanned === false ? "Banned" : "Actived";
        toast.success(`Admin ${action} successfully!`);
        refetch();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("User doesn't exist... 😅!");
      } else if (error.response?.status === 500) {
        toast.error("Server Error... 😅!");
      } else {
        toast.error("An unexpected error occurred.");
      }
      refetch(); // Still attempt to refresh the state
    } finally {
      setIsBan(false);
    }
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    const selectedFields = item.map(({ name, email, role, phoneNumber, isBanned, dateOfBirth, bio }) => ({
      Name: name,
      Email: email,
      Role: role,
      Phone: phoneNumber,
      DateOfBirth: new Date(dateOfBirth).toLocaleDateString("en-GB"),
      Bio: bio,
    }));
    const worksheet = XLSX.utils.json_to_sheet(selectedFields);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Team Data");
    XLSX.writeFile(workbook, "TeamData.xlsx");
  };

  // Set items to show data before search functionality
  useEffect(() => {
    if (item?.length > 0) {
      setFilteredProducts(item);
    }
  }, [item]);

  // Search function
  const handleSearch = (e) => {
    const query = e?.target?.value?.toLowerCase();
    if (query === "") {
      setFilteredProducts(item);
    } else {
      const filtered = item.filter((option) => {
        return (
          option?.name?.toLowerCase().includes(query) ||
          option?.phoneNumber?.toLowerCase().includes(query) ||
          option?.email?.toLowerCase().includes(query)
        );
      });
      setFilteredProducts(filtered);
    }
  };

  const { authdata } = useContext(AuthContext);
  return (
    <>
      <CustomMetaTag title={"Members  List"} />
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 ">
        <h1 className="text-2xl text-gray-600">Team Management</h1>
        {/* Export and Add User button */}

        <div className="flex gap-2  ">
          <Button
            variant={"outline"}
            size={"sm"}
            className={"rounded-3xl"}
            onClick={exportToExcel}
          >
            <CloudUpload />
            Export
          </Button>

          {/* dialog for add user */}

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger>
              {["ADMIN", "DEVELOPER"].includes(authdata?.role) && (
                <Button
                  variant={"default"}
                  size={"sm"}
                  className={"rounded-3xl"}
                >
                  <Plus />
                  Add New User
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="max-h-screen overflow-auto">
              <AddNewUser refetch={refetch} onClose={handleAddModal} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="border rounded-3xl mt-6">
        {/* Manage Team Header section */}
        <div className="p-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-1 space-y-2">
          <div>
            <div className="flex items-center gap-2 ">
              <h1 className="text-lg font-bold">My Teams </h1>
              <span className="bg-gray-100 dark:text-gray-700 px-2 rounded-3xl text-sm font-semibold">
                {item?.length} Total
              </span>
            </div>
            <p className="text-gray-600 ">
              You can manage your team here seamlessly.
            </p>
          </div>
          <div className="flex items-center justify-center  mb-4">
            <div className="w-full">
              {/* Search Input */}
              <input
                type="text"
                onChange={handleSearch}
                placeholder="Search... "
                className="border border-gray-300 rounded-s-xl rounded-e-0 px-4 py-2 w-full"
              />
            </div>
            <div className="text-gray-50 font-medium border-[1.1px] border-gray-500  px-4 py-2 rounded-e-xl border-l-0 bg-gray-500  ">
              Search
            </div>
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
                    Full Name
                  </TableHead>
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Join Date
                  </TableHead>
                  <TableHead className="text-gray-800 dark:text-gray-100 font-bold border-r">
                    Role
                  </TableHead>
                  <TableHead className="text-gray-800 text-center dark:text-gray-100 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              {filteredProducts?.length > 0 ? (
                <TableBody>
                  {filteredProducts?.map((member) =>
                    member?.email !== authdata?.email ? (
                      <TableRow key={member._id}>
                        <TableCell className="flex items-center gap-3 border-r">
                          <img
                            src={member?.photoURL || avatar}
                            alt={`${member?.name}'s profile`}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-semibold">{member?.name}</p>
                            <p className="text-gray-600">{member?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="border-r">
                          {member.createdAt?.split("T")[0]}
                        </TableCell>
                        <TableCell className="border-r">
                          {member.role}
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-2 items-center justify-center">
                            {/* Ban/Unban */}

                            {["ADMIN", "DEVELOPER"].includes(
                              authdata?.role
                            ) && (
                                <AlertDialog>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <AlertDialogTrigger>
                                        <TooltipTrigger>
                                          {member?.isBanned === false ? (
                                            <Ban className="p-1 text-red-500 mt-1" />
                                          ) : (
                                            <BadgeCheck className="p-1 text-green-500 mt-1" />
                                          )}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {member?.isBanned === false ? (
                                            <p>Ban</p>
                                          ) : (
                                            <p>Active</p>
                                          )}
                                        </TooltipContent>
                                      </AlertDialogTrigger>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you absolutely sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-black dark:text-gray-200">
                                        This action will{" "}
                                        {member?.isBanned === false
                                          ? "ban"
                                          : "activate"}{" "}
                                        this Team member.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleBan(member)}
                                        disabled={isBan}
                                        className={`p-4 text-white rounded ${member?.isBanned === false
                                          ? "bg-red-600 hover:bg-red-500"
                                          : "bg-green-500 hover:bg-green-500"
                                          }`}
                                      >
                                        {member?.isBanned === false
                                          ? "Yes, Ban it!"
                                          : "Yes, Activate it!"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                            {/* View Details */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Link to={`/member-details/${member?._id}`}>
                                    <Eye className="p-1" />
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Update */}

                            {["ADMIN", "DEVELOPER"].includes(
                              authdata?.role
                            ) && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Dialog
                                        open={isModalOpen === member?._id} // Check if the current modal is open
                                        onOpenChange={(open) => {
                                          if (open) {
                                            handleModalOpen(member?._id); // Open specific modal
                                          } else {
                                            handleModalClose(); // Close modal
                                          }
                                        }}
                                      >
                                        <DialogTrigger asChild>
                                          <Pen className="p-1" />
                                        </DialogTrigger>
                                        <DialogContent className="max-h-screen overflow-auto">
                                          <TeamUpdate
                                            refetch={refetch}
                                            teamData={member?._id}
                                            onClose={handleModalClose}
                                          />
                                        </DialogContent>
                                      </Dialog>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Update</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                            {/* Delete */}

                            {["ADMIN", "DEVELOPER"].includes(
                              authdata?.role
                            ) && (
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
                                        permanently delete your account and remove
                                        your data from our servers.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel disabled={isDeleting}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(member?._id)}
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
                    ) : null
                  )}

                  {/* if no products */}
                  {/* <TableRow className="">
                  <TableCell colSpan={4}>
                    <div className="flex items-center justify-between  pr-16 pl-2  ">
                      <div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#" isActive>
                                2
                              </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">99</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationNext href="#" />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                      <p className="text-left font-semibold">
                        Showing 100 of 1,000 results
                      </p>
                    </div>
                  </TableCell>
                </TableRow> */}
                </TableBody>
              ) : (
                <p>{""}</p>
              )}
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default TeamManage;
