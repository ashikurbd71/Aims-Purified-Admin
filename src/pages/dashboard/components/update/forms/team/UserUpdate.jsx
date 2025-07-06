import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select, { components } from "react-select";
import { Label } from "@/components/ui/label";
import { File, FileUp, ReceiptText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import axios from "axios";
import { AuthContext } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import ButtonLoader from "@/components/global/ButtonLoader";

const TeamUpdate = ({ teamData, refetch, onClose }) => {
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
      role: Yup.string(),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      if (values.image) {
        const imageUrl = await uploadImage(values.image);
        if (imageUrl) {
          values.image = imageUrl?.data?.fileUrls[0];
        }
      }
      values;

      try {
        const response = await axiosSecure.patch(`/admin/${teamData}`, {
          role: values.role,
        });

        if (response.status === 200) {
          " Admin Updated successfully:", values;

          toast.success(" Admin Updated successfully");

          // Refetch the updated data
          refetch();
          // Close the modal
          if (onClose) onClose();
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
        role: item?.role,
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

  const { authdata } = useContext(AuthContext);
  return (
    <div className="  ">
      <form onSubmit={formik.handleSubmit} className="md:space-y-6">
        <div className="grid grid-cols-1 gap-2 md:gap-6 rounded-md">
          <div>
            {/* Name */}
            {/* Role */}{" "}
            <div className="mt-4">
              <div className="">
                <Label className="block">Role</Label>
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
                  setSelectedRole(selectedValue);
                  formik.setFieldValue("role", selectedValue);
                }}
              />
              {formik.touched.role && formik.errors.role && (
                <small className="text-red-500  text-sm">
                  {formik.errors.role}
                </small>
              )}
            </div>
          </div>

          <div></div>
        </div>

        {/* Submit Button */}
        <div className="flex mt-4 items-center gap-3 justify-end">
          <Button
            variant="destructive"
            type="button"
            size="sm"
            onClick={() => {
              formik.resetForm(); // Reset the form
              onClose(); // Close the modal
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

export default TeamUpdate;
