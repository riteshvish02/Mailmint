import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  subscribers: [],
  domains: [],
  currentDomainSubscribers: [],
  currentViewedDomain: null,  
  loading: false,
  error: null,
  message: null,
  bulkUploadLoading: false,
  bulkUploadError: null,
  domainsLoading: false,
  domainsError: null,
  domainSubscribersLoading: false,
  domainSubscribersError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  bulkDeleteLoading: false,
  bulkDeleteError: null,
};

export const subscriberSlice = createSlice({
  name: "Subscriber",
  initialState,
  reducers: {
    // Add Single Subscriber Actions - Enhanced with optimistic update
    addSubscriberRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addSubscriberSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "Subscriber added successfully";
      
      // Add to general subscribers array
      if (action.payload) {
        state.subscribers.push(action.payload);
      }
    },
    addSubscriberFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Add optimistic subscriber to current domain view
    addSubscriberOptimistic: (state, action) => {
      const { subscriberData, domain } = action.payload;
      
      // Only add optimistically if we're currently viewing the same domain
      if (state.currentViewedDomain === domain) {
        const newSubscriber = {
          id: Date.now(), // Temporary ID
          domain: domain,
          emailAddress: subscriberData.email,
          subscriberName: subscriberData.name || '',
          status: subscriberData.status || 'active',
          addedDate: new Date().toISOString(),
          isOptimistic: true // Flag to identify optimistic updates
        };
        
        // Support both array and paginated response formats
        if (Array.isArray(state.currentDomainSubscribers)) {
          state.currentDomainSubscribers.push(newSubscriber);
        } else if (state.currentDomainSubscribers && Array.isArray(state.currentDomainSubscribers.subscribers)) {
          state.currentDomainSubscribers.subscribers.push(newSubscriber);
          if (state.currentDomainSubscribers.totalSubscribers) {
            state.currentDomainSubscribers.totalSubscribers += 1;
          }
        }
      }
    },

    // Remove optimistic subscriber (in case of error)
    removeOptimisticSubscriber: (state, action) => {
      const { email } = action.payload;
      
      if (Array.isArray(state.currentDomainSubscribers)) {
        state.currentDomainSubscribers = state.currentDomainSubscribers.filter(
          sub => !(sub.isOptimistic && sub.emailAddress === email)
        );
      } else if (state.currentDomainSubscribers && Array.isArray(state.currentDomainSubscribers.subscribers)) {
        state.currentDomainSubscribers.subscribers = state.currentDomainSubscribers.subscribers.filter(
          sub => !(sub.isOptimistic && sub.emailAddress === email)
        );
        if (state.currentDomainSubscribers.totalSubscribers) {
          state.currentDomainSubscribers.totalSubscribers -= 1;
        }
      }
    },

    // Bulk Upload Actions
    bulkUploadRequest: (state) => {
      state.bulkUploadLoading = true;
      state.bulkUploadError = null;
    },
    bulkUploadSuccess: (state, action) => {
      state.bulkUploadLoading = false;
      state.bulkUploadError = null;
      if (action.payload.subscribers && Array.isArray(action.payload.subscribers)) {
        state.subscribers = [...state.subscribers, ...action.payload.subscribers];
      }
      state.message = `Successfully uploaded ${
        action.payload.count || action.payload.length || "multiple"
      } subscribers`;
    },
    bulkUploadFail: (state, action) => {
      state.bulkUploadLoading = false;
      state.bulkUploadError = action.payload;
    },

    // Get All Domains Actions
    getAllDomainsRequest: (state) => {
      state.domainsLoading = true;
      state.domainsError = null;
    },
    getAllDomainsSuccess: (state, action) => {
      state.domainsLoading = false;
      state.domains = action.payload;
      state.domainsError = null;
    },
    getAllDomainsFail: (state, action) => {
      state.domainsLoading = false;
      state.domainsError = action.payload;
    },

    // Get Subscribers by Domain Actions - Enhanced to track current domain
    getSubscribersByDomainRequest: (state) => {
      state.domainSubscribersLoading = true;
      state.domainSubscribersError = null;
    },
    getSubscribersByDomainSuccess: (state, action) => {
      state.domainSubscribersLoading = false;
      state.currentDomainSubscribers = action.payload;
      state.domainSubscribersError = null;
      
      // Extract domain from the payload if available
      if (action.payload && action.payload.domain) {
        state.currentViewedDomain = action.payload.domain;
      }
    },
    getSubscribersByDomainFail: (state, action) => {
      state.domainSubscribersLoading = false;
      state.domainSubscribersError = action.payload;
    },

    // Set current viewed domain
    setCurrentViewedDomain: (state, action) => {
      state.currentViewedDomain = action.payload;
    },

    // Update Subscriber Actions
    updateSubscriberRequest: (state) => {
      state.updateLoading = true;
      state.updateError = null;
    },
    updateSubscriberSuccess: (state, action) => {
      state.updateLoading = false;
      state.updateError = null;

      const index = state.subscribers.findIndex(
        (sub) => sub.emailAddress === action.payload.emailAddress
      );
      if (index !== -1) {
        state.subscribers[index] = action.payload;
      }

      // Update in current domain subscribers (support both formats)
      if (Array.isArray(state.currentDomainSubscribers)) {
        const domainIndex = state.currentDomainSubscribers.findIndex(
          (sub) => sub.emailAddress === action.payload.emailAddress
        );
        if (domainIndex !== -1) {
          state.currentDomainSubscribers[domainIndex] = action.payload;
        }
      } else if (state.currentDomainSubscribers && Array.isArray(state.currentDomainSubscribers.subscribers)) {
        const domainIndex = state.currentDomainSubscribers.subscribers.findIndex(
          (sub) => sub.emailAddress === action.payload.emailAddress
        );
        if (domainIndex !== -1) {
          state.currentDomainSubscribers.subscribers[domainIndex] = action.payload;
        }
      }

      state.message = "Subscriber updated successfully";
    },
    updateSubscriberFail: (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
    },

    // Delete Single Subscriber Actions
    deleteSubscriberRequest: (state) => {
      state.deleteLoading = true;
      state.deleteError = null;
    },
    deleteSubscriberSuccess: (state, action) => {
      state.deleteLoading = false;
      state.deleteError = null;

      const { subscriberEmail } = action.payload;

      state.subscribers = state.subscribers.filter(
        (sub) => sub.emailAddress !== subscriberEmail
      );

      // Remove from current domain subscribers (support both formats)
      if (Array.isArray(state.currentDomainSubscribers)) {
        state.currentDomainSubscribers = state.currentDomainSubscribers.filter(
          (sub) => sub.emailAddress !== subscriberEmail
        );
      } else if (state.currentDomainSubscribers && Array.isArray(state.currentDomainSubscribers.subscribers)) {
        state.currentDomainSubscribers.subscribers = state.currentDomainSubscribers.subscribers.filter(
          (sub) => sub.emailAddress !== subscriberEmail
        );
        if (state.currentDomainSubscribers.totalSubscribers) {
          state.currentDomainSubscribers.totalSubscribers -= 1;
        }
      }

      state.message = "Subscriber deleted successfully";
    },
    deleteSubscriberFail: (state, action) => {
      state.deleteLoading = false;
      state.deleteError = action.payload;
    },

    // Bulk Delete Subscribers Actions
    bulkDeleteRequest: (state) => {
      state.bulkDeleteLoading = true;
      state.bulkDeleteError = null;
    },
    bulkDeleteSuccess: (state, action) => {
      state.bulkDeleteLoading = false;
      state.bulkDeleteError = null;

      const { subscriberEmails } = action.payload;

      state.subscribers = state.subscribers.filter(
        (sub) => !subscriberEmails.includes(sub.emailAddress)
      );

      // Remove from current domain subscribers (support both formats)
      if (Array.isArray(state.currentDomainSubscribers)) {
        state.currentDomainSubscribers = state.currentDomainSubscribers.filter(
          (sub) => !subscriberEmails.includes(sub.emailAddress)
        );
      } else if (state.currentDomainSubscribers && Array.isArray(state.currentDomainSubscribers.subscribers)) {
        const originalCount = state.currentDomainSubscribers.subscribers.length;
        state.currentDomainSubscribers.subscribers = state.currentDomainSubscribers.subscribers.filter(
          (sub) => !subscriberEmails.includes(sub.emailAddress)
        );
        if (state.currentDomainSubscribers.totalSubscribers) {
          const deletedCount = originalCount - state.currentDomainSubscribers.subscribers.length;
          state.currentDomainSubscribers.totalSubscribers -= deletedCount;
        }
      }

      state.message = `Successfully deleted ${subscriberEmails.length} subscribers`;
    },
    bulkDeleteFail: (state, action) => {
      state.bulkDeleteLoading = false;
      state.bulkDeleteError = action.payload;
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
    clearDomainsError: (state) => {
      state.domainsError = null;
    },
    clearDomainSubscribersError: (state) => {
      state.domainSubscribersError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearBulkDeleteError: (state) => {
      state.bulkDeleteError = null;
    },

    // Reset current domain subscribers
    resetCurrentDomainSubscribers: (state) => {
      state.currentDomainSubscribers = [];
      state.currentViewedDomain = null;
      state.domainSubscribersError = null;
    },
  },
});

export const {
  addSubscriberRequest,
  addSubscriberSuccess,
  addSubscriberFail,
  addSubscriberOptimistic,
  removeOptimisticSubscriber,
  bulkUploadRequest,
  bulkUploadSuccess,
  bulkUploadFail,
  getAllDomainsRequest,
  getAllDomainsSuccess,
  getAllDomainsFail,
  getSubscribersByDomainRequest,
  getSubscribersByDomainSuccess,
  getSubscribersByDomainFail,
  setCurrentViewedDomain,
  updateSubscriberRequest,
  updateSubscriberSuccess,
  updateSubscriberFail,
  deleteSubscriberRequest,
  deleteSubscriberSuccess,
  deleteSubscriberFail,
  bulkDeleteRequest,
  bulkDeleteSuccess,
  bulkDeleteFail,
  clearSubscriberError,
  clearSubscriberMessage,
  clearBulkUploadError,
  clearDomainsError,
  clearDomainSubscribersError,
  clearUpdateError,
  clearDeleteError,
  clearBulkDeleteError,
  resetCurrentDomainSubscribers,
} = subscriberSlice.actions;

export default subscriberSlice.reducer;