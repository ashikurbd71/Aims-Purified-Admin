import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/global/ButtonLoader";
import { getCourse } from "@/Api/selectorApi";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useEnrollmentData from "@/hooks/useEnrollmentData";
import User from "@/hooks/userData";

const BulkUpload = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseOption, setCourseOptions] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);
  const { userData } = User()
  const [, enrollmentRefetch] = useEnrollmentData()
  const axiosSecure = useAxiosSecure()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCourse();
        const options = data?.data?.map((course) => ({
          value: course._id,
          label: course.name,
        }));
        setCourseOptions(options);
      } catch (error) {
        console.error("Error fetching Courses:", error);
      }
    };
    fetchData();
  }, []);

  // Function to extract student details from an uploaded file
  const extractDetailsFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const details = jsonData.map((row) => ({
          number: row.number || "",
          name: row.name || "",
        }));

        setStudentDetails(details);
        resolve(details);
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Function to download a sample Excel file
  const downloadSampleExcel = () => {
    const sampleData = [
      { number: "01581782193", name: "Ashikur Rahman Ovi" },
      { number: "01630075517", name: "Samir" },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Sample_Student.xlsx");
  };

  const formik = useFormik({
    initialValues: {
      courseId: null,
      file: null,
    },
    validationSchema: Yup.object({
      courseId: Yup.object().nullable().required("Course is required"),

    }),
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const details = await extractDetailsFromFile(values.file);

        const response = await axiosSecure.post("/enrollment/bulk", {
          courseId: values.courseId.value,
          details: studentDetails,
          enrolledBy: userData?.name,
        });

        if (response.status === 201) {
          toast.success("Manual Enrollment successfully");
          resetForm();
        }
      } catch (error) {
        toast.error(
          error.response?.status === 400
            ? "No students found for enrollment"
            : error.response?.data?.message || "Something went wrong"
        );
      } finally {
        setIsSubmitting(false);
        enrollmentRefetch()
      }
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>

        <div className="flex items-center justify-between pt-5">
          <div></div>
          <div className="">
            <Button variant="outline" className='text-red-500' type="button" onClick={downloadSampleExcel}>
              Download Sample Excel
            </Button>
          </div>
        </div>
        {/* File Upload */}
        <div className="mb-4">
          <label className="block mb-1">
            Upload File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => formik.setFieldValue("file", e.currentTarget.files[0])}
            className="border border-gray-300 p-2 w-full rounded-md"
          />
          {formik.touched.file && formik.errors.file && (
            <div className="text-red-500 text-sm">{formik.errors.file}</div>
          )}
        </div>

        {/* Course Selection */}
        <div className="mb-4">
          <label className="block mb-1">
            Course Name <span className="text-red-500">*</span>
          </label>
          <Select
            options={courseOption}
            value={formik.values.courseId}
            onChange={(option) => formik.setFieldValue("courseId", option)}
            placeholder="Select a course"
          />
          {formik.touched.courseId && formik.errors.courseId && (
            <div className="text-red-500 text-sm">{formik.errors.courseId.label}</div>
          )}
        </div>

        {/* Download Sample File Button */}


        {/* Submit Button */}
        <div className="pt-4 text-right">
          <Button variant="default" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <ButtonLoader /> : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BulkUpload;
