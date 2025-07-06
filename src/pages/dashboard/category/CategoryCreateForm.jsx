import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Select, { components } from "react-select";
import { getCourse } from "@/Api/selectorApi";
import { useParams } from "react-router-dom";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import ButtonLoader from "@/components/global/ButtonLoader";

const CouponCreateForm = ({ refetch, onClose }) => {


  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure()

  const validationSchema = Yup.object({
    description: Yup.string()
      .required("Description code is required"),

    name: Yup.date()
      .required("Category date is required")


  });

  const formik = useFormik({
    initialValues: {
      name: "",
      expidescriptionesAt: "",

    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await axiosSecure.post("/categories/create", {
          name: values.name,
          description: values.description,

        });

        if (response.status === 201) {
          "New Category added successfully:", values;

          toast.success("New Category Added successfully");

          // Reset form values
          handleReset();

          // Refetch the updated data
          refetch();
          // Close the modal
          if (onClose) onClose();
          setIsSubmitting(false);
        }
      } catch (error) {
        if (error.status === 400) {
          console.warn("All fields are required");
          toast.error("All fields are required");
        } else if (error.status === 500) {
          console.error("Internal server error");
          toast.error("Internal server error. Please try again later.");
        } else if (error.status === 0) {
          console.error("Internal server error");
          toast.error("Coupon Must Be String");
        } else {
          console.error("Unexpected status code:", error.status);
          // toast.error("Unexpected error occurred. Please try again.");
        }
        console.error("Error adding :", error);
        // toast.error("Failed to add the class. Please try again.");
      }
    },
  });
  const handleReset = () => {
    formik.resetForm();
    setSelectedOptions([]);
    setCourseOptions([]);
    setCourseOptions([]);
  };




  const DropdownIndicator = (props) => (
    <components.DropdownIndicator {...props}>
      <svg
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

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Coupon Code */}
        <div className="">
          <Label htmlFor="code" className="w-1/4 text-sm font-medium">
            Category Name<span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="Enter Name"
              className="mt-1"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.code && formik.errors.code && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.code}</p>
            )}
          </div>
        </div>




        {/* Discount Amount */}
        <div className=" ">
          <Label
            htmlFor="description"
            className="w-full text-sm font-medium"
          >
            Discription <span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <textarea
              rows={4}
              id="description"
              name="description"
              type="number"
              placeholder={`Enter Description`}
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...formik.getFieldProps("description")}
            />
            {formik.touched.description &&
              formik.errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.description}
                </p>
              )}
          </div>
        </div>



        {/* Submit Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="destructive"
            type="button"
            onClick={() => {
              handleReset(); // Reset the form
              onClose(); // Close the modal
            }}
          >
            Cancel
          </Button>
          <Button type="submit">
            {" "}
            {isSubmitting ? <ButtonLoader /> : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponCreateForm;
