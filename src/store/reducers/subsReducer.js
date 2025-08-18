import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  subscribers: [],
  loading: false,
  error: null,
  message: null,
  bulkUploadLoading: false,
  bulkUploadError: null,
};

export const subscriberSlice = createSlice({
  name: "Subscriber",
  initialState,
  reducers: {
    // Add Single Subscriber Actions
    addSubscriberRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addSubscriberSuccess: (state, action) => {
      state.loading = false;
      state.subscribers.push(action.payload);
      state.error = null;
      state.message = "Subscriber added successfully";
    },
    addSubscriberFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Bulk Upload Actions
    bulkUploadRequest: (state) => {
      state.bulkUploadLoading = true;
      state.bulkUploadError = null;
    },
    bulkUploadSuccess: (state, action) => {
      state.bulkUploadLoading = false;
      state.bulkUploadError = null;
      state.message = `Successfully uploaded ${action.payload.count} subscribers`;
    },
    bulkUploadFail: (state, action) => {
      state.bulkUploadLoading = false;
      state.bulkUploadError = action.payload;
    },
    
    // Clear Actions
    clearSubscriberError: (state) => {
      state.error = null;
    },
    clearSubscriberMessage: (state) => {
      state.message = null;
    },
    clearBulkUploadError: (state) => {
      state.bulkUploadError = null;
    },
  },
});

export const {
  addSubscriberRequest,
  addSubscriberSuccess,
  addSubscriberFail,
  bulkUploadRequest,
  bulkUploadSuccess,
  bulkUploadFail,
  clearSubscriberError,
  clearSubscriberMessage,
  clearBulkUploadError,
} = subscriberSlice.actions;

export default subscriberSlice.reducer;