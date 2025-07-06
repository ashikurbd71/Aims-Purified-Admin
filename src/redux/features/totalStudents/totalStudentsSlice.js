import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import useAxiosSecure from "@/hooks/useAxiosSecure"; // Import retained for secure Axios usage.

// Fetch Total Students Data
export const fetchTotalStudents = createAsyncThunk(
    "totalStudents/fetchTotalStudents",
    async (_, { rejectWithValue }) => {
        try {

            const { data } = await useAxiosSecure.get("/student"); // Replace with custom API
            return data; // Assume the API response is already in JSON
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Initial State
const initialState = {
    isLoading: false,
    students: [],
    error: false,
};

// Create Slice
const totalStudentSlice = createSlice({
    name: "totalStudents",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(fetchTotalStudents.pending, (state) => {
                state.isLoading = true;
                state.error = false; // Reset error state when starting a new request
            })
            .addCase(fetchTotalStudents.fulfilled, (state, action) => {
                state.isLoading = false;
                state.students = action.payload; // Store API response in `data`
            })
            .addCase(fetchTotalStudents.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || true; // Capture error message if available
            });
    },
});

// Export Reducer
export default totalStudentSlice.reducer;
