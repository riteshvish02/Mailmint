 import axios from "../../utils/Axios";

import { 
  isLoginRequest, isUserFail, 
  isRequest, 
  isUserSuccess,
  logoutUser,
  clearUser,
  setUserMessage
} from "../reducers/usersReducer";
export {clearUserError,clearUserMessage} from '../reducers/usersReducer'

export const userLogin = (info,navigate,toast) => async (dispatch) => {
  dispatch(isLoginRequest());
  try {
    const { data } = await axios.post("/api/v1/user/login", info);
    if (data?.SuccessResponse?.success) {
      const token = data?.SuccessResponse?.data?.accessToken;
      localStorage.setItem('userToken', token);
      dispatch(isUserSuccess(data.SuccessResponse.data.user));
      toast.success("LoggedIn successfully");
      navigate('/'); 
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Login failed";
      dispatch(isUserFail(errorMessage));
      navigate('/auth');
    }
  } catch (error) {
    const errorMessage = error?.ErrorResponse?.message || error.response.data.ErrorResponse.message || error.message || "Login failed";
    dispatch(isUserFail(errorMessage));
    navigate('/auth');
  }
};

export const userRegister = (info,navigate,toast) => async (dispatch) => {
  dispatch(isRequest());
  try {
    const { data } = await axios.post("/api/v1/user/register", info);
    
    if (data?.SuccessResponse?.success) {
      const token = data?.SuccessResponse?.data?.accessToken;
      localStorage.setItem('userToken', token);
      dispatch(isUserSuccess(data.SuccessResponse.data.user));
      toast.success("SignedUp successfully");
      navigate('/'); 
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Registration failed";
      dispatch(isUserFail(errorMessage));
      navigate('/register');
    }
  } catch (error) {
    console.log("error",error);
    const errorMessage = error?.ErrorResponse?.message || error.response.data.ErrorResponse.message || error.message || "Registration failed";
    dispatch(isUserFail(errorMessage));
    navigate('/register');
  }
};


export const userInfoUpdate = (info,id,navigate,toast) => async (dispatch) => {
  dispatch(isRequest());
  try {
    const { data } = await axios.post(`/api/v1/user/update-user-info/${id}`, info);
    if (data?.SuccessResponse?.success) {
      await localStorage.setItem('userData',JSON.stringify(data.SuccessResponse.data))
      dispatch(isUserSuccess(data.SuccessResponse.data));
      toast.success("Updated successfully");
      navigate('/'); 
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Updation failed";
      dispatch(isUserFail(errorMessage));
      navigate('/auth');
    }
  } catch (error) {
    const errorMessage = error?.ErrorResponse?.message || error.response.data.ErrorResponse.message || error.message || "Updation failed";
    dispatch(isUserFail(errorMessage));
    navigate('/auth');
  }
};
export const fetchUserProfile = () => async (dispatch) => {
  
  dispatch(isLoginRequest());
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      dispatch(isUserFail("Please login to continue"));
      return;
    }
    const { data } = await axios.get("/api/v1/user/user", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (data?.SuccessResponse?.success) {
      
      dispatch(isUserSuccess(data.SuccessResponse.data));
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Internal server Error";
    
      dispatch(isUserFail(errorMessage));
    }
  } catch (error) {
    const errorMessage =
  error?.ErrorResponse?.message ||
  error?.response?.data?.ErrorResponse?.message ||
  error.message ||
  "Login failed";

    dispatch(isUserFail(errorMessage));
  }
};
export const googleLogin = (credential, navigate, toast) => async (dispatch) => {
  dispatch(isLoginRequest());
  try {
    const { data } = await axios.post("/api/v1/user/google-login", { credential });
    
    if (data?.SuccessResponse?.success) {
      const token = data?.SuccessResponse?.data?.accessToken;
      localStorage.setItem('userToken', token);
      dispatch(isUserSuccess(data.SuccessResponse.data.user));
      toast.success("Google login successful");
      navigate('/');
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Google login failed";
      dispatch(isUserFail(errorMessage));
    }
  } catch (error) {
    const errorMessage = error?.ErrorResponse?.message || error.response.data.ErrorResponse.message || error.message || "Google login failed";
    dispatch(isUserFail(errorMessage));
  }
};

export const userUpdate = (info,id,toast) => async (dispatch) => {
  dispatch(isRequest());
  try {
    const { data } = await axios.post(`/api/v1/user/update-user/${id}`, info,{'Content-Type': 'multipart/form-data'});

    if (data?.SuccessResponse?.success) {
      dispatch(isUserSuccess(data.SuccessResponse.data));
      toast.success("Actualizado exitosamente");
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Error al actualizar";
      dispatch(isUserFail(errorMessage));
    }
  } catch (error) {
    const errorMessage =
      error?.ErrorResponse?.message ||
      error.response.data.ErrorResponse.message ||
      error.message ||
      "Error al actualizar";
    dispatch(isUserFail(errorMessage));
  }
};

export const userResetPass = (info,id,toast,navigate) => async (dispatch) => {
  dispatch(isRequest());
  try {
    const { data } = await axios.post(`/api/v1/user/reset-password/${id}`, info);

    if (data?.SuccessResponse?.success) {
      // await dispatch(fetchUserProfile(navigate));
      // await dispatch(userLogout());
      toast.success("Password updated successfully");

    } else {
      const errorMessage = data?.ErrorResponse?.message;
      dispatch(isUserFail(errorMessage));

    }
  } catch (error) {
    const errorMessage =
      error?.ErrorResponse?.message ||
      error.response.data.ErrorResponse.message ||
      error.message ||
      "Password update failed";
      toast.error(errorMessage);
    // dispatch(isUserFail(errorMessage));
  }
};

export const deleteUserProfile = (id,toast) => async (dispatch) => {
  
  dispatch(isRequest());
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      dispatch(isUserFail("Please login to continue"));
      return;
    }
    const { data } = await axios.get(`/api/v1/user/delete-user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (data?.SuccessResponse?.success) {
      
      dispatch(userLogout())
      dispatch(clearUser());
      toast.success("user deleted successfully");
    } else {
      const errorMessage = data?.ErrorResponse?.message || "Internal server Error";
      dispatch(isUserFail(errorMessage));
      
    }
  } catch (error) {
    const errorMessage = error?.ErrorResponse?.message || error.response.data.ErrorResponse.message || error.message ;
    await dispatch(isUserFail(errorMessage));
    toast.error(errorMessage);
  }
};


export const userLogout = () => (dispatch) => {
  localStorage.removeItem('userToken');
  dispatch(logoutUser());
};