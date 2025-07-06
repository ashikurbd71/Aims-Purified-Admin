import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import useAxiosSecure from "@/hooks/useAxiosSecure";

// ** Fetch Total Earnings **
export const fetchTotalEarnings = createAsyncThunk(
    "totalEarnings/fetchTotalEarnings",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await useAxiosSecure.get("/enrollment"); // Replace with custom API endpoint
            // Assuming `totalEarnings` is part of the response
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ** Initial State **
const initialState = {
    isLoading: false,
    data: [],
    error: false,
};

// ** Create Slice **
const totalEarningSlice = createSlice({
    name: "totalEarnings",
    initialState,
    extraReducers: (builder) => {
        builder
            // Case 1: Fetch pending
            .addCase(fetchTotalEarnings.pending, (state) => {
                state.isLoading = true;
                state.error = null; // Reset error on new request
            })
            // Case 2: Fetch fulfilled
            .addCase(fetchTotalEarnings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload.totalEarnings || 0; // Ensure proper data assignment
            })
            // Case 3: Fetch rejected
            .addCase(fetchTotalEarnings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch earnings.";
            });
    },
});

// ** Export Reducer **
export default totalEarningSlice.reducer;
