import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    TrendingUp,
    TrendingDown,
    Package,
    DollarSign,
    ShoppingCart,
    Frown,
    Smile,
    PartyPopper,
    Coffee
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const WelcomeMessage = ({ stats }) => {
    const { user } = useAuth();

    if (!stats) return null;

    const getWelcomeMessage = () => {
        const todayEarnings = stats.todayEarnings || 0;
        const todayOrders = stats.pendingOrders || 0;

        // Get current time for greeting
        const hour = new Date().getHours();
        let greeting = '';

        if (hour < 12) greeting = 'Good morning';
        else if (hour < 17) greeting = 'Good afternoon';
        else greeting = 'Good evening';

        // Check today's performance
        const isExcellentDay = todayEarnings > 500 || todayOrders > 15;
        const isGoodDay = todayEarnings > 100 || todayOrders > 5;
        const isSlowDay = todayEarnings < 50 && todayOrders < 3;
        const isNoActivity = todayEarnings === 0 && todayOrders === 0;

        let message = '';
        let icon = <Smile className="h-6 w-6 text-green-600" />;
        let bgColor = 'bg-green-50';
        let borderColor = 'border-green-200';
        let textColor = 'text-green-800';

        if (isNoActivity) {
            message = `${greeting}, Boss! 😔 No sales or orders today. Let's make tomorrow better!`;
            icon = <Frown className="h-6 w-6 text-gray-600" />;
            bgColor = 'bg-gray-50';
            borderColor = 'border-gray-200';
            textColor = 'text-gray-800';
        } else if (isExcellentDay) {
            message = `${greeting}, Boss! 🎉 Today is absolutely amazing! You've earned ৳${todayEarnings} and have ${todayOrders} orders. Keep up this incredible momentum!`;
            icon = <PartyPopper className="h-6 w-6 text-purple-600" />;
            bgColor = 'bg-purple-50';
            borderColor = 'border-purple-200';
            textColor = 'text-purple-800';
        } else if (isGoodDay) {
            message = `${greeting}, Boss! 😊 Great work today! You've earned ৳${todayEarnings} and have ${todayOrders} orders. Business is looking good!`;
            icon = <TrendingUp className="h-6 w-6 text-blue-600" />;
            bgColor = 'bg-blue-50';
            borderColor = 'border-blue-200';
            textColor = 'text-blue-800';
        } else if (isSlowDay) {
            message = `${greeting}, Boss! ☕️ It's a quiet day today with ৳${todayEarnings} earnings and ${todayOrders} orders. Maybe grab a coffee and let's make tomorrow better!`;
            icon = <Coffee className="h-6 w-6 text-orange-600" />;
            bgColor = 'bg-orange-50';
            borderColor = 'border-orange-200';
            textColor = 'text-orange-800';
        } else {
            message = `${greeting}, Boss! 📊 Today's stats: ৳${todayEarnings} earnings and ${todayOrders} orders. Let's keep the momentum going!`;
            icon = <Package className="h-6 w-6 text-indigo-600" />;
            bgColor = 'bg-indigo-50';
            borderColor = 'border-indigo-200';
            textColor = 'text-indigo-800';
        }

        // Add additional context for mixed scenarios
        if (todayEarnings > 0 && todayOrders === 0) {
            message += ` 💰 Great earnings today, but no new orders yet!`;
        } else if (todayOrders > 0 && todayEarnings === 0) {
            message += ` 📦 Orders are coming in, but no earnings yet!`;
        }

        return { message, icon, bgColor, borderColor, textColor };
    };

    const { message, icon, bgColor, borderColor, textColor } = getWelcomeMessage();

    return (
        <Card className={`border-2 ${borderColor} ${bgColor} mb-6`}>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h2 className={`text-lg font-semibold ${textColor} mb-2`}>
                            Welcome back, {user?.name || 'Boss'}! 👋
                        </h2>
                        <p className={`${textColor} leading-relaxed`}>
                            {message}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default WelcomeMessage;
