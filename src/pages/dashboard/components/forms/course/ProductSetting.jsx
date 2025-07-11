import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileUp, X } from "lucide-react"; // Import X for remove icon
import { Textarea } from "@/components/ui/textarea";
import Select, { components } from "react-select";
import { Button } from "@/components/ui/button";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import axios from "axios";
import ButtonLoader from "@/components/global/ButtonLoader";
import { getCategory } from "@/Api/selectorApi";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const ProductSetting = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  // IMPORTANT: Replace with your actual ImgBB API key
  const IMGBB_API_KEY = "90087a428cac94ac2e8021a26aeb9f9e";
  const axiosSecure = useAxiosSecure();
  const { id } = useParams();
  const navigate = useNavigate();

  // Options for product colors
  const productColorOptions = [
    { value: "red", label: "Red" },
    { value: "green", label: "Green" },
    { value: "blue", label: "Blue" },
    { value: "yellow", label: "Yellow" },
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
    { value: "orange", label: "Orange" },
    { value: "purple", label: "Purple" },
    { value: "pink", label: "Pink" },
    { value: "brown", label: "Brown" },
    { value: "grey", label: "Grey" },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out Of Stock' },
  ];

  const [categoryOptions, setCategoryOptions] = useState([]);

  // --- Data Fetching for Product and Categories ---

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategory();
        const options = data?.data.map((cate) => ({
          value: cate.id,
          label: cate.name,
        }));
        setCategoryOptions(options);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories.");
      }
    };
    fetchData();
  }, []);

  // Fetch existing product data using useQuery
  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ["productData", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const response = await axiosSecure.get(`/products/${id}`); // Adjust API endpoint
        return response?.data?.data;
      } catch (err) {
        console.error("Error fetching product data:", err);
        toast.error("Failed to load product data.");
        throw err;
      }
    },
    enabled: !!id, // Only run query if productId exists
  });


  const handleNavigateAndFullReload = () => {
    if (typeof window !== 'undefined') {
      // This will navigate to /products-management AND cause a full page reload
      window.location.href = "/";
    } else {
      console.warn("window object not available for navigation.");
    }
  };
  const formik = useFormik({
    initialValues: {
      categoryId: null,
      code: "",
      name: "",
      description: "",
      shortDescription: "",
      price: "",
      discount: "",
      totalQuantity: "",
      productColor: [],
      status: "active", // Default status
      newThumbnailImage: null, // File object for new thumbnail
      newImages: [], // Array of File objects for new additional images
      existingThumbnailImage: "", // URL for existing thumbnail
      existingImages: [], // Array of URLs for existing additional images
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
        .optional()
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
      status: Yup.string().required("Product Status is required"),


      newImages: Yup.array().of(
        Yup.mixed()
          .test("fileSize", "Image is too large (max 10MB)", (value) => {
            return value && value.size <= 10 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format for image", (value) => {
            return value && ['image/jpeg', 'image/png', 'image/svg+xml'].includes(value.type);
          })
      ).notRequired(),
    }),

    onSubmit: async (values) => {
      setIsSubmitting(true);
      toast.loading("Updating product...", { id: 'product-update' }); // Add an ID to dismiss specifically

      try {
        // Generic Image Upload Function for ImgBB
        const uploadImage = async (file) => {
          const formData = new FormData();
          formData.append("image", file); // Correct field name for ImgBB

          try {
            const response = await axios.post(
              `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );

            // Correct response path for ImgBB
            if ((response?.status === 200 || response?.status === 201) && response?.data?.data?.url) {
              return response.data.data.url;
            } else {
              console.error("Image upload failed: Invalid response from ImgBB", response);
              return null;
            }
          } catch (uploadError) {
            console.error("Error uploading image to ImgBB:", uploadError);
            // Provide more specific error message from ImgBB if available
            const imgbbErrorMessage = uploadError.response?.data?.error?.message || uploadError.message;
            toast.error(`Image upload failed: ${imgbbErrorMessage}`, { id: 'product-update' });
            return null;
          }
        };

        // Handle Thumbnail image upload
        let finalThumbnailUrl = values.existingThumbnailImage;
        if (values.newThumbnailImage instanceof File) {
          const uploadedUrl = await uploadImage(values.newThumbnailImage);
          if (uploadedUrl) {
            finalThumbnailUrl = uploadedUrl;
          } else {
            // If new thumbnail fails and no existing one, stop submission
            if (!values.existingThumbnailImage) {
              toast.error("Thumbnail image upload failed. Please try again.", { id: 'product-update' });
              setIsSubmitting(false);
              return;
            }
            toast.warning("New thumbnail image upload failed. Keeping existing if available.", { id: 'product-update' });
          }
        } else if (!values.existingThumbnailImage) {
          // If no new thumbnail and no existing one, this case should ideally be caught by Yup validation,
          // but as a fallback for submission:
          toast.error("A thumbnail image is required.", { id: 'product-update' });
          setIsSubmitting(false);
          return;
        }

        // Handle Additional images upload
        let finalImageUrls = [...values.existingImages]; // Start with existing images
        if (values.newImages && values.newImages.length > 0) {
          const uploadPromises = values.newImages.map(file => uploadImage(file));
          const newUploadedUrls = await Promise.all(uploadPromises);
          const validNewUrls = newUploadedUrls.filter(url => url !== null);
          finalImageUrls = [...finalImageUrls, ...validNewUrls]; // Combine
          if (validNewUrls.length !== values.newImages.length) {
            toast.warning("Some additional images failed to upload.", { id: 'product-update' });
          }
        }

        // Prepare the final data structure for the API call
        const productData = {
          categoryId: values.categoryId,
          productCode: values.code,
          name: values.name,
          description: values.description,
          shortDescription: values.shortDescription,
          price: values.price,
          discountedPrice: values.discount === "" ? null : values.discount,
          totalQuantity: values.totalQuantity,
          productColor: values.productColor,
          thumbnailImage: finalThumbnailUrl, // Use the resolved URL
          images: finalImageUrls, // Use the combined image URLs
          status: values.status,
        };

        // Send Data to Backend for update (PATCH request for existing resource)
        const response = await axiosSecure.patch(`/products/${id}`, productData);

        if (response.status === 200) {
          toast.success("Product updated successfully!", { id: 'product-update' });
          refetch();
          handleNavigateAndFullReload(); // Force reload to reflect changes

        } else {
          toast.error("Something went wrong. Please try again.", { id: 'product-update' });
        }
      } catch (error) {
        console.error("Error updating product:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to update product.";
        toast.error(errorMessage, { id: 'product-update' });
      } finally {
        setIsSubmitting(false);
        toast.dismiss('product-update'); // Dismiss specific toast
      }
    },
  });

  // --- Populate Formik values when product data and categories are loaded ---
  useEffect(() => {
    if (product && categoryOptions.length > 0) {
      // Find the selected category object for React-Select
      const preSelectedCategory = categoryOptions.find(
        (option) => option.value === product.categoryId
      );
      setSelectedCategory(preSelectedCategory);

      // Set selected colors for React-Select
      const preSelectedColors = productColorOptions.filter((option) =>
        product.productColor.includes(option.value)
      );
      setSelectedColors(preSelectedColors);

      // Set selected status for React-Select
      const preSelectedStatus = statusOptions.find((option) =>
        option.value === product.status
      );
      setSelectedStatus(preSelectedStatus);

      formik.setValues({
        categoryId: product.categoryId || null,
        code: product.productCode || "",
        name: product.name || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        price: product.price || "",
        discount: product.discountedPrice || "",
        totalQuantity: product.totalQuantity || "",
        productColor: product.productColor || [],
        existingThumbnailImage: product.thumbnailImage || "",
        existingImages: product.images || [],
        status: product.status || 'active',
        newThumbnailImage: null,
        newImages: [],
      });
    }
  }, [product, categoryOptions, id]); // Added id to dependencies

  // --- Image Handling Functions (for previews and removal) ---

  const handleNewThumbnailImageChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue("newThumbnailImage", file);
    if (file) {
      // Clear existing thumbnail when a new one is selected
      formik.setFieldValue("existingThumbnailImage", "");
    }
    formik.setFieldTouched('newThumbnailImage', true, false); // Mark as touched on change
  };

  const handleRemoveExistingThumbnail = () => {
    formik.setFieldValue("existingThumbnailImage", "");
    formik.setFieldValue("newThumbnailImage", null);
    formik.setFieldTouched('newThumbnailImage', true, false); // Mark as touched to trigger validation
  };

  const handleNewImagesChange = (event) => {
    const files = Array.from(event.currentTarget.files);
    formik.setFieldValue("newImages", files);
    formik.setFieldTouched('newImages', true, false); // Mark as touched on change
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    const updatedExistingImages = formik.values.existingImages.filter(
      (_, index) => index !== indexToRemove
    );
    formik.setFieldValue("existingImages", updatedExistingImages);
  };

  const handleRemoveNewImage = (indexToRemove) => {
    const updatedNewImages = formik.values.newImages.filter(
      (_, index) => index !== indexToRemove
    );
    formik.setFieldValue("newImages", updatedNewImages);
    formik.setFieldTouched('newImages', true, false); // Mark as touched to trigger validation
  };

  // --- React-Select Custom Styles and Indicator ---
  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #E6E6E6",
      backgroundColor: "#FFFFFF",
      minHeight: '38px',
      boxShadow: 'none', // Remove default focus shadow
      '&:hover': {
        borderColor: '#9ca3af', // Light grey on hover
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e0e7ff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#4338ca',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#4338ca',
      ':hover': {
        backgroundColor: '#c7d2fe',
        color: 'red',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#4338ca' : state.isFocused ? '#e0e7ff' : null,
      color: state.isSelected ? 'white' : 'black',
      ':active': {
        backgroundColor: '#c7d2fe',
      },
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

  if (isLoading) {
    return <div className="text-center py-10">Loading product data...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;
  }

  if (!product && !isLoading) {
    return <div className="text-center py-10 text-gray-500">Product not found or invalid ID.</div>;
  }



  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-4 mt-0">
        {/* Product Category */}
        <div>
          <Label htmlFor="categoryId" className="block">
            Product Category<span className="text-xl text-red-500">*</span>
          </Label>
          <Select
            id="categoryId"
            className="custom-select w-full rounded-sm bg-[#FBFDFC] border border-[#E6E6E6]"
            components={{ DropdownIndicator }}
            options={categoryOptions}
            placeholder="Select Category"
            styles={customStyles}
            value={selectedCategory}
            onChange={(selectedOption) => {
              const selectedValue = selectedOption ? selectedOption.value : null;
              setSelectedCategory(selectedOption);
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
        <div>
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
        <div>
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
          <div className="w-full flex-1 mt-3 md:mt-0">
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
            type="number"
            placeholder="15"
            className="w-full mt-2"
            value={formik.values.totalQuantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onKeyPress={(e) => {
              const invalidChars = ["-", "e", "+", "."];
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
        <div>
          <Label htmlFor="productColor" className="block">
            Product Available Color<span className="text-xl text-red-500">*</span>
          </Label>
          <Select
            id="productColor"
            isMulti
            className="custom-select w-full rounded-sm bg-[#FBFDFC] border border-[#E6E6E6]"
            components={{ DropdownIndicator }}
            options={productColorOptions}
            placeholder="Select Color"
            styles={customStyles}
            value={selectedColors}
            onChange={(selectedOptions) => {
              const selectedValues = selectedOptions
                ? selectedOptions.map((option) => option.value)
                : [];
              setSelectedColors(selectedOptions);
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

        {/* Product Status */}
        <div>
          <Label htmlFor="status" className="block">
            Product Status<span className="text-xl text-red-500">*</span>
          </Label>
          <Select
            id="status"
            className="custom-select w-full rounded-sm bg-[#FBFDFC] border border-[#E6E6E6]"
            components={{ DropdownIndicator }}
            options={statusOptions}
            placeholder="Select Status"
            styles={customStyles}
            value={selectedStatus}
            onChange={(selectedOption) => {
              const selectedValue = selectedOption ? selectedOption.value : null;
              setSelectedStatus(selectedOption);
              formik.setFieldValue("status", selectedValue);
            }}
            onBlur={() => formik.setFieldTouched('status', true)}
          />
          {formik.touched.status && formik.errors.status && (
            <small className="text-red-500 text-sm">
              {formik.errors.status}
            </small>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div>
          <Label htmlFor="newThumbnailImage" className="block">
            Thumbnail <span className="text-xl text-red-500">*</span>
          </Label>
          <label
            htmlFor="newThumbnailImage"
            className="border border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2 mt-1"
          >
            <span className="bg-gray-200 dark:text-gray-800 p-3 rounded-full">
              <FileUp />
            </span>
            <p>
              <span className="text-sm text-blue-600 font-medium">
                Click here
              </span>{" "}
              to upload new file or drag.
            </p>
            <span className="text-xs text-gray-500">
              Supported Format: JPG, PNG, SVG (Max 10MB)
            </span>
            <Input
              id="newThumbnailImage"
              name="newThumbnailImage"
              type="file"
              accept=".jpg, .png, .svg"
              className="hidden"
              onChange={handleNewThumbnailImageChange}
              onBlur={() => formik.setFieldTouched('newThumbnailImage', true)}
            />
          </label>
          {/* Display existing thumbnail or newly selected thumbnail */}
          {(formik.values.existingThumbnailImage || formik.values.newThumbnailImage) ? (
            <div className="relative w-24 h-16 mt-2">
              <img
                src={
                  formik.values.newThumbnailImage
                    ? URL.createObjectURL(formik.values.newThumbnailImage)
                    : formik.values.existingThumbnailImage
                }
                alt="Thumbnail Preview"
                className="w-full h-full object-cover rounded-md"
              />
              <span
                className="absolute -right-2 -top-2 bg-red-500 rounded-full p-[2px] cursor-pointer"
                onClick={handleRemoveExistingThumbnail}
              >
                <X size={14} className="text-white hover:text-gray-800" />
              </span>
            </div>
          ) : null}
          {formik.touched.newThumbnailImage && formik.errors.newThumbnailImage && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.newThumbnailImage}</p>
          )}
        </div>

        {/* Additional Images Upload */}
        <div>
          <Label htmlFor="newImages" className="font-medium block">
            Additional Images (Optional)
          </Label>
          <label
            htmlFor="newImages"
            className="border border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2 mt-2"
          >
            <span className="bg-gray-200 dark:text-gray-800 p-3 rounded-full">
              <FileUp />
            </span>
            <p>
              <span className="text-sm text-blue-600 font-medium">
                Click here
              </span>{" "}
              to upload new files.
            </p>
            <span className="text-xs text-gray-500">
              Supported Format: JPG, PNG, SVG (Max 10MB each)
            </span>
            <Input
              id="newImages"
              name="newImages"
              type="file"
              multiple
              accept=".jpg, .png, .svg"
              className=" hidden "
              onChange={handleNewImagesChange}
              onBlur={() => formik.setFieldTouched('newImages', true)}
            />
          </label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {/* Display existing images */}
            {formik.values.existingImages.length > 0 && (
              formik.values.existingImages.map((imageUrl, index) => (
                <div key={`existing-${index}`} className="relative w-24 h-16">
                  <img
                    src={imageUrl}
                    alt={`Existing Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <span
                    className="absolute -right-2 -top-2 bg-red-500 rounded-full p-[2px] cursor-pointer"
                    onClick={() => handleRemoveExistingImage(index)}
                  >
                    <X size={14} className="text-white hover:text-gray-800" />
                  </span>
                </div>
              ))
            )}
            {/* Display newly selected images (before upload) */}
            {formik.values.newImages.length > 0 && (
              formik.values.newImages.map((file, index) => (
                <div key={`new-${index}`} className="relative w-24 h-16">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <span
                    className="absolute -right-2 -top-2 bg-red-500 rounded-full p-[2px] cursor-pointer"
                    onClick={() => handleRemoveNewImage(index)}
                  >
                    <X size={14} className="text-white hover:text-gray-800" />
                  </span>
                </div>
              ))
            )}
          </div>
          {formik.touched.newImages && formik.errors.newImages ? (
            <p className="text-red-500 text-sm mt-1">{formik.errors.newImages}</p>
          ) : null}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="destructive"
            type="button"
            onClick={() => {
              formik.resetForm();
              if (onClose) onClose();
              navigate("/products-management"); // Navigate back
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <ButtonLoader /> : "Update Product"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProductSetting;