import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useStudentReviewData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: studentReviewData = [], refetch: studentReviewRefetch } = useQuery({
    queryKey: ["studentReviewManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/review`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return [studentReviewData, studentReviewRefetch];
};

export default useStudentReviewData;
