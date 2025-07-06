import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const ServerUpgradeWarning = () => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    const handleClose = () => {
        setIsOpen(false);
        navigate("/");
    };

    return (
        <div className="font-mono">
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md w-[95%] mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg md:text-xl font-mono font-bold text-red-600">
                            Server Upgrade Notice
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-3 md:py-4 mb-5">
                        <p className="text-sm md:text-base text-gray-700 font-mono">
                            We will be performing a server upgrade on June 13th at 2:00 PM. During this time, you may experience some service disruptions. We apologize for any inconvenience this may cause.
                        </p>
                    </div>
                    <div className="fixed  rounded-b-md  bottom-0 w-full bg-red-600 text-white py-1">
                        <marquee className="text-md  font-semibold">
                            ⚠️ Server Upgrade Scheduled: June 13th at 2:00 PM ⚠️
                        </marquee>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default ServerUpgradeWarning; 