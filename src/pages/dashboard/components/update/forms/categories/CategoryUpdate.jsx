import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import ButtonLoader from "@/components/global/ButtonLoader";

const CategoryUpdate = ({ item, refetch, onClose }) => {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure()
  const { data: items } = useQuery({
    queryKey: ["singlecategoryManagement"],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get(`/categories/${item}`);
        res.data;
        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
  });



  const validationSchema = Yup.object({
    description: Yup.string()
      .required("Description code is required"),

    name: Yup.string()
      .required("Category  is required")


  });

  const handleReset = () => {
    formik.resetForm();
  };
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",

    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await axiosSecure.patch(`/categories/${item}`, {
          name: values.name,
          description: values.description,
        });

        if (response.data?.statusCode === 200) {


          toast.success(response.data?.message);

          // Refetch the updated data
          refetch();
          // Close the modal
          if (onClose) onClose();
          setIsSubmitting(false);
        }
      } catch (error) {
        if (error.status === 400) {
          console.warn("All fields are required");
          toast.error("This code already exists😅");
        } else if (error.status === 500) {
          console.error("Internal server error");
          toast.error("Internal server error. Please try again later.");
        } else if (error.status === 0) {
          console.error("Internal server error");
          toast.error("Coupon Must Be String");
        } else {
          console.error("Unexpected status code:", error.status);
          // toast.error("Unexpected error occurred. Please try again.");
        }
        console.error("Error adding :", error);
        // toast.error("Failed to add the class. Please try again.");
      }
    },
  });

  useEffect(() => {
    if (items) {
      formik.setValues({
        // code: items?.code || "",

        name: items?.name,
        description: items?.description,


      });


    }
  }, [items]);


  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="">
          <Label htmlFor="code" className="w-1/4 text-sm font-medium">
            Category Name<span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="Enter Name"
              className="mt-1"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.code && formik.errors.code && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.code}</p>
            )}
          </div>
        </div>




        {/* Discount Amount */}
        <div className=" ">
          <Label
            htmlFor="description"
            className="w-full text-sm font-medium"
          >
            Discription <span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <textarea
              rows={4}
              id="description"
              name="description"
              type="number"
              placeholder={`Enter Description`}
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...formik.getFieldProps("description")}
            />
            {formik.touched.description &&
              formik.errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.description}
                </p>
              )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="destructive"
            type="button"
            onClick={() => {
              handleReset(), onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isSubmitting ? <ButtonLoader /> : "Update Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryUpdate;
