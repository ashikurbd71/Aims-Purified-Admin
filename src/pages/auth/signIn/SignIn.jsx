import React, { useContext, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import logo from "/Logo.png";

const CustomInput = ({ label, type, name, placeholder, togglePassword }) => (
  <div className="mb-4">
    <label htmlFor={name} className="text-lg font-semibold pl-3">
      {label}
    </label>
    <div className="relative">
      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full text-gray-700 mt-2 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
      {togglePassword && (
        <button
          type="button"
          className="absolute right-3 bottom-[0.6px] transform -translate-y-1/2"
          onClick={togglePassword}
        >
          {type === "password" ? (
            <Eye className="text-gray-800" />
          ) : (
            <EyeOff className="text-gray-800" />
          )}
        </button>
      )}
    </div>
    <ErrorMessage
      name={name}
      component="div"
      className="text-sm text-red-500 mt-1"
    />
  </div>
);

const SignIn = () => {
  const { logIn, resetPassword } = useContext(AuthContext);

  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });
  // for reset password
  const resetPasswordSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  });
  const navigate = useNavigate();
  const handleSubmit = async (values) => {
    try {
      const { email, password } = values;
      await logIn(email, password);
      setError(null);
      toast.success("User logged in successfully!");
      navigate("/");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      toast.error("Login failed. Please check your credentials.");
      if (err.code === 400) {
        toast.error("Login failed. Please check your credentials.");
      }
    }
  };

  const handleResetPassword = async (values) => {
    // Implement password reset logic here
    try {
      const { email } = values;
      await resetPassword(email);
      setError(null);
      toast.success("Email sent successfully!");
      setIsModalOpen(false);
    } catch (err) {
      setError("failed to send email. Please check your credentials.");

      if (err.code === 400) {
        toast.error("failed to send email. Please check your credentials.");
      }
    }
    "Reset password:", values.email;
  };

  return (
    // <div className="flex justify-center items-center h-screen bg-cover bg-center bg-[url('/background-image.jpg')]">
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#29003D] text-white py-8 px-1">
      <div className="mb-8">
        <img src={logo} alt="Logo" className=" w-[175px] h-[50px] " />
      </div>
      <div className=" bg-[rgba(115,12,156,0.4)] text-white border border-[#8B21BF] p-6 rounded-xl w-full md:w-[513px]">
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <h2 className="text-xl font-bold text-center  mb-6">
                WELCOME BACK
              </h2>

              <CustomInput
                label="Email"
                type="text"
                name="email"
                placeholder="Enter your email"
              />
              <CustomInput
                label="Password"
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                togglePassword={togglePasswordVisibility}
              />

              <button
                type="submit"
                className={`w-full p-3 mt-2 rounded transition-all duration-300 ${
                  isSubmitting
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-800 to-[#8B21BF] hover:opacity-90"
                } text-white font-semibold`}
              >
                {isSubmitting ? "Logging In..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Reset password */}

        <div className="text-left my-3 ml-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger className="text-sm font-bold text-purple-600 hover:text-purple-800">
              Forgot Password?
            </DialogTrigger>
            <DialogContent className=" bg-[#29003D] text-white border-[#8B21BF]">
              <DialogHeader></DialogHeader>
              <Formik
                initialValues={{ email: "" }}
                validationSchema={resetPasswordSchema}
                onSubmit={handleResetPassword}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <CustomInput
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full p-3 rounded transition-all duration-300 ${
                        isSubmitting
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-800 to-[#8B21BF]  hover:opacity-90"
                      } text-white font-semibold`}
                    >
                      {isSubmitting ? "Sending..." : "Send"}
                    </button>
                  </Form>
                )}
              </Formik>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
