import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WelcomeMessage from './WelcomeMessage';
import QuickStats from './QuickStats';
import {
    Package,
    Users,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    CreditCard,
    Eye,
    RefreshCw
} from 'lucide-react';
import useDashboardStats from '../../../../hooks/useDashboardStats';

const DashboardOverview = () => {
    const { stats, loading, error, refreshStats } = useDashboardStats();

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-4 sm:px-0">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-6 sm:py-8 px-4 sm:px-0">
                <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
                <p className="text-red-600 text-sm sm:text-base">Error loading dashboard stats: {error}</p>
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            title: "Total Products",
            value: stats.totalProducts,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            title: "Active Products",
            value: stats.activeProducts,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Total Categories",
            value: stats.totalCategories,
            icon: Package,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
        },
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            borderColor: "border-indigo-200"
        },
        {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200"
        },
        {
            title: "Total Sales",
            value: `৳${stats.totalSales}`,
            icon: DollarSign,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200"
        },
        {
            title: "Today's Earnings",
            value: `৳${stats.todayEarnings}`,
            icon: TrendingUp,
            color: "text-rose-600",
            bgColor: "bg-rose-50",
            borderColor: "border-rose-200"
        },
        {
            title: "Monthly Earnings",
            value: `৳${stats.monthlyEarnings}`,
            icon: DollarSign,
            color: "text-cyan-600",
            bgColor: "bg-cyan-50",
            borderColor: "border-cyan-200"
        }
    ];

    const orderStatusCards = [
        {
            title: "Pending Orders",
            value: stats.pendingOrders,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200"
        },
        {
            title: "Processing Orders",
            value: stats.processingOrders,
            icon: Clock,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            title: "Shipped Orders",
            value: stats.shippedOrders,
            icon: Truck,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
        },
        {
            title: "Delivered Orders",
            value: stats.deliveredOrders,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Cancelled Orders",
            value: stats.cancelledOrders,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        }
    ];

    const paymentCards = [
        {
            title: "Review Payments",
            value: stats.reviewPayments,
            icon: Eye,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200"
        },
        {
            title: "Received Payments",
            value: stats.receivedPayments,
            icon: CreditCard,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Failed Payments",
            value: stats.failedPayments,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        }
    ];

    const stockCards = [
        {
            title: "Low Stock Products",
            value: stats.lowStockProducts,
            icon: AlertTriangle,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200"
        },
        {
            title: "Out of Stock Products",
            value: stats.outOfStockProducts,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        }
    ];

    return (
        <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 max-w-7xl mx-auto">
            {/* Welcome Message */}
            <WelcomeMessage stats={stats} />

            {/* Quick Stats
            <QuickStats stats={stats} /> */}

            {/* Main Stats */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                    <button
                        onClick={refreshStats}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base w-full sm:w-auto"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {statCards.map((card, index) => (
                        <Card key={index} className={`border-2 ${card.borderColor} hover:shadow-lg transition-shadow duration-300`}>
                            <CardHeader className="pb-2 px-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                                        {card.title}
                                    </CardTitle>
                                    <div className={`p-1.5 sm:p-2 rounded-lg ${card.bgColor}`}>
                                        <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6">
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                    {card.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Order Status */}
            <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Order Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {orderStatusCards.map((card, index) => (
                        <Card key={index} className={`border-2 ${card.borderColor} hover:shadow-lg transition-shadow duration-300`}>
                            <CardHeader className="pb-2 px-3 sm:px-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs font-medium text-gray-600 leading-tight">
                                        {card.title}
                                    </CardTitle>
                                    <div className={`p-1 sm:p-1.5 rounded-lg ${card.bgColor}`}>
                                        <card.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-3 sm:px-4">
                                <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                                    {card.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Payment Status */}
            <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Payment Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {paymentCards.map((card, index) => (
                        <Card key={index} className={`border-2 ${card.borderColor} hover:shadow-lg transition-shadow duration-300`}>
                            <CardHeader className="pb-2 px-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                                        {card.title}
                                    </CardTitle>
                                    <div className={`p-1.5 sm:p-2 rounded-lg ${card.bgColor}`}>
                                        <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6">
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                    {card.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Stock Status */}
            <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Stock Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {stockCards.map((card, index) => (
                        <Card key={index} className={`border-2 ${card.borderColor} hover:shadow-lg transition-shadow duration-300`}>
                            <CardHeader className="pb-2 px-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                                        {card.title}
                                    </CardTitle>
                                    <div className={`p-1.5 sm:p-2 rounded-lg ${card.bgColor}`}>
                                        <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6">
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                    {card.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
