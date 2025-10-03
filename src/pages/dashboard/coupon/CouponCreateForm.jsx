import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import ButtonLoader from "@/components/global/ButtonLoader";

const CouponCreateForm = ({ refetch, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure();

  const validationSchema = Yup.object({
    code: Yup.string()
      .required("Coupon code is required")
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code must be less than 20 characters"),
    amount: Yup.number()
      .required("Discount amount is required")
      .min(0, "Amount must be greater than or equal to 0")
      .max(100, "Amount must be less than or equal to 100"),
    expiredate: Yup.date()
      .required("Expiry date is required")
      .min(new Date(), "Expiry date must be in the future"),
    description: Yup.string()
      .optional(),
    minimumOrderAmount: Yup.number()
      .optional()
      .min(0, "Minimum order amount must be greater than or equal to 0"),
    usageLimit: Yup.number()
      .optional()
      .min(1, "Usage limit must be at least 1")
  });

  const formik = useFormik({
    initialValues: {
      code: "",
      amount: "",
      expiredate: "",
      description: "",
      minimumOrderAmount: "",
      usageLimit: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await axiosSecure.post("/coupon", {
          code: values.code.toUpperCase(),
          amount: parseFloat(values.amount),
          expiredate: values.expiredate,
          description: values.description || null,
          minimumOrderAmount: values.minimumOrderAmount ? parseFloat(values.minimumOrderAmount) : 0,
          usageLimit: values.usageLimit ? parseInt(values.usageLimit) : 1
        });

        console.log("Response:", response);

        if (response?.data) {
          toast.success("Coupon created successfully!");
          
          // Reset form values
          handleReset();
          
          // Refetch the updated data
          refetch();
          // Close the modal
          if (onClose) onClose();
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error("Error creating coupon:", error);
        
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || "Invalid coupon data");
        } else if (error.response?.status === 409) {
          toast.error("Coupon code already exists");
        } else if (error.response?.status === 500) {
          toast.error("Internal server error. Please try again later.");
        } else {
          toast.error("Failed to create coupon. Please try again.");
        }
        setIsSubmitting(false);
      }
    },
  });

  const handleReset = () => {
    formik.resetForm();
  };

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Coupon Code */}
        <div className="">
          <Label htmlFor="code" className="w-1/4 text-sm font-medium">
            Coupon Code<span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="Enter coupon code (e.g., SAVE20)"
              className="mt-1"
              {...formik.getFieldProps("code")}
            />
            {formik.touched.code && formik.errors.code && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.code}</p>
            )}
          </div>
        </div>

        {/* Discount Amount */}
        <div className="">
          <Label htmlFor="amount" className="w-full text-sm font-medium">
            Discount Amount (%)<span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Enter discount percentage (0-100)"
              className="mt-1"
              {...formik.getFieldProps("amount")}
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.amount}</p>
            )}
          </div>
        </div>

        {/* Expiry Date */}
        <div className="">
          <Label htmlFor="expiredate" className="w-full text-sm font-medium">
            Expiry Date<span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <Input
              id="expiredate"
              name="expiredate"
              type="datetime-local"
              className="mt-1"
              {...formik.getFieldProps("expiredate")}
            />
            {formik.touched.expiredate && formik.errors.expiredate && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.expiredate}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="">
          <Label htmlFor="description" className="w-full text-sm font-medium">
            Description
          </Label>
          <div className="flex-1">
            <textarea
              rows={3}
              id="description"
              name="description"
              placeholder="Enter coupon description (optional)"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...formik.getFieldProps("description")}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.description}</p>
            )}
          </div>
        </div>

        {/* Minimum Order Amount */}
        <div className="">
          <Label htmlFor="minimumOrderAmount" className="w-full text-sm font-medium">
            Minimum Order Amount
          </Label>
          <div className="flex-1">
            <Input
              id="minimumOrderAmount"
              name="minimumOrderAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter minimum order amount (optional)"
              className="mt-1"
              {...formik.getFieldProps("minimumOrderAmount")}
            />
            {formik.touched.minimumOrderAmount && formik.errors.minimumOrderAmount && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.minimumOrderAmount}</p>
            )}
          </div>
        </div>

        {/* Usage Limit */}
        <div className="">
          <Label htmlFor="usageLimit" className="w-full text-sm font-medium">
            Usage Limit
          </Label>
          <div className="flex-1">
            <Input
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              placeholder="Enter usage limit (optional, default: 1)"
              className="mt-1"
              {...formik.getFieldProps("usageLimit")}
            />
            {formik.touched.usageLimit && formik.errors.usageLimit && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.usageLimit}</p>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="destructive"
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isSubmitting ? <ButtonLoader /> : "Create Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponCreateForm;
