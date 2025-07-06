import { configureStore } from "@reduxjs/toolkit";
//import from counter slice
import counterSlice from "../redux/features/counter/counterSlice";
import totalStudentsSlice from "../redux/features/totalStudents/totalStudentsSlice";
import totalEarnings from "../redux/features/totalEarnings/totalEarningsSlice";
import totalCoupons from "../redux/features/coupon/couponSlice";

const store = configureStore({
  reducer: {
    counter: counterSlice,
    totalStudents: totalStudentsSlice,
    totalEarnings: totalEarnings,
    totalCoupons: totalCoupons,
  },
});

export default store;
