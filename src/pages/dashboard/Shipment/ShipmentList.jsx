import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  Book,
  Gift,
  Package,
  Shirt,
} from "lucide-react";

import useShipmentData from "@/hooks/useShipmentData";
import useBookData from "@/hooks/useBookData";
import useStudentData from "@/hooks/useStudentData";
import useCourseData from "@/hooks/useCourseData";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import User from "@/hooks/userData";
import CustomMetaTag from "@/components/global/CustomMetaTags";

const ShipmentList = () => {
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter states
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedBooks, setSelectedBooks] = useState([]);

  const axiosSecure = useAxiosSecure();
  const [deliveryData, deliveryRefetch] = useShipmentData();
  const [bookData] = useBookData();
  const [studentData] = useStudentData();
  const [courseData] = useCourseData();

  const { userData } = User();

  // Initialize filtered data
  useEffect(() => {
    if (deliveryData) {
      setFilteredDeliveries(deliveryData);
    }
  }, [deliveryData]);

  // Get student details by ID
  const getStudentDetails = (studentId) => {
    return studentData?.find((student) => student._id === studentId) || {};
  };

  // Get course details by ID
  const getCourseDetails = (courseId) => {
    return courseData?.find((course) => course._id === courseId) || {};
  };

  // Get book details by ID
  const getBookDetails = (bookId) => {
    return bookData?.find((book) => book._id === bookId) || {};
  };




  // Get book names from IDs
  const getBookNames = (bookIds) => {
    if (!bookIds || !bookIds.length) return "No books";
    return bookIds
      .map((id) => getBookDetails(id)?.name || "Unknown book")
      .join(", ");
  };

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...deliveryData];

    // Filter by delivery type
    if (selectedType !== "ALL") {
      filtered = filtered.filter((delivery) => delivery.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter(
        (delivery) => delivery.status === selectedStatus
      );
    }

    // Filter by books
    if (selectedBooks.length > 0) {
      filtered = filtered.filter((delivery) => {
        // Only apply book filter to deliveries that have books
        if (!delivery.books || delivery.books.length === 0) return false;

        // Check if delivery has all selected books
        return selectedBooks.every((bookId) => delivery.books.includes(bookId));
      });
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((delivery) => {
        const student = getStudentDetails(delivery.student);
        return (
          student?.name?.toLowerCase().includes(query) ||
          student?.email?.toLowerCase().includes(query) ||
          student?.number?.toLowerCase().includes(query) ||
          delivery?.address?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredDeliveries(filtered);
  };

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [selectedType, selectedStatus, selectedBooks, searchQuery, deliveryData]);

  // Handle book selection
  const handleBookSelection = (bookId) => {
    setSelectedBooks((prev) => {
      if (prev.includes(bookId)) {
        return prev.filter((id) => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  // Handle delivery status update
  const handleUpdateDelivery = async (deliveryId) => {
    try {
      const response = await axiosSecure.patch(`/delivery/${deliveryId}`, {
        status: "DELIVERED",
        deliveredBy: userData?.name,
      });

      if (response.status === 200) {
        toast.success("Delivery status updated successfully!");
        deliveryRefetch();
      } else {
        toast.error("Failed to update delivery status.");
      }
    } catch (error) {
      toast.error(
        error.response?.message ||
        "An error occurred while updating delivery status."
      );
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredDeliveries.map((delivery) => {
      const student = getStudentDetails(delivery.student);
      const course = getCourseDetails(delivery.course);

      return {
        "Student Name": student?.name || "N/A",
        "Student Email": student?.email || "N/A",
        "Student Phone": student?.number || "N/A",
        Course: course?.name || "N/A",
        "Delivery Type": delivery.type || "N/A",
        "T-Shirt Size": delivery.tShirtSize || "N/A",
        Books: getBookNames(delivery.books),
        Status: delivery.status || "N/A",
        Address: delivery.address || "N/A",
        "Created At":
          new Date(delivery.createdAt).toLocaleDateString() || "N/A",
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deliveries");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Save file
    saveAs(
      data,
      `Delivery-Report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Export successful!");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <CustomMetaTag title="Delivery Management" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Delivery Management</h1>
        <p className="text-gray-600">
          Manage and track all deliveries in one place
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Search by name, email, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />

          </div>

          <div className="flex flex-wrap gap-3">
            {/* Type Filter */}
            <div>
              <Label
                htmlFor="type-filter"
                className="text-sm font-medium mb-1 block"
              >
                Delivery Type
              </Label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="ALL">All Types</option>
                <option value="GIFTS">Only Gifts</option>
                <option value="BOOKS">Only Books</option>
                <option value="BOOKS_AND_GIFTS">Books & Gifts</option>
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
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={exportToExcel}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Book Filters */}
        {(selectedType === "BOOKS" ||
          selectedType === "BOOKS_AND_GIFTS" ||
          selectedType === "ALL") && (
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                Filter by Books
              </Label>
              <div className="flex flex-wrap gap-2">
                {bookData?.map((book) => (
                  <div key={book._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`book-${book._id}`}
                      checked={selectedBooks.includes(book._id)}
                      onCheckedChange={() => handleBookSelection(book._id)}
                    />
                    <label
                      htmlFor={`book-${book._id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {book.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Results Count */}
        <div className="mb-4">
          <Badge variant="outline" className="text-sm">
            {filteredDeliveries.length} deliveries found
          </Badge>
        </div>
      </Card>

      {/* Deliveries Accordion */}
      <Accordion type="single" collapsible className="w-full space-y-4">
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery, index) => {
            const student = getStudentDetails(delivery.student);
            const course = getCourseDetails(delivery.course);

            return (
              <AccordionItem
                key={delivery._id || index}
                value={`delivery-${delivery._id || index}`}
                className={`border rounded-lg overflow-hidden ${delivery.status === "PENDING"
                  ? "border-amber-200 bg-amber-50"
                  : "border-green-200 bg-green-50"
                  }`}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex flex-col md:flex-row justify-between w-full gap-2">
                    <div className="font-medium text-left">
                      {student?.name || "Unknown Student"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          delivery.status === "PENDING"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {delivery.status}
                      </Badge>
                      <Badge variant="outline">{delivery.type}</Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Student Information */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">
                        Student Information
                      </h3>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{student?.email || "No email available"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{student?.number || "No Phone available"}</span>
                      </div>
                    </div>

                    {/* Course Information */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">
                        Course Information
                      </h3>
                      <div className="flex items-center gap-2">
                        <span>{course?.name || "No course information"}</span>
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">
                        Delivery Details
                      </h3>
                      {(delivery.type === "GIFTS" ||
                        delivery.type === "BOOKS_AND_GIFTS") && (
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-gray-500" />
                            <span>T-Shirt Size: {delivery.tShirtSize}</span>
                          </div>
                        )}

                      {(delivery.type === "BOOKS" ||
                        delivery.type === "BOOKS_AND_GIFTS") &&
                        delivery.books?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Book className="h-4 w-4 text-gray-500 mt-1" />
                            <div>
                              <span className="font-medium">Books:</span>
                              <ul className="list-disc pl-5 mt-1">
                                {delivery.books.map((bookId) => (
                                  <li key={bookId}>
                                    {getBookDetails(bookId)?.name ||
                                      "Unknown book"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <span>
                          {delivery.address || "No address available"}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Status */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">T-Shirt </h3>

                      {delivery.tShirtSize && (
                        <div className="flex items-center gap-2">
                          <Shirt className="h-4 w-4 text-gray-500" />
                          <span>Size: {delivery.tShirtSize}</span>
                        </div>
                      )}


                    </div>


                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Delivery Status</h3>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span>Status: {delivery.status}</span>
                      </div>
                      {delivery.deliveredBy && (
                        <div>
                          <span className="text-sm text-gray-500">
                            Delivered by: {delivery.deliveredBy}
                          </span>
                        </div>
                      )}


                    </div>


                  </div>
                  {delivery?.books && delivery.books.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Book className="h-4 w-4 text-gray-500" />
                        Books Included
                      </h3>
                      <div className="grid gap-3">
                        {bookData
                          .filter((i) => delivery.books.includes(i._id)) // Ensure correct filtering
                          .map((book, bookIndex) => (
                            <div
                              key={book.bookId || bookIndex}
                              className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white rounded-lg border"
                            >
                              <div className="font-medium">{book.name}</div>
                              <div className="flex items-center gap-4 mt-2 md:mt-0">

                                <div className="text-sm font-semibold">
                                  <span className="text-gray-500">Price: </span>
                                  <span>
                                    {book.price}৳
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {delivery.status === "PENDING" && (
                    <div className="flex justify-end mt-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleUpdateDelivery(delivery._id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark as Delivered
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Update delivery status to DELIVERED
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
            No deliveries found matching your filters.
          </div>
        )}
      </Accordion>
    </div>
  );
};

export default ShipmentList;
