import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  templates: [],
  template: null, // Changed from currentTemplate to template for consistency
  loading: false,
  error: null,
  message: null,
  // Fetch specific states
  fetchLoading: false,
  fetchError: null,
  // Single template specific states
  singleLoading: false,
  singleError: null,
  // Update specific states
  updateLoading: false,
  updateError: null,
  updateMessage: null, // Added separate update message
  // Delete specific states
  deleteLoading: false,
  deleteError: null,
};

export const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    // Create Template Actions
    isTemplateRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    isTemplateSuccess: (state, action) => {
      state.loading = false;
      state.templates.push(action.payload);
      state.error = null;
      state.message = "Template created successfully";
    },
    isTemplateFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    
    // Fetch Templates Actions
    fetchTemplatesRequest: (state) => {
      state.fetchLoading = true;
      state.fetchError = null;
    },
    fetchTemplatesSuccess: (state, action) => {
      state.fetchLoading = false;
      state.templates = action.payload || [];
      state.fetchError = null;
    },
    fetchTemplatesFail: (state, action) => {
      state.fetchLoading = false;
      state.fetchError = action.payload;
    },
    
    // Get Single Template Actions
    getSingleTemplateRequest: (state) => {
      state.singleLoading = true;
      state.singleError = null;
      state.template = null; // Clear previous template
    },
    getSingleTemplateSuccess: (state, action) => {
      state.singleLoading = false;
      state.template = action.payload;
      state.singleError = null;
    },
    getSingleTemplateFail: (state, action) => {
      state.singleLoading = false;
      state.singleError = action.payload;
      state.template = null;
    },
    
    // Update Template Actions
    updateTemplateRequest: (state) => {
      state.updateLoading = true;
      state.updateError = null;
      state.updateMessage = null;
    },
    updateTemplateSuccess: (state, action) => {
      state.updateLoading = false;
      state.template = action.payload;
      // Update the template in the templates array
      const index = state.templates.findIndex(template => template._id === action.payload._id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
      state.updateError = null;
      state.updateMessage = "Template updated successfully";
    },
    updateTemplateFail: (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
      state.updateMessage = null;
    },
    
    // Delete Template Actions
    deleteTemplateRequest: (state) => {
      state.deleteLoading = true;
      state.deleteError = null;
    },
    deleteTemplateSuccess: (state, action) => {
      state.deleteLoading = false;
      // Remove the template from the templates array
      state.templates = state.templates.filter(template => template._id !== action.payload);
      state.deleteError = null;
      state.message = "Template deleted successfully";
    },
    deleteTemplateFail: (state, action) => {
      state.deleteLoading = false;
      state.deleteError = action.payload;
    },
    
    // Clear Actions
    clearTemplateError: (state) => {
      state.error = null;
      state.singleError = null;
      state.updateError = null;
      state.deleteError = null;
      state.fetchError = null;
    },
    clearTemplateMessage: (state) => {
      state.message = null;
      state.updateMessage = null;
    },
    clearFetchError: (state) => {
      state.fetchError = null;
    },
    clearSingleError: (state) => {
      state.singleError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearCurrentTemplate: (state) => {
      state.template = null;
    },
    clearAllErrors: (state) => {
      state.error = null;
      state.fetchError = null;
      state.singleError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    // Reset entire state
    resetTemplateState: (state) => {
      return initialState;
    },
  },
});

export const {
  isTemplateRequest,
  isTemplateSuccess,
  isTemplateFail,
  fetchTemplatesRequest,
  fetchTemplatesSuccess,
  fetchTemplatesFail,
  getSingleTemplateRequest,
  getSingleTemplateSuccess,
  getSingleTemplateFail,
  updateTemplateRequest,
  updateTemplateSuccess,
  updateTemplateFail,
  deleteTemplateRequest,
  deleteTemplateSuccess,
  deleteTemplateFail,
  clearTemplateError,
  clearTemplateMessage,
  clearFetchError,
  clearSingleError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentTemplate,
  clearAllErrors,
  resetTemplateState
} = templateSlice.actions;

export default templateSlice.reducer;