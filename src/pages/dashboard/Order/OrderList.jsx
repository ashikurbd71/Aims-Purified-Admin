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
    Download,
    Phone,
    Mail,
    MapPin,
    Book,
    Gift,
    Package,
    Shirt,
} from "lucide-react";


import useAxiosSecure from "@/hooks/useAxiosSecure";
// import User from "@/hooks/userData";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import useOrderData from "@/hooks/useOrderData"; // Assuming this now fetches the JSON structure

const OrderList = () => {

    const [orderData, orderRefetch] = useOrderData()

    console.log(orderData)
    // Renamed from filteredDeliveries to filteredOrders for consistency
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter states
    const [selectedType, setSelectedType] = useState("ALL"); // Possible types: "ALL", "BOOKS", "GIFTS", "BOOKS_AND_GIFTS", "OTHER"
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedBookProductIds, setSelectedBookProductIds] = useState([]); // To filter by specific product IDs if they are books

    const axiosSecure = useAxiosSecure();
    // const { userData } = User();
    // Assuming enrollmentData contains your order data, and enrollmentRefetch can re-fetch it


    // State to hold unique "book" products for filtering checkboxes
    const [uniqueBookProducts, setUniqueBookProducts] = useState([]);

    // --- Helper Functions to infer data from the new JSON structure ---

    // Function to determine order type based on products
    const getOrderType = (products) => {
        let hasBooks = false;
        let hasGifts = false; // Assuming gifts are things like T-shirts

        for (const product of products) {
            const productName = product.name?.toLowerCase() || "";
            const productDescription = product.description?.toLowerCase() || "";

            // Simple heuristic to detect books
            if (productName.includes("book") || productName.includes("বই")) {
                hasBooks = true;
            }

            // Simple heuristic to detect gifts (e.g., t-shirts)
            if (
                productName.includes("t-shirt") ||
                productName.includes("shirt") ||
                productName.includes("gift") ||
                productDescription.includes("t-shirt") ||
                productDescription.includes("shirt") ||
                productDescription.includes("gift")
            ) {
                hasGifts = true;
            }
        }

        if (hasBooks && hasGifts) return "BOOKS_AND_GIFTS";
        if (hasBooks) return "BOOKS";
        if (hasGifts) return "GIFTS";
        return "OTHER"; // Default for orders with other types of products
    };

    // Function to extract t-shirt size (if available in product description/name)
    const getTShirtSize = (products) => {
        for (const product of products) {
            const productName = product.name?.toLowerCase() || "";
            const productDescription = product.description?.toLowerCase() || "";

            // Look for common size indicators
            const sizeMatch =
                productName.match(/\b(s|m|l|xl|xxl|small|medium|large|x-large)\b/) ||
                productDescription.match(/\b(s|m|l|xl|xxl|small|medium|large|x-large)\b/);

            if (sizeMatch) {
                return sizeMatch[0].toUpperCase(); // Return the matched size
            }
        }
        return null;
    };


    // Determine unique book products for filtering checkboxes
    useEffect(() => {
        if (orderData) {
            const books = new Set();
            orderData.forEach(order => {
                order.products.forEach(product => {
                    const productName = product.name?.toLowerCase() || "";
                    if (productName.includes("book") || productName.includes("বই")) {
                        // Store product ID and name to display in checkbox
                        books.add(JSON.stringify({ _id: product.id, name: product.name }));
                    }
                });
            });
            setUniqueBookProducts(Array.from(books).map(item => JSON.parse(item)));
        }
    }, [orderData]);


    // --- Filtering Logic ---
    useEffect(() => {
        if (!orderData) return; // Ensure data is loaded

        let currentFilteredOrders = [...orderData];

        // Apply Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            currentFilteredOrders = currentFilteredOrders.filter((order) => {
                const customerName = order.customerName?.toLowerCase() || "";
                const customerEmail = order.user?.email?.toLowerCase() || "";
                const customerAddress = order.customerAddress?.toLowerCase() || "";

                return (
                    customerName.includes(query) ||
                    customerEmail.includes(query) ||
                    customerAddress.includes(query)
                );
            });
        }

        // Apply Type Filter
        if (selectedType !== "ALL") {
            currentFilteredOrders = currentFilteredOrders.filter((order) => {
                return getOrderType(order.products) === selectedType;
            });
        }

        // Apply Status Filter
        if (selectedStatus !== "ALL") {
            currentFilteredOrders = currentFilteredOrders.filter(
                (order) => order.status.toLowerCase() === selectedStatus.toLowerCase()
            );
        }

        // Apply Book Filter
        if (selectedBookProductIds.length > 0) {
            currentFilteredOrders = currentFilteredOrders.filter(order =>
                order.products.some(product => selectedBookProductIds.includes(product.id))
            );
        }

        setFilteredOrders(currentFilteredOrders);
    }, [orderData, searchQuery, selectedType, selectedStatus, selectedBookProductIds]);


    // Handle delivery status update (adjusted to match JSON's 'status' field)
    const handleUpdateDelivery = async (orderId) => {
        try {
            // Note: Your JSON has 'status' as a string "pending", "delivered"
            // The API patch might need to send "delivered" lowercase or "DELIVERED" uppercase.
            // Adjust payload as per your backend API's expectation.
            const response = await axiosSecure.patch(`/orders/${orderId}`, {
                status: "delivered", // Changed from "DELIVERED" to "delivered" as per JSON example
                // Assuming your backend expects 'riderName' to update who delivered it
                // riderName: userData?.name,
            });

            if (response.status === 200) {
                toast.success("Order status updated successfully!");
                enrollmentRefetch(); // Corrected function name
            } else {
                toast.error("Failed to update order status.");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "An error occurred while updating order status."
            );
            console.error("Error updating order:", error);
        }
    };

    // Handle book selection for filtering
    const handleBookSelection = (bookProductId) => {
        setSelectedBookProductIds((prevSelected) => {
            if (prevSelected.includes(bookProductId)) {
                return prevSelected.filter((id) => id !== bookProductId);
            } else {
                return [...prevSelected, bookProductId];
            }
        });
    };

    // Export to Excel (adapted for the new JSON structure)
    const exportToExcel = () => {
        // Prepare data for export
        const exportData = filteredOrders.map((order) => {
            const orderType = getOrderType(order.products);
            const tShirtSize = getTShirtSize(order.products);

            // Filter products that are likely books for the "Books Ordered" column
            const bookNames = order.products
                .filter(product => {
                    const productName = product.name?.toLowerCase() || "";
                    return productName.includes("book") || productName.includes("বই");
                })
                .map(product => product.name)
                .join(", ");

            // Filter products that are not categorized as books or explicitly gifts (like t-shirts)
            const otherProductNames = order.products
                .filter(product => {
                    const productName = product.name?.toLowerCase() || "";
                    const isBook = productName.includes("book") || productName.includes("বই");
                    const isGift = productName.includes("t-shirt") || productName.includes("shirt") || productName.includes("gift");
                    return !isBook && !isGift; // Exclude books and explicit gifts from "Other Products"
                })
                .map(product => product.name)
                .join(", ");


            return {
                "Customer Name": order.customerName || "N/A",
                "Customer Email": order.user?.email || "N/A",
                "Customer Phone": order.customerPhone || "N/A",
                "Total Amount": order.totalAmount || "N/A",
                "Order Type": orderType,
                "T-Shirt Size": tShirtSize || "N/A",
                "Books Ordered": bookNames || "N/A",
                "Other Products": otherProductNames || "N/A",
                "Order Status": order.status || "N/A",
                "Payment Status": order.Paymentstatus || "N/A", // Corrected typo from Paymentstatus
                Address: order.customerAddress || "N/A",
                "Created At":
                    new Date(order.createdAt).toLocaleDateString() || "N/A",
            };
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });

        // Save file
        saveAs(
            data,
            `Order-Report-${new Date().toISOString().split("T")[0]}.xlsx`
        );
        toast.success("Export successful!");
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <CustomMetaTag title="Order Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Order Management</h1>
                <p className="text-gray-600">
                    Manage and track all customer orders
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
                            className="pl-10" // Placeholder for potential search icon
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* Type Filter */}
                        <div>
                            <Label
                                htmlFor="type-filter"
                                className="text-sm font-medium mb-1 block"
                            >
                                Order Type
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
                                <option value="OTHER">Other Products</option> {/* Added for clarity */}
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
                                <option value="pending">Pending</option> {/* Adjusted to lowercase as per JSON */}
                                <option value="delivered">Delivered</option> {/* Adjusted to lowercase as per JSON */}
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

                {/* Book Product Filters (renamed from Book Filters) */}
                {/* Only show if type includes books OR ALL is selected, AND there are actually unique book products */}
                {(selectedType === "BOOKS" ||
                    selectedType === "BOOKS_AND_GIFTS" ||
                    selectedType === "ALL") && uniqueBookProducts.length > 0 && (
                        <div className="mb-6">
                            <Label className="text-sm font-medium mb-2 block">
                                Filter by Specific Books
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {uniqueBookProducts.map((book) => (
                                    <div key={book._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`book-filter-${book._id}`}
                                            checked={selectedBookProductIds.includes(book._id)}
                                            onCheckedChange={() => handleBookSelection(book._id)}
                                        />
                                        <label
                                            htmlFor={`book-filter-${book._id}`}
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
                        {filteredOrders.length} orders found
                    </Badge>
                </div>
            </Card>

            {/* Orders Accordion (renamed from Deliveries Accordion) */}
            <Accordion type="single" collapsible className="w-full space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => {
                        const orderType = getOrderType(order.products);
                        const tShirtSize = getTShirtSize(order.products);
                        const isPending = order.status.toLowerCase() === "pending"; // Use lowercase status

                        return (
                            <AccordionItem
                                key={order.id || index} // Use order.id as a stable key
                                value={`order-${order.id || index}`}
                                className={`border rounded-lg overflow-hidden ${isPending
                                    ? "border-amber-200 bg-amber-50"
                                    : "border-green-200 bg-green-50"
                                    }`}
                            >
                                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                    <div className="flex flex-col md:flex-row justify-between w-full gap-2">
                                        <div className="font-medium text-left">
                                            {order.customerName || order.user?.name || "Unknown Customer"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={isPending ? "outline" : "secondary"}
                                            >
                                                {order.status}
                                            </Badge>
                                            <Badge variant="outline">{orderType}</Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="px-4 pb-4">
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        {/* Customer Information */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm">
                                                Customer Information
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                <span>{order.user?.email || "No email available"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span>{order.customerPhone || "No Phone available"}</span>
                                            </div>
                                        </div>

                                        {/* Associated Information (e.g., Total Amount) */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm">
                                                Associated Information
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span>Total Amount: {order.totalAmount}৳</span>
                                            </div>
                                            {order.paymentMethod && (
                                                <div className="flex items-center gap-2">
                                                    <span>Payment Method: {order.paymentMethod}</span>
                                                </div>
                                            )}
                                            {order.transactionId && (
                                                <div className="flex items-center gap-2">
                                                    <span>Transaction ID: {order.transactionId}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Details (Address, T-shirt Size) */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm">
                                                Order Details
                                            </h3>
                                            {(orderType === "GIFTS" || orderType === "BOOKS_AND_GIFTS") && tShirtSize && (
                                                <div className="flex items-center gap-2">
                                                    <Gift className="h-4 w-4 text-gray-500" />
                                                    <span>T-Shirt Size: {tShirtSize}</span>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                                <span>
                                                    {order.customerAddress || "No address available"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Status & Delivery Info */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm">Order Status</h3>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-gray-500" />
                                                <span>Status: {order.status}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Payment Status: {order.Paymentstatus}</span>
                                            </div>
                                            {order.riderName && ( // Changed from deliveredBy to riderName as per JSON
                                                <div>
                                                    <span className="text-sm text-gray-500">
                                                        Delivered by: {order.riderName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Products Included */}
                                    {order.products && order.products.length > 0 && (
                                        <div className="mt-4 border-t pt-4">
                                            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                                <Book className="h-4 w-4 text-gray-500" />
                                                Products Included
                                            </h3>
                                            <div className="grid gap-3">
                                                {order.products.map((product, productIndex) => (
                                                    <div
                                                        key={product.id || productIndex} // Use product.id as key
                                                        className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white rounded-lg border"
                                                    >
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                                                            <div className="text-sm font-semibold">
                                                                <span className="text-gray-500">Price: </span>
                                                                <span>
                                                                    {product.discountedPrice
                                                                        ? product.discountedPrice
                                                                        : product.price}
                                                                    ৳
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {isPending && ( // Only show "Mark as Delivered" if status is "pending"
                                        <div className="flex justify-end mt-4">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => handleUpdateDelivery(order.id)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            Mark as Delivered
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Update order status to DELIVERED
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
                        No orders found matching your filters.
                    </div>
                )}
            </Accordion>
        </div>
    );
};

export default OrderList;