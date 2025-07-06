import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select, { components } from "react-select";
import { Label } from "@/components/ui/label";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import ButtonLoader from "@/components/global/ButtonLoader";

const AddNewUser = ({ refetch, onClose }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure();
  const options = [
    { value: "MODERATOR", label: "Moderator" },
    { value: "ADMIN", label: "Admin" },
    { value: "TEACHER", label: "Teacher" },
  ];


  const handleReset = () => {
    formik.resetForm();
  };
  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      phoneNumber: "",
      image: "",

      role: "MODERATOR",
      dateOfBirth: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      name: Yup.string()
        .required("Name is required")
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),
      phoneNumber: Yup.string()
        .required("Phone number is required")
        // .matches(/^[0-9]+$/, "Phone number must be numeric")
        .length(11, "Phone number must be exactly 11 digits"),
      image: Yup.string(),

      role: Yup.string().required("Role is required"),
      // .required("Role is required")
      dateOfBirth: Yup.date()
        .nullable()
        .max(new Date(), "Date of Birth cannot be in the future"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);

      try {
        const response = await axiosSecure.post("/admin/add", {
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          role: values.role,
        });

        if (response.status === 201) {
          "New Admin added successfully:", values;

          toast.success("New Admin Added successfully");

          // Reset form values
          handleReset();

          // Refetch the updated data
          refetch();

          // Close the modal
          if (onClose) {
            onClose();
          }
          setIsSubmitting(false);
        }
        //all response Status Check
      } catch (error) {
        if (error.status === 400) {
          console.warn("Admin is already added to the panel!!! 😅");
          toast.error("Admin is already added to the panel!!! 😅");
        } else if (error.status === 500) {
          console.error("Internal server error");
          toast.error("Internal server error. Please try again later.");
        } else {
          console.error("Unexpected status code:", error.response.status);
          toast.error("Unexpected error occurred. Please try again.");
        }
        console.error("Error adding Manager:", error);
        // toast.error("Failed to add the class. Please try again.");
      }
    },
  });
  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #E6E6E6",
      backgroundColor: "#FFFFFF",
    }),
  };

  const DropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <svg
          className="dropSVG"
          width="14"
          height="8"
          viewBox="0 0 14 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 8L0.937823 0.5L13.0622 0.499999L7 8Z" fill="#D9D9D9" />
        </svg>
      </components.DropdownIndicator>
    );
  };

  return (
    <div className="  ">
      <form onSubmit={formik.handleSubmit} className="md:space-y-6">
        <div className="grid grid-cols-1  gap-2 md:gap-6 rounded-md">
          <div>
            {/* Name */}
            <div>
              <label className="block font-medium   mb-2">
                Name <span className="text-xl text-red-500 ">*</span>
              </label>
              <Input
                type="text"
                name="name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className={`w-full p-3 border ${formik.touched.name && formik.errors.name
                  ? "border-red-500"
                  : "border-gray-300"
                  } rounded-lg`}
                placeholder="Enter name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="pt-2">
              <label className="block   font-medium mb-2">
                Phone Number <span className="text-xl text-red-500 ">*</span>
              </label>
              <Input
                type="phone"
                name="phoneNumber"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phoneNumber}
                className={`w-full p-3 border ${formik.touched.phoneNumber && formik.errors.phoneNumber
                  ? "border-red-500"
                  : "border-gray-300"
                  } rounded-lg`}
                placeholder="Enter phone number"
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.phoneNumber}
                </p>
              )}
            </div>


            <div className="mt-3">
              <div className="">
                <Label className="block">
                  Role <span className="text-xl text-red-500 ">*</span>
                </Label>
              </div>
              <Select
                className="custom-select w-full h-[40px] rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] mt-2"
                components={{ DropdownIndicator }}
                options={options}
                placeholder="Select Role"
                styles={customStyles}
                value={options.find((option) => option.value === selectedRole)}
                onChange={(selectedOption) => {
                  const selectedValue = selectedOption
                    ? selectedOption.value
                    : null;
                  setSelectedRole(selectedValue); // Update local state
                  formik.setFieldValue("role", selectedValue); // Update Formik
                }}
              />
              {formik.touched.role && formik.errors.role && (
                <small className="text-red-500  text-sm">
                  {formik.errors.role}
                </small>
              )}
            </div>
          </div>
          <div>
            {/* Email */}
            <div>
              <label className="block  font-medium mb-2">
                Email <span className="text-xl text-red-500 ">*</span>
              </label>
              <Input
                type="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full p-3 border ${formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-gray-300"
                  } rounded-lg`}
                placeholder="Enter email"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex mt-4 items-center gap-3 justify-end">
          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={() => {
              formik.resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button variant="default" size="sm" type="submit">
            {isSubmitting ? <ButtonLoader /> : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddNewUser;
