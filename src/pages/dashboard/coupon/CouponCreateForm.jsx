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
  const [selectedType, setSelectedType] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const { courseId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure()
  const discountTypes = [
    { value: "PERCENTAGE", label: "Percentage" },
    { value: "FIXED", label: "Fixed Amount" },
  ];

  const validationSchema = Yup.object({
    code: Yup.string()
      .required("Coupon code is required")
      .trim()
      .min(3, "Code must be at least 3 characters"),
    expiresAt: Yup.date()
      .required("Expiration date is required")
      .min(new Date(), "Expiration date must be in the future"),
    discountType: Yup.string()
      .required("Discount type is required")
      .oneOf(["PERCENTAGE", "FIXED"], "Invalid discount type"),
    discountedAmount: Yup.number()
      .required("Discount amount is required")
      .positive("Must be a positive number")
      .when("discountType", {
        is: "PERCENTAGE",
        then: (schema) => schema.max(100, "Percentage cannot exceed 100%"),
      }),
    applicableCourses: Yup.array().min(1, "Select at least one course"),
  });

  const formik = useFormik({
    initialValues: {
      code: "",
      expiresAt: "",
      discountType: "",
      discountedAmount: "",
      applicableCourses: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await axiosSecure.post("/coupon/add", {
          code: values.code.toUpperCase(),
          expiresAt: values.expiresAt,
          discountType: values.discountType,
          applicableCourses: Array.isArray(values.applicableCourses)
            ? values.applicableCourses.map((item) => item)
            : null,

          discountedAmount: values.discountedAmount,
        });

        if (response.status === 201) {
          "New Coupon added successfully:", values;

          toast.success("New Coupon Added successfully");

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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourse();
        const options = response?.data?.map((course) => ({
          value: course._id,
          label: course.name,
        }));
        setCourseOptions(options);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #E6E6E6",
      backgroundColor: "#FFFFFF",
      minHeight: "40px",
    }),
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
            Coupon Code <span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="Enter code"
              className="mt-1"
              {...formik.getFieldProps("code")}
            />
            {formik.touched.code && formik.errors.code && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.code}</p>
            )}
          </div>
        </div>

        {/* Expiration Date */}
        <div className=" ">
          <Label htmlFor="expiresAt" className="w-1/4 text-sm font-medium">
            Expiry Date <span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              className="mt-1"
              {...formik.getFieldProps("expiresAt")}
            />
            {formik.touched.expiresAt && formik.errors.expiresAt && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.expiresAt}
              </p>
            )}
          </div>
        </div>

        {/* Discount Type */}
        <div className=" ">
          <Label htmlFor="discountType" className="w-1/4 text-sm font-medium">
            Discount Type <span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Select
              id="discountType"
              options={discountTypes}
              placeholder="Select discount type"
              styles={customStyles}
              value={selectedType}
              onChange={(option) => {
                formik.setFieldValue("discountType", option?.value);
                setSelectedType(option);
              }}
            />
            {formik.touched.discountType && formik.errors.discountType && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.discountType}
              </p>
            )}
          </div>
        </div>

        {/* Discount Amount */}
        <div className=" ">
          <Label
            htmlFor="discountedAmount"
            className="w-1/4 text-sm font-medium"
          >
            Discount Amount <span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Input
              id="discountedAmount"
              name="discountedAmount"
              type="number"
              placeholder={`Enter ${formik.values.discountType === "percentage"
                ? "percentage"
                : "amount"
                }`}
              className="mt-1"
              {...formik.getFieldProps("discountedAmount")}
            />
            {formik.touched.discountedAmount &&
              formik.errors.discountedAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.discountedAmount}
                </p>
              )}
          </div>
        </div>

        {/* Applicable Courses */}
        <div className=" ">
          <Label className="w-1/4 text-sm font-medium">
            Applicable Courses <span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Select
              isMulti
              className="w-full mt-1"
              components={{ DropdownIndicator }}
              options={courseOptions}
              placeholder="Select Courses"
              styles={customStyles}
              value={courseOptions?.filter((option) =>
                selectedOptions.includes(option.value)
              )}
              onChange={(selected) => {
                const selectedValues =
                  selected?.map((option) => option.value) || [];
                setSelectedOptions(selectedValues);
                formik.setFieldValue("applicableCourses", selectedValues);
              }}
            />
            {formik.touched.applicableCourses &&
              formik.errors.applicableCourses && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.applicableCourses}
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
            {isSubmitting ? <ButtonLoader /> : "Create Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponCreateForm;
