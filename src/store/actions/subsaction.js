import axios from "../../utils/Axios";
import {
  addSubscriberRequest,
  addSubscriberSuccess,
  addSubscriberFail,
  bulkUploadRequest,
  bulkUploadSuccess,
  bulkUploadFail
} from "../reducers/subsReducer";
import { 
  isUserFail, 
} from "../reducers/usersReducer";

// Add Single Subscriber Action
export const addSubscriber = (subscriberData, onSuccess, onError) => async (dispatch) => {

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

// Bulk Upload Subscribers Action
export const bulkUploadSubscribers = (formData, onSuccess, onError) => async (dispatch) => {
    
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