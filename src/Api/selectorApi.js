import useAxiosSecure from "@/hooks/useAxiosSecure";
const axiosSecure = useAxiosSecure()
//BloodGroup
export const getTeacher = async () => {
  const { data } = await axiosSecure.get(`/admin`);
  ("data", data);
  return data;
};

//Class
export const getClass = async () => {
  const { data } = await axiosSecure.get(`/class`);
  ("data", data);
  return data;
};

//Class
export const getChapter = async () => {
  const { data } = await axiosSecure.get(`/chapter`);

  return data;
};

//Price
export const getPrice = async () => {
  const { data } = await axiosSecure.get(`/price`);

  return data;
};

//Subject
export const getSubject = async () => {
  const { data } = await axiosSecure.get(`/subject`);

  return data;
};

//Course
export const getCourse = async () => {
  const { data } = await axiosSecure.get(`/course`);
  ("data", data);
  return data;
};
