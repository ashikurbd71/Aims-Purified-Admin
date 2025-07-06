import React from 'react';
import { Video, Users, GraduationCap, MessageSquare } from 'lucide-react';

const LiveClass = () => {
    return (
        <div className="">
            <div className="">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-center text-[#691094]">
                    Live Class Feature Coming Soon
                </h1>

                <div className="flex justify-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-4 border-[#691094] border-t-transparent rounded-full animate-spin"></div>
                </div>

                <p className="text-base sm:text-lg lg:text-xl text-center mb-8 sm:mb-12 text-gray-600 max-w-3xl mx-auto">
                    We're crafting an exceptional live learning experience for you. Stay tuned for the launch!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    <div className="bg-[#691094]/10 rounded-lg p-4 sm:p-6 text-center transform hover:scale-105 transition-transform">
                        <Video className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[#691094]" />
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#691094]">HD Video Streaming</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Crystal clear video quality for the best learning experience</p>
                    </div>

                    <div className="bg-[#691094]/10 rounded-lg p-4 sm:p-6 text-center transform hover:scale-105 transition-transform">
                        <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[#691094]" />
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#691094]">Interactive Sessions</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Engage with instructors and fellow learners in real-time</p>
                    </div>

                    <div className="bg-[#691094]/10 rounded-lg p-4 sm:p-6 text-center transform hover:scale-105 transition-transform">
                        <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[#691094]" />
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#691094]">Expert Instructors</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Learn from industry professionals and experienced educators</p>
                    </div>

                    <div className="bg-[#691094]/10 rounded-lg p-4 sm:p-6 text-center transform hover:scale-105 transition-transform">
                        <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[#691094]" />
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#691094]">Live Q&A</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Get your questions answered instantly during sessions</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveClass;
