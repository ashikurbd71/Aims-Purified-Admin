import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import { FileUp } from "lucide-react";
import Select, { components } from "react-select";
import { getCourse, getSubject } from "@/Api/selectorApi";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ButtonLoader from "@/components/global/ButtonLoader";
const AddNewChaptar = ({ subjectId, courseId: courseid, refetch, onClose }) => {
  const { courseId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure()
  courseId;

  // Upload Image
  const uploadImage = async (files) => {
    if (!Array.isArray(files)) {
      files = [files];
    }
    // ("Files to upload:", files);

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
        "Uploaded Images Data:", response.data;
        return response.data;
      } else {
        console.error("Image upload failed: Invalid response");
        return null;
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  // reset form
  const handleReset = () => {
    formik.resetForm();
  };

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      chapterName: "",
      description: "",
      featuredImg: "",
      subject: "",
      number: "",
    },
    validationSchema: Yup.object({
      chapterName: Yup.string()
        .required("Chapter name is required")
        .min(3, "Chapter name must be at least 3 characters"),
      description: Yup.string().trim(),
      featuredImg: Yup.mixed(),

      number: Yup.number(),
    }),
    //Chapter Creator Submit button

    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      if (values.featuredImg) {
        const imageUrl = await uploadImage(values.featuredImg);
        if (imageUrl) {
          values.featuredImg = imageUrl?.data?.fileUrls[0];
        }
      }

      try {
        const response = await axiosSecure.post("/chapter/add", {
          name: values.chapterName,
          course: courseId || courseid,
          featuredImgUrl: values.featuredImg,
          subject: subjectId,
        });

        if (response.status === 201) {
          "New Chapter added successfully:", values;

          toast.success("New Chapter Added successfully");

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
        } else if (error.status === 404) {
          console.warn("Chapter does not exist");
          toast.error("Chapter does not exist");
        } else if (error.status === 500) {
          console.error("Internal server error");
          toast.error("Internal server error. Please try again later.");
        } else {
          console.error("Unexpected status code:", error.status);
          // toast.error("Unexpected error occurred. Please try again.");
        }
        console.error("Error adding Manager:", error);
        // toast.error("Failed to add the class. Please try again.");
      }
    },
  });

  // sleep function
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

  // hnalde image change
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        console.error("File size should be less than 10MB");
        return;
      }
      formik.setFieldValue("featuredImg", file);
    }
  };

  return (
    <div>
      <form className="mt-3" onSubmit={formik.handleSubmit}>
        {/* Chapter Name */}
        <div>
          <Label htmlFor="chapterName" className="font-medium">
            Chapter Name <span className="text-xl text-red-500 ">*</span>
          </Label>
          <Input
            id="chapterName"
            name="chapterName"
            type="text"
            placeholder="Enter Chapter Name"
            className="mt-1"
            value={formik.values.chapterName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.chapterName && formik.errors.chapterName ? (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.chapterName}
            </p>
          ) : null}
        </div>
        {/* Course */}

        <div className="space-y-2 mt-4">
          <Label htmlFor="featuredImg" className="block">
            Image <span className="text-xl text-red-500 ">*</span>
          </Label>
          <label
            htmlFor="featuredImg"
            className="border border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            <span className="bg-gray-200 dark:text-gray-800 p-3 rounded-full">
              <FileUp />
            </span>
            <p>
              <span className="text-sm text-blue-600 font-medium">
                Click here
              </span>{" "}
              to upload your file or drag.
            </p>
            <span className="text-xs text-gray-500">
              Supported Format: SVG, JPG, PNG (10mb each)
            </span>
            <Input
              id="featuredImg"
              name="featuredImg"
              type="file"
              accept=".svg, .jpg, .png"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          {formik.values.featuredImg && formik.values.featuredImg.size > 0 && (
            <p className="text-sm mt-1">
              {formik.values.featuredImg.name} -{" "}
              {(formik.values.featuredImg.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
          {formik.touched.featuredImg && formik.errors.featuredImg && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.featuredImg}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex mt-4 items-center gap-3 justify-end">
          <Button
            variant="destructive"
            size="sm"
            className=""
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

export default AddNewChaptar;
