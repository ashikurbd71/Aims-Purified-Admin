import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useNoticeData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: noticeData = [], refetch: noticeRefetch } = useQuery({
    queryKey: ["noticeManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/notice`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return [noticeData, noticeRefetch];
};

export default useNoticeData;
