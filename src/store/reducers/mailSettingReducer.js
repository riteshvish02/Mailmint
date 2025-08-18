 import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mailSettings: [],
  loading: false,
  error: null,
  message: null,
  fetchLoading: false,
  fetchError: null,
};

export const mailSettingSlice = createSlice({
  name: "MailSetting",
  initialState,
  reducers: {
    // Add Mail Setting Actions
    isMailSettingRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    isMailSettingSuccess: (state, action) => {
      state.loading = false;
      state.mailSettings = action.payload;
      state.error = null;
    },
    isMailSettingFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Fetch Mail Settings Actions
    fetchMailSettingsRequest: (state) => {
      state.fetchLoading = true;
      state.fetchError = null;
    },
    fetchMailSettingsSuccess: (state, action) => {
      state.fetchLoading = false;
      state.mailSettings = action.payload;
      state.fetchError = null;
    },
    fetchMailSettingsFail: (state, action) => {
      state.fetchLoading = false;
      state.fetchError = action.payload;
    },
    
    // Update Mail Setting Actions
    updateMailSettingRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateMailSettingSuccess: (state, action) => {
      state.loading = false;
      state.mailSettings = action.payload;
      state.error = null;
    },
    updateMailSettingFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Delete Mail Setting Actions
    deleteMailSettingRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteMailSettingSuccess: (state, action) => {
      state.loading = false;
      state.mailSettings = action.payload;
      state.error = null;
    },
    deleteMailSettingFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Clear Actions
    clearMailSettingError: (state) => {
      state.error = null;
    },
    clearMailSettingMessage: (state) => {
      state.message = null;
    },
    clearFetchError: (state) => {
      state.fetchError = null;
    },
  },
});

export const {
  isMailSettingRequest,
  isMailSettingSuccess,
  isMailSettingFail,
  fetchMailSettingsRequest,
  fetchMailSettingsSuccess,
  fetchMailSettingsFail,
  updateMailSettingRequest,
  updateMailSettingSuccess,
  updateMailSettingFail,
  deleteMailSettingRequest,
  deleteMailSettingSuccess,
  deleteMailSettingFail,
  clearMailSettingError,
  clearMailSettingMessage,
  clearFetchError,
} = mailSettingSlice.actions;

export default mailSettingSlice.reducer;