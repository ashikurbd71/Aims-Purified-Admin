import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Package
} from 'lucide-react';

const QuickStats = ({ stats }) => {
    if (!stats) return null;

    const quickStats = [
        {
            title: "Today's Earnings",
            value: `৳${stats.todayEarnings || 0}`,
            icon: <DollarSign className="h-5 w-5" />,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders || 0,
            icon: <ShoppingCart className="h-5 w-5" />,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200"
        },
        {
            title: "Total Users",
            value: stats.totalUsers || 0,
            icon: <Users className="h-5 w-5" />,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            title: "Active Products",
            value: stats.activeProducts || 0,
            icon: <Package className="h-5 w-5" />,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
        }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {quickStats.map((stat, index) => (
                <Card key={index} className={`border-2 ${stat.borderColor} hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <div className={stat.color}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default QuickStats;
