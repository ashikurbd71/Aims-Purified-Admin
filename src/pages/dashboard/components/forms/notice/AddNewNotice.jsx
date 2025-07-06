import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp } from "lucide-react";
import Select, { components } from "react-select";
import { getCourse, getTeacher } from "@/Api/selectorApi";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import { AuthContext } from "@/contexts/AuthContext";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import ButtonLoader from "@/components/global/ButtonLoader";

const NoticeForm = ({ refetch, onClose }) => {
  const [selectedOptions, SetSelectedOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure()
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
        "https://cdn.englishhealer.com/v1/upload/notices",
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

  const uploadMultipleImages = async (files) => {
    try {
      const uploadPromises = Array.from(files).map((file) => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      return urls.filter((url) => url !== null);
    } catch (error) {
      console.error("Multiple upload failed:", error);
      return [];
    }
  };

  const handleFeaturedImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        console.error("File size should be less than 10MB");
        return;
      }
      formik.setFieldValue("featuredImgUrl", file);
    }
  };

  const handleFilesChange = async (event) => {
    const files = Array.from(event.currentTarget.files);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        console.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });
    formik.setFieldValue("files", validFiles);
  };

  // Fetch Course options from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCourse();
        // Transform API response to match Select component format
        const options = data?.data?.map((course) => ({
          value: course._id, // Backend's teacher ID
          label: course.name, // Displayed teacher name
        }));
        setCourseOptions(options);
      } catch (error) {
        console.error("Error fetching Courses:", error);
      }
    };

    fetchData();
  }, []);

  const handleReset = () => {
    formik.resetForm();
    setCourseOptions([]);
    SetSelectedOptions([]);
  };
  // Add Notice
  const formik = useFormik({
    initialValues: {
      title: "", // Single-select field
      description: "",
      course: [],
      featuredImgUrl: "",
      files: [],
      addedBy: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required").trim(),
      description: Yup.string().trim(),
      course: Yup.array(),
      featuredImgUrl: Yup.mixed(),
      files: Yup.array().of(Yup.string()),
      addedBy: Yup.string().trim(),
    }),

    //Notice Creator Submit button

    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      // image upload
      let updatedValues = { ...values };

      // Handle featured image upload
      if (values.featuredImgUrl instanceof File) {
        const featuredImageUrl = await uploadImage(values.featuredImgUrl);
        if (featuredImageUrl) {
          updatedValues.uploadedFeaturedImageUrl =
            featuredImageUrl?.data?.fileUrls[0];
          formik.setFieldValue("uploadedFeaturedImageUrl", featuredImageUrl);
        }
      }

      // Handle multiple files upload
      if (values.files?.length > 0) {
        const fileUrlsResponse = await uploadMultipleImages(values.files);
        const fileUrls = fileUrlsResponse
          .filter((response) => response.success)
          .flatMap((response) => response.data?.fileUrls || []);

        if (fileUrls.length > 0) {
          updatedValues.uploadedFileUrls = fileUrls;
          formik.setFieldValue("uploadedFileUrls", fileUrls);
        }
      }

      // Use the uploaded URLs in your final submission
      const finalSubmission = {
        ...updatedValues,
        featuredImgUrl: updatedValues.uploadedFeaturedImageUrl,
        files: updatedValues.uploadedFileUrls,
      };

      "Form Values:", finalSubmission;
      try {
        const response = await axiosSecure.post("/notice/add", {
          title: values.title,
          description: values.description,
          courses: Array.isArray(values.course)
            ? values.course.map((item) => item)
            : null,
          featuredImgUrl: updatedValues.uploadedFeaturedImageUrl,
          files: updatedValues.uploadedFileUrls,
          addedBy: user?.reloadUserInfo?.localId,
        });

        if (response.status === 201) {
          "New Notice added successfully:", values;

          toast.success("New Notice Added successfully");

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
        } else {
          console.error("Unexpected status code:", error.status);
          // toast.error("Unexpected error occurred. Please try again.");
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
    <div>
      <form className="mt-3 space-y-4" onSubmit={formik.handleSubmit}>
        {/* Title */}
        <div>
          <Label htmlFor="title" className="font-medium">
            Title <span className="text-xl text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            type="text"
            placeholder="Enter Title"
            className="mt-1"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.title && formik.errors.title ? (
            <p className="text-red-500 text-sm mt-1">{formik.errors.title}</p>
          ) : null}
        </div>
        {/* Description */}
        <div className="mt-3">
          <Label htmlFor="description" className="font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            type="text"
            placeholder="Enter Description"
            className="mt-1"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        {/* Teacher */}
        {/* <div className="mt-3">
          <div className="">
            <Label className="block">Teacher</Label>
          </div>
          <Select
            className="custom-select w-full h-[40px] rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] mt-2"
            components={{ DropdownIndicator }}
            options={teachersOptions}
            placeholder="Select subject"
            styles={customStyles}
            value={teachersOptions.find(
              (option) => option.value === selectedTeacher
            )}
            onChange={(selectedOption) => {
              const selectedValue = selectedOption
                ? selectedOption.value
                : null;
              setSelectedTeacher(selectedValue); // Update local state
              formik.setFieldValue("addedBy", selectedValue); // Update Formik
            }}
          />
          {formik.touched.addedBy && formik.errors.addedBy && (
            <small className="text-red-500  text-sm">
              {formik.errors.addedBy}
            </small>
          )}
        </div> */}
        {/* Course */}{" "}
        <div className="mt-3">
          <div className="relative w-fit">
            <label className="block">
              Course <span className="text-xl text-red-500">*</span>
            </label>
          </div>
          <Select
            isMulti
            className="custom-select w-full h-auto  rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] mt-2"
            components={{ DropdownIndicator }} // Optional for custom behavior
            options={courseOptions}
            placeholder="Select Course"
            styles={customStyles}
            value={courseOptions?.filter((option) =>
              selectedOptions.includes(option.value)
            )}
            onChange={(selectedOptions) => {
              const selectedValues = selectedOptions
                ? selectedOptions.map((option) => option.value)
                : [];
              SetSelectedOptions(selectedValues); // Update local state
              formik.setFieldValue("course", selectedValues); // Update Formik state
            }}
          />
          {formik.touched.course && formik.errors.course && (
            <small className="text-red-500 text-sm">
              {formik.errors.course}
            </small>
          )}
        </div>
        {/* Featured Image URL */}
        <div className="space-y-2 mt-3">
          <Label htmlFor=" " className="block">
            Image
          </Label>
          <label
            htmlFor="featuredImgUrl"
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
              id="featuredImgUrl"
              name="featuredImgUrl"
              type="file"
              accept=".svg, .jpg, .png"
              className="hidden"
              onChange={handleFeaturedImageChange}
            />
          </label>
          {formik.values.featuredImgUrl &&
            formik.values.featuredImgUrl.size > 0 && (
              <p className="text-sm mt-1">
                {formik.values.featuredImgUrl.name} -{" "}
                {formik.values.featuredImgUrl.size / 1024 / 1024} MB
              </p>
            )}
          {formik.touched.featuredImgUrl && formik.errors.featuredImgUrl && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.featuredImgUrl}
            </p>
          )}
        </div>
        {/* Files */}
        <div className="mt-3">
          <Label htmlFor=" " className="font-medium block">
            Files
          </Label>
          <label
            htmlFor="files"
            className="border border-dashed border-gray-300 p-2 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2 mt-2"
          >
            <span className="bg-gray-200 dark:text-gray-800 p-3 rounded-full">
              <FileUp />
            </span>
            <p>
              <span className="text-sm text-blue-600 font-medium">
                Click here
              </span>{" "}
              to upload your file.
            </p>
            <span className="text-xs text-gray-500">
              Supported Format: PDF, SVG, JPG, PNG (10mb each)
            </span>
            <Input
              id="files"
              name="files"
              type="file"
              multiple
              accept=".pdf,.svg, .jpg, .png"
              className="   hidden "
              onChange={handleFilesChange}
              onBlur={formik.handleBlur}
            />
          </label>
          {formik.values.files?.length > 0 && (
            <div className="mt-2">
              {formik.values.files.map((file, index) => (
                <p key={index} className="text-sm">
                  {file.name} -{" "}
                  {file.size > 0 ? (
                    <>{(file.size / 1024 / 1024).toFixed(2)} MB</>
                  ) : (
                    ""
                  )}
                </p>
              ))}
            </div>
          )}
          {formik.touched.files && formik.errors.files ? (
            <p className="text-red-500 text-sm mt-1">{formik.errors.files}</p>
          ) : null}
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

export default NoticeForm;
