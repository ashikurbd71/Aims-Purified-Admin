import axios from "axios";

const axiosSecure = axios.create({
  baseURL: "https://admin-server.englishhealer.com/v1",
  withCredentials: true,
});

const useAxiosSecure = () => {
  return axiosSecure;
};

export default useAxiosSecure;
