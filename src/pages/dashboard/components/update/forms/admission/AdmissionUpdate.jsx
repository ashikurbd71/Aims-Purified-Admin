import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select, { components } from "react-select";
import { useEffect, useState } from "react";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "sonner";
import ButtonLoader from "@/components/global/ButtonLoader";

const AdmissionUpdate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  (id);
  // fetach notice data
  const { data: item } = useQuery({
    queryKey: ["singlenotice", id],
    queryFn: async () => {
      try {
        const res = await useAxiosSecure.get(`/admissionCalender/${id}`);
        (res.data);
        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
  });
  const [selectedTime, setSelectedTime] = useState(null);

  const [selectedCalculator, setSelectedCalculator] = useState(null);
  (selectedCalculator);
  const options = [
    { value: "YES", label: "Yes" },
    { value: "NO", label: "No" },
  ];
  const calculator = [
    { value: "Allowed", label: "Allowed" },
    { value: "Not Allowed", label: "Not Allowed" },
  ];
  // Formik configuration
  const formik = useFormik({
    initialValues: {
      examName: "",
      examDate: "",
      examTime: "",
      examMarks: "",
      examSyllabus: "",
      secondTime: "",
      negativeMarks: "",
      calculator: "",
      applicationStarts: "",
      applicationEnds: "",
      applicationFee: "",
      websiteLink: "",
      admitLink: "",
      resultLink: "",
    },
    validationSchema: Yup.object({
      examName: Yup.string().required("Exam Name is required"),
      examDate: Yup.string().required("Exam Date is required"),

      websiteLink: Yup.string().url("Must be a valid URL"),
      negativeMarks: Yup.number()
        .typeError("Must be a number")

        .max(0, "Must be negative number"),

      applicationStarts: Yup.date()
        .required("Application start date is required")
        .min(new Date(), "Application starts must be in the future"),
      applicationEnds: Yup.date()
        .required("Application end date is required")
        .min(new Date(), "Application ends must be in the future"),
      applicationFee: Yup.number()
        .typeError("Must be a number")

        .min(0, "Fee cannot be negative"),

      admitLink: Yup.string().url("Must be a valid URL").notRequired(),
      resultLink: Yup.string().url("Must be a valid URL").notRequired(),
    }),

    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const response = await useAxiosSecure.patch(
          `/admissionCalender/${id}`,
          {
            name: values.examName,
            examDate: values.examDate,
            examStartTime: values.examTime,

            metadata: {
              marksDistribution: values.examMarks,
              examSyllabus: values.examSyllabus,
              areSecondTimerAllowedToApply:
                values.secondTime === "YES" ? true : false,
              negativeMarks: values.negativeMarks,
              isCalculatorAllowed:
                values.calculator === "Allowed" ? true : false,
              admitCardUrl: values.admitLink,
              resultUrl: values.resultLink,
            },
            applicationInfo: {
              startTime: values.applicationStarts,
              deadline: values.applicationEnds,
              fee: values.applicationFee,
              applicationUrl: values.websiteLink,
            },
          }
        );

        if (response.status === 200) {
          (" Admission form Updated successfully:", values);

          toast.success("Admission form Updated successfully");

          // Refetch the updated data
          navigate("/calendar");
          refetch();
          setIsSubmitting(false);
        } else {
          // toast.error("Something went wrong. Please try again.");
        }
      } catch (error) {
        if (error.status === 400) {
          console.warn("All fields are required");
          toast.error("All fields are required");
        } else if (error.status === 500) {
          console.error("Internal server error");
          toast.error("Internal server error. Please try again later.");
        } else {
          console.error("Unexpected status code:", error.status);
          // toast.error("Unexpected error occurred. Please try again.");
        }

        console.error("Error adding Course:", error);
        // toast.error("Failed to add the class. Please try again.");
      }
    },
  });
  useEffect(() => {
    if (item) {
      formik.setValues({
        examMarks: item?.metadata?.marksDistribution || "",
        examSyllabus: item?.metadata?.examSyllabus,
        negativeMarks: item?.metadata?.negativeMarks,

        calculator:
          item?.metadata?.isCalculatorAllowed === true
            ? "Allowed"
            : "Not Allowed",
        secondTime:
          item?.metadata?.areSecondTimerAllowedToApply === true ? "YES" : "NO",
        admitLink: item?.metadata?.admitCardUrl,
        resultLink: item?.metadata?.resultUrl,

        applicationStarts: item?.applicationInfo?.startTime?.split("T")[0],
        applicationEnds: item?.applicationInfo?.deadline?.split("T")[0],
        applicationFee: item?.applicationInfo?.fee,
        websiteLink: item?.applicationInfo?.applicationUrl,
        examName: item?.name,
        examDate: item?.examDate?.split("T")[0],
        examTime: item?.examStartTime,
      });

      if (item?.metadata?.areSecondTimerAllowedToApply === true) {
        setSelectedTime("YES");
      } else {
        setSelectedTime("NO");
      }
      if (item?.metadata?.isCalculatorAllowed === true) {
        setSelectedCalculator("Allowed");
      } else {
        setSelectedCalculator("Not Allowed");
      }
    }
  }, [item]);

  (item?.metadata?.isCalculatorAllowed);
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

  const renderError = (fieldName) => {
    if (formik.touched[fieldName] && formik.errors[fieldName]) {
      return (
        <div className="text-red-500 text-sm mt-1">
          {formik.errors[fieldName]}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <CustomMetaTag title={"Update Calender"} />

      <div className="mt-10">
        <div className="mt-10">
          <div className="border-b pb-5">
            <p className="font-bold">Exam Date</p>
            <p className="text-gray-600">
              Here you can add Exam Name, description and other course details
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6 mt-7">
            {/* exam Name */}
            <div className="flex items-start gap-4">
              <Label htmlFor="examName" className="w-1/4 text-sm font-medium">
                Exam Name <span className="text-xl text-red-500 ">*</span>
              </Label>
              <div className="flex-1">
                <Input
                  id="examName"
                  name="examName"
                  type="text"
                  placeholder="Input exam name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.examName}
                  className="w-full"
                />
                {renderError("examName")}
              </div>
            </div>

            {/* exam Date */}
            <div className="flex items-start gap-4">
              <Label htmlFor="examDate" className="w-1/4 text-sm font-medium">
                Exam Date <span className="text-xl text-red-500 ">*</span>
              </Label>
              <div className="flex-1">
                <Input
                  id="examDate"
                  name="examDate"
                  type="date"
                  placeholder="Input exam date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.examDate}
                  className="w-full"
                />
                {renderError("examDate")}
              </div>
            </div>

            {/* Exam time */}
            <div className="flex items-start gap-4">
              <Label htmlFor="examTime" className="w-1/4 text-sm font-medium">
                Exam Time
              </Label>
              <div className="flex-1">
                <Input
                  id="examTime"
                  name="examTime"
                  type="time"
                  placeholder="Input exam time"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.examTime}
                  className="w-full"
                />
                {renderError("examTime")}
              </div>
            </div>

            {/* exam info */}
            <div className="mt-10">
              <div className="border-b pb-5">
                <p className="font-bold">Exam Info</p>
                <p className="text-gray-600">Here you can add Exam Info</p>
              </div>

              <div className="space-y-6 mt-7">
                {/* marks */}
                <div className="flex items-start gap-4">
                  <Label
                    htmlFor="examMarks"
                    className="w-1/4 text-sm font-medium"
                  >
                    Marks Distribution{" "}
                  </Label>
                  <div className="flex-1">
                    <Textarea
                      id="examMarks"
                      name="examMarks"
                      type="text"
                      placeholder="Input exam marks system"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.examMarks}
                      className="w-full"
                    />
                    {renderError("examMarks")}
                  </div>
                </div>

                {/* syllabus */}
                <div className="flex items-start gap-4">
                  <Label
                    htmlFor="examSyllabus"
                    className="w-1/4 text-sm font-medium"
                  >
                    Exam Syllabus{" "}
                  </Label>
                  <div className="flex-1">
                    <Input
                      id="examSyllabus"
                      name="examSyllabus"
                      placeholder="Short Syllabus"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.examSyllabus}
                      className="w-full"
                    />
                    {renderError("examSyllabus")}
                  </div>
                </div>

                {/* second time */}
                <div className="mt-3 flex items-start gap-4">
                  <Label className="  w-1/4">Second Time</Label>
                  <div className="flex-1">
                    <Select
                      className="custom-select w-full h-[40px] rounded-sm bg-[#FBFDFC] border border-[#E6E6E6]  "
                      components={{ DropdownIndicator }}
                      options={options}
                      placeholder="Select"
                      styles={customStyles}
                      value={options.find(
                        (option) => option.value === selectedTime
                      )}
                      onChange={(selectedOption) => {
                        const selectedValue = selectedOption
                          ? selectedOption.value
                          : null;
                        setSelectedTime(selectedValue);
                        formik.setFieldValue("secondTime", selectedValue);
                      }}
                    />
                    {renderError("secondTime")}
                  </div>
                </div>

                {/* negative marks */}
                <div className="flex items-start gap-4">
                  <Label
                    htmlFor="negativeMarks"
                    className="w-1/4 text-sm font-medium"
                  >
                    Negative Marks{" "}
                  </Label>
                  <div className="flex-1">
                    <Input
                      id="negativeMarks"
                      name="negativeMarks"
                      type="number"
                      placeholder="-5"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.negativeMarks}
                      className="w-full"
                    />
                    {renderError("negativeMarks")}
                  </div>
                </div>

                {/* calculator */}
                <div className="mt-3 flex items-start gap-4">
                  <Label className="  w-1/4">Calculator</Label>
                  <div className="flex-1">
                    <Select
                      className="custom-select w-full h-[40px] rounded-sm bg-[#FBFDFC] border border-[#E6E6E6]  "
                      components={{ DropdownIndicator }}
                      options={calculator}
                      placeholder="Select"
                      styles={customStyles}
                      value={calculator.find(
                        (option) => option.value === selectedCalculator
                      )}
                      onChange={(selectedOption) => {
                        const selectedValue = selectedOption
                          ? selectedOption.value
                          : null;
                        setSelectedCalculator(selectedValue);
                        formik.setFieldValue("calculator", selectedValue);
                      }}
                    />
                    {renderError("calculator")}
                  </div>
                </div>
              </div>
            </div>

            {/* Application info */}
            <div className="mt-10">
              <div className="border-b pb-5">
                <p className="font-bold">Application Info</p>
                <p className="text-gray-600">
                  Here you can add Application Info
                </p>
              </div>

              <div className="space-y-6 mt-7">
                {/* starting */}
                <div className="flex items-start gap-4">
                  <Label
                    htmlFor="applicationStarts"
                    className="w-1/4 text-sm font-medium"
                  >
                    Application Starts{" "}
                    <span className="text-xl text-red-500 ">*</span>
                  </Label>
                  <div className="flex-1">
                    <Input
                      id="applicationStarts"
                      name="applicationStarts"
                      type="date"
                      placeholder="Input application start date"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.applicationStarts}
                      className="w-full"
                    />
                    {renderError("applicationStarts")}
                  </div>
                </div>

                {/* ending */}
                <div className="flex items-start gap-4">
                  <Label
                    htmlFor="applicationEnds"
                    className="w-1/4 text-sm font-medium"
                  >
                    Application Ends{" "}
                    <span className="text-xl text-red-500 ">*</span>
                  </Label>
                  <div className="flex-1">
                    <Input
                      id="applicationEnds"
                      name="applicationEnds"
                      type="date"
                      placeholder="Input application end date"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.applicationEnds}
                      className="w-full"
                    />
                    {renderError("applicationEnds")}
                  </div>
                </div>

                {/* application fee */}
                <div className="flex items-start gap-4">
                  <Label
                    htmlFor="applicationFee"
                    className="w-1/4 text-sm font-medium"
                  >
                    Application Fee{" "}
                  </Label>
                  <div className="flex-1">
                    <Input
                      id="applicationFee"
                      name="applicationFee"
                      type="number"
                      placeholder="230 BDT"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.applicationFee}
                      className="w-full"
                    />
                    {renderError("applicationFee")}
                  </div>
                </div>

                {/* website link */}
                <div className="flex items-start gap-4">
                  <Label
                    htmlFor="websiteLink"
                    className="w-1/4 text-sm font-medium"
                  >
                    Website Link{" "}
                    <span className="text-xl text-red-500 ">*</span>
                  </Label>
                  <div className="flex-1">
                    <Input
                      id="websiteLink"
                      name="websiteLink"
                      type="text"
                      placeholder="Input website link"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.websiteLink}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Admit info */}
            <div className="mt-10">
              <div className="border-b pb-5">
                <p className="font-bold">Admit Info</p>
                <p className="text-gray-600">Here you can add Admit Info</p>
              </div>

              <div className="space-y-6 mt-7">
                {/* admit link */}
                <div className="flex items-start gap-4">
                  <Label
                    htmlFor="admitLink"
                    className="w-1/4 text-sm font-medium"
                  >
                    Admit Link
                  </Label>
                  <div className="flex-1">
                    <Input
                      id="admitLink"
                      name="admitLink"
                      type="url"
                      placeholder="Input admit link"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.admitLink}
                      className="w-full"
                    />
                    {renderError("admitLink")}
                  </div>
                </div>
              </div>
            </div>

            {/* Result info */}
            <div className="mt-10">
              <div className="border-b pb-5">
                <p className="font-bold">Result Info</p>
                <p className="text-gray-600">Here you can add Result Info</p>
              </div>

              <div className="space-y-6 mt-7">
                {/* result link */}
                <div className="flex items-start gap-4">
                  <Label
                    htmlFor="resultLink"
                    className="w-1/4 text-sm font-medium"
                  >
                    Result Link
                  </Label>
                  <div className="flex-1">
                    <Input
                      id="resultLink"
                      name="resultLink"
                      type="url"
                      placeholder="Input result link"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.resultLink}
                      className="w-full"
                    />
                    {renderError("resultLink")}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex mt-4 items-center gap-3 justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      formik.resetForm();
                      navigate("/calendar");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="default" size="sm" type="submit">
                    {isSubmitting ? <ButtonLoader /> : "Update"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdmissionUpdate;
