import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const usePaymentData = () => {
    const axiosSecure = useAxiosSecure();
    const { data: paymentData = [], refetch: paymentRefetch } = useQuery({
        queryKey: ["paymentManagement"],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments`);

            console.log("Payment data fetched:", res?.data);
            return res?.data?.data; // ✅ Return only the data part
        },
        staleTime: Infinity,
        cacheTime: Infinity,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: false,
    });

    return [paymentData, paymentRefetch];
};

export default usePaymentData;
