 import axios from "../../utils/Axios";
import {
  addSubscriberRequest,
  addSubscriberSuccess,
  addSubscriberFail,
  bulkUploadRequest,
  bulkUploadSuccess,
  bulkUploadFail,
  getSubscribersByDomainRequest,
  getSubscribersByDomainSuccess,
  getSubscribersByDomainFail,
  updateSubscriberRequest,
  updateSubscriberSuccess,
  updateSubscriberFail,
  deleteSubscriberRequest,
  deleteSubscriberSuccess,
  deleteSubscriberFail,
  bulkDeleteRequest,
  bulkDeleteSuccess,
  bulkDeleteFail
} from "../reducers/subsReducer";
import { 
  isUserFail, 
} from "../reducers/usersReducer";

// Add Single Subscriber Action - Updated with optimistic update and refetch
export const addSubscriber = (subscriberData, onSuccess, onError, shouldRefetchDomain = null) => async (dispatch) => {
  dispatch(addSubscriberRequest());
  
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      dispatch(isUserFail("Please login to continue"));
      return;
    }

    const { data } = await axios.post("/api/v1/subscribers/add", subscriberData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (data?.SuccessResponse?.success) {
      dispatch(addSubscriberSuccess(data.SuccessResponse.data));
      
      // If shouldRefetchDomain is provided, refetch the subscriber list for that domain
      if (shouldRefetchDomain) {
        dispatch(getSubscribersByDomain(shouldRefetchDomain));
      }
      
      onSuccess?.(data.SuccessResponse.data);
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to add subscriber";
      dispatch(addSubscriberFail(errorMessage));
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    
    dispatch(addSubscriberFail(errorMessage));
    onError?.(errorMessage);
  }
};

// Bulk Upload Subscribers Action - Updated with refetch capability
export const bulkUploadSubscribers = (formData, onSuccess, onError, shouldRefetchDomain = null) => async (dispatch) => {
  dispatch(bulkUploadRequest());
  
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      dispatch(isUserFail("Please login to continue"));
      return;
    }

    const { data } = await axios.post("/api/v1/subscribers/bulk-upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (data?.SuccessResponse?.success) {
      dispatch(bulkUploadSuccess(data.SuccessResponse.data));
      
      // If shouldRefetchDomain is provided, refetch the subscriber list for that domain
      if (shouldRefetchDomain) {
        dispatch(getSubscribersByDomain(shouldRefetchDomain));
      }
      
      onSuccess?.(data.SuccessResponse.data);
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to upload subscribers";
      dispatch(bulkUploadFail(errorMessage));
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    
    dispatch(bulkUploadFail(errorMessage));
    onError?.(errorMessage);
  }
};
// Updated getSubscribersByDomain action to use the correct endpoint
export const getSubscribersByDomain = (domain, onSuccess, onError) => async (dispatch) => {
  dispatch(getSubscribersByDomainRequest());
  
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      dispatch(isUserFail("Please login to continue"));
      return;
    }

    // Updated endpoint to match your router: /domains/:domain/subscribers/all
    const { data } = await axios.get(`/api/v1/subscribers/domains/${domain}/subscribers/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (data?.SuccessResponse?.success) {
      // Add domain info to the response for tracking
      const responseData = {
        ...data.SuccessResponse.data,
        domain: domain
      };
      
      dispatch(getSubscribersByDomainSuccess(responseData));
      onSuccess?.(responseData);
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to fetch subscribers";
      dispatch(getSubscribersByDomainFail(errorMessage));
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    
    dispatch(getSubscribersByDomainFail(errorMessage));
    onError?.(errorMessage);
  }
};

// Update other subscriber actions to use the correct endpoints if needed
export const updateSubscriber = (domain, subscriberData, onSuccess, onError) => async (dispatch) => {
  dispatch(updateSubscriberRequest());
  
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      dispatch(isUserFail("Please login to continue"));
      return;
    }

    // Update endpoint - adjust based on your actual update endpoint
    const { data } = await axios.put(`/api/v1/subscribers/domains/${domain}/update`, subscriberData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (data?.SuccessResponse?.success) {
      dispatch(updateSubscriberSuccess(data.SuccessResponse.data));
      onSuccess?.(data.SuccessResponse.data);
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to update subscriber";
      dispatch(updateSubscriberFail(errorMessage));
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    
    dispatch(updateSubscriberFail(errorMessage));
    onError?.(errorMessage);
  }
};

export const deleteSubscriber = (domain, subscriberEmail, onSuccess, onError) => async (dispatch) => {
  dispatch(deleteSubscriberRequest());
  
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      dispatch(isUserFail("Please login to continue"));
      return;
    }
    // Use query param for email as per backend route
    const { data } = await axios.delete(`/api/v1/subscribers/domains/${domain}/delete?email=${encodeURIComponent(subscriberEmail)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (data?.SuccessResponse?.success) {
      dispatch(deleteSubscriberSuccess({ subscriberEmail }));
      onSuccess?.(data.SuccessResponse.data);
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to delete subscriber";
      dispatch(deleteSubscriberFail(errorMessage));
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    dispatch(deleteSubscriberFail(errorMessage));
    onError?.(errorMessage);
  }
};

export const bulkDeleteSubscribers = (domain, subscriberEmails, onSuccess, onError) => async (dispatch) => {
  dispatch(bulkDeleteRequest());
  
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      dispatch(isUserFail("Please login to continue"));
      return;
    }
    // Use DELETE with data for bulk delete as per backend route
    const { data } = await axios.delete(`/api/v1/subscribers/domains/${domain}/bulk-delete`, {
      data: { emails: subscriberEmails },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (data?.SuccessResponse?.success) {
      dispatch(bulkDeleteSuccess({ subscriberEmails }));
      onSuccess?.(data.SuccessResponse.data);
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to delete subscribers";
      dispatch(bulkDeleteFail(errorMessage));
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    dispatch(bulkDeleteFail(errorMessage));
    onError?.(errorMessage);
  }
};
 