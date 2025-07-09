import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select, { components } from "react-select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUp, X } from "lucide-react";
import { getCategory } from "@/Api/selectorApi";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import ButtonLoader from "@/components/global/ButtonLoader";
import useBookData from "@/hooks/useBookData";

const CourseForm = () => {
  const [courseOptions, setCourseOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState([]);
  const [selectedType, setSelectedType] = useState();
  const [bookOptionsDropdown, setBookOptionsDropdown] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([])
  const [bookData] = useBookData()
  const axiosSecure = useAxiosSecure()
  const hasEnrollMentGifts = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];
  // options for book
  const bookOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];


  const enrollment = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];


  const book = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];



  const gift = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];


  const [hasFb, setHasFb] = useState("no");
  const { courseId } = useParams();
  courseId;
  const { data: item } = useQuery({
    queryKey: ["updateclass"],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get(`/course/${courseId}`);
        "Response data:", response.data;
        return response?.data?.data; // Return the fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Ensure errors are properly thrown
      }
    },
  });

  item;
  // Fetch courses for Select dropdown
  // Fetch teacher options from APItfhgytr
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategory();
        // Transform API response to match Select component format
        const options = data?.data?.map((teachers) => ({
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
  const [selectedTeachers, setSelectedTecher] = useState(null);
  const filterTeacher = item?.teachers?.map((tech) => tech?._id);
  useEffect(() => {
    const selected = teacherOptions?.filter((teacher) =>
      filterTeacher?.includes(teacher?.value)
    );
    selected; // Log to check what selected produces
    setSelectedTecher(
      selected?.map((items) => ({ value: items?.value, label: items?.label }))
    );
  }, [teacherOptions, item?.teachers]);

  selectedTeachers;
  // Adjusted dependency array
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
      name: Yup.string().required("Course Name is required"),
      slug: Yup.string().required("Slug is required"),

      teachers: Yup.array(),
      // .min(1, "At least one teacher is required")
      price: Yup.number()
        .required("Course Price is required")
        .min(0, "Price cannot be less than 0"),
      discount: Yup.number()
        .optional()
        .test(
          "is-valid-discount",
          "Discount cannot be greater than the price",
          function (value) {
            const { price } = this.parent;
            return value <= price;
          }
        ),
      thumbnail: Yup.mixed().notRequired(),
      files: Yup.array().of(Yup.string()),
      video: Yup.string().notRequired(),
      hasFb: Yup.string().notRequired(),
      approximate_class: Yup.string().trim(),
      approximate_exams: Yup.string().trim(),
      approximate_duration: Yup.string().trim(),
      books_inc: Yup.boolean().notRequired(),
    }),

    //Course Creator Submit button
    onSubmit: async (values, { resetForm }) => {
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

      // console.log(updatedValues);
      try {
        const response = await axiosSecure.patch(`/course/${courseId}`, {
          slug: values.slug,
          name: values.name,
          price: values.price,
          discountedPrice: values.discount,
          metadata: {
            description: values.description,

            hasFb: hasFb,
            featuredImage: updatedValues.uploadedThumbnailImg,
            images: updatedValues.uploadedFileUrls,
            fbGroupLink: values.fbgrouplink,
            promoVideo: values.video,
            totalApproximateClasses: values.approximate_class,
            totalApproximateDuration: values.approximate_duration,
            totalApproximateExams: values.approximate_exams,
            areAnyBooksIncluded: values.books_inc,
            books: Array.isArray(values.books)
              ? values.books.map((item) => item)
              : null,
            hasDiscountOnBooks: values.hasDiscountOnBooks,
            discountOnBooks: values.discountOnBooks,
            isEnrollmentDisabled: values.isEnrollmentDisabled,
            hasEnrollmentGifts: values.hasEnrollmentGifts
          },

          teachers: Array.isArray(values.teachers)
            ? values.teachers.map((item) => item)
            : null,
        });

        if (response.status === 200) {
          " Course Updated successfully:", values;

          toast.success(" Course Updated successfully");

          // Refetch the updated data

          setTimeout(() => {
            window.location.reload();
          }, 100);
          refetch();
          setIsSubmitting(false);
        } else {
          // toast.error("Something went wrong. Please try again.");
        }
      } catch (error) {
        if (error.status === 400) {
          console.warn("All fields are required");
          toast.error("All fields are required");
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
    },
  });

  item;
  useEffect(() => {
    if (item) {
      formik.setValues({
        slug: item?.slug || "",
        name: item?.name,
        teachers: item?.teachers?.map((teacher) => teacher),

        discount: item?.discountedPrice,
        description: item?.metadata?.description,
        video: item?.metadata?.promoVideo,
        hasFb: item?.metadata?.fbgrouplink ? "yes" : "no",
        fbgrouplink: item?.metadata?.fbGroupLink,
        uploadedThumbnailImg: item?.metadata?.featuredImage,
        uploadedFileUrls: item?.metadata?.images,
        price: item?.price,
        approximate_class: item?.metadata?.totalApproximateClasses,
        approximate_duration: item?.metadata?.totalApproximateDuration,
        approximate_exams: item?.metadata?.totalApproximateExams,
        books_inc: item?.metadata?.areAnyBooksIncluded,
        isEnrollmentDisabled: item?.metadata?.isEnrollmentDisabled,
        hasDiscountOnBooks: item?.metadata?.hasDiscountOnBooks,
        books: item?.metadata?.books?.map((book) => book),
        discountOnBooks: item?.metadata?.discountOnBooks,
        hasEnrollmentGifts: item?.metadata?.hasEnrollmentGifts
      });


      if (item?.metadata?.fbgrouplink) setSelectedType("Yes");
    } else setSelectedType("Yes");
  }, [item]);
  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #E6E6E6",
      backgroundColor: "#FFFFFF",
    }),
  };

  const DropdownIndicator = (props) => (
    <components.DropdownIndicator {...props}>
      <svg
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

  // Function to remove an existing image
  const handleExistingImageRemove = (index) => {
    const updatedImages = formik?.values?.uploadedFileUrls?.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("uploadedFileUrls", updatedImages);
  };
  // Function to remove an existing thumbnail
  const handleThumbnailRemove = () => {
    formik.setFieldValue("uploadedThumbnailImg", "");
  };



  useEffect(() => {
    // Check if courseOptions and applicableCourses exist
    if (bookData && item?.metadata?.books) {
      const selected = bookData.filter((course) =>
        item?.metadata?.books.includes(course._id)
      );
      selected; // Log selected courses for debugging
      setSelectedBooks(
        selected.map((i) => ({ value: i._id, label: i.name }))
      );
    }
  }, [bookData, item?.metadata?.books]); // Adjusted dependency array

  return (
    <div>
      <div className="border-b pb-5">
        <p className="font-bold">About Course</p>
        <p className="text-gray-600">
          Update course name, description, and other course details
        </p>
      </div>
      <form onSubmit={formik.handleSubmit}>
        <div className=" space-y-6 mt-3">
          {/* slug */}
          <div className="grid grid-cols-4 ">
            <Label htmlFor="slug" className=" block">
              Slug <span className="text-xl text-red-500 ">*</span>
            </Label>
            <div className="col-span-3">
              <Input
                id="slug"
                name="slug"
                type="text"
                placeholder="Enter Slug"
                className="w-full "
                value={formik.values.slug}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.slug && formik.errors.slug && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.slug}
                </p>
              )}
            </div>
          </div>
          {/* Course Name */}
          <div className="grid grid-cols-4 ">
            <Label htmlFor="name" className="block">
              Course Name <span className="text-xl text-red-500 ">*</span>
            </Label>
            <div className="col-span-3">
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
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>
          </div>
          {/* Course Description */}
          <div className="grid grid-cols-4 ">
            <Label htmlFor="description" className="block">
              Course Description
            </Label>
            <div className="col-span-3">
              <Textarea
                id="description"
                name="description"
                placeholder="Enter your course description..."
                className="w-full"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>
          {/* Course Price */}
          <div className="grid grid-cols-4 ">
            <Label htmlFor="price" className="block">
              Course Price <span className="text-xl text-red-500 ">*</span>
            </Label>
            <div className="col-span-3">
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="1000 BDT"
                className="w-full"
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
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.price}
                </p>
              )}
            </div>
          </div>
          {/* Discounted Price */}
          <div className="grid grid-cols-4 ">
            <Label htmlFor="discount" className="block">
              Discounted Price
            </Label>
            <div className="col-span-3">
              <Input
                id="discount"
                name="discount"
                type="number"
                placeholder="999 BDT"
                className="w-full"
                value={formik.values.discount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              // onKeyPress={(e) => {
              //   const invalidChars = ["-", "e", "+"];
              //   if (invalidChars.includes(e.key)) {
              //     e.preventDefault(); // Prevent typing invalid characters
              //   }
              // }}
              />
              {formik.touched.discount && formik.errors.discount && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.discount}
                </p>
              )}
            </div>
          </div>
          {/* Assign Teachers */}
          <div className="grid grid-cols-4 ">
            <Label className="block">
              Assign Teacher <span className="text-xl text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <Select
                isMulti
                className="custom-select w-full   rounded-sm  s mt-2"
                components={{ DropdownIndicator }}
                options={teacherOptions}
                placeholder="Select Teacher"
                styles={customStyles}
                value={selectedTeachers}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions
                    ? selectedOptions.map((option) => option.value)
                    : [];
                  // Update local state

                  setSelectedTeacher(selectedValues); // Update local state
                  setSelectedTecher(selectedOptions);
                  formik.setFieldValue("teachers", selectedValues); // Update Formik
                }}
              />
              {formik.touched.teachers && formik.errors.teachers && (
                <small className="text-red-500 text-sm">
                  {formik.errors.teachers}
                </small>
              )}
            </div>
          </div>
          {/* Approximate class and duration */}
          <div className="grid grid-cols-4">
            <Label htmlFor="approximate_class" className="block">
              Approximate Class
            </Label>
            <div className="col-span-3">
              <Input
                id="approximate_class"
                name="approximate_class"
                type="text"
                placeholder="15"
                className="w-full "
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
          {/* Approximate duration */}
          <div className="grid grid-cols-4">
            <Label htmlFor="approximate_duration" className="block">
              Approximate Duration
            </Label>
            <div className="col-span-3">
              <Input
                id="approximate_duration"
                name="approximate_duration"
                type="text"
                placeholder="20 month"
                className="w-full "
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
          {/* Approximate exams */}
          <div className="grid grid-cols-4">
            <Label htmlFor="approximate_exams" className="block">
              Approximate Exams
            </Label>
            <div className="col-span-3">
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
          </div>
          {/* abailable book */}
          <div className="grid grid-cols-4">
            <Label htmlFor="books_inc" className="block">
              Is Books Included ?
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

          <div className="grid grid-cols-4">
            <Label htmlFor="hasEnrollmentGifts" className="block">
              Has Enrollment Gifts ?
            </Label>
            <div className="flex items-center space-x-4">
              {gift?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2  cursor-pointer"
                >
                  <input
                    type="radio"
                    name="hasEnrollmentGifts"
                    value={option?.value}
                    checked={formik.values.books_inc === option.value}
                    onChange={() =>
                      formik.setFieldValue("hasEnrollmentGifts", option.value)
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Book dropdown - Conditionally render based on books_inc */}
          {formik.values.books_inc && (

            <>
              <div className="grid grid-cols-4 ">
                <Label className="block">
                  Select Books
                </Label>
                <div className="col-span-3">
                  <Select
                    isMulti
                    className="custom-select w-full  rounded-sm  s mt-2"
                    components={{ DropdownIndicator }}
                    options={bookData?.map((i) => ({
                      label: i.name,
                      value: i._id
                    }))}// Use book options here
                    placeholder="Select Books"
                    styles={customStyles}
                    value={selectedBooks}
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : [];
                      setSelectedBooks(selectedOptions)
                      formik.setFieldValue("books", selectedValues);
                    }}
                  />
                  {formik.touched.books && formik.errors.books && (
                    <small className="text-red-500 text-sm">
                      {formik.errors.books}
                    </small>
                  )}
                </div>
              </div>







              < div className="grid grid-cols-4">
                <Label htmlFor="books_inc" className="block">
                  Has  Discount Book ?
                </Label>
                <div className="flex items-center space-x-4">
                  {book?.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2  cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="hasDiscountOnBooks"
                        value={option?.value}
                        checked={formik.values.hasDiscountOnBooks === option.value}
                        onChange={() =>
                          formik.setFieldValue("hasDiscountOnBooks", option.value)
                        }
                        className="w-5 h-5"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {
                formik.values.hasDiscountOnBooks && (
                  <div className="grid grid-cols-4 ">
                    <Label htmlFor="discountOnBooks" className="block">
                      Discounted On Book
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="discountOnBooks"
                        name="discountOnBooks"
                        type="number"
                        placeholder="999 BDT"
                        className="w-full"
                        value={formik.values.discountOnBooks}
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
                )
              }

            </>
          )}

          {/* Featured Image URL */}
          <div className=" grid grid-cols-4 ">
            <Label className="block">
              Thumbnail <span className="text-xl text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <label
                htmlFor="thumbnail"
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
                  id="thumbnail"
                  name="thumbnail"
                  type="file"
                  accept=".svg, .jpg, .png"
                  className="hidden"
                  onChange={handleThambnailImageChange}
                />
              </label>
              {formik.values.thumbnail && formik.values.thumbnail.size > 0 && (
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
              {formik?.values?.uploadedThumbnailImg ? (
                <div className="relative w-24 h-16 ">
                  <img
                    src={
                      formik.values.uploadedThumbnailImg ||
                      "https://via.placeholder.com/150"
                    }
                    alt="Image"
                    className="w-24 h-16 object-cover mt-2 rounded-md"
                  />
                  <span
                    className="absolute right-0 top-0 bg-red-500 rounded-full p-[2px] cursor-pointer"
                    onClick={() => handleThumbnailRemove()}
                  >
                    <X size={14} className="text-white hover:text-gray-800" />
                  </span>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>

          {/* Files */}
          <div className="grid grid-cols-4 ">
            <Label htmlFor="" className="font-medium block">
              Images
            </Label>
            <div className="col-span-3">
              <label
                htmlFor="files"
                className="border border-dashed border-gray-300 p-2 py-6 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2 mt-2"
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
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.files}
                </p>
              ) : null}
              <div className="flex items-center flex-wrap gap-2 mt-2">
                {formik.values.uploadedFileUrls?.map((fileUrl, index) => (
                  <div className="relative">
                    <img
                      key={index}
                      src={fileUrl || "https://via.placeholder.com/150"}
                      alt="Image"
                      className="w-24 h-16 object-cover rounded-md  "
                    />
                    <span
                      className="absolute right-0 top-0 bg-red-500 rounded-full p-[2px] cursor-pointer"
                      onClick={() => handleExistingImageRemove(index)}
                    >
                      <X size={14} className="text-white hover:text-gray-800" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* promo */}
          <div className="grid grid-cols-4  ">
            <Label htmlFor="video" className="block">
              Promo Video
            </Label>
            <div className="col-span-3">
              <Input
                id="video"
                name="video"
                type="url"
                placeholder="Url"
                className="w-full"
                value={formik.values.video}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>
          {/* Facebook Group Link */}
          {/* <div className="grid grid-cols-4 ">
            <Label htmlFor="hasFb" className="block">
              Has Facebook
            </Label>
            <div className="flex items-center space-x-4">
              {options.map((option) => (
                <Label
                  key={option.value}
                  className="flex items-center space-x-2 font-semibold cursor-pointer"
                >
                  <input
                    type="radio"
                    name="hasFb"
                    value={option.value}
                    checked={formik.values.hasFb === option.value || selectedType}
                    onChange={() => formik.setFieldValue("hasFb", option.value)} // Update Formik's state directly
                    className="w-5 h-5 ml-5"
                  />
                  <span>{option.label}</span>
                </Label>
              ))}
            </div>
            {formik.touched.hasFb && !formik.values.hasFb && (
              <p className="text-red-500 text-sm mt-1">
                Please select an option
              </p>
            )}
          </div> */}
          {/* Facebook Group Link Input */}

          <div className="grid grid-cols-4 ">
            <Label htmlFor="fbgrouplink" className="block">
              Group Link<span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <Input
                id="fbgrouplink"
                name="fbgrouplink"
                type="url"
                placeholder="Url"
                {...formik.getFieldProps("fbgrouplink")}
              />
              {formik.touched.fbgrouplink && formik.errors.fbgrouplink && (
                <p className="text-red-500 text-sm">
                  {formik.errors.fbgrouplink}
                </p>
              )}
            </div>
          </div>


          <div className="grid grid-cols-4">
            <Label htmlFor="books_inc" className="block">
              Is Enrollment Disabled ?
            </Label>
            <div className="flex items-center space-x-4">
              {enrollment?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2  cursor-pointer"
                >
                  <input
                    type="radio"
                    name="isEnrollmentDisabled"
                    value={option?.value}
                    checked={formik.values.isEnrollmentDisabled === option.value}
                    onChange={() =>
                      formik.setFieldValue("isEnrollmentDisabled", option.value)
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="destructive"
              type="button"
              onClick={() => window.location.reload()}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isSubmitting ? <ButtonLoader /> : "Update"}
            </Button>
          </div>
        </div>
      </form >
    </div >
  );
};

export default CourseForm;