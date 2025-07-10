import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react"; // Only FileUp is used
import { Textarea } from "@/components/ui/textarea";
import Select, { components } from "react-select";
import { Button } from "@/components/ui/button";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import axios from "axios";
import ButtonLoader from "@/components/global/ButtonLoader";
import { getCategory } from "@/Api/selectorApi"; // Ensure this path is correct

const ProductCreateForm = ({ refetch, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // Changed to null for single select
  const [selectedColors, setSelectedColors] = useState([]); // Renamed for clarity and consistency
  const axiosSecure = useAxiosSecure();
  const IMGBB_API_KEY = '90087a428cac94ac2e8021a26aeb9f9e'; // Ensure this key is valid and securely handled

  // Options for product colors
  const productColorOptions = [
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

  const [categoryOptions, setCategoryOptions] = useState([]); // Renamed for clarity

  // Fetch category options from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategory();
        // Transform API response to match Select component format
        const options = data?.data.map((cate) => ({
          value: cate.id, // Backend's category ID
          label: cate.name, // Displayed category name
        }));
        setCategoryOptions(options);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories.");
      }
    };

    fetchData();
  }, []);

  const handleResetForm = () => {
    formik.resetForm();
    setSelectedCategory(null); // Reset single selected category
    setSelectedColors([]); // Reset selected colors
  };

  const formik = useFormik({
    initialValues: {
      categoryId: null, // To store the selected category ID
      code: "",
      name: "",
      description: "",
      shortDescription: "",
      price: "",
      discount: "",
      totalQuantity: "",
      productColor: [], // To store selected color values
      thumbnail: null, // Will store the File object for thumbnail
      images: [], // Will store an array of File objects for additional images
    },
    validationSchema: Yup.object({
      categoryId: Yup.string().required("Product Category is required"),
      code: Yup.string().trim().required("Product Code is required"),
      name: Yup.string().trim().required("Product Name is required"),
      description: Yup.string().trim().notRequired(),
      shortDescription: Yup.string().trim().notRequired(),
      price: Yup.number()
        .required("Product Price is required")
        .min(0, "Price cannot be less than 0"),
      discount: Yup.number()
        .notRequired()
        .test(
          "is-valid-discount",
          "Discount cannot be greater than the price",
          function (value) {
            const { price } = this.parent;
            return value === undefined || value === null || value <= price;
          }
        ),
      totalQuantity: Yup.number()
        .required("Total Quantity is required")
        .min(0, "Quantity cannot be less than 0")
        .integer("Quantity must be an integer"),
      productColor: Yup.array().min(1, "At least one color is required"),
      thumbnail: Yup.mixed(),
      images: Yup.array().of(
        Yup.mixed()
          .test("fileSize", "Image is too large (max 10MB)", (value) => {
            return value && value.size <= 10 * 1024 * 1024; // 10 MB
          })
          .test("fileType", "Unsupported file format for image", (value) => {
            return value && ['image/jpeg', 'image/png', 'image/svg+xml'].includes(value.type);
          })
      ).notRequired(),
    }),

    onSubmit: async (values, { resetForm, error }) => {
      console.log(error)
      setIsSubmitting(true);
      toast.loading("Creating product...");

      try {
        // 1. Upload Thumbnail Image
        let thumbnailUrl = "";
        if (values.thumbnail) {
          const formData = new FormData();
          formData.append("image", values.thumbnail);

          const imgbbResponse = await axios.post(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            formData
          );
          if (imgbbResponse.data.success) {
            thumbnailUrl = imgbbResponse.data.data.url;
            toast.success("Thumbnail uploaded successfully!");
          } else {
            throw new Error("Failed to upload thumbnail to ImgBB.");
          }
        }

        // 2. Upload Additional Images
        const imageUrls = [];
        if (values.images && values.images.length > 0) {
          for (const imageFile of values.images) {
            const formData = new FormData();
            formData.append("image", imageFile);

            const imgbbResponse = await axios.post(
              `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
              formData
            );
            if (imgbbResponse.data.success) {
              imageUrls.push(imgbbResponse.data.data.url);
            } else {
              throw new Error(`Failed to upload image ${imageFile.name} to ImgBB.`);
            }
          }
          toast.success("Additional images uploaded successfully!");
        }

        // 3. Prepare Payload for Backend
        const productData = {
          categoryId: values.categoryId,
          code: values.code,
          name: values.name,
          description: values.description,
          shortDescription: values.shortDescription,
          price: values.price,
          discountedPrice: values.discount,
          totalQuantity: values.totalQuantity,
          productColor: values.productColor, // This will be an array of strings like ['red', 'blue']
          thumbnail: thumbnailUrl,
          images: imageUrls,
        };

        // 4. Send Data to Backend
        const response = await axiosSecure.post("/products/create", productData); // Assuming /products/add endpoint

        if (response.status === 201) {
          toast.success("New product added successfully!");
          handleResetForm(); // Reset form and local states
          if (refetch) refetch();
          if (onClose) onClose();
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } catch (error) {
        console.error("Error adding product:", error);
        toast.error(error.message || "Failed to add product. Please try again.");
      } finally {
        setIsSubmitting(false);
        toast.dismiss(); // Dismiss the loading toast
      }
    },
  });

  // Handle thumbnail file change
  const handleThumbnailImageChange = (event) => {
    formik.setFieldValue("thumbnail", event.currentTarget.files[0]);
  };

  // Handle multiple files change
  const handleImagesChange = (event) => {
    formik.setFieldValue("images", Array.from(event.currentTarget.files));
  };

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
      <div className="space-y-4 backdrop: mt-0">
        {/* Product Category */}
        <div className="">
          <div className="relative w-fit">
            <Label className="block">
              Product Category<span className="text-xl text-red-500">*</span>
            </Label>
          </div>
          <Select
            className="custom-select w-full rounded-sm bg-[#FBFDFC] border border-[#E6E6E6]"
            components={{ DropdownIndicator }}
            options={categoryOptions}
            placeholder="Select Category"
            styles={customStyles}
            value={categoryOptions.find((option) =>
              option.value === selectedCategory
            )}
            onChange={(selectedOption) => {
              const selectedValue = selectedOption ? selectedOption.value : null;
              setSelectedCategory(selectedValue);
              formik.setFieldValue("categoryId", selectedValue);
            }}
            onBlur={() => formik.setFieldTouched('categoryId', true)}
          />
          {formik.touched.categoryId && formik.errors.categoryId && (
            <small className="text-red-500 text-sm">
              {formik.errors.categoryId}
            </small>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          {/* Product Code */}
          <div className="w-full flex-1">
            <Label htmlFor="code" className="block">
              Product Code<span className="text-xl text-red-500">*</span>
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
          {/* Product Name */}
          <div className="w-full flex-1">
            <Label htmlFor="name" className="block">
              Product Name <span className="text-xl text-red-500">*</span>
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

        {/* Product Description */}
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

        {/* Product Short Description */}
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

        <div className="flex flex-col md:flex-row gap-2">
          {/* Product Price */}
          <div className="w-full flex-1">
            <Label htmlFor="price" className="block">
              Product Price <span className="text-xl text-red-500">*</span>
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
                  e.preventDefault();
                }
              }}
            />
            {formik.touched.price && formik.errors.price && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.price}</p>
            )}
          </div>
          {/* Discounted Price */}
          <div className="w-full flex-1 mt-3 md:mt-0"> {/* Adjusted margin for responsiveness */}
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
                  e.preventDefault();
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

        {/* Total Quantity */}
        <div className="flex-1 w-full">
          <Label htmlFor="totalQuantity" className="block">
            Total Quantity<span className="text-xl text-red-500">*</span>
          </Label>
          <Input
            id="totalQuantity"
            name="totalQuantity"
            type="number" // Changed to number for quantity
            placeholder="15"
            className="w-full mt-2"
            value={formik.values.totalQuantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onKeyPress={(e) => {
              const invalidChars = ["-", "e", "+", "."]; // Added '.' to prevent decimals if integer is required
              if (invalidChars.includes(e.key)) {
                e.preventDefault();
              }
            }}
          />
          {formik.touched.totalQuantity && formik.errors.totalQuantity && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.totalQuantity}</p>
          )}
        </div>

        {/* Product Available Color */}
        <div className="">
          <div className="relative w-fit">
            <Label className="block">
              Product Available Color<span className="text-xl text-red-500">*</span>
            </Label>
          </div>
          <Select
            isMulti
            className="custom-select w-full rounded-sm bg-[#FBFDFC] border border-[#E6E6E6]"
            components={{ DropdownIndicator }}
            options={productColorOptions}
            placeholder="Select Color"
            styles={customStyles}
            value={productColorOptions.filter((option) =>
              selectedColors.includes(option.value)
            )}
            onChange={(selectedOptions) => {
              const selectedValues = selectedOptions
                ? selectedOptions.map((option) => option.value)
                : [];
              setSelectedColors(selectedValues);
              formik.setFieldValue("productColor", selectedValues);
            }}
            onBlur={() => formik.setFieldTouched('productColor', true)}
          />
          {formik.touched.productColor && formik.errors.productColor && (
            <small className="text-red-500 text-sm">
              {formik.errors.productColor}
            </small>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div className="">
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
              Supported Format: JPG, PNG, SVG (Max 10MB)
            </span>
            <Input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept=".jpg, .png, .svg"
              className="hidden"
              onChange={handleThumbnailImageChange}
              onBlur={() => formik.setFieldTouched('thumbnail', true)}
            />
          </label>

        </div>

        {/* Additional Images Upload */}
        <div className="">
          <Label htmlFor="images" className="font-medium block">
            Images (Optional)
          </Label>
          <label
            htmlFor="images"
            className="border border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2 mt-2"
          >
            <span className="bg-gray-200 dark:text-gray-800 p-3 rounded-full">
              <FileUp />
            </span>
            <p>
              <span className="text-sm text-blue-600 font-medium">
                Click here
              </span>{" "}
              to upload your files.
            </p>
            <span className="text-xs text-gray-500">
              Supported Format: JPG, PNG, SVG (Max 10MB each)
            </span>
            <Input
              id="images"
              name="images"
              type="file"
              multiple
              accept=".jpg, .png, .svg"
              className=" hidden "
              onChange={handleImagesChange}
              onBlur={() => formik.setFieldTouched('images', true)}
            />
          </label>
          {formik.values.images?.length > 0 && (
            <div className="mt-2 overflow-hidden">
              {formik.values.images.map((file, index) => (
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
          {formik.touched.images && formik.errors.images ? (
            <p className="text-red-500 text-sm mt-1">{formik.errors.images}</p>
          ) : null}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="destructive"
            type="button"
            onClick={() => {
              handleResetForm();
              if (onClose) onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <ButtonLoader /> : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProductCreateForm;