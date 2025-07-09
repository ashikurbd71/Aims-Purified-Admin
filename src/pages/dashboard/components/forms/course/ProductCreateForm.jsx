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

import axios from "axios";
import ButtonLoader from "@/components/global/ButtonLoader";
import { getCategory } from "@/Api/selectorApi";

const ProductCreateForm = ({ refetch, onClose }) => {
  const [hasFb, setHasFb] = useState("No");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  const axiosSecure = useAxiosSecure()
  const IMGBB_API_KEY = '90087a428cac94ac2e8021a26aeb9f9e';
  // options for book
  const productColor = [
    { value: 'red', label: "Red" },
    { value: 'green', label: "Green" },
    { value: 'blue', label: "Blue" },
    { value: 'yellow', label: "Yellow" },
    { value: 'black', label: "Black" },
    { value: 'white', label: "White" },
    { value: 'orange', label: "Orange" },
    { value: 'purple', label: "Purple" },
    { value: 'pink', label: "Pink" },
    { value: 'brown', label: "Brown" },
    { value: 'grey', label: "Grey" },
  ];
  const [categoryOptions, setCategorytOptions] = useState([]);

  // Fetch teacher options from APItfhgytr
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategory();
        // Transform API response to match Select component format
        const options = data?.data.map((cate) => ({
          value: cate.id, // Backend's teacher ID
          label: cate.name, // Displayed teacher name
        }));
        setCategorytOptions(options);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchData();
  }, []);

  // Upload Image

  const uploadImage = async (file) => {
    if (!file) {
      console.error("No file provided for upload.");
      return null;
    }

    const formData = new FormData();
    formData.append("image", file); // ImgBB expects the key 'image' for the file

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (
        (response?.status === 200 || response?.status === 201) &&
        response?.data?.data?.url // Access the URL from ImgBB's response structure
      ) {
        console.log("Uploaded Image Data:", response.data.data.url);
        return response.data.data.url; // Return the direct URL
      } else {
        console.error("Image upload failed: Invalid response from ImgBB", response);
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
      return urls.filter((url) => url !== null); // Filter out any failed uploads
    } catch (error) {
      console.error("Multiple upload failed:", error);
      return [];
    }
  };

  const handleThambnailImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // Keep your 10MB limit
        console.error("File size should be less than 10MB");
        toast.error("Thumbnail file size should be less than 10MB");
        return;
      }
      formik.setFieldValue("thumbnail", file);
    }
  };

  const handleFilesChange = async (event) => {
    const files = Array.from(event.currentTarget.files);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) { // Keep your 10MB limit
        console.error(`${file.name} exceeds 10MB limit`);
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });
    formik.setFieldValue("files", validFiles);
  };

  const handleReset = () => {
    formik.resetForm();
    setSelectedCategory([]);
    setTeacherOptions([]);
    setSelectedColor([]);
    setHasFb("no"); // Reset hasFb state
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
      // .min(1, "At least one teacher is required") // Uncomment if you want to enforce at least one teacher
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
            return value === undefined || value === null || value <= price; // Handle optional discount
          }
        ),
      thumbnail: Yup.mixed().required("Course Thumbnail is required"),
      files: Yup.array().notRequired(), // Expecting File objects initially, then URLs after upload
      video: Yup.string().url("Must be a valid URL").notRequired(),
      hasFb: Yup.string().notRequired(),
    }),

    //Course Creator  Submit button
    onSubmit: async (values, { resetForm }) => {
      console.log("Formik values on submit:", values);
      setIsSubmitting(true);
      let updatedValues = { ...values };
      let thumbnailUrl = null;
      let uploadedFileUrls = [];

      try {
        // Handle Thumbnail image upload
        if (values.thumbnail instanceof File) {
          thumbnailUrl = await uploadImage(values.thumbnail);
          if (!thumbnailUrl) {
            toast.error("Failed to upload thumbnail image.");
            setIsSubmitting(false);
            return; // Stop submission if thumbnail upload fails
          }
          updatedValues.uploadedThumbnailImg = thumbnailUrl;
        } else if (typeof values.thumbnail === 'string' && values.thumbnail !== '') {
          // If thumbnail is already a URL (e.g., in an edit scenario where it's not changed)
          updatedValues.uploadedThumbnailImg = values.thumbnail;
        }


        // Handle multiple files upload
        if (values.files && values.files.length > 0) {
          const filesToUpload = values.files.filter(file => file instanceof File); // Only upload actual File objects
          const existingFileUrls = values.files.filter(file => typeof file === 'string'); // Keep existing URLs if any

          uploadedFileUrls = await uploadMultipleImages(filesToUpload);

          // If some files failed to upload, show an error and potentially stop
          if (uploadedFileUrls.length === 0 && filesToUpload.length > 0) {
            toast.error("Failed to upload one or more additional images.");
            setIsSubmitting(false);
            return;
          }
          updatedValues.uploadedFileUrls = [...existingFileUrls, ...uploadedFileUrls]; // Combine existing with new
        }


        // Proceed with API call only if image uploads were successful (or not required)
        const response = await axiosSecure.post("/course/add", {
          slug: values.slug.replace(/\s+/g, "-"),
          name: values.name,
          price: values.price,
          discountedPrice: values.discount,
          metadata: {
            description: values.description,
            hasFb: values.hasFb,
            featuredImage: updatedValues.uploadedThumbnailImg, // This will be the ImgBB URL
            images: updatedValues?.uploadedFileUrls, // These will be the ImgBB URLs
            fbGroupLink: values.fbgrouplink,
            promoVideo: values.video,
            totalApproximateClasses: values.approximate_class,
            totalApproximateDuration: values.approximate_duration,
            totalApproximateExams: values.approximate_exams,
            areAnyBooksIncluded: values.books_inc,
          },
          teachers: Array.isArray(values.teachers)
            ? values.teachers.map((item) => item)
            : null,
        });

        if (response.status === 201) {
          console.log("New Course added successfully:", response.data);
          toast.success("New Course Added successfully");
          handleReset();
          if (refetch) refetch();
          if (onClose) onClose();
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } catch (error) {
        console.error("Error adding Course:", error);
        // ... (your existing error handling for axiosSecure)
      } finally {
        setIsSubmitting(false);
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
    <form onSubmit={formik.handleSubmit}>
      <div className=" space-y-4   backdrop: mt-0">
        <div className="">
          <div className="relative w-fit">
            <Label className="block">
              Product Category<span className="text-xl text-red-500">*</span>
            </Label>
          </div>
          <Select
            // isMulti prop is removed for single select
            className="custom-select w-full rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] "
            components={{ DropdownIndicator }}
            options={categoryOptions}
            placeholder="Select Category"
            styles={customStyles}
            // Adjust value to expect a single object
            value={categoryOptions.find((option) =>
              option.value === selectedCategory // Compare directly with the single selected value
            )}
            onChange={(selectedOption) => { // selectedOption will be a single object or null
              const selectedValue = selectedOption ? selectedOption.value : null;

              setSelectedCategory(selectedValue); // Update local state with single value
              formik.setFieldValue("categoryId", selectedValue); // Update Formik with single value
            }}
          />
          {formik.touched.teachers && formik.errors.teachers && (
            <small className="text-red-500 text-sm">
              {formik.errors.teachers}
            </small>
          )}
        </div>
        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Slug */}
          <div className="w-full flex-1 ">
            <Label htmlFor="code" className="block">
              Product  Code<span className="text-xl text-red-500 ">*</span>
            </Label>
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="Enter Product Code"
              className="w-full"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.code && formik.errors.code && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.code}</p>
            )}
          </div>
          {/* Course Name */}
          <div className="w-full flex-1">
            <Label htmlFor="name" className="block">
              Product Name <span className="text-xl text-red-500 ">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter Product Name"
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
            Product Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter your product description..."
            className="w-full mt-1"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        <div className="">
          <Label htmlFor="shortDescription" className="block">
            Product Short Description
          </Label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            placeholder="Enter your product short description..."
            className="w-full mt-1"
            value={formik.values.shortDescription}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>


        <div className="flex items-center flex-col md:flex-row gap-2">
          {/* Course Price */}
          <div className="w-full flex-1">
            <Label htmlFor="price" className="block">
              Product Price <span className="text-xl text-red-500 ">*</span>
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
              Total Quantity
            </Label>
            <Input
              id="quantity"
              name="quantity"
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

        </div>



        <div className="">
          <div className="relative w-fit">
            <Label className="block">
              Product   Availble Color<span className="text-xl text-red-500">*</span>
            </Label>
          </div>
          <Select
            isMulti
            className="custom-select w-full rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] "
            components={{ DropdownIndicator }}
            options={productColor}
            placeholder="Select Color"
            styles={customStyles}
            value={productColor.filter((option) =>
              selectedColor.includes(option.value)
            )}
            onChange={(selectedOptions) => {
              const selectedValues = selectedOptions
                ? selectedOptions.map((option) => option.value)
                : [];
              // Update local state

              setSelectedColor(selectedValues); // Update local state
              formik.setFieldValue("colorNames", selectedValues); // Update Formik
            }}
          />
          {formik.touched.teachers && formik.errors.teachers && (
            <small className="text-red-500 text-sm">
              {formik.errors.teachers}
            </small>
          )}
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
