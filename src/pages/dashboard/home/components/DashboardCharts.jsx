import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const DashboardCharts = ({ stats }) => {
    // Sample data for charts - in a real app, this would come from your API
    const salesTrendData = [
        { month: 'Jan', sales: 4000, orders: 24 },
        { month: 'Feb', sales: 3000, orders: 13 },
        { month: 'Mar', sales: 2000, orders: 98 },
        { month: 'Apr', sales: 2780, orders: 39 },
        { month: 'May', sales: 1890, orders: 48 },
        { month: 'Jun', sales: 2390, orders: 38 },
        { month: 'Jul', sales: 3490, orders: 43 },
        { month: 'Aug', sales: 4000, orders: 52 },
        { month: 'Sep', sales: 3200, orders: 35 },
        { month: 'Oct', sales: 2800, orders: 28 },
        { month: 'Nov', sales: 3900, orders: 45 },
        { month: 'Dec', sales: 4500, orders: 58 }
    ];

    const orderStatusData = [
        { name: 'Pending', value: stats?.pendingOrders || 0, color: '#f59e0b' },
        { name: 'Processing', value: stats?.processingOrders || 0, color: '#3b82f6' },
        { name: 'Shipped', value: stats?.shippedOrders || 0, color: '#8b5cf6' },
        { name: 'Delivered', value: stats?.deliveredOrders || 0, color: '#10b981' },
        { name: 'Cancelled', value: stats?.cancelledOrders || 0, color: '#ef4444' }
    ];

    const revenueData = [
        { name: 'Products', value: stats?.totalProducts || 0, color: '#3b82f6' },
        { name: 'Users', value: stats?.totalUsers || 0, color: '#8b5cf6' },
        { name: 'Orders', value: stats?.totalOrders || 0, color: '#10b981' },
        { name: 'Categories', value: stats?.totalCategories || 0, color: '#f59e0b' }
    ];

    const weeklyRevenueData = [
        { day: 'Mon', revenue: 1200 },
        { day: 'Tue', revenue: 1900 },
        { day: 'Wed', revenue: 3000 },
        { day: 'Thu', revenue: 2800 },
        { day: 'Fri', revenue: 1890 },
        { day: 'Sat', revenue: 2390 },
        { day: 'Sun', revenue: 3490 }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.dataKey}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{payload[0].name}</p>
                    <p className="text-sm" style={{ color: payload[0].payload.color }}>
                        {`Value: ${payload[0].value}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <Card className="col-span-1 lg:col-span-2 border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Sales Trend (Last 12 Months)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                    name="Sales (৳)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        Order Status Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Revenue */}
            <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Weekly Revenue
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="day"
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="revenue"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                    name="Revenue (৳)"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Revenue Analytics */}
            <Card className="col-span-1 lg:col-span-2 border-2 border-indigo-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        Revenue Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    name="Sales (৳)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    name="Orders"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardCharts;
