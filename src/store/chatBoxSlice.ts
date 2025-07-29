import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./store";
import {APIS} from '../globals/http/index'
// TYPES
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  read: boolean;
  Sender?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  Receiver?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
}

interface ChatState {
  chatId: string;
  adminId: string;
  loading: boolean;
  error: string | null;
  messages: Message[];
  messageLoading: boolean;
  adminUsers: AdminUser[];
  adminUsersLoading: boolean;
}

const initialState: ChatState = {
  chatId: "",
  adminId: "4c264ede-84b4-4455-adc1-801fc169e95e", // Default adminId
  loading: false,
  error: null,
  messages: [],
  messageLoading: false,
  adminUsers: [],
  adminUsersLoading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatId(state, action: PayloadAction<string>) {
      state.chatId = action.payload;
    },
    setAdminId(state, action: PayloadAction<string>) {
      state.adminId = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    resetMessages(state) {
      state.messages = [];
    },
    setMessageLoading(state, action: PayloadAction<boolean>) {
      state.messageLoading = action.payload;
    },
    setAdminUsers(state, action: PayloadAction<AdminUser[]>) {
      state.adminUsers = action.payload;
    },
    setAdminUsersLoading(state, action: PayloadAction<boolean>) {
      state.adminUsersLoading = action.payload;
    },
  },
});

export const {
  setChatId,
  setAdminId,
  setLoading,
  setError,
  setMessages,
  addMessage,
  resetMessages,
  setMessageLoading,
  setAdminUsers,
  setAdminUsersLoading,
} = chatSlice.actions;

export default chatSlice.reducer;

export const selectChatState = (state: RootState) => state.chat;

// Thunk: Get or create chat
export const getOrCreateChat = (customerId: string, adminId: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const res = await APIS.post("/chats/get-or-create", {
        adminId,
      });
      if (res.status === 200 && res.data.chat) {
        dispatch(setChatId(res.data.chat.id));
        dispatch(setAdminId(adminId));
      } else {
        dispatch(setError("Failed to create chat"));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Chat request failed";
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// Thunk: Fetch all messages for a given chat
export const fetchChatMessages = (chatId: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setMessageLoading(true));
    try {
      const res = await APIS.get(`/chats/${chatId}/messages`);
      if (res.status === 200 && res.data.data) {
        dispatch(setMessages(res.data.data));
      } else {
        dispatch(setError("Failed to load messages"));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load messages";
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setMessageLoading(false));
    }
  };
};

// Thunk: Send a message (for REST API, not Socket.io)
export const sendMessage = (
  chatId: string,
  content: string
) => {
  return async (dispatch: AppDispatch) => {
    try {
      const res = await APIS.post("/chats/send-message", {
        chatId,
        content,
      });
      if (res.status === 200 && res.data.data) {
        dispatch(addMessage(res.data.data));
      } else {
        dispatch(setError("Failed to send message"));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      dispatch(setError(errorMessage));
    }
  };
};

// Thunk: Fetch admin users
export const fetchAdminUsers = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(setAdminUsersLoading(true));
    try {
      const res = await APIS.get("/chats/admins");
      if (res.status === 200 && res.data.data) {
        dispatch(setAdminUsers(res.data.data));
        // Set first admin as default if no admin is selected
        if (res.data.data.length > 0) {
          dispatch(setAdminId(res.data.data[0].id));
        }
      } else {
        dispatch(setError("Failed to load admin users"));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load admin users";
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setAdminUsersLoading(false));
    }
  };
};