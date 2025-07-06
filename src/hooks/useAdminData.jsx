import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useAdminData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: adminData = [], refetch: adminRefetch } = useQuery({
    queryKey: ["adminManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/admin`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return [adminData, adminRefetch];
};

export default useAdminData;
