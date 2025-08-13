import { useState, useEffect } from 'react';

const useDashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://aims-purified-api.onrender.com/v1/dashboard/all-stats');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = () => {
        fetchDashboardStats();
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    return {
        stats,
        loading,
        error,
        refreshStats
    };
};

export default useDashboardStats;
