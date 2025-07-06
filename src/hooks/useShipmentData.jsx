import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useShipmentData = () => {
    const axiosSecure = useAxiosSecure();
    const { data: shipmentData = [], refetch: shipmentRefetch, isLoading: shipmentLoading } = useQuery({
        queryKey: ["shipmentManagement"],
        queryFn: async () => {
            const res = await axiosSecure.get(`/delivery`);
            return res.data.data;
        },
        staleTime: Infinity,
        cacheTime: Infinity,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: false,
    });

    return [shipmentData, shipmentRefetch, shipmentLoading];
};

export default useShipmentData;
