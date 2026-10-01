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
  queuedLoad: false,
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
      if (Array.isArray(action.payload)) {
        state.domains = action.payload;
      } else if (action.payload && typeof action.payload === 'object') {
        state.domain = action.payload;
        const currentDomains = Array.isArray(state.domains) ? state.domains : [];
        const exists = currentDomains.some(d => d._id && d._id === action.payload._id);
        state.domains = exists ? currentDomains : [action.payload, ...currentDomains];
      }
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
      state.domains = Array.isArray(action.payload) ? action.payload : [];
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
    updateDomainProgress: (state, action) => {
      const { domainId, domainName, emailsSent, emailsFailed, emailsTotal, emailsRemaining, sendingInProgress } = action.payload;
      const target = state.domains.find(
        (d) => (domainId && d._id === domainId) || (domainName && d.domain === domainName)
      );
      if (target) {
        if (typeof emailsSent === 'number') target.emailsSent = emailsSent;
        if (typeof emailsFailed === 'number') target.emailsFailed = emailsFailed;
        if (typeof emailsTotal === 'number') target.emailsTotal = emailsTotal;
        if (typeof emailsRemaining === 'number') target.emailsRemaining = emailsRemaining;
        if (typeof sendingInProgress === 'boolean') target.sendingInProgress = sendingInProgress;
      }
    },
    setQueuedLoad: (state, action) => {
      state.queuedLoad = true;
    },
    clearQueuedLoad: (state) => {
      state.queuedLoad = false;
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
    isSuccess: (state) => {
      state.loading = false;
      state.error = null;
    }
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
  isSuccess,
  setQueuedLoad,
  clearQueuedLoad,
  updateDomainProgress
} = domainSlice.actions;

export default domainSlice.reducer;