import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { MessageCircle, X, Minimize2, Maximize2, Loader2, Camera, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSocket } from '../App';
import { 
  fetchAllChatsThunk, 
  addMessage,
  setMessages,
  setCurrentChat,
  setTyping,
  updateChatLastMessage
} from '../store/chatSlice';

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

// Removed unused Chat interface

const ChatWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    currentChat, 
    messages, 
    isTyping
  } = useAppSelector((state) => state.chat);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [adminUsers, setAdminUsers] = useState<{id: string; username: string; email: string; role: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);


  // Backend URL with fallback
  const baseURL = "https://nike-backend-1-g9i6.onrender.com/api";
  
  // Get proper token for API calls
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("tokenauth");
    return token ? `Bearer ${token}` : '';
  }, []);

  // Drag handling functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return; // Don't drag when chat is open
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep within screen bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    const minY = 20; // Don't go too high
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(minY, Math.min(newY, maxY))
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, handleMouseMove]);

  // WebSocket integration for real-time chat
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Track processed message IDs to prevent duplicates
    const processedMessageIds = new Set<string>();

    // Listen for new messages with duplicate prevention
    const handleNewMessage = (message: Message) => {
      // Check if message already processed
      if (processedMessageIds.has(message.id)) {
        console.log('⚠️ Duplicate message ignored:', message.id);
        return;
      }
      
      // Mark message as processed
      processedMessageIds.add(message.id);
      
      // Only add message if it's for current chat
      if (currentChat?.id === message.chatId) {
        dispatch(addMessage(message));
        dispatch(updateChatLastMessage({ chatId: message.chatId, message }));
        
        // Show notification if not from current currentUser
        if (message.senderId !== user?.id) {
          toast.success(`New message from ${message.Sender?.username || 'Admin'}`, {
            duration: 3000,
          });
        }
      }
    };

    // Listen for typing indicators
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

    // Only listen to receiveMessage - remove other duplicate listeners
    socket.on("receiveMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [dispatch, currentChat?.id, user?.id]);

  // Initialize chat on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAllChatsThunk());
    }
  }, [dispatch, user?.id]);



  // Image handling functions
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setSelectedImage(file);
      console.log('🖼️ Image selected:', file.name, 'Size:', file.size);
    }
  };

  // Removed unused removeImage function

  // Location handling functions
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Simple address format
          const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setLocation({ lat, lng, address });
          setShowLocationModal(false);
          toast.success('Location captured!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const removeLocation = () => {
    setLocation(null);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Fetch admin users for chat
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const response = await fetch(`${baseURL}/auth/users`, {
          headers: {
            'Authorization': getAuthToken(),
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const admins = data.data.filter((user: { role: string }) => user.role === 'admin');
          setAdminUsers(admins);
        }
      } catch (error) {
        console.error('Error fetching admin users:', error);
      }
    };

    fetchAdminUsers();
  }, [baseURL, getAuthToken]);

  // Socket event listeners for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.log('❌ ChatWidget: No socket available');
      return;
    }

    console.log('🔌 ChatWidget: Setting up socket listeners, socket connected:', socket.connected);
    setSocketConnected(socket.connected);

    // Listen for connection status changes
    const handleConnect = () => {
      console.log('✅ ChatWidget: Socket connected');
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ ChatWidget: Socket disconnected');
      setSocketConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    const handleReceiveMessage = (message: Message) => {
      console.log('💬 ChatWidget: Received message:', message);
      console.log('💬 Current chat ID:', currentChat?.id);
      console.log('💬 Message chat ID:', message.chatId);
      console.log('💬 Message sender ID:', message.senderId);
      console.log('💬 Current currentUser ID:', user.id);
      
      // Check if message is for current chat and not from current currentUser
      if (message.chatId === currentChat?.id && message.senderId !== user.id) {
        // Check if message already exists to prevent duplicates
        const messageExists = messages.some(msg => msg.id === message.id);
        if (!messageExists) {
          console.log('✅ Adding message to current chat (from admin)');
          dispatch(addMessage(message));
          toast.success('New message received!');
        } else {
          console.log('ℹ️ Message already exists, skipping duplicate');
        }
      } else if (message.chatId === currentChat?.id && message.senderId === user.id) {
        console.log('ℹ️ Message from current currentUser, not adding to avoid duplicate');
      } else {
        console.log('❌ Message not for current chat or from current currentUser');
      }
    };

    // Removed unused handleNewMessageNotification function

    const handleTyping = (data: {chatId: string; username: string}) => {
      console.log('⌨️ ChatWidget: Typing indicator:', data);
      if (data.chatId === currentChat?.id) {
        dispatch(setTyping(true));
        setTypingUser(data.username || 'Admin');
        setTimeout(() => {
          dispatch(setTyping(false));
          setTypingUser('');
        }, 3000);
      }
    };

    const handleStopTyping = (data: {chatId: string; username: string}) => {
      console.log('⌨️ ChatWidget: Stop typing indicator:', data);
      if (data.chatId === currentChat?.id) {
        dispatch(setTyping(false));
        setTypingUser('');
      }
    };

    // Add event listeners - only receiveMessage to prevent duplicates
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    
    // Join chat room when chat is selected
    if (currentChat?.id) {
      socket.emit('joinChat', currentChat.id);
      console.log('🔌 Joined chat room:', currentChat.id);
    }
    
    // Socket connection status
    console.log('🔌 ChatWidget: Socket events registered');
    console.log('🔌 ChatWidget: Socket connected:', socket.connected);
    console.log('🔌 ChatWidget: Socket ID:', socket.id);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [dispatch, currentChat?.id, user.id, messages]);

  // Auto-refresh messages every 5 seconds as fallback
  useEffect(() => {
    if (!currentChat?.id) return;
    
    const interval = setInterval(async () => {
      console.log('🔄 ChatWidget: Auto-refreshing messages as fallback');
      try {
        const response = await fetch(`${baseURL}/chats/${currentChat.id}/messages`, {
          headers: {
            'Authorization': getAuthToken(),
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success || data.messages || data.data) {
            const messagesData = data.messages || data.data || [];
            dispatch(setMessages(messagesData));
            console.log('✅ ChatWidget: Messages refreshed via fallback');
          }
        }
      } catch (error) {
        console.error('❌ ChatWidget: Fallback refresh failed:', error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [dispatch, currentChat?.id]);

  // Fetch messages when chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat?.id) return;

      try {
        setIsLoading(true);
        console.log('📥 Fetching messages for chat:', currentChat.id);
        
        const response = await fetch(`${baseURL}/chats/${currentChat.id}/messages`, {
          headers: {
            'Authorization': getAuthToken(),
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Messages API Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📡 Messages API Response data:', data);
          
          // Check for both success field and messages field
          if (data.success || data.messages || data.data) {
            const messagesData = data.messages || data.data || [];
            dispatch(setMessages(messagesData));
            console.log('✅ Messages fetched:', messagesData);
      } else {
            console.error('❌ Failed to fetch messages:', data.message);
      }
    } else {
          const errorData = await response.text();
          console.error('❌ Failed to fetch messages:', response.status, errorData);
        }
      } catch (error) {
        console.error('❌ Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [dispatch, currentChat?.id]);

  const handleOpenChat = async () => {
    if (adminUsers.length === 0) {
      toast.error('No admin available at the moment. Please try again later.');
      return;
    }
    
    // Immediately show chat UI
    setIsOpen(true);
    setIsMinimized(false);
    
    try {
      setIsLoading(true);
      console.log('🔄 Creating chat with admin:', adminUsers[0]);
      console.log('🌐 Making API call to:', `${baseURL}/chats/get-or-create`);
      console.log('🔑 Token:', localStorage.getItem('tokenauth') ? 'Present' : 'Missing');
      
      const response = await fetch(`${baseURL}/chats/get-or-create`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthToken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminId: adminUsers[0].id })
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response data:', data);
        
        // Check for both success field and chat field
        if (data.success || data.chat) {
          const chatData = data.chat || data.data;
          console.log('✅ Chat created/opened:', chatData);
          
          // Ensure chatData has required fields
          if (chatData && (chatData.id || chatData.chatId)) {
            dispatch(setCurrentChat(chatData));
            toast.success('Connected to support!');
            
            // Join chat room
            const socket = getSocket();
            if (socket && chatData.id) {
              socket.emit('joinChat', chatData.id);
              console.log('🔌 Joined chat room:', chatData.id);
            }
          } else {
            console.error('❌ Invalid chat data received:', chatData);
            toast.error('Invalid chat data received');
          }
        } else {
          console.error('❌ Failed to create chat:', data.message);
          toast.error(data.message || 'Failed to start chat');
        }
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to create chat:', response.status);
        console.error('❌ Error response:', errorData);
        toast.error(`Failed to start chat: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      toast.error('Failed to start chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedImage && !location) || !currentChat) return;

    // Prevent duplicate sends
    if (isLoading) {
      console.log('⚠️ Message already being sent, ignoring duplicate');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 Starting message send process...');
      console.log('📝 Message:', message.trim());
      console.log('💬 Chat ID:', currentChat.id);

      // Prepare location data if available
      let locationData = null;
      if (location) {
        locationData = {
          lat: location.lat,
          lng: location.lng,
          address: location.address
        };
      }

      const messageContent = message.trim();
      const messageId = Date.now().toString(); // Generate unique ID
      
      const formData = new FormData();
      formData.append('chatId', currentChat.id);
      formData.append('content', messageContent);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      if (locationData) {
        formData.append('location', JSON.stringify(locationData));
      }

      console.log('🌐 Making API call to:', `${baseURL}/chats/send-message`);

      const response = await fetch(`${baseURL}/chats/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthToken()
        },
        body: formData
      });

      console.log('📡 API Response Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message sent successfully');
        
        // Add message to local state (only once) with unique ID
        const newMessage = {
          id: data.data?.id || messageId,
          chatId: currentChat.id,
          senderId: data.data?.senderId || user.id,
          receiverId: data.data?.receiverId || currentChat.adminId,
          content: messageContent,
          imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : data.data?.imageUrl,
          location: locationData,
          createdAt: data.data?.createdAt || new Date().toISOString(),
          read: false,
          Sender: {
            id: data.data?.senderId || user.id,
            username: data.data?.Sender?.username || user.username,
            email: data.data?.Sender?.email || user.email,
            role: 'customer'
          }
        };

        // Check if message already exists to prevent duplicates
        const messageExists = messages.some(msg => msg.id === newMessage.id);
        if (!messageExists) {
          dispatch(addMessage(newMessage));
        } else {
          console.log('⚠️ Message already exists, skipping duplicate');
        }
        
        // Clear form immediately to prevent duplicate sends
        setMessage('');
        setSelectedImage(null);
        setLocation(null);
        
        // Don't emit socket event here - let backend handle it to prevent duplicates
        // The backend will emit the message to all connected clients
        
        toast.success('Message sent successfully!');
      } else {
        const errorData = await response.text();
        console.error('❌ API Error Response:', errorData);
        toast.error(`Failed to send message: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };



  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div 
        ref={dragRef}
        className="fixed z-50 cursor-pointer select-none bottom-3 right-8 sm:bottom-4 sm:right-10 md:bottom-6 md:right-12 lg:bottom-8 lg:right-14"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
        onMouseDown={handleMouseDown}
        onClick={handleOpenChat}
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 relative group">
          <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </div>
          {isLoading && (
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg">
              <Loader2 className="h-3 w-3 animate-spin text-orange-600" />
            </div>
          )}
          {/* Notification Badge */}
          {messages.length > 0 && (
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {messages.length > 9 ? '9+' : messages.length}
            </div>
          )}
          <div className="absolute -top-10 sm:-top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium text-xs">Nike Support</span>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  // When chat is open, don't show the floating button
  return (
    <div className={`fixed bottom-4 right-8 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 ${
      isMinimized 
        ? 'w-72 h-14 sm:w-80 sm:h-16' 
        : 'w-80 h-96 sm:w-96 sm:h-[400px] md:w-[380px] md:h-[450px]'
    } overflow-hidden backdrop-blur-sm flex flex-col`}>
        {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-3 sm:p-4 md:p-5 rounded-t-3xl flex items-center justify-between relative overflow-hidden min-h-[60px] w-full flex-shrink-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="absolute -top-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/5 rounded-full"></div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 relative z-50 min-w-0 flex-1 overflow-hidden">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-white">
                {adminUsers.length > 0 ? adminUsers[0].username : 'Nike Support'}
              </span>
              {adminUsers.length > 0 && (
                <span className="text-xs bg-orange-500/20 px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${socketConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-xs opacity-90 font-medium text-white">
                {socketConnected ? 'Active Now' : 'Offline'}
              </span>
              {socketConnected && (
                <span className="text-xs bg-green-500/20 px-1.5 py-0.5 rounded-full">Live</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 relative z-50 flex-shrink-0">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-110 border border-white/20 hover:border-white/40"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-white hover:bg-red-500/50 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 border border-red-400/40 hover:border-red-400/70 bg-red-500/15 hover:shadow-lg"
            title="Close Chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

        {!isMinimized && (
          <>
          {/* Messages */}
          <div className="flex-1 p-3 sm:p-4 md:p-5 overflow-y-auto bg-gradient-to-b from-gray-50 to-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" style={{height: 'calc(100% - 120px)'}}>
            {isLoading ? (
              <div className="text-center text-gray-500 py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange-600" />
                </div>
                <p className="text-xs sm:text-sm font-medium">Loading messages...</p>
                <p className="text-xs text-gray-400 mt-1">Please wait</p>
                </div>
              ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-2">Welcome to Nike Support!</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">How can we help you today?</p>
                <div className="space-y-2">
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-50 rounded-full inline-block">
                    <span className="text-xs font-medium text-orange-700">
                      {adminUsers.length > 0 ? `${adminUsers.length} support agent(s) available` : 'No agents available'}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 rounded-full inline-block">
                    <span className="text-xs text-gray-600">Average response time: 2 minutes</span>
                  </div>
                </div>
                </div>
              ) : (
              <div className="space-y-3 sm:space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs px-3 py-2 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-200 hover:shadow-md ${
                        msg.senderId === user.id
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Image */}
                      {msg.imageUrl && (
                        <div className="mb-2 sm:mb-3 -mx-1">
                          <img 
                            src={msg.imageUrl} 
                            alt="Message attachment" 
                            className="max-w-full h-auto rounded-xl sm:rounded-2xl max-h-32 sm:max-h-48 object-cover shadow-sm"
                          />
                        </div>
                      )}
                      
                      {/* Location - if location data exists */}
                      {msg.metadata?.location && (
                        <div className={`mb-2 sm:mb-3 p-2 sm:p-3 rounded-xl sm:rounded-2xl ${
                          msg.senderId === user.id 
                            ? 'bg-white/20' 
                            : 'bg-orange-50 border border-orange-200'
                        }`}>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm font-medium">Location: {msg.metadata.location.address}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Text Content */}
                      {msg.content && <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>}
                      
                      <div className="flex justify-end mt-1 sm:mt-2">
                        <p className="text-xs opacity-70">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-600 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{typingUser} is typing...</span>
                    </div>
                  </div>
                </div>
              )}
                
                
                <div ref={messagesEndRef} />
                </div>
              )}
            </div>


            {/* Location Preview */}
            {location && (
              <div className="px-3 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-200">
                <div className="bg-white border border-orange-200 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-800">Location Shared</p>
                      <p className="text-xs text-gray-600 truncate">{location.address}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeLocation}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-all duration-200 flex-shrink-0"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 sm:p-4 md:p-5 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-end space-x-2 sm:space-x-3">
                {/* Image Upload Button */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  ref={fileInputRef}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 flex items-center hover:scale-105 shadow-sm hover:shadow-md"
                  title="Upload Image"
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>

                {/* Location Button */}
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 flex items-center hover:scale-105 shadow-sm hover:shadow-md"
                  title="Send Location"
                >
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      // Emit typing indicator
                      const socket = getSocket();
                      if (socket && currentChat) {
                        socket.emit('typing', {
                          chatId: currentChat.id,
                          userId: user.id
                        });
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="w-full border border-gray-200 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-14 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm text-sm sm:text-base"
                  />
                  <button
                    onClick={() => {
                      console.log('🔘 Send button clicked');
                      console.log('📝 Message:', message.trim());
                      console.log('🖼️ Selected Image:', !!selectedImage);
                      console.log('📍 Location:', !!location);
                      handleSendMessage();
                    }}
                    disabled={(!message.trim() && !selectedImage && !location) || isLoading}
                    className={`absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      (!message.trim() && !selectedImage && !location) || isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                    style={{
                      display: (!message.trim() && !selectedImage && !location) ? 'none' : 'flex'
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="hidden sm:inline">Press Enter to send</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Max 10MB</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full"></div>
                  <span className="hidden sm:inline">Secure chat</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Send Location</h3>
              <p className="text-gray-600 mb-4">Get your current location to share with admin</p>
              <div className="flex space-x-3">
                <button
                  onClick={getCurrentLocation}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Location
                </button>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ChatWidget; 