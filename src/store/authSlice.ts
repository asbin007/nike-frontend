import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "./store";
import { API, APIS } from "../globals/http";
import { Status } from "../globals/types/types";
// import  {API}  from "../http/index";

interface IResetPassword {
  newPassword: string;
  confirmPassword: string;
  email: string;
  otp: string;
}
interface ILoginUser {
  email: string;
  password: string;
}

export interface IUser {
  id: string | null;
  username: string | null;
  email: string | null;
  password: string | null;
  token: string | null;
}
export interface IAuthState {
  user: IUser;
  status: Status;
}
const initialState: IAuthState = {
  user: {
    id: null,
    username: null,
    email: null,
    password: null,
    token: null,
  },
  status: Status.LOADING,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state: IAuthState, action: PayloadAction<IUser>) {
      state.user = action.payload;
    },
    setStatus(state: IAuthState, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
    setToken(state: IAuthState, action: PayloadAction<string>) {
      state.user.token = action.payload;
    },
    logout(state: IAuthState) {
      state.user = {
        id: null,
        username: null,
        email: null,
        password: null,
        token: null,
      };
      state.status = Status.LOADING;

      localStorage.removeItem("tokenauth");
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, setStatus, setToken, logout } = authSlice.actions;
export default authSlice.reducer;

export function registerUser(data: { username: string; email: string; password: string }) {
  return async function registerUserThunk(dispatch: AppDispatch) {
    try {
      const res = await API.post("/auth/register", data);
      console.log(res);
      if (res.status === 201) {
        // Store registration data for OTP verification
        localStorage.setItem("pendingRegistration", JSON.stringify({
          userId: res.data.userId,
          email: res.data.email,
          username: data.username
        }));
        dispatch(setStatus(Status.SUCCESS));
      } else dispatch(setStatus(Status.ERROR));
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function verifyOtp(data: { email: string; otp: string }) {
  return async function verifyOtpThunk(dispatch: AppDispatch) {
    try {
      const res = await API.post("/auth/verify-otp", data);
      if (res.status === 200) {
        // Clear pending registration
        localStorage.removeItem("pendingRegistration");
        dispatch(setStatus(Status.SUCCESS));
      } else dispatch(setStatus(Status.ERROR));
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function resendOtp(data: { email: string }) {
  return async function resendOtpThunk(dispatch: AppDispatch) {
    try {
      const res = await API.post("/auth/resend-otp", data);
      if (res.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
      } else dispatch(setStatus(Status.ERROR));
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function loginUser(data: ILoginUser) {
  return async function loginUserThunk(dispatch: AppDispatch) {
    try {
      const response = await API.post("/auth/login", data);
      if (response.status === 201) {
        const { id, username, email } = response.data;
        dispatch(setStatus(Status.SUCCESS));
        console.log("res", response.data);
        const token =response.data.token || response.data.session?.access_token;

        if (token) {
          localStorage.setItem("tokenauth", token);
          const userData: IUser = {
            id,
            username,
            email,
            token,
            password: null,
          };
          dispatch(setUser({ id, username, email, password: null, token }));
             localStorage.setItem("user", JSON.stringify(userData));
          dispatch(setUser(userData));
          dispatch(setStatus(Status.SUCCESS));
        } else {
          dispatch(setStatus(Status.ERROR));
        }
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function forgotPassword(data: { email: string }) {
  return async function forgotPasswordThunk(dispatch: AppDispatch) {
    try {
      dispatch(setStatus(Status.LOADING));
      const res = await API.post("/auth/forgot-password", data);
      console.log(res);
      if (res.status === 201 || res.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
      // You can throw the error to be handled by the component
      throw error;
    }
  };
}

export function resetPassword(data: IResetPassword) {
  return async function resetPasswordThunk(dispatch: AppDispatch) {
    try {
      dispatch(setStatus(Status.LOADING));
      const res = await API.post("/auth/reset-password", data);
      console.log(res);
      if (res.status === 201 || res.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
      throw error;
    }
  };
}
export function adminLogin(data: { email: string; password: string; role: string }) {
  return async function adminLoginThunk(dispatch: AppDispatch) {
    try {
      const response = await API.post("/auth/logins", data);
      if (response.status === 201) {
        const { token } = response.data;
        if (token) {
          localStorage.setItem("tokenauth", token);
          localStorage.setItem("adminToken", token);
          dispatch(setStatus(Status.SUCCESS));
        } else {
          dispatch(setStatus(Status.ERROR));
        }
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function fetchUsers() {
  return async function fetchUsersThunk() {
    try {
      const response = await APIS.get("/auth/users");
      if (response.status === 201) {
        return response.data.data;
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export function deleteUser(id: string) {
  return async function deleteUserThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.delete(`/auth/users/${id}`);
      if (response.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function loadUserFromStorage() {
  return function loadUserThunk(dispatch: AppDispatch) {
    const token = localStorage.getItem("tokenauth");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch(setUser({ ...parsedUser, token }));
        dispatch(setStatus(Status.SUCCESS));
      } catch  {
        console.error("Failed to parse user from storage");
        dispatch(setStatus(Status.ERROR));
      }
    }
  };
}
