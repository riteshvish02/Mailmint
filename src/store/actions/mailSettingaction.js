import axios from "../../utils/Axios";
import {
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
  deleteMailSettingFail
} from "../reducers/mailSettingReducer";

// Add Mail Setting Action
export const addMailSetting = (mailSettingData, onSuccess, onError) => async (dispatch) => {
 
  dispatch(isMailSettingRequest());
  try {
    const { data } = await axios.post("/api/v1/mailsetting", mailSettingData);

    if (data?.SuccessResponse?.success) {
      dispatch(isMailSettingSuccess(data.SuccessResponse.data));
      dispatch(fetchMailSettings());
      onSuccess?.(data.SuccessResponse.data);
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to Add Mail Setting";
      dispatch(isMailSettingFail(errorMessage));
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.ErrorResponse?.message ||
                         error?.response?.data?.message ||
                         "Something went wrong";
    dispatch(isMailSettingFail(errorMessage));
    onError?.(errorMessage);
  }
};

// Fetch All Mail Settings
export const fetchMailSettings = () => async (dispatch) => {
  dispatch(fetchMailSettingsRequest());
  try {
    const { data } = await axios.get("/api/v1/mailsetting");
    
    if (data?.SuccessResponse) {
      dispatch(fetchMailSettingsSuccess(data.SuccessResponse.data));
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to fetch mail settings";
      dispatch(fetchMailSettingsFail(errorMessage));
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.ErrorResponse?.message ||
                         error?.response?.data?.message ||
                         "Failed to fetch mail settings";
    dispatch(fetchMailSettingsFail(errorMessage));
  }
};

// Update Mail Setting
export const updateMailSetting = (id, mailSettingData, onSuccess, onError) => async (dispatch) => {
  dispatch(updateMailSettingRequest());
  try {
    const { data } = await axios.put(`/api/v1/mailsetting/${id}`, mailSettingData);

    if (data?.SuccessResponse?.success) {
      dispatch(updateMailSettingSuccess(data.SuccessResponse.data));
      dispatch(fetchMailSettings());
      onSuccess?.(data.SuccessResponse.data);
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to update mail setting";
      dispatch(updateMailSettingFail(errorMessage));
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.ErrorResponse?.message ||
                         error?.response?.data?.message ||
                         "Something went wrong";
    dispatch(updateMailSettingFail(errorMessage));
    onError?.(errorMessage);
  }
};

// Delete Mail Setting
export const deleteMailSetting = (id, onSuccess, onError) => async (dispatch) => {
  dispatch(deleteMailSettingRequest());
  try {
    const { data } = await axios.delete(`/api/v1/mailsetting/${id}`);

    if (data?.SuccessResponse?.success) {
      dispatch(deleteMailSettingSuccess(data.SuccessResponse.data));
      dispatch(fetchMailSettings());
      onSuccess?.(data.SuccessResponse.data);
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to delete mail setting";
      dispatch(deleteMailSettingFail(errorMessage));
      onError?.(errorMessage);
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.ErrorResponse?.message ||
                         error?.response?.data?.message ||
                         "Something went wrong";
    dispatch(deleteMailSettingFail(errorMessage));
    onError?.(errorMessage);
  }
};
