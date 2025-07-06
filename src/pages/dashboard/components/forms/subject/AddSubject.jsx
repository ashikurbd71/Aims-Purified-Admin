import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useParams } from "react-router-dom";
import axios from "axios";
import ButtonLoader from "@/components/global/ButtonLoader";

const AddSubject = ({ refetch, onClose }) => {
  const { courseId } = useParams();
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
        ("Uploaded Images Data:", response.data);
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

  const handleReset = () => {
    formik.resetForm();
  };
  const formik = useFormik({
    initialValues: {
      featuredImg: "",
      name: "",
      course: "",
    },
    validationSchema: Yup.object({
      featuredImg: Yup.mixed().required("Image is required"),
      name: Yup.string().required("Name is required"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      if (values.featuredImg) {
        const imageUrl = await uploadImage(values.featuredImg);
        if (imageUrl) {
          values.featuredImg = imageUrl?.data?.fileUrls[0];
        }
      }

      try {
        const response = await axiosSecure.post("/subject/add", {
          name: values.name,
          course: courseId,
          featuredImgUrl: values.featuredImg,
        });

        if (response.status === 201) {
          ("New Subject added successfully:", values);

          toast.success("New Subject Added successfully");

          // Reset form values
          handleReset();

          // Refetch the updated data
          refetch();

          // Close the modal
          if (onClose) {
            onClose();
          }
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

  return (
    <div>
      <form className="mt-3" onSubmit={formik.handleSubmit}>
        {/* Name */}
        <div className="pt-4">
          <Label className="block">
            Subject Name
            <span className="text-xl text-red-500">*</span>
          </Label>
          <Input
            type="text"
            name="name"
            placeholder="Enter Name"
            className="custom-input w-full h-[40px] rounded-sm bg-[#FBFDFC] border border-[#E6E6E6] mt-2"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name && (
            <small className="text-red-500 text-sm">{formik.errors.name}</small>
          )}
        </div>

        {/* Image */}
        <div className="space-y-2 pt-4">
          <Label htmlFor=" " className="block">
            Image <span className="text-xl text-red-500">*</span>
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
              to upload your image .
            </p>
            <span className="text-xs text-gray-500">
              Supported Format: SVG, JPG, PNG (10mb each)
            </span>
            <input
              id="featuredImg"
              name="featuredImg"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                formik.setFieldValue("featuredImg", event.target.files[0])
              }
            />
          </label>
          {formik.values.featuredImg && formik.values.featuredImg.size > 0 && (
            <p className="text-sm mt-1">
              {formik.values.featuredImg.name} -{" "}
              {(formik.values.featuredImg.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}

          {formik.touched.featuredImg && formik.errors.featuredImg && (
            <small className="text-red-500 text-sm">
              {formik.errors.featuredImg}
            </small>
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

export default AddSubject;
