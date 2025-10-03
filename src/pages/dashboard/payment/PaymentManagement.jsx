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
    CreditCard,
    DollarSign,
    Calendar,
    User,
    Receipt,
} from "lucide-react";

import useAxiosSecure from "@/hooks/useAxiosSecure";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import ButtonLoader from "@/components/global/ButtonLoader";
import usePaymentData from "@/hooks/usePaymentData";

const PaymentManagement = () => {
    const [paymentData, paymentRefetch] = usePaymentData();
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedDateRange, setSelectedDateRange] = useState("ALL");

    // Loading states for buttons
    const [loadingStates, setLoadingStates] = useState({
        export: false,
    });

    // Update filtered payments when paymentData or filters change
    useEffect(() => {
        let filtered = paymentData || [];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter((payment) =>
                payment.txnId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                payment.orderCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                payment.userId?.toString().includes(searchQuery) ||
                payment.bangoPayTransactionId?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (selectedStatus !== "ALL") {
            filtered = filtered.filter((payment) => payment.status === selectedStatus);
        }

        // Date range filter
        if (selectedDateRange !== "ALL") {
            const now = new Date();
            const filterDate = new Date();

            switch (selectedDateRange) {
                case "TODAY":
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case "THIS_WEEK":
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case "THIS_MONTH":
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                default:
                    break;
            }

            filtered = filtered.filter((payment) => {
                const paymentDate = new Date(payment.createdAt);
                return paymentDate >= filterDate;
            });
        }

        setFilteredPayments(filtered);
    }, [paymentData, searchQuery, selectedStatus, selectedDateRange]);

    // Export to Excel function
    const exportToExcel = async () => {
        setLoadingStates(prev => ({ ...prev, export: true }));
        try {
            const exportData = filteredPayments.map((payment) => ({
                "Transaction ID": payment.txnId,
                "Order Code": payment.orderCode || "N/A",
                "User ID": payment.userId,
                "Amount": payment.amount,
                "Status": payment.status,
                "Payment Method": "BangoPay",
                "BangoPay Transaction ID": payment.bangoPayTransactionId || "N/A",
                "Coupon Code": payment.couponCode || "N/A",
                "Discount Amount": payment.discountAmount || 0,
                "Created At": new Date(payment.createdAt).toLocaleString(),
                "Updated At": new Date(payment.updatedAt).toLocaleString(),
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Payments");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(data, `payments_${new Date().toISOString().split("T")[0]}.xlsx`);
            toast.success("Payments exported successfully!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export payments");
        } finally {
            setLoadingStates(prev => ({ ...prev, export: false }));
        }
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "FAILED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: "BDT",
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-BD", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="p-6 space-y-6">
            <CustomMetaTag title="Payment Management" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                    <p className="text-gray-600">Manage and track all payment transactions</p>
                </div>
                <Button
                    onClick={exportToExcel}
                    disabled={loadingStates.export || filteredPayments.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {loadingStates.export ? (
                        <ButtonLoader />
                    ) : (
                        <Download className="w-4 h-4 mr-2" />
                    )}
                    Export to Excel
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-900">{paymentData?.length || 0}</p>
                        </div>
                        <Receipt className="w-8 h-8 text-blue-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-green-600">
                                {paymentData?.filter(p => p.status === "COMPLETED").length || 0}
                            </p>
                        </div>
                        <CreditCard className="w-8 h-8 text-green-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {paymentData?.filter(p => p.status === "PENDING").length || 0}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(paymentData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0)}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-gray-600" />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="search">Search</Label>
                        <Input
                            id="search"
                            placeholder="Search by Transaction ID, Order Code, User ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="dateRange">Date Range</Label>
                        <select
                            id="dateRange"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedDateRange}
                            onChange={(e) => setSelectedDateRange(e.target.value)}
                        >
                            <option value="ALL">All Time</option>
                            <option value="TODAY">Today</option>
                            <option value="THIS_WEEK">This Week</option>
                            <option value="THIS_MONTH">This Month</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedStatus("ALL");
                                setSelectedDateRange("ALL");
                            }}
                            className="w-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Payments Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction Details
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Code
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User & Order
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Method
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {payment.txnId}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-blue-600">
                                                {payment.orderCode || "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-900">
                                                    User ID: {payment.userId}
                                                </div>
                                                {payment.orderIds && payment.orderIds.length > 0 && (
                                                    <div className="text-sm text-gray-500">
                                                        Orders: {payment.orderIds.length}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(payment.amount)}
                                                </div>
                                                {payment.discountAmount > 0 && (
                                                    <div className="text-sm text-green-600">
                                                        Discount: {formatCurrency(payment.discountAmount)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge className={getStatusBadgeColor(payment.status)}>
                                                {payment.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-900">BangoPay</div>
                                                {payment.bangoPayTransactionId && (
                                                    <div className="text-sm text-gray-500">
                                                        {payment.bangoPayTransactionId}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(payment.createdAt)}
                                                </div>
                                                {payment.updatedAt !== payment.createdAt && (
                                                    <div className="text-sm text-gray-500">
                                                        Updated: {formatDate(payment.updatedAt)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                // View payment details
                                                                console.log("View payment:", payment);
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View Details</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Summary */}
            <Card className="p-4">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Showing {filteredPayments.length} of {paymentData?.length || 0} payments
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                        Total Amount: {formatCurrency(filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PaymentManagement;
