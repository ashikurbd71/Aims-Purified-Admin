import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";

const User = () => {
  const { authdata } = useContext(AuthContext);
  const userData = authdata;
  return { userData };
};

export default User;
