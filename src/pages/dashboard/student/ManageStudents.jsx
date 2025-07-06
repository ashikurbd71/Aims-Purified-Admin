import { useContext, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import * as XLSX from "xlsx";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import { AuthContext } from "@/contexts/AuthContext";
import avatar from "/male.png";
import useStudentData from "@/hooks/useStudentData";
import useCourseData from "@/hooks/useCourseData";

const ManageStudents = () => {
  const [studentData, studentRefetch] = useStudentData();
  const [courseData] = useCourseData();
  const [filteredOptions, setFilteredOptions] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isBan, setIsBan] = useState(false);
  const { authdata } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure()
  // set items to show data before search functionality
  useEffect(() => {
    if (studentData) {
      setFilteredOptions(studentData);
    }
  }, [studentData]);

  // Function to export data to Excel
  const exportToExcel = () => {
    const selectedFields = studentData.map(
      ({ name, email, number, institution, address, HSCBatch }) => ({
        Name: name,
        Email: email,
        Phone: number,
        Address: address,
        Institution: institution,
        HSCBatch: HSCBatch,
      })
    );
    const worksheet = XLSX.utils.json_to_sheet(selectedFields);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");
    XLSX.writeFile(workbook, "StudentData.xlsx");
  };

  // Search function
  const handleSearch = (e) => {
    const query = e?.target?.value?.toLowerCase();
    if (query === "") {
      setFilteredOptions(studentData);
    } else {
      const filtered = studentData.filter(
        (option) =>
          option?.name?.toLowerCase().includes(query) ||
          option?.number?.toLowerCase().includes(query) ||
          option?.email?.toLowerCase().includes(query)
      );
      setFilteredOptions(filtered);
    }
  };

  const handleBan = async (data) => {
    const studentId = data?._id;
    try {
      setIsBan(true);
      const response = await axiosSecure.patch(`/student/ban`, {
        studentId: studentId,
      });

      if (response.status === 200) {
        const action = data?.isBanned === false ? "Banned" : "Unbanned";
        toast.success(`Student ${action} successfully!`);
        studentRefetch();
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
      studentRefetch(); // Still attempt to refresh the state
    } finally {
      setIsBan(false);
    }
  };

  // Sign out from all devices
  const handleSignOutFromAllDevices = async (id) => {
    setIsLoading(true);
    try {
      const response = await axiosSecure.get(`/student/sign-out/${id}`);

      if (response.status === 200) {
        toast.success(`Signed out from all devices!`);
        studentRefetch();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      // Handle errors
      if (error.response?.status === 404) {
        toast.error("Currently the use isn't signed in any device!!!");
      } else if (error.response?.status === 500) {
        toast.error("Server Error... 😅!");
      } else {
        toast.error("An unexpected error occurred.");
      }
      studentRefetch(); //
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <>
      <CustomMetaTag title={"Student List"} />

      <div>
        <div className="flex items-center lg:flex-row flex-col lg:gap-0 gap-5  justify-between">
          <h1 className="text-2xl text-gray-600">Manage Students</h1>
          <Button
            variant={"outline"}
            size={"sm"}
            className={"rounded-3xl"}
            onClick={exportToExcel}
          >
            <CloudUpload />
            Export
          </Button>
        </div>
        {/* student section */}
        <div className="border rounded-2xl mt-6">
          <div className="px-6 py-4 flex flex-col md:flex-row items-start space-y-2 md:items-center justify-between">
            <div>
              <div className="flex items-center gap-2 ">
                <h1 className="text-lg font-bold">Students </h1>
                <span className="bg-gray-100 dark:text-gray-700 px-2 rounded-3xl text-sm font-semibold">
                  {studentData?.length} Total
                </span>
              </div>
              <p className="text-gray-600 ">
                You can manage students here seamlessly
              </p>
            </div>
            <div className="flex flex-row-reverse items-center gap-2">
              <div className="flex items-center justify-center ">
                <div className="w-full">
                  {/* Search Input */}
                  <input
                    type="text"
                    onChange={handleSearch}
                    placeholder="Search..."
                    className="border border-gray-300 rounded-s-xl rounded-e-0 px-4 py-2 w-full"
                  />
                </div>
                <div className="text-gray-50 font-medium border-[1.1px] border-gray-500  px-4 py-2 rounded-e-xl border-l-0 bg-gray-500  ">
                  Search
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto px-2">
            <Accordion type="single" collapsible>
              {filteredOptions?.map((student, index) => (
                <AccordionItem
                  key={index}
                  value={`item - ${index + 1}`}
                  className="bg-[#F0FDF4] border-b-0 border border-green-200 rounded-2xl px-3 mb-4"
                >
                  <AccordionTrigger>
                    <div className="flex flex-col">
                      <div className="text-start flex items-center gap-2">
                        <img
                          src={avatar}
                          alt="image"
                          className="h-8 w-8 rounded-full border"
                        />
                        <h2 className="font-bold ">{student?.name}</h2>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 grid-cols-1 pb-3 gap-2">
                      <p className="font-semibold">
                        HSC Batch:{" "}
                        <span className="font-normal">{student.HSCBatch}</span>
                      </p>
                      <p className="font-semibold">
                        Phone:{" "}
                        <span className="font-normal">{student.number}</span>
                      </p>
                      <p className="font-semibold">
                        Email:{" "}
                        <span className="font-normal">{student.email}</span>
                      </p>
                      <p className="font-semibold">
                        Address:{" "}
                        <span className="font-normal">{student.address}</span>
                      </p>

                      <p className="font-semibold">
                        Institution Name:{" "}
                        <span className="font-normal">
                          {student.institution || "N/A"}
                        </span>
                      </p>

                      {student?.courses.length > 0 && (
                        <div className="font-semibold flex flex-col items-start">
                          <h1>Currently Enrolled:</h1>
                          <div className="pl-2 flex flex-col gap-2">
                            {courseData?.map((course, index) => {
                              // Check if the course is included in the student's courses
                              const isEnrolled = student.courses?.some(
                                (studentCourse) => studentCourse === course._id
                              );

                              // Render only if the student is enrolled in the course
                              if (isEnrolled) {
                                return (
                                  <span
                                    key={course._id}
                                    className="font-normal"
                                  >
                                    {index + 1}. {course.name}
                                  </span>
                                );
                              }

                              return null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <div></div>
                      <div className="">
                        {/* bn */}

                        <AlertDialog>
                          <div className="flex space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <AlertDialogTrigger>
                                  <TooltipTrigger>
                                    {student?.isBanned === false ? (
                                      <div className=" rounded-lg bg-red-500 text-white font-semibold border px-5  p-2">
                                        Ban
                                      </div>
                                    ) : (
                                      <div className=" rounded-lg bg-green-500 text-white font-semibold border   p-2">
                                        Active
                                      </div>
                                    )}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {student?.isBanned === false ? (
                                      <p>Ban</p>
                                    ) : (
                                      <p>Active</p>
                                    )}
                                  </TooltipContent>
                                </AlertDialogTrigger>
                              </Tooltip>
                            </TooltipProvider>

                            {/* signout button disabled */}
                            {["ADMIN", "DEVELOPER"].includes(
                              authdata?.role
                            ) && (
                                <button
                                  className={`rounded-lg bg-red-500 text-white font-semibold border p-2 ${isLoading
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:bg-red-600"
                                    } `}
                                  disabled={isLoading}
                                  onClick={() =>
                                    handleSignOutFromAllDevices(student._id)
                                  } // Attach the handler function
                                >
                                  {isLoading
                                    ? "Processing..."
                                    : "Sign out from all devices"}
                                </button>
                              )}
                          </div>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription className=" text-black dark:text-gray-200">
                                This action will{" "}
                                {student?.isBanned === false ? "Ban" : "Unban"}{" "}
                                this Student.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleBan(student)}
                                disabled={isBan}
                                className={`${student?.isBanned === false
                                  ? "bg-red-600 hover:bg-red-500"
                                  : "bg-green-500 hover:bg-green-500"
                                  } p - 4 text - white rounded`}
                              >
                                {student?.isBanned === false
                                  ? "Yes, Ban him!"
                                  : "Yes, Unban him!"}
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
      </div>
    </>
  );
};

export default ManageStudents;
