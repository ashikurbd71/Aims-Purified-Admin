import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Select, { components } from "react-select";
import { getCourse } from "@/Api/selectorApi";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import ButtonLoader from "@/components/global/ButtonLoader";

const CouponUpdate = ({ item, refetch, onClose }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure()
  const { data: items } = useQuery({
    queryKey: ["singlecouponManagement"],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get(`/coupon/${item}`);
        res.data;
        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
  });
  item;

  const discountTypes = [
    { value: "PERCENTAGE", label: "Percentage" },
    { value: "FIXED", label: "Fixed Amount" },
  ];

  const validationSchema = Yup.object({
    code: Yup.string().trim().min(3, "Code must be at least 3 characters"),
    // expiresAt: Yup.date().min(
    //   new Date(),
    //   "Expiration date must be in the future"
    // ),
    discountType: Yup.string().oneOf(
      ["PERCENTAGE", "FIXED"],
      "Invalid discount type"
    ),
    discountedAmount: Yup.number()

      .positive("Must be a positive number")
      .when("discountType", {
        is: "percentage",
        then: (schema) => schema.max(100, "Percentage cannot exceed 100%"),
      }),
    applicableCourses: Yup.array().notRequired(),
  });
  const handleReset = () => {
    formik.resetForm();
  };
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
        const response = await axiosSecure.patch(`/coupon/${item}`, {
          // code: values.code,
          expiresAt: values.expiresAt,
          discountType: values.discountType,
          applicableCourses: Array.isArray(values.applicableCourses)
            ? values.applicableCourses.map((item) => item)
            : null,

          discountedAmount: values.discountedAmount,
        });

        if (response.status === 200) {
          "New Coupon added successfully:", values;

          toast.success(" Coupon Updated successfully");

          // Refetch the updated data
          refetch();
          // Close the modal
          if (onClose) onClose();
          setIsSubmitting(false);
        }
      } catch (error) {
        if (error.status === 400) {
          console.warn("All fields are required");
          toast.error("This code already exists😅");
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

  useEffect(() => {
    if (items) {
      formik.setValues({
        // code: items?.code || "",

        discountType: items?.discountType,
        applicableCourses: items?.applicableCourses,
        discountedAmount: items?.discountedAmount,
        expiresAt: items?.expiresAt?.split("T")[0],
      });

      setSelectedType(items?.discountType);
    }
  }, [items]);
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

  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    // Check if courseOptions and applicableCourses exist
    if (courseOptions && items?.applicableCourses) {
      const selected = courseOptions.filter((course) =>
        items?.applicableCourses?.includes(course.value)
      );
      selected; // Log selected courses for debugging
      setSelectedCourse(
        selected.map((i) => ({ value: i.value, label: i.label }))
      );
    }
  }, [courseOptions, items?.applicableCourses]); // Adjusted dependency array

  selectedCourse; // Log to see the final state of selectedCourse

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
        {/* <div className="">
          <Label htmlFor="code" className="w-1/4 text-sm font-medium">
            Coupon Code
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
        </div> */}

        {/* Expiration Date */}
        <div className=" ">
          <Label htmlFor="expiresAt" className="w-1/4 text-sm font-medium">
            Expiry Date
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
            Discount Type
          </Label>
          <div className="flex-1">
            <Select
              id="discountType"
              options={discountTypes}
              placeholder="Select discount type"
              styles={customStyles}
              value={discountTypes.find((i) => i.value === selectedType)}
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
            Discount Amount
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
            Applicable Courses
          </Label>
          <div className="flex-1">
            <Select
              isMulti
              className="w-full"
              components={{ DropdownIndicator }}
              options={courseOptions}
              placeholder="Select Courses"
              styles={customStyles}
              value={selectedCourse}
              onChange={(selected) => {
                const selectedValues =
                  selected?.map((option) => option.value) || [];
                setSelectedOptions(selectedValues);
                setSelectedCourse(selected);
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
              handleReset(), onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isSubmitting ? <ButtonLoader /> : "Update Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponUpdate;
