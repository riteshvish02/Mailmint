
import axios from "../../utils/Axios";
import {
  isDomainRequest,
  isDomainSuccess,
  isDomainFail,
  fetchDomainsRequest,
  fetchDomainsSuccess,
  fetchDomainsFail,
  fetchSingleDomainSuccess
} from "../reducers/domainReducer";
import { 
  isUserFail, 
} from "../reducers/usersReducer";
// Add Domain Action
  export const addDomain = (domainData, onSuccess, onError) => async (dispatch) => {
  
  dispatch(isDomainRequest());
  
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      dispatch(isUserFail("Please login to continue"));
      return;
    }
    const { data } = await axios.post("/api/v1/domain/add-domain", domainData,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    
    // Check for the actual response format from your backend
    if (data?.SuccessResponse.success) {
      
      dispatch(isDomainSuccess(data.SuccessResponse.data));
      dispatch(fetchDomains()) 
      onSuccess?.(data.SuccessResponse.data);  
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to Add"
      dispatch(isDomainFail(errorMessage));
      onError?.(errorMessage);  
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    
    dispatch(isDomainFail(errorMessage));
    onError?.(errorMessage); 
  }
};
// Fetch All Domains Action
export const fetchDomains = () => async (dispatch) => {
  dispatch(fetchDomainsRequest());
  try {
    const { data } = await axios.get("/api/v1/domain/get-all-domains");

    if (data?.SuccessResponse) {
      dispatch(fetchDomainsSuccess(data.SuccessResponse.data));
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to fetch domains";
      dispatch(fetchDomainsFail(errorMessage));
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      "Failed to fetch domains";
    dispatch(fetchDomainsFail(errorMessage));
  }
};

export const getSingleDomain = (id) => async (dispatch) => {
  dispatch(isDomainRequest());
  try {
    const { data } = await axios.get(`/api/v1/domain/${id}`);
    console.log(data);
    
    if (data?.SuccessResponse) {
      dispatch(fetchSingleDomainSuccess(data.SuccessResponse.data));
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to fetch domain";
      dispatch(fetchDomainsFail(errorMessage));
    }
  } catch (error) {
    console.error("Single domain fetch error:", error);
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch domain";
    dispatch(fetchDomainsFail(errorMessage));
  }
};
// Update Domain Action
export const updateDomain = (domainData,id,toast) => async (dispatch) => {
 dispatch(isDomainRequest());
  try {
    const { data } = await axios.post(`/api/v1/domain/update/${id}`, domainData);
    console.log(data);
    
    if (data?.SuccessResponse) {
      dispatch(fetchSingleDomainSuccess(data.SuccessResponse.data));
      toast.success("Domain updated successfully");
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to fetch domain";
      dispatch(fetchDomainsFail(errorMessage));
    }
  } catch (error) {
    console.error("Single domain fetch error:", error);
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch domain";
    dispatch(fetchDomainsFail(errorMessage));
    toast.error(errorMessage);
  }
};

export const PublishMail = (id,toast) => async (dispatch) => {
 dispatch(isDomainRequest());
  try {
    const { data } = await axios.post(`/api/v1/publish/${id}`);
    console.log(data);

    if (data?.SuccessResponse) {
      toast.success("Email published successfully");
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to publish email";
      dispatch(fetchDomainsFail(errorMessage));
    }
  } catch (error) {
    console.error("Single domain fetch error:", error);
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to publish email";
    dispatch(fetchDomainsFail(errorMessage));
    toast.error(errorMessage);
  }
};
// Reset Domain Email Status Action
export const resetDomainEmailStatus = (id, toast) => async (dispatch) => {
  dispatch(isDomainRequest());
  try {
    const { data } = await axios.post(`/api/v1/publish/${id}/reset`);
    if (data?.SuccessResponse) {
      toast && toast.success("Domain email status reset successfully");
      dispatch(fetchDomains());
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Failed to reset domain email status";
      dispatch(fetchDomainsFail(errorMessage));
      toast && toast.error(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.ErrorResponse?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to reset domain email status";
    dispatch(fetchDomainsFail(errorMessage));
    toast && toast.error(errorMessage);
  }
};

// export const userUpdate = (info,id,navigate,toast) => async (dispatch) => {
//   dispatch(isRequest());
//   try {
//     const { data } = await axios.post(`/api/v1/user/update-user/${id}`, info);

//     if (data?.SuccessResponse?.success) {
//       const token = data?.SuccessResponse?.data?.accessToken;
//       localStorage.setItem('userToken', token);
//       dispatch(isUserSuccess(data.SuccessResponse.data.user));
//       toast.success("Updated successfully");
//       dispatch(userLogout());
//       navigate('/'); 
//     } else {
//       const errorMessage = data?.ErrorResponse?.message || "Updation failed";
//       dispatch(isUserFail(errorMessage));
//       navigate('/update');
//     }
//   } catch (error) {
//     const errorMessage = error?.ErrorResponse?.message || error.response.data.ErrorResponse.message || error.message || "Updation failed";
//     dispatch(isUserFail(errorMessage));
//   }
// };