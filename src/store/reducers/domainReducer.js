import { createSlice } from "@reduxjs/toolkit";
import { fetchMailSettingsFail } from "./mailSettingReducer";

const initialState = {
  domains: [],
  loading: false,
  error: null,
  domain: {}, 
  message: null,
  fetchLoading: false,
  fetchError: null,
};

export const domainSlice = createSlice({
  name: "Domain",
  initialState,
  reducers: {
    // Add Domain Actions
    isDomainRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    isDomainSuccess: (state, action) => {
      state.loading = false;
      state.domains = action.payload;
      state.error = null;
    },
    isDomainFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Fetch Domains Actions
    fetchDomainsRequest: (state) => {
      state.fetchLoading = true;
      state.fetchError = null;
    },
    fetchDomainsSuccess: (state, action) => {
      state.fetchLoading = false;
      state.domains = action.payload;
      state.fetchError = null;
    },
   
    fetchSingleDomainSuccess: (state, action) => {
      state.loading = false;
      state.domain = action.payload;
      state.error = null;
    },
    fetchDomainsFail: (state, action) => {
      state.fetchLoading = false;
      state.fetchError = action.payload;
    },
    
    // Clear Actions
    clearDomainError: (state) => {
      state.error = null;
    },
    clearDomainMessage: (state) => {
      state.message = null;
    },
    clearFetchError: (state) => {
      state.fetchError = null;
    },
  },
});

export const {
  isDomainRequest,
  isDomainSuccess,
  isDomainFail,
  fetchDomainsRequest,
  fetchDomainsSuccess,
  fetchDomainsFail,
  clearDomainError,
  clearDomainMessage,
  clearFetchError,
  fetchSingleDomainSuccess,
} = domainSlice.actions;

export default domainSlice.reducer;