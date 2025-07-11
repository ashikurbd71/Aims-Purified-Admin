import axios from "axios";

const axiosSecure = axios.create({
  baseURL: "https://aims-purified-api.onrender.com/v1",
  withCredentials: true,
});

const useAxiosSecure = () => {
  return axiosSecure;
};

export default useAxiosSecure;
