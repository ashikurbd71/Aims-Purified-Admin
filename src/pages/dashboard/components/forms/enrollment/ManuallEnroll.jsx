import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { Button } from "@/components/ui/button";
import { getCourse } from "@/Api/selectorApi";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import { AuthContext } from "@/contexts/AuthContext";
import ButtonLoader from "@/components/global/ButtonLoader";
import useStudentData from "@/hooks/useStudentData";
import useCourseData from "@/hooks/useCourseData";
import useBookData from "@/hooks/useBookData";
import Select, { components } from "react-select";
import useEnrollmentData from "@/hooks/useEnrollmentData";
const ManuallEnroll = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, studentDataRefetch] = useStudentData();
  const [courseData, courseRefetch] = useCourseData();
  const [bookData, bookRefetch] = useBookData();
  const [, enrollmentRefetch] = useEnrollmentData();
  const axiosSecure = useAxiosSecure();

  const { user } = useContext(AuthContext);
  const formik = useFormik({
    initialValues: {
      phoneNumber: "",
      courseId: null,
      books: [],
      transactionNumber: "",
      discountedAmount: 0,
    },
    validationSchema: Yup.object({
      phoneNumber: Yup.string()
        .matches(/^\d{11}$/, "Phone number must be 11 digits")
        .required("Phone number is required"),
      courseId: Yup.object()
        .shape({
          value: Yup.string().required(),
          label: Yup.string().required(),
        })
        .nullable()
        .required("Course ID is required"),
      discountedAmount: Yup.number().required("Discounted Amount is required"),
      transactionNumber: Yup.string().required(
        "Transaction number is required"
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      console.log(values);

      try {
        const response = await axiosSecure.post("/enrollment/manually", {
          number: values.phoneNumber,
          courseId: values.courseId.value,
          books: Array.isArray(values.books) ? values.books : [],
          transactionId: values.transactionNumber,
          discountedAmount: values.discountedAmount,
          enrolledBy: user?.displayName,
        });

        if (response.status === 201) {
          toast.success("Manual Enrollment successfully");
          resetForm();
          studentDataRefetch();
          onClose?.();
        } else if (response.status === 200) {
          toast.success("Student is already enrolled in this course");
          resetForm();
          studentDataRefetch();
          onClose?.();
        }
      } catch (error) {
        toast.error(
          error.response?.status === 400
            ? "No students found for enrollment"
            : error.response?.data?.message || "Something went wrong"
        );
      } finally {
        setIsSubmitting(false);
        enrollmentRefetch();
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
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">
            Select student <span className="text-red-500">*</span>
          </label>
          <Select
            options={studentData?.map((student) => ({
              label: student.name,
              value: student.number,
            }))}
            value={
              studentData?.find(
                (student) => student.number === formik.values.phoneNumber
              )
                ? {
                    label: studentData.find(
                      (student) => student.number === formik.values.phoneNumber
                    ).name,
                    value: formik.values.phoneNumber,
                  }
                : null
            }
            onChange={(option) =>
              formik.setFieldValue("phoneNumber", option.value)
            }
            placeholder="Enter phone number"
          />

          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <div className="text-red-500 text-sm">
              {formik.errors.phoneNumber}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1">
            Crouse Name<span className="text-red-500">*</span>
          </label>
          <Select
            options={courseData?.map((course) => ({
              label: course?.name,
              value: course?._id,
            }))}
            value={formik.values.courseId}
            onChange={(option) => formik.setFieldValue("courseId", option)}
            placeholder="Select a course"
          />
          {formik.touched.courseId && formik.errors.courseId && (
            <div className="text-red-500 text-sm">
              {formik.errors.courseId.label}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 pb-4 ">
          <label className="block mb-1">Books Name</label>
          <div className="col-span-3">
            <Select
              isMulti
              className="custom-select w-full rounded-sm mt-2"
              components={{ DropdownIndicator }}
              options={bookData?.map((i) => ({
                label: i.name,
                value: i._id,
              }))}
              placeholder="Select Books"
              styles={customStyles}
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions
                  ? selectedOptions.map((option) => option.value)
                  : [];
                formik.setFieldValue("books", selectedValues);
              }}
            />
          </div>
        </div>

        {/* discountedAmount */}

        <div className="mb-4">
          <label className="block mb-1">
            Discounted Amount <span className="text-red-500">*</span>
          </label>
          <input
            name="discountedAmount"
            type="number"
            className="w-full p-2 border rounded"
            placeholder="Enter transaction number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.discountedAmount}
          />
          {formik.touched.discountedAmount &&
            formik.errors.discountedAmount && (
              <div className="text-red-500 text-sm">
                {formik.errors.discountedAmount}
              </div>
            )}
        </div>

        <div className="mb-4">
          <label className="block mb-1">
            Transaction Number <span className="text-red-500">*</span>
          </label>
          <input
            name="transactionNumber"
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter transaction number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.transactionNumber}
          />
          {formik.touched.transactionNumber &&
            formik.errors.transactionNumber && (
              <div className="text-red-500 text-sm">
                {formik.errors.transactionNumber}
              </div>
            )}
        </div>

        <div className="pt-4 text-right">
          <Button variant="default" size="sm" type="submit">
            {isSubmitting ? <ButtonLoader /> : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManuallEnroll;
