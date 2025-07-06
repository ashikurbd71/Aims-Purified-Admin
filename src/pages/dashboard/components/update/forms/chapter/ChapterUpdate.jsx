import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileUp, X } from "lucide-react";
import Select, { components } from "react-select";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import ButtonLoader from "@/components/global/ButtonLoader";

const ChapterUpdate = ({ chapter, refetch, onClose }) => {
  const [selectedSubOptions, SetSelectedSubOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload Image
  const { courseId } = useParams();
  courseId;
  const uploadImage = async (files) => {
    if (!Array.isArray(files)) {
      files = [files];
    }
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

    SetSelectedSubOptions([]);
  };

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      chapterName: "",
      description: "",
      featuredImg: "",

      number: "",
    },
    validationSchema: Yup.object({
      chapterName: Yup.string()
        .required("Chapter name is required")
        .min(3, "Chapter name must be at least 3 characters"),
      description: Yup.string().trim(),
      featuredImg: Yup.mixed(),
      subject: Yup.string(),
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
      console.log(values);

      try {
        const response = await useAxiosSecure.patch(
          `/chapter/${chapter?._id}`,
          {
            name: values.chapterName,
            course: courseId,
            featuredImgUrl: values.featuredImg,
            subject: values.subject,
          }
        );

        if (response.status === 200) {
          " Chapter Updated successfully:", values;

          toast.success("New Chapter Added successfully");

          // Refetch the updated data
          refetch();
          // modal close
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
  useEffect(() => {
    if (chapter) {
      formik.setValues({
        chapterName: chapter?.name || "",
        featuredImg: chapter?.featuredImgUrl,
        subject: chapter?.subject,
      });
    }
  }, [chapter]);

  const { data: items } = useQuery({
    queryKey: ["subject", courseId],
    queryFn: async () => {
      try {
        const response = await useAxiosSecure.post("/subject", { courseId });
        "Response data:", response.data;
        return response?.data?.data; // Return the fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Ensure errors are properly thrown
      }
    },
    enabled: !!courseId, // Only run query if courseId exists
  });

  // Map subject options when `item` is available
  useEffect(() => {
    if (items) {
      const options = items.map((subject) => ({
        value: subject._id, // Backend's subject ID
        label: subject.name, // Displayed subject name
      }));
      setSubjectOptions(options);
    }
  }, [items]); // Runs whenever `item` changes
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const selected = subjectOptions?.filter(
      (sub) => sub?.value === chapter?.subject
    );
    selected; // Log to check what selected produces
    setSelectedSubject({ value: items?.value, label: items?.label });
  }, [subjectOptions, chapter?.teachers]);

  console.log(items);

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

  // Function to remove an existing thumbnail
  // const handleThumbnailRemove = () => {
  //   formik.setFieldValue("featuredImg", "");
  // };

  return (
    <div>
      <form className="mt-3" onSubmit={formik.handleSubmit}>
        {/* Chapter Name */}
        <div>
          <Label htmlFor="chapterName" className="font-medium">
            Chapter Name
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
        {/* image */}

        <div className="space-y-2 mt-4">
          <Label htmlFor="" className="block">
            Image
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
        {chapter?.featuredImgUrl ? (
          <div className="relative w-24 h-16 ">
            <img
              src={chapter?.featuredImgUrl || "https://via.placeholder.com/150"}
              alt="Image"
              className="w-24 h-16 object-cover mt-2 rounded-md"
            />
            {/* <span
              className="absolute right-0 top-0 bg-red-500 rounded-full p-[2px] cursor-pointer"
              onClick={() => handleThumbnailRemove()}
            >
              <X size={14} className="text-white hover:text-gray-800" />
            </span> */}
          </div>
        ) : (
          ""
        )}
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
            {isSubmitting ? <ButtonLoader /> : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChapterUpdate;
