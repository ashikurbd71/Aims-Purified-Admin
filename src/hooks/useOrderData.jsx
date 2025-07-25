import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useOrderData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: orderData = [], refetch: orderRefetch } = useQuery({
    queryKey: ["orderManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/orders`);

      console.log()
      return res?.data?.data; // ✅ Return only the data part
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });

  return [orderData, orderRefetch];
};

export default useOrderData;
