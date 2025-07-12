import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useCouponData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: couponData = [], refetch: couponRefetch } = useQuery({
    queryKey: ["couponManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/coupon`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return [couponData, couponRefetch];
};

export default useCouponData;
