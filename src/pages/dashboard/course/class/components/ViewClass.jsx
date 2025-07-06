import useAxiosSecure from '@/hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';

export default function ViewClass() {
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();

    const { data: item, isLoading, isError } = useQuery({
        queryKey: ["classview", id],
        queryFn: async () => {
            try {
                const response = await axiosSecure.get(`/class/${id}`);
                return response?.data?.data;
            } catch (error) {
                console.error("Error fetching data:", error);
                throw error;
            }
        },
        enabled: !!id,
    });

    if (isLoading) return <p className="text-center text-lg font-semibold">Loading...</p>;
    if (isError || !item) return <p className="text-center text-red-500">Error fetching data</p>;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg overflow-hidden p-6">
                {/* Featured Image */}


                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h1>

                {/* Description */}
                {item.description ? (
                    <p className="text-gray-600 mb-4">{item.description}</p>
                ) : (
                    <p className="text-gray-400 italic">No description available.</p>
                )}

                {/* Video Section */}
                {item.videoUrl ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe
                            className="w-full h-full"
                            src={item.videoUrl.replace("youtu.be/", "www.youtube.com/embed/")}
                            title={item.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <p className="text-red-500 text-center mt-4">No video available</p>
                )}

                {/* Metadata */}
                <div className="mt-4 text-gray-600 text-sm">

                    <p><strong>Start Time:</strong> {new Date(item.startTime).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
