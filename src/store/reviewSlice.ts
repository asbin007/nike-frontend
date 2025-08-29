import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../globals/types/types";
import { API, APIS } from "../globals/http";
import type { AppDispatch } from "./store";

interface user {
  id: string | null;
  username: string | null;
}
 interface IData {
  id: string | null;
  productId: string | null;
  userId: string | null;
  comment: string | null;
  rating: number | null;
  createdAt: string | null;
  User: user;
}
export interface IReview {
  review: IData[];
  status: Status;
}

const initialState: IReview = {
  review: [],
  status: Status.LOADING,
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setReview(state: IReview, action: PayloadAction<IData[]>) {
      state.review = action.payload;
    },
    setStatus(state: IReview, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
    // Add these new reducers
    updateReview(state: IReview, action: PayloadAction<IData>) {
      state.review = state.review.map((review) =>
        review.id === action.payload.id ? action.payload : review
      );
    },
    deleteReview(state: IReview, action: PayloadAction<string>) {
      state.review = state.review.filter(
        (review) => review.id !== action.payload
      );
    },
  },
});

export const { setReview, setStatus, updateReview, deleteReview } =
  reviewSlice.actions;
export default reviewSlice.reducer;

export function fetchReview(productId: string) {
  return async function fetchReviewThunk(dispatch: AppDispatch) {
    dispatch(setStatus(Status.LOADING)); // Set loading state first

    try {
      const res = await API.get(`/review/${productId}`);

      if (res.status === 200) {
         // ✅ Ensure review array is correctly extracted
        const reviewArray = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.reviews || [];
        dispatch(setReview(reviewArray)); 
        dispatch(setStatus(Status.SUCCESS));
        console.log(reviewArray,"array")
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function createReview(data: IData) {
  return async function createReviewThunk(dispatch: AppDispatch) {
    try {
      const res = await APIS.post("/review", data);

      if (res.status === 200) {
        // dispatch(setReview(res.data.data));
        dispatch(setStatus(Status.SUCCESS));
        console.log(res.data.data,"data")
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.error("Create review error:", error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

// Add function to fetch all reviews for real-time display
export function fetchAllReviews() {
  return async function fetchAllReviewsThunk(dispatch: AppDispatch) {
    dispatch(setStatus(Status.LOADING));

    try {
      const res = await API.get(`/review`);

      if (res.status === 200) {
        const reviewArray = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.reviews || [];
        dispatch(setReview(reviewArray));
        dispatch(setStatus(Status.SUCCESS));
        console.log("All reviews fetched:", reviewArray);
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.error("Fetch all reviews error:", error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

// Add function to fetch recent reviews for hero page
export function fetchRecentReviews(limit: number = 3) {
  return async function fetchRecentReviewsThunk(dispatch: AppDispatch) {
    dispatch(setStatus(Status.LOADING));

    try {
      const res = await API.get(`/review/recent?limit=${limit}`);

      if (res.status === 200) {
        const reviewArray = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.reviews || [];
        dispatch(setReview(reviewArray));
        dispatch(setStatus(Status.SUCCESS));
        console.log("Recent reviews:", reviewArray);
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.error("Fetch recent reviews error:", error);
      // If the endpoint doesn't exist, we'll use a fallback approach
      dispatch(setStatus(Status.ERROR));
    }
  };
}

// Add these new thunks
export function editReview(
  reviewId: string,
  updatedData: { rating?: number; comment?: string }
) {
  return async function editReviewThunk(dispatch: AppDispatch) {
    dispatch(setStatus(Status.LOADING));
    try {
      const res = await APIS.patch(`/review/${reviewId}`, updatedData);
      if (res.status === 200) {
        dispatch(updateReview(res.data.data));
        dispatch(setStatus(Status.SUCCESS));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.error("Edit review error:", error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function removeReview(reviewId: string) {
  return async function removeReviewThunk(dispatch: AppDispatch) {
    dispatch(setStatus(Status.LOADING));
    try {
      const res = await APIS.delete(`/review/${reviewId}`);
      if (res.status === 200) {
        dispatch(deleteReview(reviewId));
        dispatch(setStatus(Status.SUCCESS));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.error("Delete review error:", error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}
