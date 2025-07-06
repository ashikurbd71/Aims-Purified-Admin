/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select, { components } from "react-select";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/global/ButtonLoader";
import { Textarea } from "@/components/ui/textarea";


import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useCourseData from "@/hooks/useCourseData";

const UpdateStudentReview = ({ onClose, reviewData, refetch }) => {
    const [courseData]=useCourseData()

  const [courseOption, setCourseOptions] = useState([]);

  useEffect(() => {
    const options = courseData.map((course) => ({
      value: course._id,
      label: course.name,
    }));
    setCourseOptions(options)
}, [courseData])

  const [selectedCourse, setSelectedCourse] = useState(null);
  useEffect(() => {
    if (courseOption && reviewData?.courseName) {
      const selected = courseOption.find((course) =>
        reviewData.courseName.includes(course.label)
      );

      setSelectedCourse(
        selected ? { value: selected.value, label: selected.label } : null
      );
    }
  }, [courseOption, reviewData.courseName, reviewData.courses]);

  console.log(selectedCourse);

  const reviewTypeOptions = [
    { value: "TEXT", label: "Text" },
    { value: "VIDEO", label: "Video" },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      studentName: "",
      reviewType: "TEXT",
      reviewText: "",
      reviewVideoUrl: "",
      courseId: null, // Ensure courseId is initialized
    },
    validationSchema: Yup.object({
      studentName: Yup.string().required("Student Name is required"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await useAxiosSecure.patch(
          `/review/${reviewData?._id}`,
          {
            studentName: values.studentName,
            reviewType: values.reviewType,
            courseName: values.courseId,
            reviewText: values.reviewText,
            reviewVideoUrl: values.reviewVideoUrl,
          }
        );

        if (response.status === 200) {
          toast.success("Student Review Update successfully");
          formik.resetForm();
          onClose && onClose();
          refetch();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          toast.error("All fields are required");
        } else if (error.response?.status === 500) {
          toast.error("Internal server error. Please try again later.");
        } else {
          console.error("Unexpected error:", error);
          toast.error("Something went wrong. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (reviewData) {
      formik.setValues({
        studentName: reviewData?.studentName || "",
        reviewType: reviewData?.reviewType,
        courseId: reviewData?.courseName,
        reviewText: reviewData?.reviewText,
        reviewVideoUrl: reviewData?.reviewVideoUrl,
      });
    }
  }, [formik, reviewData]);

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
    <div>
      <form className="mt-3" onSubmit={formik.handleSubmit}>
        {/* Student Name */}
        <div className="pt-4">
          <Label className="block">
            Student Name <span className="text-xl text-red-500">*</span>
          </Label>
          <Input
            type="text"
            name="studentName"
            placeholder="Enter student name"
            className="mt-2"
            {...formik.getFieldProps("studentName")}
          />
          {formik.touched.studentName && formik.errors.studentName && (
            <small className="text-red-500 text-sm">
              {formik.errors.studentName}
            </small>
          )}
        </div>

        {/* Course Name */}
        <div className="mt-3">
          <div className="relative w-fit">
            <label className="block">Course</label>
          </div>
          <Select
            className="custom-select w-full rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] mt-2"
            components={{ DropdownIndicator }} // Optional for custom behavior
            options={courseOption}
            placeholder="Select Course"
            styles={customStyles}
            value={selectedCourse}
            onChange={(selectedOption) => {
              // SetSelectedOptions(selectedOption?.value || ""); // Update local state
              setSelectedCourse(selectedOption); // Update Select component state
              formik.setFieldValue("courseId", selectedOption?.label || ""); // Update Formik state
            }}
          />
          {formik.touched.courseId && formik.errors.courseId && (
            <small className="text-red-500 text-sm">
              {formik.errors.courseId}
            </small>
          )}
        </div>

        {/* Review Type */}
        <div className="mt-4">
          <Label className="block mb-2">Review Type</Label>
          <Select
            options={reviewTypeOptions}
            value={reviewTypeOptions.find(
              (option) => option.value === formik.values.reviewType
            )}
            onChange={(selectedOption) =>
              formik.setFieldValue("reviewType", selectedOption.value)
            }
          />
        </div>

        {/* Review Text */}
        {formik.values.reviewType === "TEXT" && (
          <div className="pt-4">
            <Label className="block">
              Review Text <span className="text-xl text-red-500">*</span>
            </Label>
            <Textarea
              name="reviewText"
              placeholder="Enter review"
              className="mt-2"
              {...formik.getFieldProps("reviewText")}
            />
            {formik.touched.reviewText && formik.errors.reviewText && (
              <small className="text-red-500 text-sm">
                {formik.errors.reviewText}
              </small>
            )}
          </div>
        )}

        {/* Review Video URL */}
        {formik.values.reviewType === "VIDEO" && (
          <div className="pt-4">
            <Label className="block">
              Review Video URL <span className="text-xl text-red-500">*</span>
            </Label>
            <Input
              type="url"
              name="reviewVideoUrl"
              placeholder="Enter video URL"
              className="mt-2"
              {...formik.getFieldProps("reviewVideoUrl")}
            />
            {formik.touched.reviewVideoUrl && formik.errors.reviewVideoUrl && (
              <small className="text-red-500 text-sm">
                {formik.errors.reviewVideoUrl}
              </small>
            )}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex mt-4 items-center gap-3 justify-end">
          <Button variant="destructive" size="sm" onClick={onClose}>
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

export default UpdateStudentReview;
