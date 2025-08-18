  import axios from "../../utils/Axios";
import {
  // Create Template Actions
  isTemplateRequest,
  isTemplateSuccess,
  isTemplateFail,
  // Fetch Templates Actions
  fetchTemplatesRequest,
  fetchTemplatesSuccess,
  fetchTemplatesFail,
  // Get Single Template Actions
  getSingleTemplateRequest,
  getSingleTemplateSuccess,
  getSingleTemplateFail,
  // Update Template Actions
  updateTemplateRequest,
  updateTemplateSuccess,
  updateTemplateFail,
  // Delete Template Actions
  deleteTemplateRequest,
  deleteTemplateSuccess,
  deleteTemplateFail
} from "../reducers/templateReducer";

// Create a new template
export const createTemplate = (templateData) => async (dispatch) => {
  dispatch(isTemplateRequest());
  try {
    const { data } = await axios.post("/api/v1/template/create", templateData);
    if (data?.SuccessResponse) {
      dispatch(isTemplateSuccess(data.SuccessResponse.data));
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to create template";
      dispatch(isTemplateFail(errorMessage));
    }
  } catch (error) {
    console.error("Template creation error:", error);
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create template";
    dispatch(isTemplateFail(errorMessage));
  }
};

// Get all templates
export const listTemplates = () => async (dispatch) => {
  dispatch(fetchTemplatesRequest());
  try {
    const { data } = await axios.get("/api/v1/template/get-all-templates");
    console.log(data);
    
    if (data?.SuccessResponse) {
      dispatch(fetchTemplatesSuccess(data.SuccessResponse.data));
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to fetch templates";
      dispatch(fetchTemplatesFail(errorMessage));
    }
  } catch (error) {
    console.error("Template fetch error:", error);
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch templates";
    dispatch(fetchTemplatesFail(errorMessage));
  }
};

// Get single template by ID
export const getSingleTemplate = (id) => async (dispatch) => {
  dispatch(getSingleTemplateRequest());
  try {
    const { data } = await axios.get(`/api/v1/template/${id}`);

    if (data?.SuccessResponse) {
      dispatch(getSingleTemplateSuccess(data.SuccessResponse.data));
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to fetch template";
      dispatch(getSingleTemplateFail(errorMessage));
    }
  } catch (error) {
    console.error("Single template fetch error:", error);
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch template";
    dispatch(getSingleTemplateFail(errorMessage));
  }
};

// Update template by ID
export const updateTemplate = (id, templateData) => async (dispatch) => {
  dispatch(updateTemplateRequest());
  try {
    const { data } = await axios.put(`/api/v1/template/update/${id}`, templateData);

    if (data?.SuccessResponse) {
      dispatch(updateTemplateSuccess(data.SuccessResponse.data));
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to update template";
      dispatch(updateTemplateFail(errorMessage));
    }
  } catch (error) {
    console.error("Template update error:", error);
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update template";
    dispatch(updateTemplateFail(errorMessage));
  }
};

// Delete template by ID
export const deleteTemplate = (id) => async (dispatch) => {
  dispatch(deleteTemplateRequest());
  try {
    const { data } = await axios.delete(`/api/v1/template/delete/${id}`);

    if (data?.SuccessResponse) {
      dispatch(deleteTemplateSuccess(id)); // Pass the ID to remove from state
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to delete template";
      dispatch(deleteTemplateFail(errorMessage));
    }
  } catch (error) {
    console.error("Template deletion error:", error);
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete template";
    dispatch(deleteTemplateFail(errorMessage));
  }
};