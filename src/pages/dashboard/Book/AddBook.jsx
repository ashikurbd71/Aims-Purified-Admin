import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import ButtonLoader from "@/components/global/ButtonLoader";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const AddBook = ({ refetch, onClose }) => {
    const axiosSecure = useAxiosSecure();
    const [isSubmitting, setIsSubmitting] = useState(false);


    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Name  is required")
        ,
        price: Yup.date()
            .required("Price is required")
        ,

    });

    const formik = useFormik({
        initialValues: {
            name: "",
            price: "",

        },
        validationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const response = await axiosSecure.post("/book/add", {
                    name: values.name,
                    price: values.price,

                });

                if (response.status === 201) {
                    "Book added successfully:", values;

                    toast.success("Book Added successfully");

                    // Reset form values
                    handleReset();

                    // Refetch the updated data
                    refetch();
                    // Close the modal
                    if (onClose) onClose();
                    setIsSubmitting(false);
                }
            } catch (error) {
                if (error.status === 400) {
                    console.warn("All fields are required");
                    toast.error("All fields are required");
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
    const handleReset = () => {
        formik.resetForm();

    };




    return (
        <div>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Coupon Code */}
                <div className="">
                    <Label htmlFor="name" className="w-1/4 text-sm font-medium">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex-1">
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter Name"
                            className="mt-1"
                            {...formik.getFieldProps("name")}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
                        )}
                    </div>
                </div>

                <div className="">
                    <Label htmlFor="price" className="w-1/4 text-sm font-medium">
                        Price <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex-1">
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            placeholder="Enter Price"
                            className="mt-1"
                            {...formik.getFieldProps("price")}
                        />
                        {formik.touched.price && formik.errors.price && (
                            <p className="text-red-500 text-sm mt-1">{formik.errors.price}</p>
                        )}
                    </div>
                </div>









                {/* Submit Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                    <Button
                        variant="destructive"
                        type="button"
                        onClick={() => {
                            handleReset(); // Reset the form
                            onClose(); // Close the modal
                        }}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">
                        {" "}
                        {isSubmitting ? <ButtonLoader /> : "Submit"}
                    </Button>
                </div>
            </form >
        </div >
    );
};

export default AddBook;
