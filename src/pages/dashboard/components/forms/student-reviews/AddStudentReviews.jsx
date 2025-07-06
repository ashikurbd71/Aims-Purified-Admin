/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/global/ButtonLoader";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";

import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useCourseData from "@/hooks/useCourseData";


const AddStudentReviews = ({ onClose, refetch }) => {

  const [courseOption, setCourseOptions] = useState([]);
  const [courseData]=useCourseData()

  useEffect(() => {
        const options = courseData.map((course) => ({
          value: course._id,
          label: course.name,
        }));
        setCourseOptions(options)
  }, [courseData])
      

  const reviewTypeOptions = [
    { value: "TEXT", label: "Text" },
    { value: "VIDEO", label: "Video" },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      studentName: "",
      reviewType: "text",
      reviewText: "",
      reviewVideoUrl: "",
      courseId: null,
    },
    validationSchema: Yup.object({
      studentName: Yup.string().required("Student Name is required"),



    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await useAxiosSecure.post("/review", {
          studentName: values.studentName,
          reviewType: values.reviewType,
          courseName: values.courseId?.label,
          reviewText: values.reviewText,
          reviewVideoUrl: values.reviewVideoUrl,
        });

        if (response.status === 201) {
          toast.success("Student Review added successfully");
          formik.resetForm();
          onClose && onClose();
          refetch()
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
        <div className="mt-4">
          <Label className="block pb-2">
            Course Name <span className="text-red-500">*</span>
          </Label>
          <Select
            options={courseOption}
            value={formik.values.courseId}
            onChange={(option) => formik.setFieldValue("courseId", option)}
            placeholder="Select a course"
          />
          {formik.touched.courseId && formik.errors.courseId && (
            <div className="text-red-500 text-sm">{formik.errors.courseId}</div>
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
            {isSubmitting ? <ButtonLoader /> : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentReviews;
