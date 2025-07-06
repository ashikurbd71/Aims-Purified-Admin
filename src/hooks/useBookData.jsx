import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useBookData = () => {
  const axiosSecure = useAxiosSecure();
  const { data: bookData = [], refetch: bookRefetch, isLoading: bookLoading } = useQuery({
    queryKey: ["bookManagement"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/book`);
      return res.data.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return [bookData, bookRefetch, bookLoading];
};

export default useBookData;
