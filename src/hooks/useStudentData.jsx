import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useStudentData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: studentData = [], refetch: studentRefetch } = useQuery({
    queryKey: ["studentManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/student`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });

  return [studentData, studentRefetch];
};

export default useStudentData;
