import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select, { components } from "react-select";
import { Label } from "@/components/ui/label";
import { File, FileUp, ReceiptText, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import axios from "axios";
// import { AuthContext } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import ButtonLoader from "@/components/global/ButtonLoader";

const UpdateProfile = ({ teamData, refetch, onClose }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure()
  const { data: item } = useQuery({
    queryKey: ["singleteamManagement"],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get(`/admin/${teamData}`);
        res.data;
        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
  });

  item;

  const [selectedRole, setSelectedRole] = useState("");

  const options = [
    { value: "MODERATOR", label: "Moderator" },
    { value: "ADMIN", label: "Admin" },
    { value: "TEACHER", label: "Teacher" },
  ];

  // Upload Image
  const uploadImage = async (files) => {
    if (!Array.isArray(files)) {
      files = [files];
    }
    "Files to upload:", files;

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));
    try {
      const response = await axios.post(
        "https://cdn.englishhealer.com/v1/upload/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (
        (response?.status === 200 || response?.status === 201) &&
        response?.data
      ) {
        // toast.success("Image uploaded successfully!");
        "Uploaded Images Data:", response;
        return response.data; // Return the uploaded images' response
      } else {
        toast.error("Image upload failed: Invalid response");
        return null;
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      phoneNumber: "",
      image: "",
      role: " ",
      dateOfBirth: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email format"),
      name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),
      phoneNumber: Yup.string().length(
        11,
        "Phone number must be exactly 11 digits"
      ),
      image: Yup.mixed(),
      role: Yup.string(),
      dateOfBirth: Yup.date()
        .nullable()
        .max(new Date(), "Date of Birth cannot be in the future"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      if (values.image) {
        const imageUrl = await uploadImage(values.image);
        if (imageUrl) {
          values.image = imageUrl?.data?.fileUrls[0];
        }
      }
      console.log(values);

      try {
        const response = await axiosSecure.patch(`/admin/${teamData}`, {
          name: values.name,

          phoneNumber: values.phoneNumber,
          dateOfBirth: values.dateOfBirth,
          photoURL: values.image,

          bio: values.description,
        });

        if (response.status === 200) {
          " Admin Updated successfully:", values;

          toast.success(" Admin Updated successfully");

          // First close the modal
          if (onClose) {
            onClose();
          }

          // Navigate to home
          navigate("/", { replace: true });

          // After navigation is complete, then refetch
          setTimeout(() => {
            refetch();
          }, 100);
          setIsSubmitting(false);
        }
        //all response Status Check
      } catch (error) {
        if (error.status === 404) {
          console.warn("Admin Doesn't exist... 😅");
          toast.error("Admin  Doesn't exist... 😅");
        } else if (error.status === 500) {
          console.error("Internal server error");
          toast.error("Internal server error. Please try again later.");
        } else {
          console.error("Unexpected status code:", response.status);
          toast.error("Unexpected error occurred. Please try again.");
        }
        console.error("Error adding Manager:", error);
        // toast.error("Failed to add the class. Please try again.");
      }
    },
  });

  useEffect(() => {
    if (item) {
      formik.setValues({
        name: item?.name || "",
        email: item?.email,
        phoneNumber: item?.phoneNumber,
        role: item?.role,
        photoURL: item?.photoURL,
        description: item?.bio,
        dateOfBirth: item?.dateOfBirth?.split("T")[0],
      });

      setSelectedRole(item?.role);
    }
  }, [item]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #E6E6E6",
      backgroundColor: "#FFFFFF",
    }),
  };

  const DropdownIndicator = (props) => (
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

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    formik.setFieldValue("image", file);
  };

  // Function to remove an existing thumbnail
  // const handleThumbnailRemove = () => {
  //   formik.setFieldValue("photoURL", "");
  //   formik.setFieldValue("image", "");
  // };

  return (
    <div className="  ">
      <form onSubmit={formik.handleSubmit} className="md:space-y-6">
        <div className="grid grid-cols-1 gap-2 md:gap-6 rounded-md">
          <div>
            {/* Name */}
            <div>
              <label className="block font-medium   mb-2">Name</label>
              <Input
                type="text"
                name="name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className={`w - full p - 3 border ${formik.touched.name && formik.errors.name
                  ? "border-red-500"
                  : "border-gray-300"
                  } rounded - lg`}
                placeholder="Enter name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="mt-4">
              <label className="block   font-medium mb-2">Phone Number</label>
              <Input
                type="phone"
                name="phoneNumber"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phoneNumber}
                className={`w - full p - 3 border ${formik.touched.phoneNumber && formik.errors.phoneNumber
                  ? "border-red-500"
                  : "border-gray-300"
                  } rounded - lg`}
                placeholder="Enter phone number"
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="mt-4">
              <label className="block   font-medium mb-2 ">Date of Birth</label>
              <Input
                type="date"
                name="dateOfBirth"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.dateOfBirth}
                className={`w - full p - 3 border ${formik.touched.dateOfBirth && formik.errors.dateOfBirth
                  ? "border-red-500"
                  : "border-gray-300"
                  } rounded - lg`}
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.dateOfBirth}
                </p>
              )}
            </div>
          </div>
          <div>
            <div className="">
              <Label htmlFor="description" className="block font-medium my-3">
                Bio
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter your Bio..."
                className="w-full mt-1"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {/* Photo Upload */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="featuredImgUrl" className="block">
                Image
              </Label>
              <label
                htmlFor="featuredImgUrl"
                className="border border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <span className="bg-gray-200 dark:text-gray-800 p-3 rounded-full">
                  <FileUp />
                </span>
                <p className="text-sm">
                  <span className="text-sm text-blue-600 font-sm">
                    Click here
                  </span>{" "}
                  to upload your file or drag.
                </p>
                <Input
                  id="featuredImgUrl"
                  name="featuredImgUrl"
                  type="file"
                  accept=".svg, .jpg, .png"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {formik.values.image && formik.values.image.size > 0 && (
                <p className="text-sm mt-1">
                  {formik.values.image.name} -{" "}
                  {(formik.values.image.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
              {formik.touched.image && formik.errors.image && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.image}
                </p>
              )}
            </div>
            {item?.photoURL ? (
              <div className="relative w-24 h-16 ">
                <img
                  src={item?.photoURL || "https://placehold.co/150"}
                  alt="Image"
                  className="w-24 h-16 object-cover mt-2 rounded-md"
                />
                {/* <span
                  className="absolute right-0 top-0 bg-red-500 rounded-full p-[2px] cursor-pointer"
                  onClick={() => handleThumbnailRemove()}
                >
                  <X size={14} className="text-white hover:text-gray-800" />
                </span> */}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex mt-4 items-center gap-3 justify-end">
          <Button
            variant="destructive"
            type="button"
            size="sm"
            onClick={() => {
              formik.resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button variant="default" size="sm" type="submit">
            {isSubmitting ? <ButtonLoader /> : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
