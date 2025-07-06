import { Card, CardContent } from "@/components/ui/card";
import useCouponData from "@/hooks/useCouponData";
import useEnrollmentData from "@/hooks/useEnrollmentData";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import User from "@/hooks/userData";
import useSmsBalanceData from "@/hooks/useSmsBalanceData";
import useStudentData from "@/hooks/useStudentData";
import { Mail, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import useShipmentData from "@/hooks/useShipmentData";

const Home = () => {
  // Query state Management
  const [enrollmentData] = useEnrollmentData();
  const [smsBalanceData] = useSmsBalanceData();
  const [studentData] = useStudentData();
  const [couponData] = useCouponData();
  const [shipmentData]=useShipmentData()

  const {userData}= User()
  const total = enrollmentData
    ?.filter((item) => item.enrollment?.status === "COMPLETED") // Filter only items with status "COMPLETED"
    ?.reduce(
      (sum, item) => sum + (item.enrollment?.earnedFromThisEnrollment || 0),
      0
    );
  const roundedTotal = parseFloat(total?.toFixed(2)) || 0; // Handle potential undefined total
const pendingShipment = shipmentData?.filter((item)=>item.status="PENDING")

  return (
    <>
      <CustomMetaTag title={"Overview"} />

      <div>
        <h1 className="text-xl font-bold  ">Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {/* Earnings */}

          {(userData?.role === "ADMIN" || userData?.role === "DEVELOPER") && (
            <Card className="p-6 rounded-3xl">
              <Link to={"/enrollment"}>
                {" "}
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="bg-gray-100 dark:text-gray-800 h-10 w-10 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1e1e1e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-banknote"
                      >
                        <rect width="20" height="12" x="2" y="6" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                    </div>

                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-ellipsis-vertical"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-600 mt-6">
                    Total Earning
                  </p>
                  <p className="flex items-center justify-between mt-2">
                    <span className="text-4xl font-extrabold pr-2">
                      {roundedTotal || 0}
                    </span>
                  </p>
                </CardContent>
              </Link>
            </Card>
          )}

          {/* Students */}

          <Link to={"/student"}>
            <Card className="p-6 rounded-3xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="bg-gray-100 dark:text-gray-800 h-10 w-10 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-users"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>

                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-ellipsis-vertical"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-600 mt-6">
                  Total Students
                </p>
                <p className="flex items-center justify-between mt-2">
                  <span className="text-4xl font-extrabold">
                    {studentData?.length || 0}
                  </span>
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Coupon */}
          <Link to={"/coupon"}>
            <Card className="p-6 rounded-3xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="bg-gray-100 dark:text-gray-800 h-10 w-10 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-eye"
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>

                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-ellipsis-vertical"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-600 mt-6">
                  Active Coupon
                </p>
                <p className="flex items-center justify-between mt-2">
                  <span className="text-4xl font-extrabold">
                    {couponData.length || 0}
                  </span>
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Coupon */}
          <Link to={"/shipments"}>
            <Card className="p-6 rounded-3xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="bg-gray-100 dark:text-gray-800 h-10 w-10 rounded-full flex items-center justify-center">
                    <Truck/>
                  </div>

                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-ellipsis-vertical"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-600 mt-6">
                  Pending Shipments
                </p>
                <p className="flex items-center justify-between mt-2">
                  <span className="text-4xl font-extrabold">
                    {pendingShipment.length || 0}
                  </span>
                </p>
              </CardContent>
            </Card>
          </Link>

          
            {userData?.role === "DEVELOPER" && (
              <Card className="p-6 rounded-3xl">
                <a href="https://bulksmsbd.net/bkash/newindex" target="_blank">
                  {" "}
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="bg-gray-100 dark:text-gray-800 h-10 w-10 rounded-full flex items-center justify-center">
                        <Mail />
                      </div>

                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-ellipsis-vertical"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-600 mt-6">
                      Remaining SMS
                    </p>
                    <p className="flex items-center justify-between mt-2">
                      <span className="text-4xl font-extrabold pr-2">
                        {smsBalanceData?.balance
                          ? Math.floor(smsBalanceData?.balance / 0.35)
                          : 0}
                      </span>
                    </p>
                  </CardContent>
                </a>
              </Card>
            )}
        </div>
      </div>
    </>
  );
};

export default Home;
