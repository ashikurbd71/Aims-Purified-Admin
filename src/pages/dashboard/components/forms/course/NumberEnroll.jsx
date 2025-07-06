import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";

// Simple phone number validation
const phoneRegExp = /^\d{11}$/;

const validationSchema = Yup.object({
  numbers: Yup.array()
    .of(
      Yup.string()
        .matches(phoneRegExp, "Please enter a valid mobile number (11 digits)")
        .required("Mobile number is required")
    )
    .min(1, "At least one number is required"),
  newNumber: Yup.string(),
});

const NumberEnroll = () => {
  const initialValues = {
    numbers: [""],
    newNumber: "",
  };

  // State to manage input error
  const [inputError, setInputError] = useState("");

  const handleSubmit = (values, { setSubmitting }) => {
    console.log(
      "Submitted mobile numbers:",
      values.numbers.filter((n) => n)
    );
    setSubmitting(false);
  };

  return (
    <div className=" ">
      <h2 className="text-xl font-semibold mb-4">Mobile Numbers</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-4">
            {/* Input for new number */}
            <div>
              <label
                htmlFor="newNumber"
                className="block text-sm font-medium mb-1"
              >
                Add Mobile Number:
              </label>
              <div className="flex">
                <Field
                  id="newNumber"
                  name="newNumber"
                  type="text"
                  placeholder="Enter mobile number"
                  className={`flex-1 px-3 py-2 border ${
                    inputError ? "border-red-500" : "border-gray-300"
                  } rounded-l-md`}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                    // Clear error when user starts typing again
                    if (inputError) setInputError("");
                  }}
                />

                <button
                  type="button"
                  className="px-4 py-2 bg-gray-900 text-white rounded-r-md hover:bg-gray-800"
                  onClick={() => {
                    // Validate number before adding
                    if (!values.newNumber) {
                      setInputError("Please enter a mobile number");
                      return;
                    }

                    if (!phoneRegExp.test(values.newNumber)) {
                      setInputError(
                        "Please enter a valid mobile number (11 digits)"
                      );
                      return;
                    }

                    // Number is valid, add it
                    setFieldValue("numbers", [
                      ...values.numbers.filter((n) => n),
                      values.newNumber,
                    ]);
                    setFieldValue("newNumber", "");
                    setInputError("");
                  }}
                >
                  Add
                </button>
              </div>

              {/* Show input error message */}
              {inputError && (
                <div className="text-red-500 text-xs mt-1">{inputError}</div>
              )}
            </div>

            {/* Display added numbers */}
            <FieldArray name="numbers">
              {({ remove }) => (
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-1">
                    Added Numbers:
                  </label>

                  {values.numbers.length === 0 ||
                  (values.numbers.length === 0.1 && !values.numbers[0]) ? (
                    <div>
                      <p className="text-gray-500 text-sm italic">
                        No numbers added yet
                      </p>
                      {errors.numbers &&
                        typeof errors.numbers === "string" &&
                        touched.numbers && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.numbers}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {values.numbers
                        .map(
                          (number, index) =>
                            number && (
                              <div
                                key={index}
                                className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md"
                              >
                                <div className="flex-1">
                                  <span className="font-medium">{number}</span>
                                  <input
                                    type="hidden"
                                    name={`numbers.${index}`}
                                    value={number}
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="p-1 text-red-500 hover:text-red-700"
                                  onClick={() => remove(index)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </div>
                            )
                        )
                        .filter(Boolean)}
                    </div>
                  )}
                </div>
              )}
            </FieldArray>

            <div className="pt-4 text-right">
              <Button
                variant="default"
                size="default"
                type="submit"
                className="mt-2"
                disabled={values.numbers.filter((n) => n).length === 0}
              >
                Submit
              </Button>
            </div>

            {/* Form submission errors */}
            {Object.keys(errors).length > 0 && touched.numbers && (
              <div className="mt-2 text-red-500 text-xs">
                {typeof errors.numbers === "string" && errors.numbers}
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NumberEnroll;
