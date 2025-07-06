
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useSmsBalanceData = () => {
  const { data: smsBalanceData = [], refetch: smsBalanceRefetch } = useQuery({
    queryKey: ["smsBalanceManagement"],

    queryFn: async () => {
      const res = await axios.get(`https://bulksmsbd.net/api/getBalanceApi?api_key=smdfhuwS5rLqiDnTPVTk`);
      return res.data;
    },
    staleTime: Infinity, 
    cacheTime: Infinity, 
    refetchOnWindowFocus: false, 
    refetchOnMount: false, 
    refetchOnReconnect: false, 
    retry: false,
  });


  return [smsBalanceData, smsBalanceRefetch];
};

export default useSmsBalanceData;
