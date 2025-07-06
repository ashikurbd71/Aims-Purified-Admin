import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import useAxiosSecure from "@/hooks/useAxiosSecure";

// ** Fetch Coupons **
export const fetchCoupons = createAsyncThunk(
  "coupons/fetchCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await useAxiosSecure.get("/coupon"); // Replace with your API URL
      return data; // Assume the API already returns JSON
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ** Initial State **
const initialState = {
  isLoading: false,
  coupons: [],
  error: null,
};

// ** Create Slice **
const totalCouponSlice = createSlice({
  name: "coupons",
  initialState,
  extraReducers: (builder) => {
    // Fetch Coupons
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Reset error on new request
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch coupons.";
      });
  },
});

// ** Export Reducer **
export default totalCouponSlice.reducer;
