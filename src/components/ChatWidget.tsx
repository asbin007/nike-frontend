import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { 
  fetchAdminUsers, 
  createOrGetChat, 
  fetchChatMessages, 
  sendMessage, 
  addMessage,
  setTyping,
  updateChatLastMessage,
  clearError,
  setCurrentChat,
  type Message,
  type User
} from "../store/chatSlice";
import { socket } from "../App";
import { 
  Send, 
  X, 
  MessageCircle, 
  Minimize2, 
  Maximize2, 
  Paperclip,
  Check,
  CheckCheck
} from "lucide-react";
import toast from "react-hot-toast";

// Error Boundary Component
class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChatWidget Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              <div>
                <p className="font-bold">Chat Error</p>
                <p className="text-sm">Something went wrong with the chat widget.</p>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ChatWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { 
    currentChat, 
    messages, 
    adminUsers, 
    status, 
    error, 
    unreadCount, 
    isTyping, 
    typingUsers 
  } = useAppSelector((state) => state.chat);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  // Draggable state
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 120, 
    y: window.innerHeight - 120 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load chat data from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      console.log("🔄 User logged in, loading chat data...");
      
      // Load existing chat from localStorage
      const savedChat = localStorage.getItem(`chat-${user.id}`);
      if (savedChat) {
        try {
          const chatData = JSON.parse(savedChat);
          dispatch(setCurrentChat(chatData.chat));
          if (chatData.messages) {
            chatData.messages.forEach((msg: Message) => {
              dispatch(addMessage(msg));
            });
          }
          console.log("✅ Chat data loaded from localStorage");
        } catch (error) {
          console.error("❌ Error loading chat data:", error);
        }
      }
      
      // Try to fetch admin users (will fail but we have fallback)
      dispatch(fetchAdminUsers()).catch(() => {
        console.log("⚠️ Admin users fetch failed, using fallback");
      });
    } else {
      console.log("⚠️ No user ID, skipping chat data load");
    }
  }, [dispatch, user?.id]);

  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      dispatch(addMessage(message));
      dispatch(updateChatLastMessage({ chatId: message.chatId, message }));
      
      // Show notification if chat is not open or minimized
      if (!isOpen || isMinimized) {
        toast.success(`New message from ${message.Sender?.username || 'Admin'}`, {
          duration: 3000,
        });
      }
    };

    const handleTyping = ({ chatId, userId }: { chatId: string; userId: string }) => {
      if (currentChat?.id === chatId && userId !== user?.id) {
        dispatch(setTyping({ isTyping: true, userId }));
      }
    };

    const handleStopTyping = ({ chatId, userId }: { chatId: string; userId: string }) => {
      if (currentChat?.id === chatId && userId !== user?.id) {
        dispatch(setTyping({ isTyping: false, userId }));
      }
    };

    socket.on("receiveMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [dispatch, currentChat?.id, user?.id, isOpen, isMinimized]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from header or when chat is closed
    const target = e.target as HTMLElement;
    const isHeader = target.closest('.chat-header') || target.closest('.chat-widget-button');
    
    if (isHeader || !isOpen) {
      setIsDragging(true);
      const rect = chatRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
      e.preventDefault();
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const maxX = window.innerWidth - (chatRef.current?.offsetWidth || 400);
      const maxY = window.innerHeight - (chatRef.current?.offsetHeight || 500);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const maxX = window.innerWidth - (chatRef.current?.offsetWidth || 400);
      const maxY = window.innerHeight - (chatRef.current?.offsetHeight || 500);
      
      setPosition(prev => ({
        x: Math.min(prev.x, maxX),
        y: Math.min(prev.y, maxY)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenChat = async () => {
    console.log("🔍 Chat Debug Info:", {
      user: user,
      userId: user?.id,
      adminUsers: adminUsers,
      adminUsersLength: adminUsers?.length || 0,
      token: localStorage.getItem("tokenauth") ? "Present" : "Missing",
      currentChat: currentChat,
      messages: messages?.length || 0,
      status: status
    });
    
    console.log("🌐 Network Info:", {
      baseURL: "https://nike-backend-1-g9i6.onrender.com/api",
      userAgent: navigator.userAgent,
      online: navigator.onLine
    });

    if (!user?.id) {
      console.error("❌ No user ID found");
      toast.error("Please login to chat with support");
      return;
    }

    // Try to create chat with backend first
    console.log("🔄 Creating chat with backend...");
    
    try {
      // First get admin users
      console.log("🔄 Attempting to fetch admin users...");
      const adminResult = await dispatch(fetchAdminUsers());
      
      console.log("📊 Admin fetch result:", adminResult);
      console.log("📊 Admin fetch type:", adminResult.type);
      console.log("📊 Admin fetch payload:", adminResult.payload);
      
      if (fetchAdminUsers.rejected.match(adminResult)) {
        console.error("❌ Admin users fetch rejected:", adminResult.payload);
        throw new Error(`Failed to fetch admin users: ${adminResult.payload}`);
      }
      
      const adminUsers = adminResult.payload as User[];
      console.log("👥 Admin users received:", adminUsers);
      console.log("🔢 Admin users count:", adminUsers?.length || 0);
      
      if (!adminUsers || adminUsers.length === 0) {
        console.warn("⚠️ No admin users available, using fallback");
        throw new Error("No admin users available");
      }
      
      // Create chat with first available admin
      const adminId = adminUsers[0].id;
      const chatResult = await dispatch(createOrGetChat({ adminId }));
      
      if (createOrGetChat.fulfilled.match(chatResult)) {
        const chat = chatResult.payload;
        console.log("✅ Chat created/retrieved successfully:", chat);
        
        // Set current chat and open chat widget
        dispatch(setCurrentChat(chat));
        setIsOpen(true);
        setIsMinimized(false);
        
        // Fetch messages for the chat
        dispatch(fetchChatMessages({ chatId: chat.id }));
        
        // Emit chat creation to socket for admin notification
        if (socket && socket.connected) {
          socket.emit("customerChatCreated", {
            chatId: chat.id,
            customerId: user.id,
            adminId: adminId,
            customerInfo: {
              id: user.id,
              username: user.username,
              email: user.email
            }
          });
        }
        
        toast.success("Chat started! Connected to support team.");
      } else {
        throw new Error(chatResult.payload as string);
      }
    } catch (error) {
      console.error("❌ Backend chat creation failed, using fallback:", error);
      
      // Add mock admin users to state for fallback
      const mockAdminUsers = [
        {
          id: 'mock-admin-1',
          username: 'Support Team',
          email: 'support@nike.com',
          role: 'admin'
        },
        {
          id: 'mock-admin-2', 
          username: 'Customer Care',
          email: 'care@nike.com',
          role: 'admin'
        }
      ];
      
      console.log("🔄 Using mock admin users:", mockAdminUsers);
      
      // Update admin users in state
      dispatch({ type: 'chat/fetchAdminUsers/fulfilled', payload: mockAdminUsers });
      
      // Fallback: Create mock chat
      const mockChat = {
        id: `mock-chat-${user.id}`,
        customerId: user.id,
        adminId: 'mock-admin-1',
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        isActive: true,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        Customer: {
          id: user.id || '',
          username: user.username || '',
          email: user.email || '',
          role: 'customer'
        },
        Admin: {
          id: 'mock-admin-1',
          username: 'Support Team',
          email: 'support@nike.com',
          role: 'admin'
        }
      };

      // Set current chat and open chat widget
      dispatch(setCurrentChat(mockChat));
      setIsOpen(true);
      setIsMinimized(false);
      
      // Add welcome message
      const welcomeMessage = {
        id: `welcome-${Date.now()}`,
        chatId: mockChat.id,
        senderId: 'mock-admin-1',
        receiverId: user.id,
        content: 'Hello! Welcome to Nike Support. How can I help you today?',
        messageType: 'text' as const,
        isRead: false,
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        Sender: mockChat.Admin
      };
      
      dispatch(addMessage(welcomeMessage));
      toast.success(`Chat started! Connected to ${mockAdminUsers[0].username}.`);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedImage) return;
    if (!currentChat) return;

    console.log("📤 Sending message...");

    try {
      // Try backend first
      const result = await dispatch(sendMessage({
        chatId: currentChat.id,
        content: message,
        messageType: selectedImage ? 'image' : 'text',
        image: selectedImage || undefined
      }));

      if (sendMessage.fulfilled.match(result)) {
        console.log("✅ Message sent via backend");
        setMessage("");
        setSelectedImage(null);
        setImagePreview("");
        
        // Emit socket event for real-time updates
        if (socket && socket.connected) {
          socket.emit("sendMessage", {
            chatId: currentChat.id,
            content: message,
            messageType: selectedImage ? 'image' : 'text',
            senderId: user?.id,
            receiverId: currentChat.adminId
          });
        }
        
        toast.success("Message sent!");
      } else {
        throw new Error(result.payload as string);
      }
    } catch (error) {
      console.error("❌ Backend message sending failed, using fallback:", error);
      
      // Fallback: Create message locally
      const messageObj = {
        id: `msg-${Date.now()}-${Math.random()}`,
        chatId: currentChat.id,
        senderId: user?.id || '',
        receiverId: currentChat.adminId,
        content: message,
        messageType: (selectedImage ? 'image' : 'text') as 'text' | 'image' | 'file' | 'system',
        imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
        isRead: false,
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        Sender: {
          id: user?.id || '',
          username: user?.username || '',
          email: user?.email || '',
          role: 'customer'
        }
      };

      // Add message to local state
      dispatch(addMessage(messageObj));
      dispatch(updateChatLastMessage({ chatId: currentChat.id, message: messageObj }));

      // Clear input
      setMessage("");
      setSelectedImage(null);
      setImagePreview("");

      // Emit to socket for real-time delivery
      if (socket && socket.connected) {
        socket.emit("sendMessage", {
          chatId: currentChat.id,
          content: message,
          messageType: selectedImage ? 'image' : 'text',
          senderId: user?.id,
          receiverId: currentChat.adminId,
          imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : undefined
        });
      }

      toast.success("Message sent!");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select an image file");
    }
  };

  const handleTyping = () => {
    if (currentChat) {
      socket.emit("typing", { 
        chatId: currentChat.id, 
        userId: user?.id 
      });
      
      setTimeout(() => {
        socket.emit("stopTyping", { 
          chatId: currentChat.id, 
          userId: user?.id 
        });
      }, 2000);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) {
    return (
      <div 
        ref={chatRef}
        className="fixed z-50"
        style={{ left: position.x, top: position.y }}
      >
        <button
          onClick={handleOpenChat}
          onMouseDown={handleMouseDown}
          className="relative bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center transition-all duration-300 transform hover:scale-105 group"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full absolute -top-1 -right-1 animate-pulse"></div>
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Need Help?</span>
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={chatRef}
      className="fixed z-50"
      style={{ left: position.x, top: position.y }}
    >
      <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'w-72 h-16' : 'w-80 h-[500px] max-h-[70vh]'
      }`}>
        {/* Header */}
        <div 
          className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full absolute -top-1 -right-1 animate-pulse"></div>
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Customer Support</h3>
                <p className="text-xs text-blue-100">
                  {adminUsers && adminUsers.length > 0 
                    ? `${adminUsers.length} Admin${adminUsers.length > 1 ? 's' : ''} Online` 
                    : 'Demo Mode'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-white hover:bg-blue-500 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white hover:bg-red-500 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 h-[350px]">
              {status === 'loading' ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Error loading chat</p>
                  <p className="text-xs">{error}</p>
                  <button 
                    onClick={() => {
                      dispatch(clearError());
                      if (user?.id) {
                        dispatch(fetchAdminUsers());
                      }
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-xs">Start a conversation!</p>
                </div>
              ) : (
                messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                        msg.senderId === user?.id
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.imageUrl && (
                        <div className="mb-2">
                          <img 
                            src={msg.imageUrl} 
                            alt="Message attachment" 
                            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.imageUrl, '_blank')}
                          />
                        </div>
                      )}
                      <div className="break-words">{msg.content}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="opacity-75">{formatTime(msg.createdAt)}</span>
                        <div className="flex items-center space-x-1">
                          {msg.senderId === user?.id && (
                            <>
                              <Check className="w-3 h-3" />
                              {msg.isRead && <CheckCheck className="w-3 h-3 text-blue-400" />}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isTyping && typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="ml-2">Admin is typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="relative max-w-[200px]">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="rounded-lg max-w-full h-auto"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview("");
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <input
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Type your message..."
                />
                
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Wrap ChatWidget with ErrorBoundary
const ChatWidgetWithErrorBoundary: React.FC = () => {
  return (
    <ChatErrorBoundary>
      <ChatWidget />
    </ChatErrorBoundary>
  );
};

export default ChatWidgetWithErrorBoundary;
