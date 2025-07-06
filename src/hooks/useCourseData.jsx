import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useCourseData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: courseData = [], refetch: courseRefetch } = useQuery({
    queryKey: ["courseManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/course`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return [courseData, courseRefetch];
};

export default useCourseData;
