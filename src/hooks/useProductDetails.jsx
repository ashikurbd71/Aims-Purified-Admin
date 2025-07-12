import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useCourseDetails = ({courseId}) => {
  const axiosSecure = useAxiosSecure();
  const { data: courseDetails = [], refetch: courseDetailsRefetch , isLoading: isCourseDetailsLoading} = useQuery({
    queryKey: ["subjectManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/course/${courseId}`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return [courseDetails, courseDetailsRefetch, isCourseDetailsLoading];
};

export default useCourseDetails;
