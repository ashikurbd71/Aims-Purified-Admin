import useAxiosSecure from "@/hooks/useAxiosSecure";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";

const AdmissionDetails = () => {
  const admissionId = useParams();

  const {
    data: Addmission,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["calenderManagement"],
    queryFn: async () => {
      try {
        const res = await useAxiosSecure.get(
          `/admissionCalender/${admissionId?.id}`
        );
        (res.data);
        return res?.data?.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
  });

  return (
    <>
      <CustomMetaTag title={" Calender Details"} />
      <div class="container mx-auto my-8 p-6 bg-white shadow-lg rounded-lg">
        <h1 class="text-3xl font-semibold text-center mb-6">
          {Addmission?.name}
        </h1>

        <table class="min-w-full table-auto mb-6">
          <thead>
            <tr class="bg-gray-200">
              <th class="px-6 py-3 text-left text-xl font-semibold mb-3">
                Exam Date
              </th>
              <th class="px-6 py-3 text-left text-2xl font-semibold mb-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Exam Name</td>
              <td class="px-6 py-4">{Addmission?.name}</td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Date</td>
              <td class="px-6 py-4">
                {Addmission?.examDate
                  ? new Date(Addmission?.examDate).toLocaleString()
                  : "N/A"}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Time</td>
              <td className="px-6 py-4">
                {Addmission?.examStartTime
                  ? new Date(
                    `1970-01-01T${Addmission.examStartTime}:00Z`
                  ).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  : "No Time Available"}
              </td>
            </tr>
          </tbody>
        </table>

        <table class="min-w-full table-auto mb-6">
          <thead>
            <tr class="bg-gray-200">
              <th class="px-6 py-3 text-left text-xl font-semibold mb-3">
                Exam Info
              </th>
              <th class="px-6 py-3 text-left text-2xl font-semibold mb-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Marks Distribution</td>
              <td class="px-6 py-4">
                {Addmission?.metadata?.marksDistribution}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Syllabus</td>
              <td class="px-6 py-4">{Addmission?.metadata?.examSyllabus}</td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Second Attempt</td>
              <td class="px-6 py-4">
                {Addmission?.metadata?.areSecondTimerAllowedToApply === true
                  ? "Yes"
                  : "No"}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Negative Marks</td>
              <td class="px-6 py-4">{Addmission?.metadata?.negativeMarks}</td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Calculator</td>
              <td class="px-6 py-4">
                {" "}
                {Addmission?.metadata?.isCalculatorAllowed === true
                  ? "Allowed"
                  : "Not Allowed"}{" "}
              </td>
            </tr>
          </tbody>
        </table>

        <table class="min-w-full table-auto mb-6">
          <thead>
            <tr class="bg-gray-200">
              <th class="px-6 py-3 text-left text-xl font-semibold mb-3">
                Application Info
              </th>
              <th class="px-6 py-3 text-left text-2xl font-semibold mb-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Application Start Date</td>
              <td class="px-6 py-4">
                {Addmission?.applicationInfo?.startTime
                  ? new Date(
                    Addmission?.applicationInfo?.startTime
                  ).toLocaleString()
                  : "N/A"}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Application End Date</td>
              <td class="px-6 py-4">
                {" "}
                {Addmission?.applicationInfo?.deadline
                  ? new Date(
                    Addmission?.applicationInfo?.deadline
                  ).toLocaleString()
                  : "N/A"}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Application Fee</td>
              <td class="px-6 py-4"> {Addmission?.applicationInfo?.fee} Tk</td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Website</td>
              <td class="px-6 py-4">
                <a
                  href={Addmission?.applicationInfo?.applicationUrl}
                  class="text-blue-500 hover:underline"
                  target="_blank"
                >
                  {Addmission?.applicationInfo?.applicationUrl}
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <table class="min-w-full table-auto mb-6">
          <thead>
            <tr class="bg-gray-200">
              <th class="px-6 py-3 text-left text-xl font-semibold mb-3">
                Admit Card Info
              </th>
              <th class="px-6 py-3 text-left text-2xl font-semibold mb-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Download Admit Card</td>
              <td class="px-6 py-4">
                <a
                  href={Addmission?.metadata?.admitCardUrl}
                  class="text-blue-500 hover:underline"
                  target="_blank"
                >
                  Click here to download
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <table class="min-w-full table-auto mb-6">
          <thead>
            <tr class="bg-gray-200">
              <th class="px-6 py-3 text-left text-xl font-semibold mb-3">
                Result Info
              </th>
              <th class="px-6 py-3 text-left text-2xl font-semibold mb-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">View Results</td>
              <td class="px-6 py-4">
                <a
                  href={Addmission?.metadata?.resultUrl}
                  class="text-blue-500 hover:underline"
                  target="_blank"
                >
                  Click here to view results
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <table class="min-w-full table-auto mb-6">
          <thead>
            <tr class="bg-gray-200">
              <th class="px-6 py-3 text-left text-xl font-semibold mb-3">
                Metadata
              </th>
              <th class="px-6 py-3 text-left text-2xl font-semibold mb-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Created At</td>
              <td class="px-6 py-4">
                {Addmission?.createdAt
                  ? new Date(Addmission?.createdAt).toLocaleString()
                  : "N/A"}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-6 py-4 text-gray-700">Last Updated</td>
              <td class="px-6 py-4">
                {Addmission?.updatedAt
                  ? new Date(Addmission?.updatedAt).toLocaleString()
                  : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdmissionDetails;
