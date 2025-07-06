import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import Select, { components } from "react-select";
import { toast } from "sonner";
import { FileUp } from "lucide-react";
import { getChapter, getCourse, getTeacher } from "@/Api/selectorApi";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ButtonLoader from "@/components/global/ButtonLoader";

const UploadClass = ({ refetch, onClose, courseId }) => {
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure()
  const options = [
    { value: "1", label: "One" },
    { value: "2", label: "Two" },
  ];
  const typeOptions = [
    { value: "RECORDED", label: "Recorded" },
    { value: "LIVE", label: "Live" },
  ];

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
  const uploadSlide = async (files) => {
    if (!Array.isArray(files)) {
      files = [files];
    }
    // ("Files to upload:", files);

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));
    try {
      const response = await axios.post(
        "https://cdn.englishhealer.com/v1/upload/class-slides",
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
  const uploadPracticeSheet = async (files) => {
    if (!Array.isArray(files)) {
      files = [files];
    }
    // ("Files to upload:", files);

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));
    try {
      const response = await axios.post(
        "https://cdn.englishhealer.com/v1/upload/practice-sheets",
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
  const uploadPracticeSheetSolution = async (files) => {
    if (!Array.isArray(files)) {
      files = [files];
    }
    // ("Files to upload:", files);

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));
    try {
      const response = await axios.post(
        "https://cdn.englishhealer.com/v1/upload/practice-sheets",
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

  const { data: item } = useQuery({
    queryKey: ["courseataformcourse", courseId],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get(`/course/${courseId}`);
        res.data; // For debugging purposes
        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
    refetchInterval: 5000, // Automatically refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when the window is focused
  });

  const [chapterOptions, setChapterOptions] = useState([]);

  // Fetch Course options from API
  useEffect(() => {
    try {
      const options = item?.chapters?.map((i) => ({
        value: i?._id, // Backend's teacher ID
        label: i?.name, // Displayed teacher name
      }));
      setChapterOptions(options);
    } catch (error) {
      console.error("Error fetching Courses:", error);
    }
  }, [item]);

  item;

  // Fetch teacher options from API
  const [teacherOptions, setTeacherOptions] = useState([]);
  useEffect(() => {
    try {
      const options = item?.teachers?.map((teachers) => ({
        value: teachers?._id, // Backend's teacher ID
        label: teachers?.name, // Displayed teacher name
      }));
      setTeacherOptions(options);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }, [item]);

  const handleReset = () => {
    formik.resetForm();
    setSelectedChapter([]);

    setSelectedTeacher([]);
  };
  // Formik configuration
  const formik = useFormik({
    initialValues: {
      className: "",
      description: "",
      chapter: "",
      course: "",
      classSlide: "",
      practiceSheet: "",
      practiceSheetSolution: "",
      teacher: "",
      thumbnail: null,
      startTime: null,

      classLink: "",
      type: "RECORDED",
    },
    validationSchema: Yup.object({
      className: Yup.string()
        .required("Course name is required")
        .min(3, "Course name must be at least 3 characters long"),
      description: Yup.string().min(
        10,
        "Description must be at least 10 characters"
      ),
      chapter: Yup.string().required("Select chapter"),

      classSlide: Yup.mixed(),
      practiceSheet: Yup.mixed(),
      practiceSheetSolution: Yup.mixed(),
      teacher: Yup.string().required("Teacher name is required"),
      thumbnail: Yup.mixed().required("Course Thumbnail is required"),
      startTime: Yup.date(),

      classLink: Yup.string()
        .required("Class link is required")
        .url("Enter a valid URL"),
      type: Yup.string().oneOf(["RECORDED", "LIVE"], "Invalid class type"),
    }),
    //Chapter Creator Submit button
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      if (values.thumbnail) {
        const imageUrl = await uploadImage(values.thumbnail);
        if (imageUrl) {
          values.thumbnail = imageUrl?.data?.fileUrls[0];
        }
      }
      if (values.classSlide) {
        const Url = await uploadSlide(values.classSlide);
        Url;
        if (Url) {
          values.classSlide = Url?.data?.fileUrls[0];
        }
      }
      if (values.practiceSheet) {
        const Url = await uploadPracticeSheet(values.practiceSheet);
        Url;
        if (Url) {
          values.practiceSheet = Url?.data?.fileUrls[0];
        }
      }
      if (values.practiceSheetSolution) {
        const Url = await uploadPracticeSheetSolution(
          values.practiceSheetSolution
        );
        Url;
        if (Url) {
          values.practiceSheetSolution = Url?.data?.fileUrls[0];
        }
      }

      values;
      try {
        const response = await useAxiosSecure.post("/class/add", {
          title: values.className,
          description: values.description,
          chapter: values.chapter,
          course: courseId,
          classSlide: values.classSlide,
          practiceSheet: values.practiceSheet,
          practiceSheetSolution: values.practiceSheetSolution,
          teacher: values.teacher,
          featuredImgUrl: values.thumbnail,
          startTime: values.startTime,
          videoUrl: values.classLink,
          type: values.type,
        });

        if (response.status === 201) {
          "New Class added successfully:", values;

          toast.success("New Class Added successfully");

          // Reset form values
          handleReset();

          // Close the modal
          if (onClose) onClose();
          // Refetch the updated data
          refetch();
          setIsSubmitting(false);
        }
        //all response Status Check
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
        console.error("Error adding :", error);
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

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        console.error("File size should be less than 10MB");
        return;
      }
      formik.setFieldValue("thumbnail", file);
    }
  };
  const handleClassSlide = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        console.error("File size should be less than 10MB");
        return;
      }
      formik.setFieldValue("classSlide", file);
    }
  };
  const handlePracticeSheet = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        console.error("File size should be less than 10MB");
        return;
      }
      formik.setFieldValue("practiceSheet", file);
    }
  };
  const handlePracticeSheetSolution = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        console.error("File size should be less than 10MB");
        return;
      }
      formik.setFieldValue("practiceSheetSolution", file);
    }
  };

  const [selectedType, setSelectedType] = useState(null);
  return (
    <div className="">
      <form className=" space-y-4" onSubmit={formik.handleSubmit}>
        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Class Name */}
          <div className="w-full flex-1">
            <Label htmlFor="className" className="font-medium">
              Class Name <span className="text-xl text-red-500 ">*</span>
            </Label>
            <Input
              id="className"
              name="className"
              type="text"
              placeholder="Enter course name"
              className="mt-1"
              value={formik.values.className}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.className && formik.errors.className ? (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.className}
              </p>
            ) : null}
          </div>
          {/* chapter */}{" "}
          <div className="w-full flex-1">
            <div className="">
              <Label className="block">
                Chapter <span className="text-xl text-red-500 ">*</span>
              </Label>
            </div>
            <Select
              className="custom-select w-full h-[40px] rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] mt-1"
              components={{ DropdownIndicator }}
              options={chapterOptions}
              placeholder="Select Chapter"
              styles={customStyles}
              value={options.find((option) => option.value === selectedChapter)}
              onChange={(selectedOption) => {
                const selectedValue = selectedOption
                  ? selectedOption.value
                  : null;
                setSelectedChapter(selectedValue); // Update local state
                formik.setFieldValue("chapter", selectedValue); // Update Formik
              }}
            />
            {formik.touched.chapter && formik.errors.chapter && (
              <small className="text-red-500 text-sm">
                {formik.errors.chapter}
              </small>
            )}
          </div>
        </div>

        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Type */}
          <div className="w-full flex-1">
            <Label htmlFor="type" className="font-medium">
              Class Type <span className="text-xl text-red-500">*</span>
            </Label>
            <Select
              id="type"
              name="type"
              className="mt-1"
              components={{ DropdownIndicator }}
              options={typeOptions}
              styles={customStyles}
              value={typeOptions.find(
                (option) => option.value === formik.values.type
              )}
              onChange={(selectedOption) => {
                formik.setFieldValue("type", selectedOption.value);
                setSelectedType(selectedOption.value);
              }}
              onBlur={formik.handleBlur}
              placeholder="Select class type"
            />
            {formik.touched.type && formik.errors.type && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.type}</p>
            )}
          </div>

          {/* Teacher Name */}
          <div className="w-full flex-1">
            <div className="">
              <Label className="block">
                Teacher <span className="text-xl text-red-500 ">*</span>
              </Label>
            </div>
            <Select
              className="custom-select w-full h-[40px] rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] mt-1"
              components={{ DropdownIndicator }}
              options={teacherOptions}
              placeholder="Select Teacher"
              styles={customStyles}
              value={options.find((option) => option.value === selectedTeacher)}
              onChange={(selectedOption) => {
                const selectedValue = selectedOption
                  ? selectedOption.value
                  : null;
                setSelectedTeacher(selectedValue); // Update local state
                formik.setFieldValue("teacher", selectedValue); // Update Formik
              }}
            />
            {formik.touched.teacher && formik.errors.teacher && (
              <small className="text-red-500  text-sm">
                {formik.errors.teacher}
              </small>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="">
          <Label htmlFor="description" className="font-medium">
            Class Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter class description..."
            className="mt-1"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.description && formik.errors.description ? (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center flex-col gap-2">
          {/* Practice Sheet */}
          <div className="w-full ">
            <Label htmlFor="  " className="font-medium">
              Practice Sheet
            </Label>
            <label
              htmlFor="practiceSheet"
              className="border border-dashed border-gray-300 p-3 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2"
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
              <Input
                id="practiceSheet"
                name="practiceSheet"
                type="file"
                placeholder="Enter slide"
                className="mt-2 hidden"
                accept=".pdf,.ppt,.pptx,.png,.jpg,.svg"
                onChange={handlePracticeSheet}
              />
            </label>
            {formik.values.practiceSheet &&
              formik.values.practiceSheet.size > 0 && (
                <p className="text-sm mt-1">
                  {formik.values.practiceSheet.name} -{" "}
                  {(formik.values.practiceSheet.size / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </p>
              )}
            {formik.touched.practiceSheet && formik.errors.practiceSheet ? (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.practiceSheet}
              </p>
            ) : null}
          </div>

          {/* Practice Sheet Solution */}
          <div className="w-full ">
            <Label htmlFor=" " className="font-medium">
              Practice Sheet Solution
            </Label>
            <label
              htmlFor="practiceSheetSolution"
              className="border border-dashed border-gray-300 p-3 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2"
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
              <Input
                id="practiceSheetSolution"
                name="practiceSheetSolution"
                type="file"
                placeholder="Enter slide"
                className="mt-2 hidden"
                accept=".pdf,.ppt,.pptx,.png,.jpg,.svg"
                onChange={handlePracticeSheetSolution}
              />
            </label>
            {formik.values.practiceSheetSolution &&
              formik.values.practiceSheetSolution.size > 0 && (
                <p className="text-sm mt-1">
                  {formik.values.practiceSheetSolution.name} -{" "}
                  {(
                    formik.values.practiceSheetSolution.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>
              )}
            {formik.touched.practiceSheetSolution &&
              formik.errors.practiceSheetSolution ? (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.practiceSheetSolution}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Class slide */}
          <div className="w-full flex-1">
            <Label htmlFor=" " className="font-medium">
              Class Slide
            </Label>
            <label
              htmlFor="classSlide"
              className="border border-dashed border-gray-300 p-3 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2"
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
              <Input
                id="classSlide"
                name="classSlide"
                type="file"
                placeholder="Enter slide"
                className="mt-2 hidden"
                accept=".pdf,.ppt,.pptx,.png,.jpg,.svg"
                onChange={handleClassSlide}
              />
            </label>
            {formik.values.classSlide && formik.values.classSlide.size > 0 && (
              <p className="text-sm mt-1">
                {formik.values.classSlide.name} -{" "}
                {(formik.values.classSlide.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            {formik.touched.classSlide && formik.errors.classSlide ? (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.classSlide}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Start time */}
          <div className="w-full flex-1">
            <Label htmlFor="startTime" className="font-medium">
              Start Time <span className="text-xl text-red-500">*</span>
            </Label>
            <Input
              id="startTime"
              name="startTime"
              type="datetime-local"
              placeholder="Enter date"
              className="mt-1"
              value={formik.values.startTime}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.startTime && formik.errors.startTime ? (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.startTime}
              </p>
            ) : null}
          </div>
          {/* Class Link */}

          {selectedType === "LIVE" ? (
            ""
          ) : (
            <div className="w-full flex-1">
              <Label htmlFor="classLink" className="font-medium">
                Class Link <span className="text-xl text-red-500 ">*</span>
              </Label>
              <Input
                id="classLink"
                name="classLink"
                type="url"
                placeholder="Enter class link"
                className="mt-1"
                value={formik.values.classLink}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.classLink && formik.errors.classLink ? (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.classLink}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="">
          <Label htmlFor="thumbnail" className="block">
            Class Thumbnail <span className="text-xl text-red-500 ">*</span>
          </Label>
          <label
            htmlFor="thumbnail"
            className="border border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2 mt-1"
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
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept=".svg, .jpg, .png"
              className="hidden "
              onChange={handleImageChange}
            />
          </label>
          {formik.values.thumbnail && formik.values.thumbnail.size > 0 && (
            <p className="text-sm mt-1">
              {formik.values.thumbnail.name} -{" "}
              {(formik.values.thumbnail.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
          {formik.touched.thumbnail && formik.errors.thumbnail && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.thumbnail}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 justify-end">
          <Button
            variant="destructive"
            size="default"
            className="mt-2"
            onClick={() => {
              formik.resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="default"
            type="submit"
            className="mt-2"
          >
            {isSubmitting ? <ButtonLoader /> : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadClass;
