import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileUp, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Select, { components } from "react-select";
import { Button } from "@/components/ui/button";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import { getTeacher } from "@/Api/selectorApi";
import axios from "axios";
import ButtonLoader from "@/components/global/ButtonLoader";

const ProductCreateForm = ({ refetch, onClose }) => {
  const [hasFb, setHasFb] = useState("No");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure()
  const options = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];
  // options for book
  const bookOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];
  const [teacherOptions, setTeacherOptions] = useState([]);

  // Fetch teacher options from APItfhgytr
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTeacher();
        // Transform API response to match Select component format
        const options = data?.data.map((teachers) => ({
          value: teachers._id, // Backend's teacher ID
          label: teachers.name, // Displayed teacher name
        }));
        setTeacherOptions(options);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchData();
  }, []);

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

  const handleThambnailImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        console.error("File size should be less than 10MB");
        return;
      }
      formik.setFieldValue("thumbnail", file);
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

  const handleReset = () => {
    formik.resetForm();
    setSelectedTeacher([]);
    setTeacherOptions([]);
  };

  const formik = useFormik({
    initialValues: {
      slug: "",
      name: "",
      description: "",
      teachers: [],
      price: "",
      discount: "",
      thumbnail: "",
      fbgrouplink: "",
      files: [],
      video: "",
      hasFb: "no",
      approximate_class: "",
      approximate_duration: "",
      approximate_exams: "",
      books_inc: false,
    },
    validationSchema: Yup.object({
      approximate_class: Yup.string().trim(),
      approximate_exams: Yup.string().trim(),
      approximate_duration: Yup.string().trim(),
      books_inc: Yup.boolean().default().notRequired(),
      name: Yup.string().required("Course Name is required"),
      slug: Yup.string().required("Slug is required"),

      teachers: Yup.array(),
      // .min(1, "At least one teacher is required")
      price: Yup.number()
        .required("Course Price is required")
        .min(0, "Price cannot be less than 0"),
      discount: Yup.number()
        .notRequired()
        .test(
          "is-valid-discount",
          "Discount cannot be greater than the price",
          function (value) {
            const { price } = this.parent;
            return value <= price;
          }
        ),
      thumbnail: Yup.mixed().required("Course Thumbnail is required"),
      files: Yup.array().of(Yup.string()).notRequired(),
      video: Yup.string().url("Must be a valid url").notRequired(),
      hasFb: Yup.string().notRequired(),
    }),

    //Course Creator Submit button
    onSubmit: async (values, { resetForm }) => {
      "object", values;
      setIsSubmitting(true);
      // image upload
      let updatedValues = { ...values };

      // Handle Thumbnail image upload
      if (values.thumbnail instanceof File) {
        const thumbnailImg = await uploadImage(values.thumbnail);
        if (thumbnailImg) {
          updatedValues.uploadedThumbnailImg = thumbnailImg?.data?.fileUrls[0];
          formik.setFieldValue("uploadedThumbnailImg", thumbnailImg);
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

      try {
        const response = await axiosSecure.post("/course/add", {
          slug: values.slug.replace(/\s+/g, "-"),
          name: values.name,
          price: values.price,
          discountedPrice: values.discount,
          metadata: {
            description: values.description,
            hasFb: hasFb,
            featuredImage: updatedValues.uploadedThumbnailImg,
            images: updatedValues?.uploadedFileUrls?.map((img) => img),
            fbGroupLink: values.fbgrouplink,
            promoVideo: values.video,
            totalApproximateClasses: values.approximate_class,
            totalApproximateDuration: values.approximate_duration,
            totalApproximateExams: values.approximate_exams,
            areAnyBooksIncluded: values.books_inc,
          },

          teachers: Array.isArray(values.teachers)
            ? values?.teachers?.map((item) => item)
            : null,
        });

        if (response.status === 201) {
          "New Course added successfully:", values;

          toast.success("New Course Added successfully");

          // Reset form values
          handleReset();

          // Refetch the updated data
          refetch();
          // Close the modal
          if (onClose) onClose();
          setIsSubmitting(false);
        } else {
          // toast.error("Something went wrong. Please try again.");
        }
      } catch (error) {
        if (error.status === 400) {
          console.warn("All fields are required");
          toast.error("Slug must be unique");
        } else if (error.status === 404) {
          console.warn("Course does not exist");
          toast.error("Course does not exist");
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
      // toast.error("Failed to add the class. Please try again.");
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
  const [selectedTeacher, setSelectedTeacher] = useState([]);
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className=" space-y-4   backdrop: mt-0">
        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Slug */}
          <div className="w-full flex-1 ">
            <Label htmlFor="slug" className="block">
              Slug <span className="text-xl text-red-500 ">*</span>
            </Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              placeholder="Enter Slug"
              className="w-full"
              value={formik.values.slug}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.slug && formik.errors.slug && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.slug}</p>
            )}
          </div>
          {/* Course Name */}
          <div className="w-full flex-1">
            <Label htmlFor="name" className="block">
              Course Name <span className="text-xl text-red-500 ">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter Course Name"
              className="w-full"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>
        </div>
        {/* Course Description */}
        <div className="">
          <Label htmlFor="description" className="block">
            Course Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter your course description..."
            className="w-full mt-1"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        {/* Assign Teachers */}{" "}
        <div className="">
          <div className="relative w-fit">
            <Label className="block">
              Assign Teacher <span className="text-xl text-red-500">*</span>
            </Label>
          </div>
          <Select
            isMulti
            className="custom-select w-full rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] "
            components={{ DropdownIndicator }}
            options={teacherOptions}
            placeholder="Select Teacher"
            styles={customStyles}
            value={teacherOptions.filter((option) =>
              selectedTeacher.includes(option.value)
            )}
            onChange={(selectedOptions) => {
              const selectedValues = selectedOptions
                ? selectedOptions.map((option) => option.value)
                : [];
              // Update local state

              setSelectedTeacher(selectedValues); // Update local state
              formik.setFieldValue("teachers", selectedValues); // Update Formik
            }}
          />
          {formik.touched.teachers && formik.errors.teachers && (
            <small className="text-red-500 text-sm">
              {formik.errors.teachers}
            </small>
          )}
        </div>
        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Course Price */}
          <div className="w-full flex-1">
            <Label htmlFor="price" className="block">
              Course Price <span className="text-xl text-red-500 ">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="1000 BDT"
              className="w-full mt-1"
              value={formik.values.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onKeyPress={(e) => {
                const invalidChars = ["-", "e", "+"];
                if (invalidChars.includes(e.key)) {
                  e.preventDefault(); // Prevent typing invalid characters
                }
              }}
            />
            {formik.touched.price && formik.errors.price && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.price}</p>
            )}
          </div>
          {/* Discounted Price */}
          <div className="w-full flex-1 mt-3">
            <Label htmlFor="discount" className="block">
              Discounted Price
            </Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              placeholder="999 BDT"
              className="w-full mt-1"
              value={formik.values.discount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onKeyPress={(e) => {
                const invalidChars = ["-", "e", "+"];
                if (invalidChars.includes(e.key)) {
                  e.preventDefault(); // Prevent typing invalid characters
                }
              }}
            />
            {formik.touched.discount && formik.errors.discount && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.discount}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Approximate class and duration */}
          <div className="flex-1 w-full">
            <Label htmlFor="approximate_class" className="block">
              Approximate Class
            </Label>
            <Input
              id="approximate_class"
              name="approximate_class"
              type="text"
              placeholder="15"
              className="w-full mt-2"
              value={formik.values.approximate_class}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onKeyPress={(e) => {
                const invalidChars = ["-", "e", "+"];
                if (invalidChars.includes(e.key)) {
                  e.preventDefault(); // Prevent typing invalid characters
                }
              }}
            />
          </div>
          {/* Approximate duration */}
          <div className="flex-1 w-full">
            <Label htmlFor="approximate_duration" className="block">
              Approximate Duration
            </Label>
            <Input
              id="approximate_duration"
              name="approximate_duration"
              type="text"
              placeholder="2 month"
              className="w-full mt-2"
              value={formik.values.approximate_duration}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onKeyPress={(e) => {
                const invalidChars = ["-", "e", "+"];
                if (invalidChars.includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Approximate exams */}
          <div className="flex-1 w-full">
            <Label htmlFor="approximate_exams" className="block">
              Approximate Exams
            </Label>
            <Input
              id="approximate_exams"
              name="approximate_exams"
              type="text"
              placeholder="20 "
              className="w-full mt-2"
              value={formik.values.approximate_exams}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onKeyPress={(e) => {
                const invalidChars = ["-", "e", "+"];
                if (invalidChars.includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {/* abailable book */}
          <div className="space-y-3 flex-1 ">
            <Label htmlFor="books_inc" className="block">
              Is Books Included
            </Label>
            <div className="flex items-center space-x-4">
              {bookOptions?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2  cursor-pointer"
                >
                  <input
                    type="radio"
                    name="books_inc"
                    value={option?.value}
                    checked={formik.values.books_inc === option.value}
                    onChange={() =>
                      formik.setFieldValue("books_inc", option.value)
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Featured Image URL */}
        <div className=" ">
          <Label htmlFor="thumbnail" className="block">
            Thumbnail <span className="text-xl text-red-500">*</span>
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
              className="hidden"
              onChange={handleThambnailImageChange}
            />
          </label>
          {formik.values.thumbnail && (
            <p className="text-sm mt-1 overflow-hidden">
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
        {/* Files */}
        <div className="">
          <Label htmlFor="files" className="font-medium block">
            Images
          </Label>
          <label
            htmlFor="files"
            className="border border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2 mt-2"
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
              Supported Format: SVG, JPG, PNG (10mb each)
            </span>
            <Input
              id="files"
              name="files"
              type="file"
              multiple
              accept=".svg, .jpg, .png"
              className=" hidden "
              onChange={handleFilesChange}
              onBlur={formik.handleBlur}
            />
          </label>
          {formik.values.files?.length > 0 && (
            <div className="mt-2 overflow-hidden">
              {formik?.values?.files?.map((file, index) => (
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
        {/* promo */}
        <div className="space-y-2 mt-3 ">
          <Label htmlFor="video" className="block">
            Promo Video
          </Label>
          <Input
            id="video"
            name="video"
            type="text"
            placeholder="Url"
            className="w-full"
            value={formik.values.video}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.video && formik.errors.video && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.video}</p>
          )}
        </div>
        {/* Facebook Group Link */}
        <div className="space-y-2 mt-3">
          <Label htmlFor="hasFb" className="block">
            Has Facebook
          </Label>
          <div className="flex items-center space-x-4">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2  cursor-pointer"
              >
                <input
                  type="radio"
                  name="hasFb"
                  value={option.value}
                  checked={formik.values.hasFb === option.value}
                  onChange={() => formik.setFieldValue("hasFb", option.value)} // Update Formik's state directly
                  className="w-5 h-5"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          {formik.touched.hasFb && !formik.values.hasFb && (
            <p className="text-red-500 text-sm mt-1">Please select an option</p>
          )}
        </div>
        {/* Facebook Group Link Input */}
        {formik.values.hasFb === "yes" && (
          <div className="space-y-2 mt-3">
            <Label htmlFor="fbgrouplink" className="block">
              Group Link<span className="text-red-500">*</span>
            </Label>
            <Input
              id="fbgrouplink"
              name="fbgrouplink"
              type="text"
              placeholder="Url"
              {...formik.getFieldProps("fbgrouplink")}
            />
            {formik.touched.fbgrouplink && formik.errors.fbgrouplink && (
              <p className="text-red-500 text-sm">
                {formik.errors.fbgrouplink}
              </p>
            )}
          </div>
        )}
        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="destructive"
            type="button"
            onClick={() => {
              formik.resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isSubmitting ? <ButtonLoader /> : "Submit"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProductCreateForm;
