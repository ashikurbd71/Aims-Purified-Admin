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
    Clock,
    Truck,
    Eye,
} from "lucide-react";


import useAxiosSecure from "@/hooks/useAxiosSecure";
// import User from "@/hooks/userData";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import ButtonLoader from "@/components/global/ButtonLoader";
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
    const [selectedProductIds, setSelectedProductIds] = useState([]); // To filter by specific product IDs if they are books

    // Loading states for buttons
    const [loadingStates, setLoadingStates] = useState({
        markAsShipped: {},
        cancelOrder: {},
        reviewTransaction: {},
    });

    const axiosSecure = useAxiosSecure();
    // const { userData } = User();
    // Assuming enrollmentData contains your order data, and enrollmentRefetch can re-fetch it


    // State to hold unique "book" products for filtering checkboxes
    const [uniqueProducts, setUniqueProducts] = useState([]);

    // Calculate summary counts
    const getSummaryCounts = () => {
        if (!orderData) return { pending: 0, shipment: 0, review: 0 };

        return {
            pending: orderData.filter(order => order.status?.toLowerCase() === "pending").length,
            shipment: orderData.filter(order => order.status?.toLowerCase() === "shipped").length,
            review: orderData.filter(order => order.Paymentstatus?.toLowerCase() === "review").length,
        };
    };

    const summaryCounts = getSummaryCounts();

    // --- Helper Functions to infer data from the new JSON structure ---

    // Function to determine order type based on products
    const getOrderType = (products) => {
        let hasShataranji = false;
        let hasChira = false;
        let hasAchar = false;

        for (const product of products) {
            const productName = product.name?.toLowerCase() || "";

            if (productName.includes("শতরঞ্জি")) {
                hasShataranji = true;
            }
            if (productName.includes("বাদামি চিড়া")) {
                hasChira = true;
            }
            if (productName.includes("বরই আচার")) {
                hasAchar = true;
            }
        }

        if (hasShataranji) return "শতরঞ্জি";
        if (hasChira) return "বাদামি চিড়া";
        if (hasAchar) return "বরই আচার";
        return "OTHER";
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
            const products = new Set();
            orderData.forEach(order => {
                order.products.forEach(product => {
                    // Store product ID and name to display in checkbox
                    products.add(JSON.stringify({ _id: product.id, name: product.name }));
                });
            });
            setUniqueProducts(Array.from(products).map(item => JSON.parse(item)));
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

        // Apply Product Filter
        if (selectedProductIds.length > 0) {
            currentFilteredOrders = currentFilteredOrders.filter(order =>
                order.products.some(product => selectedProductIds.includes(product.id))
            );
        }

        setFilteredOrders(currentFilteredOrders);
    }, [orderData, searchQuery, selectedType, selectedStatus, selectedProductIds]);


    // Handle delivery status update (adjusted to match JSON's 'status' field)
    const handleUpdateDelivery = async (orderId, newStatus = "delivered") => {
        try {
            // Note: Your JSON has 'status' as a string "pending", "delivered"
            // The API patch might need to send "delivered" lowercase or "DELIVERED" uppercase.
            // Adjust payload as per your backend API's expectation.
            const response = await axiosSecure.patch(`/orders/${orderId}`, {
                status: newStatus,
                // Assuming your backend expects 'riderName' to update who delivered it
                // riderName: userData?.name,
            });

            if (response.status === 200) {
                toast.success("Order status updated successfully!");
                orderRefetch(); // Corrected function name
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

    // Handle product selection for filtering
    const handleProductSelection = (productId) => {
        setSelectedProductIds((prevSelected) => {
            if (prevSelected.includes(productId)) {
                return prevSelected.filter((id) => id !== productId);
            } else {
                return [...prevSelected, productId];
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
            const productNames = order.products
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



    const handleMarkAsShipped = async (orderId) => {
        // Set loading state for this specific order
        setLoadingStates(prev => ({
            ...prev,
            markAsShipped: { ...prev.markAsShipped, [orderId.id]: true }
        }));

        try {
            const response = await axiosSecure.patch(`/orders/order-status/${orderId?.id}`, {
                status: "shipped",
                totalDue: orderId?.totalDue,
            });
            if (response.status === 200) {
                toast.success("Order marked as shipped successfully!");
                orderRefetch();
            } else {
                toast.error("Failed to update order status.");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "An error occurred while updating order status."
            );
            console.error("Error updating order:", error);
        } finally {
            // Clear loading state
            setLoadingStates(prev => ({
                ...prev,
                markAsShipped: { ...prev.markAsShipped, [orderId.id]: false }
            }));
        }
    };

    const handleCancelOrder = async (orderId) => {
        // Set loading state for this specific order
        setLoadingStates(prev => ({
            ...prev,
            cancelOrder: { ...prev.cancelOrder, [orderId]: true }
        }));

        try {
            const response = await axiosSecure.delete(`/orders/${orderId}`, {
                status: "cancel",
            });
            if (response.status === 200) {
                toast.success("Order cancelled successfully!");
                orderRefetch();
            } else {
                toast.error("Failed to cancel order.");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "An error occurred while cancelling order."
            );
            console.error("Error cancelling order:", error);
        } finally {
            // Clear loading state
            setLoadingStates(prev => ({
                ...prev,
                cancelOrder: { ...prev.cancelOrder, [orderId]: false }
            }));
        }
    };

    const handleReviewTransaction = async (orderId) => {
        // Set loading state for this specific order
        setLoadingStates(prev => ({
            ...prev,
            reviewTransaction: { ...prev.reviewTransaction, [orderId]: true }
        }));

        try {
            const response = await axiosSecure.patch(`/orders/payment-status/${orderId}`, {
                paymentStatus: "Received", // or whatever status you want to set
            });
            if (response.status === 200) {
                toast.success("Transaction reviewed successfully!");
                orderRefetch();
            } else {
                toast.error("Failed to review transaction.");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "An error occurred while reviewing transaction."
            );
            console.error("Error reviewing transaction:", error);
        } finally {
            // Clear loading state
            setLoadingStates(prev => ({
                ...prev,
                reviewTransaction: { ...prev.reviewTransaction, [orderId]: false }
            }));
        }
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Pending Orders */}
                <Card className="p-4 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                            <p className="text-2xl font-bold text-amber-600">{summaryCounts.pending}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-full">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                </Card>

                {/* Shipment Orders */}
                <Card className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">In Shipment</p>
                            <p className="text-2xl font-bold text-blue-600">{summaryCounts.shipment}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                {/* Review Transactions */}
                <Card className="p-4 border-l-4 border-l-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Review Transactions</p>
                            <p className="text-2xl font-bold text-yellow-600">{summaryCounts.review}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <Eye className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>
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
                                <option value="শতরঞ্জি">শতরঞ্জি</option>
                                <option value="বাদামি চিড়া">বাদামি চিড়া</option>
                                <option value="বরই আচার">বরই আচার</option>
                                <option value="OTHER">অন্যান্য</option> {/* Added for clarity */}
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
                                <option value="shipped">shipped</option>


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

                {/* Product Filters (renamed from Book Filters) */}
                {/* Only show if type includes books OR ALL is selected, AND there are actually unique book products */}
                {(selectedType === "শতরঞ্জি" ||
                    selectedType === "বাদামি চিড়া" ||
                    selectedType === "বরই আচার" ||
                    selectedType === "ALL") && uniqueProducts.length > 0 && (
                        <div className="mb-6">
                            <Label className="text-sm font-medium mb-2 block">
                                Filter by Specific Products
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {uniqueProducts.map((product) => (
                                    <div key={product._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`product-filter-${product._id}`}
                                            checked={selectedProductIds.includes(product._id)}
                                            onCheckedChange={() => handleProductSelection(product._id)}
                                        />
                                        <label
                                            htmlFor={`product-filter-${product._id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {product.name}
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
                                    {/* Individual card notifications based on status */}
                                    {order.status === "pending" && (
                                        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r font-semibold flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                            Urgent: Please review this order immediately
                                        </div>
                                    )}

                                    {order.status === "shipment" && (
                                        <div className="mb-4 p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-r font-semibold flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            Order is currently in shipment
                                        </div>
                                    )}

                                    {order.status === "cancel" && (
                                        <div className="mb-4 p-3 bg-gray-100 border-l-4 border-gray-500 text-gray-700 rounded-r font-semibold flex items-center gap-2">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                            This order has been cancelled
                                        </div>
                                    )}

                                    {order.Paymentstatus === "Review" && (
                                        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-r font-semibold flex items-center gap-2">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                            Payment is under review
                                        </div>
                                    )}

                                    {/* "Do Something" message for other actionable statuses */}

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
                                                <span>Delivery Charge: {order.totalAmount}৳</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span>Total Due: {order.totalDue}৳</span>
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
                                            {(orderType === "বরই আচার") && tShirtSize && (
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
                                                    <span className="text-sm  font-semibold text-gray-500">
                                                        Product Code :  {order.riderName}
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
                                                        key={product.id || productIndex}
                                                        className="flex flex-col p-3 bg-white rounded-lg border"
                                                    >
                                                        <div className="flex items-center justify-between gap-2 mb-3">
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="flex items-center gap-4">
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

                                                        {/* Product Images with Codes */}
                                                        <div className="flex items-center flex-wrap gap-4 overflow-x-auto py-2">

                                                            {product.images && product.images.length > 0 && product.images.map((img, i) => (
                                                                <div key={i} className="flex flex-col gap-2">
                                                                    <img
                                                                        src={img}
                                                                        alt={`${product.name} ${i + 1}`}
                                                                        className="w-24 h-24 rounded object-cover"
                                                                    />
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <span>Code:</span>
                                                                        <span className="font-semibold">{product.productCode}{i + 1}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons for status */}
                                    <div className="flex gap-2 justify-end mt-4">
                                        {order.status === "pending" && (
                                            <Button
                                                onClick={() => handleMarkAsShipped(order)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                                disabled={loadingStates.markAsShipped[order.id]}
                                            >
                                                {loadingStates.markAsShipped[order.id] ? (
                                                    <ButtonLoader />
                                                ) : (
                                                    "Mark as Shipped"
                                                )}
                                            </Button>
                                        )}
                                        {(order.status === "pending" || order.status === "shipped") && (
                                            <Button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="bg-red-600 hover:bg-red-700"
                                                disabled={loadingStates.cancelOrder[order.id]}
                                            >
                                                {loadingStates.cancelOrder[order.id] ? (
                                                    <ButtonLoader />
                                                ) : (
                                                    "Cancel Order"
                                                )}
                                            </Button>
                                        )}
                                        {order.Paymentstatus === "Review" && (
                                            <Button
                                                onClick={() => handleReviewTransaction(order.id)}
                                                className="bg-yellow-600 hover:bg-yellow-700"
                                                disabled={loadingStates.reviewTransaction[order.id]}
                                            >
                                                {loadingStates.reviewTransaction[order.id] ? (
                                                    <ButtonLoader />
                                                ) : (
                                                    "Review Transaction"
                                                )}
                                            </Button>
                                        )}
                                    </div>
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