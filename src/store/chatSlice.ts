import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIS } from "../globals/http";
import { Status } from "../globals/types/types";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  read: boolean;
  messageType?: 'text' | 'image' | 'file' | 'location';
  metadata?: {
    imageUrl?: string;
    fileName?: string;
    fileSize?: number;
    location?: {
      lat: number;
      lng: number;
      address: string;
    };
  };
  Sender?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

interface Chat {
  id: string;
  customerId: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'closed' | 'pending';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  unreadCount?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  notes?: string;
  tags?: string[];
  Admin?: {
    id: string;
    username: string;
    email: string;
  };
  Customer?: {
    id: string;
    username: string;
    email: string;
  };
}

interface ChatState {
  chats: Chat[];
  messages: Message[];
  currentChat: Chat | null;
  adminUsers: any[];
  loading: boolean;
  error: string | null;
  status: Status;
  unreadCount: number;
  isTyping: boolean;
  typingUsers: string[];
  searchQuery: string;
  filterStatus: 'all' | 'active' | 'closed' | 'pending';
  filterPriority: 'all' | 'low' | 'medium' | 'high' | 'urgent';
}

const initialState: ChatState = {
  chats: [],
  messages: [],
  currentChat: null,
  adminUsers: [],
  loading: false,
  error: null,
  status: Status.LOADING,
  unreadCount: 0,
  isTyping: false,
  typingUsers: [],
  searchQuery: '',
  filterStatus: 'all',
  filterPriority: 'all',
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
    },
    setAdminUsers: (state, action: PayloadAction<any[]>) => {
      state.adminUsers = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setStatus: (state, action: PayloadAction<Status>) => {
      state.status = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    setTyping: (state, action: PayloadAction<boolean | { isTyping: boolean; userId: string }>) => {
      if (typeof action.payload === 'boolean') {
        state.isTyping = action.payload;
      } else {
        state.isTyping = action.payload.isTyping;
        if (action.payload.isTyping) {
          if (!state.typingUsers.includes(action.payload.userId)) {
            state.typingUsers.push(action.payload.userId);
          }
        } else {
          state.typingUsers = state.typingUsers.filter(id => id !== (action.payload as any).userId);
        }
      }
    },
    setTypingUsers: (state, action: PayloadAction<string[]>) => {
      state.typingUsers = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<'all' | 'active' | 'closed' | 'pending'>) => {
      state.filterStatus = action.payload;
    },
    setFilterPriority: (state, action: PayloadAction<'all' | 'low' | 'medium' | 'high' | 'urgent'>) => {
      state.filterPriority = action.payload;
    },
    updateChat: (state, action: PayloadAction<{ chatId: string; updates: Partial<Chat> }>) => {
      const { chatId, updates } = action.payload;
      const chatIndex = state.chats.findIndex(c => c.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex] = { ...state.chats[chatIndex], ...updates };
      }
    },
    clearTyping: (state) => {
      state.isTyping = false;
      state.typingUsers = [];
    },
    updateChatLastMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        chat.lastMessage = message.content;
        chat.lastMessageAt = message.createdAt;
      }
    },
    markChatAsRead: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        state.unreadCount -= chat.unreadCount || 0;
        chat.unreadCount = 0;
      }
    },
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      state.messages
        .filter(m => m.chatId === chatId && m.senderId !== 'admin')
        .forEach(message => {
          message.read = true;
        });
      
      // Reset unread count for this chat
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        state.unreadCount -= chat.unreadCount || 0;
        chat.unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllChatsThunk.pending, (state) => {
        state.status = Status.LOADING;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllChatsThunk.fulfilled, (state) => {
        state.status = Status.SUCCESS;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllChatsThunk.rejected, (state, action) => {
        state.status = Status.ERROR;
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch chats';
      });
  },
});

export const {
  setChats,
  setMessages,
  addMessage,
  setCurrentChat,
  setAdminUsers,
  setLoading,
  setError,
  clearError,
  setStatus,
  setUnreadCount,
  setTyping,
  setTypingUsers,
  setSearchQuery,
  setFilterStatus,
  setFilterPriority,
  updateChat,
  clearTyping,
  updateChatLastMessage,
  markChatAsRead,
  markMessagesAsRead,
} = chatSlice.actions;

// Async thunk to fetch all chats
export const fetchAllChatsThunk = createAsyncThunk(
  'chat/fetchAllChats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('🔄 Fetching all chats...');
      dispatch(setStatus(Status.LOADING));

      // Try multiple endpoints for chat API
      let response;
      try {
        response = await APIS.get("/chats/admin/all");
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('🔄 Trying alternative chat endpoint...');
          try {
            response = await APIS.get("/chats/all");
          } catch (secondError: any) {
            if (secondError.response?.status === 404) {
              console.log('🔄 Trying third chat endpoint...');
              response = await APIS.get("/chats");
            } else {
              throw secondError;
            }
          }
        } else {
          throw error;
        }
      }
      
      if (response.status === 200) {
        console.log('✅ Chats fetched successfully:', response.data);
        dispatch(setChats(response.data.data || response.data || []));
        dispatch(setStatus(Status.SUCCESS));
        return response.data;
      } else {
        console.error('❌ Failed to fetch chats:', response.status);
        dispatch(setStatus(Status.ERROR));
        return rejectWithValue('Failed to fetch chats');
      }
    } catch (error: any) {
      console.error('❌ Error fetching chats:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch chats';
      dispatch(setStatus(Status.ERROR));
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Additional async thunks for chat functionality
export const fetchChatMessages = (chatId: string) => {
  return async function fetchChatMessagesThunk(dispatch: any) {
    try {
      console.log('🔄 Fetching chat messages for:', chatId);
      dispatch(setLoading(true));

      const response = await APIS.get(`/chats/${chatId}/messages`);
      
      if (response.status === 200) {
        console.log('✅ Chat messages fetched successfully:', response.data);
        dispatch(setMessages(response.data.data || response.data || []));
        dispatch(setStatus(Status.SUCCESS));
        return response.data;
      } else {
        console.error('❌ Failed to fetch chat messages:', response.status);
        dispatch(setStatus(Status.ERROR));
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error fetching chat messages:', error);
      dispatch(setStatus(Status.ERROR));
      dispatch(setError(error.message || 'Failed to fetch chat messages'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const sendMessage = (params: { 
  chatId: string; 
  content: string; 
  messageType?: 'text' | 'image' | 'file' | 'location'; 
  image?: File; 
  metadata?: any 
}) => {
  return async function sendMessageThunk(dispatch: any) {
    try {
      console.log('🔄 Sending message:', params);
      dispatch(setLoading(true));

      const formData = new FormData();
      formData.append('chatId', params.chatId);
      formData.append('content', params.content);
      formData.append('messageType', params.messageType || 'text');
      
      if (params.image) {
        formData.append('image', params.image);
      }
      
      if (params.metadata) {
        formData.append('metadata', JSON.stringify(params.metadata));
      }

      const response = await APIS.post("/chats/send-message", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log('✅ Message sent successfully:', response.data);
        
        const message: Message = {
          id: response.data.messageId || Date.now().toString(),
          chatId: params.chatId,
          content: params.content,
          senderId: response.data.senderId || 'customer',
          receiverId: response.data.receiverId || 'admin',
          createdAt: new Date().toISOString(),
          read: false,
          messageType: params.messageType || 'text',
          metadata: params.metadata,
          Sender: {
            id: response.data.senderId || 'customer',
            username: response.data.senderName || 'Customer',
            email: response.data.senderEmail || '',
            role: 'customer'
          }
        };

        // Add message to store (duplicate prevention handled in component)
        dispatch(addMessage(message));
        dispatch(updateChatLastMessage({ chatId: params.chatId, message }));
        
        dispatch(setStatus(Status.SUCCESS));
        return { success: true, message };
      } else {
        console.error('❌ Failed to send message:', response.status);
        dispatch(setStatus(Status.ERROR));
        return { success: false, error: 'Failed to send message' };
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      dispatch(setStatus(Status.ERROR));
      dispatch(setError(error.message || 'Failed to send message'));
      return { success: false, error: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const createChat = (customerId: string) => {
  return async function createChatThunk(dispatch: any) {
    try {
      console.log('🔄 Creating chat for customer:', customerId);
      dispatch(setLoading(true));

      const response = await APIS.post("/chats/get-or-create", { adminId: "28819183-81c9-4ab9-ba65-04b1c3e94fcd" });
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Chat created successfully:', response.data);
        
        const newChat: Chat = {
          id: response.data.chatId || response.data.id,
          customerId: customerId,
          adminId: response.data.adminId || 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          priority: 'medium',
          unreadCount: 0,
          Customer: {
            id: customerId,
            username: response.data.customerName || 'Customer',
            email: response.data.customerEmail || ''
          }
        };

        dispatch(setCurrentChat(newChat));
        dispatch(setStatus(Status.SUCCESS));
        return { success: true, chat: newChat };
      } else {
        console.error('❌ Failed to create chat:', response.status);
        dispatch(setStatus(Status.ERROR));
        return { success: false, error: 'Failed to create chat' };
      }
    } catch (error: any) {
      console.error('❌ Error creating chat:', error);
      dispatch(setStatus(Status.ERROR));
      dispatch(setError(error.message || 'Failed to create chat'));
      return { success: false, error: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export default chatSlice.reducer;
