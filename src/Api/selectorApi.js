import useAxiosSecure from "@/hooks/useAxiosSecure";
const axiosSecure = useAxiosSecure()
//BloodGroup
export const getCategory = async () => {
  const { data } = await axiosSecure.get(`/categories`);
  ("data", data);
  return data;
};
