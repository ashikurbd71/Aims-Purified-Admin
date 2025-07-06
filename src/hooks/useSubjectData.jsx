import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useSubjectData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: subjectData = [], refetch: subjectRefetch } = useQuery({
    queryKey: ["subjectManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/subject`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return [subjectData, subjectRefetch];
};

export default useSubjectData;
