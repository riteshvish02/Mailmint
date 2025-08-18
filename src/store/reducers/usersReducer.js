import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
  isAuthenticated: false,
  error: null,
  message: null,
};

export const userSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    isLoginRequest: (state) => {
      state.loading = true;
      state.isAuthenticated = false;
    },
    isUserSuccess: (state, action) => {
        state.loading = false;  
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
    },
    isUserFail: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    setUserMessage:(state,action)=>{
      state.message = action.payload;
    },
    isRequest: (state, action) => {
        state.loading = true;
    },
   
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state,action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.message = action.payload
    },
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserMessage: (state) => {
      state.message = null;
   }
  },
});

export const {
  isLoginRequest,
  setUserMessage,
  isUserFail,
  isRequest,
  logoutUser,
  isUserSuccess,
  clearUserError,
  clearUserMessage,
  clearUser
 
} = userSlice.actions;

export default userSlice.reducer;
