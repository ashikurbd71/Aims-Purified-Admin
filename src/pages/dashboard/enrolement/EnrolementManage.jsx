import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CloudUpload,
  Filter,
  Search,
  Book,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Facebook,
  DollarSign,
  Mail,
  Phone,
  User,
} from "lucide-react";

import useAxiosSecure from "@/hooks/useAxiosSecure";
import useEnrollmentData from "@/hooks/useEnrollmentData";
import useCourseData from "@/hooks/useCourseData";
import { AuthContext } from "@/contexts/AuthContext";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import ManuallEnroll from "../components/forms/enrollment/ManuallEnroll";
import BulkUpload from "../components/forms/enrollment/BulkUpload";

const EnrollmentManagement = () => {
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenBulk, setIsModalOpenBulk] = useState(false);

  // Data hooks
  const [enrollmentData, enrollmentRefetch] = useEnrollmentData();
  const [courseData] = useCourseData();
  const axiosSecure = useAxiosSecure();
  const { authdata } = useContext(AuthContext);

  // Initialize filtered data
  useEffect(() => {
    if (enrollmentData) {
      setFilteredEnrollments(enrollmentData);
    }
  }, [enrollmentData]);

  const getCourse = (courseId) =>
    courseData.find((course) => course._id === courseId);

  const getPrice = (enrollment) => {
    const course = getCourse(enrollment?.courseId);
    return formatCurrency(course?.discountedPrice ?? course?.price) || 0;
  };

  // Filter counts
  const statusCounts = useMemo(() => {
    if (!enrollmentData) return {};

    return enrollmentData.reduce(
      (counts, item) => {
        const status = item?.enrollment?.status || "UNKNOWN";
        counts[status] = (counts[status] || 0) + 1;

        // Count for Facebook approval needed
        if (item?.enrollment?.hasJoinedFb === false) {
          counts["NEED_APPROVAL_AT_FACEBOOK_GROUP"] =
            (counts["NEED_APPROVAL_AT_FACEBOOK_GROUP"] || 0) + 1;
        }

        return counts;
      },
      { TOTAL: enrollmentData.length }
    );
  }, [enrollmentData]);

  // Course counts
  const courseCounts = useMemo(() => {
    if (!enrollmentData) return {};

    return enrollmentData.reduce((counts, item) => {
      const courseId = item?.enrollment?.courseId || "UNKNOWN";
      counts[courseId] = (counts[courseId] || 0) + 1;
      return counts;
    }, {});
  }, [enrollmentData]);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...enrollmentData];

    // Filter by course
    if (selectedCourse !== "ALL") {
      filtered = filtered.filter(
        (item) => item?.enrollment?.courseId === selectedCourse
      );
    }

    // Filter by status
    if (selectedStatus === "NEED_APPROVAL_AT_FACEBOOK_GROUP") {
      filtered = filtered.filter(
        (item) => item?.enrollment?.hasJoinedFb === false
      );
    } else if (selectedStatus !== "ALL") {
      filtered = filtered.filter(
        (item) => item?.enrollment?.status === selectedStatus
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item?.student?.name?.toLowerCase().includes(query) ||
          item?.student?.email?.toLowerCase().includes(query) ||
          item?.enrollment?.accessKey?.toLowerCase().includes(query) ||
          item?.enrollment?.transactionId?.toLowerCase().includes(query)
      );
    }

    setFilteredEnrollments(filtered);
  }, [selectedCourse, selectedStatus, searchQuery, enrollmentData]);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [
    selectedCourse,
    selectedStatus,
    searchQuery,
    enrollmentData,
    applyFilters,
  ]);

  // Handle course filter change
  const handleCourseFilter = (courseId) => {
    setSelectedCourse(courseId);
  };

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalCloseBulk = () => {
    setIsModalOpenBulk(false);
  };

  // Handle Facebook approval
  const handleApproval = async (enrollmentId) => {
    try {
      const response = await axiosSecure.patch(`/enrollment/${enrollmentId}`, {
        hasJoinedFb: true,
        approvedBy: authdata?.name,
      });

      if (response.status === 200) {
        toast.success("Facebook group join request approved successfully!");
        enrollmentRefetch();
      } else {
        toast.error("Failed to approve join request.");
      }
    } catch (error) {
      toast.error(
        error.response?.message ||
        "An error occurred while approving the request."
      );
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return `৳${Number.parseFloat(amount).toLocaleString()}`;
  };

  // Get status badge
  const getStatusBadge = (status, hasJoinedFb) => {
    if (status === "NEED_APPROVAL_AT_FACEBOOK_GROUP" || hasJoinedFb === false) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Needs FB Approval
        </Badge>
      );
    }

    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Canceled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    // Function to add ordinal suffix (st, nd, rd, th)
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th"; // Covers 4th - 20th
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  // Get status icon
  const getStatusIcon = (status, hasJoinedFb) => {
    if (status === "NEED_APPROVAL_AT_FACEBOOK_GROUP" || hasJoinedFb === false) {
      return <Facebook className="h-4 w-4 text-blue-500" />;
    }

    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CANCELED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    // Create worksheet data
    const worksheetData = filteredEnrollments.map(
      ({ enrollment, student, course }) => {
        // Base data
        const rowData = {
          "Student Name": student?.name || "N/A",
          "Student Email": student?.email || "N/A",
          "Student Phone": student?.number || "N/A",
          "Course Name": course?.name || "N/A",
          Status:
            enrollment?.status === "NEED_APPROVAL_AT_FACEBOOK_GROUP"
              ? "Needs FB Approval"
              : enrollment?.status || "UNKNOWN",
          "Transaction ID": enrollment?.transactionId || "N/A",
          "Invoice Number": enrollment?.invoiceNumber || "N/A",
          "Payment Method": enrollment?.paymentMethod || "Bkash",
          "Original Price": getPrice(enrollment),
          "Discounted Amount":
            formatCurrency(enrollment?.discountedAmount) || 0,
          "Total Paid":
            formatCurrency(enrollment?.totalPriceToPay) ||
            formatCurrency(enrollment.earnedFromThisEnrollment) ||
            0,
          "Coupon Used": enrollment?.usedCoupon ? "Yes" : "No",
          "Enrollment Date": enrollment?.createdAt
            ? formatDate(enrollment.createdAt)
            : "N/A",
          "FB Group Joined": enrollment?.hasJoinedFb ? "Yes" : "No",
          "Approved By": enrollment?.approvedBy || "N/A",
        };

        // Add book information if available
        if (enrollment?.books && enrollment.books.length > 0) {
          enrollment.books.forEach((book, index) => {
            rowData[`Book ${index + 1} Name`] = book.name || "N/A";
            rowData[`Book ${index + 1} Original Price`] =
              formatCurrency(book.originalPrice) || "N/A";
            rowData[`Book ${index + 1} Discounted Price`] =
              formatCurrency(book.discountedPrice) || "N/A";
          });
        }

        return rowData;
      }
    );

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Student Name
      { wch: 25 }, // Student Email
      { wch: 15 }, // Student Phone
      { wch: 30 }, // Course Name
      { wch: 12 }, // Status
      { wch: 15 }, // FB Group Joined
      { wch: 20 }, // Transaction ID
      { wch: 15 }, // Invoice Number
      { wch: 15 }, // Payment Method
      { wch: 15 }, // Original Price
      { wch: 15 }, // Discounted Amount
      { wch: 15 }, // Total Paid
      { wch: 10 }, // Coupon Used
      { wch: 20 }, // Enrolled By
      { wch: 15 }, // Enrollment Date
      { wch: 15 }, // FB Approved By
    ];

    worksheet["!cols"] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollment Data");

    // Generate file name with date
    const fileName = `Enrollment_Report_${new Date().toISOString().split("T")[0]
      }.xlsx`;

    // Write file
    XLSX.writeFile(workbook, fileName);
    toast.success("Export successful!");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <CustomMetaTag title="Enrollment Management" />

      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Enrollment Management</h1>
          <p className="text-gray-600">
            Manage and track all student enrollments
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full flex items-center gap-2"
            onClick={exportToExcel}
          >
            <CloudUpload className="h-4 w-4" />
            Export
          </Button>

          {(authdata?.role === "ADMIN" || authdata?.role === "DEVELOPER") && (
            <Dialog open={isModalOpenBulk} onOpenChange={setIsModalOpenBulk}>
              <DialogTrigger asChild>
                <Button size="sm" className="px-3 rounded-full bg-black">
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-screen overflow-auto min-w-[45%]">
                <BulkUpload onClose={handleModalCloseBulk} />
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="px-3 rounded-full bg-black">
                Manual Enrollment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-screen overflow-auto min-w-[45%]">
              <ManuallEnroll onClose={handleModalClose} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{statusCounts.TOTAL || 0}</p>
              </div>
              <div className="bg-gray-200 p-2 rounded-full">
                <Filter className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-500">Pending</p>
                <p className="text-2xl font-bold">
                  {statusCounts.PENDING || 0}
                </p>
              </div>
              <div className="bg-yellow-200 p-2 rounded-full">
                <Clock className="h-5 w-5 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-500">Completed</p>
                <p className="text-2xl font-bold">
                  {statusCounts.COMPLETED || 0}
                </p>
              </div>
              <div className="bg-green-200 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-500">Need FB Approval</p>
                <p className="text-2xl font-bold">
                  {statusCounts.NEED_APPROVAL_AT_FACEBOOK_GROUP || 0}
                </p>
              </div>
              <div className="bg-blue-200 p-2 rounded-full">
                <Facebook className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-500">Canceled</p>
                <p className="text-2xl font-bold">
                  {statusCounts.CANCELED || 0}
                </p>
              </div>
              <div className="bg-red-200 p-2 rounded-full">
                <XCircle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative w-full md:w-1/3">
              <Input
                type="text"
                placeholder="Search by name, email, transaction ID..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />

            </div>

            <div className="flex flex-wrap gap-3">
              {/* Course Filter */}
              <div>
                <Label
                  htmlFor="course-filter"
                  className="text-sm font-medium mb-1 block"
                >
                  Course
                </Label>
                <select
                  id="course-filter"
                  value={selectedCourse}
                  onChange={(e) => handleCourseFilter(e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="ALL">All Courses</option>
                  {courseData?.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({courseCounts[course._id] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <Label
                  htmlFor="status-filter"
                  className="text-sm font-medium mb-1 block"
                >
                  Status
                </Label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="ALL">
                    All Status ({statusCounts.TOTAL || 0})
                  </option>
                  <option value="PENDING">
                    Pending ({statusCounts.PENDING || 0})
                  </option>
                  <option value="COMPLETED">
                    Completed ({statusCounts.COMPLETED || 0})
                  </option>
                  <option value="NEED_APPROVAL_AT_FACEBOOK_GROUP">
                    Need FB Approval (
                    {statusCounts.NEED_APPROVAL_AT_FACEBOOK_GROUP || 0})
                  </option>
                  <option value="CANCELED">
                    Canceled ({statusCounts.CANCELED || 0})
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <Badge variant="outline" className="text-sm">
              {filteredEnrollments.length} enrollments found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Accordion */}
      <Accordion type="single" collapsible className="w-full space-y-4">
        {filteredEnrollments.length > 0 ? (
          filteredEnrollments.map((item, index) => {
            const enrollment = item?.enrollment || {};
            const student = item?.student || {};
            const course = item?.course || {};
            const status =
              enrollment?.status === "NEED_APPROVAL_AT_FACEBOOK_GROUP"
                ? "Needs FB Approval"
                : enrollment?.status || "UNKNOWN";

            const hasJoinedFb = enrollment?.hasJoinedFb || false;
            const needsFbApproval =
              status === "NEED_APPROVAL_AT_FACEBOOK_GROUP" || !hasJoinedFb;

            return (
              <AccordionItem
                key={enrollment._id || index}
                value={`enrollment-${enrollment._id || index}`}
                className={`border rounded-lg overflow-hidden ${status === "PENDING"
                  ? "border-yellow-200 bg-yellow-50"
                  : status === "NEED_APPROVAL_AT_FACEBOOK_GROUP" ||
                    !hasJoinedFb
                    ? "border-blue-200 bg-blue-50"
                    : status === "COMPLETED"
                      ? "border-green-200 bg-green-50"
                      : status === "CANCELED"
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex flex-col md:flex-row justify-between w-full gap-2">
                    <div className="font-medium text-left flex items-center gap-2">
                      {getStatusIcon(status, hasJoinedFb)}
                      {student?.name || "Unknown Student"}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(status, hasJoinedFb)}
                      <Badge variant="outline" className="bg-gray-100">
                        {course?.name || "Unknown Course"}
                      </Badge>
                      {enrollment?.paymentMethod && (
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-800"
                        >
                          {enrollment.paymentMethod}
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    {/* Student Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Student Information
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Name:</span>
                          <span>{student?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{student?.email || "No email available"}</span>
                        </div>
                        {student?.number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{student.number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Book className="h-4 w-4 text-gray-500" />
                        Course Information
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Course:</span>
                          <span>{course?.name || "N/A"}</span>
                        </div>
                        {enrollment?.FBGroupLink && (
                          <div className="flex items-center gap-2">
                            <Facebook className="h-4 w-4 text-blue-500" />
                            <a
                              href={enrollment.FBGroupLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Facebook Group
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        Payment Information
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Status:</span>
                          <span>{status}</span>
                          {hasJoinedFb && (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 ml-2"
                            >
                              FB Group Joined
                            </Badge>
                          )}
                        </div>
                        {enrollment?.invoiceNumber && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Invoice:</span>
                            <span>{enrollment.invoiceNumber}</span>
                          </div>
                        )}
                        {enrollment?.transactionId && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Transaction ID:</span>
                            <span>{enrollment.transactionId}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Payment Method:</span>
                          <span>{enrollment?.paymentMethod || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Original Price:</span>
                          <span>{getPrice(enrollment)}</span>
                        </div>
                        {enrollment?.discountedAmount > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Discount:</span>
                            <span>
                              {formatCurrency(enrollment?.discountedAmount)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Total Paid:</span>
                          <span className="font-semibold">
                            {formatCurrency(enrollment?.totalPriceToPay)}
                          </span>
                        </div>
                        {enrollment?.usedCoupon && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Coupon Used:</span>
                            <span>{enrollment?.couponCode || "Yes"}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">
                        Additional Information
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {enrollment?.enrolledBy && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Enrolled By:</span>
                            <span>{enrollment.enrolledBy}</span>
                          </div>
                        )}
                        {enrollment?.approvedBy && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Approved By:</span>
                            <span>{enrollment.approvedBy}</span>
                          </div>
                        )}
                        {enrollment?.createdAt && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Enrollment Date:
                            </span>
                            <span>{formatDate(enrollment.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Books Information (if available) */}
                  {enrollment?.books && enrollment.books.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Book className="h-4 w-4 text-gray-500" />
                        Books Included
                      </h3>
                      <div className="grid gap-3">
                        {enrollment.books.map((book, bookIndex) => (
                          <div
                            key={book.bookId || bookIndex}
                            className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white rounded-lg border"
                          >
                            <div className="font-medium">{book.name}</div>
                            <div className="flex items-center gap-4 mt-2 md:mt-0">
                              <div className="text-sm">
                                <span className="text-gray-500">
                                  Original:{" "}
                                </span>
                                <span className="line-through">
                                  {formatCurrency(book.originalPrice)}
                                </span>
                              </div>
                              <div className="text-sm font-semibold">
                                <span className="text-gray-500">
                                  Discounted:{" "}
                                </span>
                                <span>
                                  {formatCurrency(book.discountedPrice)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}

                  {(enrollment?.status === "PENDING" || enrollment?.hasJoinedFb === false) && (
                    <div className="flex justify-end mt-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleApproval(enrollment._id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Approve FB Join Request
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Approve Facebook group join request
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}


                </AccordionContent>
              </AccordionItem>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No enrollments found matching your filters.
          </div>
        )}
      </Accordion >
    </div >
  );
};

export default EnrollmentManagement;
