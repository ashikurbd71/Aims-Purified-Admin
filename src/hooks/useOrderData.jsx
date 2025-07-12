import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useEnrollmentData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: enrollmentData = [], refetch: enrollmentRefetch } = useQuery({
    queryKey: ["enrollmentManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/enrollment`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });

  return [enrollmentData, enrollmentRefetch];
};

export default useEnrollmentData;
