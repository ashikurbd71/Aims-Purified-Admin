import { Card, CardContent } from "@/components/ui/card";
import useCouponData from "@/hooks/useCategoryData";
import useEnrollmentData from "@/hooks/useOrderData";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import DashboardOverview from "./components/DashboardOverview";
import { Link } from "react-router-dom";

const Home = () => {
  // Query state Management
  const [enrollmentData] = useEnrollmentData();
  const [couponData] = useCouponData();

  // Calculate total earnings from completed enrollments
  const total = enrollmentData
    ?.filter((item) => item.enrollment?.status === "COMPLETED")
    ?.reduce(
      (sum, item) => sum + (item.enrollment?.earnedFromThisEnrollment || 0),
      0
    );
  const roundedTotal = parseFloat(total?.toFixed(2)) || 0;

  return (
    <>
      <CustomMetaTag title={"Overview"} />

      <div className="space-y-8">
        {/* Dashboard Overview Section */}
        <DashboardOverview />


      </div>
    </>
  );
};

export default Home;
