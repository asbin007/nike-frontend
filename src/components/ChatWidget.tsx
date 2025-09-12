import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addMessage, fetchChatMessages, Message, getOrCreateChat, fetchAdminUsers } from "../store/chatBoxSlice";
import { socket } from "../App";
import { Send, Image, MapPin, Paperclip, X, Search, Mic, Check, CheckCheck, Smile, MessageCircle, Minimize2, Maximize2 } from "lucide-react";
import toast from "react-hot-toast";

//chat box for support
const ChatWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { chatId, adminId, adminUsers, adminUsersLoading, messages, messageLoading } = useAppSelector((state) => state.chat);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Draggable state
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 100, 
    y: window.innerHeight - 100 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch admin users on component mount
  useEffect(() => {
    console.log("ChatWidget mounted, fetching admin users...");
    dispatch(fetchAdminUsers());
  }, [dispatch]);


  // Debug admin users state changes
  useEffect(() => {
    console.log("Admin users state changed:", {
      adminUsers,
      adminUsersLoading,
      adminId,
      user
    });
  }, [adminUsers, adminUsersLoading, adminId, user]);

  // Drag event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === chatRef.current || chatRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      const rect = chatRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep chat widget within viewport bounds
      const maxX = window.innerWidth - (chatRef.current?.offsetWidth || 400);
      const maxY = window.innerHeight - (chatRef.current?.offsetHeight || 500);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, handleMouseMove, handleMouseUp]);

  // Handle window resize to keep chat widget within bounds
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

  // Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages and join room
  useEffect(() => {
    if (!chatId) return;

    dispatch(fetchChatMessages(chatId));
    socket.emit("joinChat", chatId);

    // Listen for new messages from socket
    socket.on("receiveMessage", (message: Message) => {
      if (message.chatId === chatId) {
        dispatch(addMessage(message));
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }
    });

    // Listen for socket errors
    socket.on("error", (error: string) => {
      console.error("Socket error:", error);
      toast.error(error);
    });

    // Listen for typing indicators
    socket.on("typing", (data: { chatId: string; userId: string }) => {
      if (data.chatId === chatId && data.userId !== user?.id) {
        setIsTyping(true);
        setTypingUser(data.userId);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    // Listen for new message notifications
    socket.on("newMessageNotification", (data: { chatId: string; sender: string }) => {
      if (data.chatId === chatId) {
        console.log(`New message from ${data.sender}`);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("newMessageNotification");
    };
  }, [chatId, dispatch, user?.id, isOpen]);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('Image selected:', file);
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
        setShowAttachments(false);
        console.log('Image set successfully');
      } else {
        toast.error("Please select an image file");
        console.log('Invalid file type:', file.type);
      }
    } else {
      console.log('No file selected');
    }
  };

  // Handle location sharing
  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `📍 Location: ${latitude}, ${longitude}\nhttps://maps.google.com/?q=${latitude},${longitude}`;
          setContent(locationMessage);
          setShowAttachments(false);
        },
        () => {
          toast.error("Unable to get location");
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  // Handle voice recording
  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.success("Recording started... Click again to stop");
    } else {
      setIsRecording(false);
      toast.success("Voice message recorded!");
    }
  };

  // Handle message reactions
  const handleMessageReaction = (_messageId: string, reaction: string) => {
    toast.success(`Reacted with ${reaction} to message`);
    setSelectedMessage(null);
  };

  // Filter messages for search
  const filteredMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format timestamp
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

  // Open chat and get/create chatId
  const handleOpenChat = () => {
    console.log("Chat button clicked");
    console.log("User:", user);
    console.log("Admin users:", adminUsers);
    console.log("Admin users loading:", adminUsersLoading);
    
    if (!user?.id) {
      toast.error("Please login to chat with support.");
      return;
    }
    
    if (adminUsersLoading) {
      toast.error("Loading admin users...");
      return;
    }
    
    // Check if we have admin users
    if (adminUsers.length === 0) {
      console.log("No admin users found");
      toast.error("No admin users available. Please try again later or contact support directly.");
      return;
    }
    
    // Use the selected admin or first available admin
    const targetAdminId = adminId || adminUsers[0].id;
    
    console.log("Creating chat with admin ID:", targetAdminId);
    dispatch(getOrCreateChat(user.id, targetAdminId));
    
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleSend = async () => {
    console.log('handleSend called');
    console.log('Content:', content);
    console.log('SelectedImage:', selectedImage);
    
    if (!content.trim() && !selectedImage) {
      console.log('No content or image to send');
      return;
    }

    // Messages are always allowed - they will be delivered when admin comes online

    try {
      if (selectedImage) {
        console.log('Processing image upload...');
        // Create FormData for image upload
        const formData = new FormData();
        formData.append('chatId', chatId);
        formData.append('content', content || '');
        formData.append('image', selectedImage);
        
        console.log('FormData created:', {
          chatId: chatId,
          content: content || '',
          imageName: selectedImage.name,
          imageSize: selectedImage.size,
          imageType: selectedImage.type
        });

        console.log('Sending image:', selectedImage.name);
        console.log('ChatId:', chatId);

        // Send image via REST API with FormData (with retry)
        let response;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            console.log(`Attempt ${retryCount + 1} to upload image...`);
            response = await fetch('http://localhost:5001/api/chats/send-message', {
              method: 'POST',
              headers: {
                'Authorization': localStorage.getItem('tokenauth') || '',
              },
              body: formData,
            });
            
            if (response.ok) {
              console.log('Upload successful on attempt', retryCount + 1);
              break;
            } else if (response.status === 413 || response.status === 400) {
              // Don't retry for client errors
              break;
            } else {
              retryCount++;
              if (retryCount <= maxRetries) {
                console.log(`Retrying in 1 second... (${retryCount}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          } catch (error) {
            console.error('Network error:', error);
            retryCount++;
            if (retryCount <= maxRetries) {
              console.log(`Retrying in 1 second... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        if (!response) {
          console.error('No response received after all retries');
          toast.error('Network error, please try again');
          
          // Fallback: Send as text message
          socket.emit("sendMessage", {
            chatId,
            content: `📷 Image: ${selectedImage.name}\n${content}`,
          });
          return;
        }

        console.log('Response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('Image upload success:', result);
          
          // Add message to local state
          dispatch(addMessage(result.data));
          
          // Send via Socket.io for real-time update
          socket.emit("sendMessage", {
            chatId,
            content: `📷 Image: ${selectedImage.name}\n${content}`,
          });
          
          toast.success("Image sent successfully!");
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Image upload failed:', errorData);
          console.error('Response status:', response.status);
          console.error('Response headers:', response.headers);
          
          // Show specific error message
          let errorMessage = 'Failed to send image';
          if (response.status === 413) {
            errorMessage = 'Image file too large (max 5MB)';
          } else if (response.status === 401) {
            errorMessage = 'Please login again';
          } else if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid image format';
          } else if (response.status >= 500) {
            errorMessage = 'Server error, please try again';
          }
          
          toast.error(errorMessage);
          
          // Fallback: Send as text message with image info
          console.log('Falling back to text message');
          socket.emit("sendMessage", {
            chatId,
            content: `📷 Image: ${selectedImage.name}\n${content}`,
          });
        }
      } else {
        // Send text message via Socket.io only
        socket.emit("sendMessage", {
          chatId,
          content: content,
        });
      }
      
      setContent("");
      setSelectedImage(null);
      setImagePreview("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  if (!isOpen) {
    return (
      <div 
        ref={chatRef}
        className="fixed z-50"
        style={{
          left: position.x,
          top: position.y
        }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenChat();
          }}
          onMouseDown={(e) => {
            // Only handle dragging if clicking on the button itself, not the content
            if (e.target === e.currentTarget) {
              handleMouseDown(e);
            }
          }}
          className="relative bg-white hover:bg-gray-50 text-gray-700 p-3 md:p-4 rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center transition-all duration-300 transform hover:scale-105 group"
          aria-label="Chat with Support"
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
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'w-72 md:w-80 h-16' : 'w-80 md:w-96 h-[400px] md:h-[500px] max-h-[60vh] md:max-h-[70vh]'
      }`}>
        {/* Header */}
        <div 
          className="p-4 bg-white border-b border-gray-100"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full absolute -top-1 -right-1 animate-pulse"></div>
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="hidden sm:block">
                <h3 className="text-sm font-semibold text-gray-900">Customer Support</h3>
                <p className="text-xs text-green-600 font-medium">
                  {adminUsers.length > 0 ? 'Available' : 'Always Available'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Search Bar */}
            {showSearch && (
              <div className="p-3 bg-gray-50 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 text-sm" style={{ height: 'calc(100% - 200px)' }}>
              {/* Image Preview */}
              {imagePreview && (
                <div className="flex justify-end mb-2">
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

              {messageLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-xs">Start a conversation!</p>
                </div>
              ) : (
                (searchQuery ? filteredMessages : messages).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                                         <div
                       className={`max-w-[75%] px-4 py-3 rounded-2xl relative group ${
                         msg.senderId === user?.id
                           ? "bg-blue-600 text-white shadow-sm"
                           : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                       }`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedMessage(selectedMessage === msg.id ? null : msg.id);
                      }}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {msg.Sender?.username || "Unknown"}
                      </div>
                      {/* Display image if message has imageUrl */}
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
                              {msg.read && <CheckCheck className="w-3 h-3 text-blue-400" />}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Message Actions */}
                      {selectedMessage === msg.id && (
                        <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-10">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleMessageReaction(msg.id, "❤️")}
                              className="p-1 hover:bg-gray-100 rounded text-sm"
                            >
                              ❤️
                            </button>
                            <button
                              onClick={() => handleMessageReaction(msg.id, "👍")}
                              className="p-1 hover:bg-gray-100 rounded text-sm"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => handleMessageReaction(msg.id, "👎")}
                              className="p-1 hover:bg-gray-100 rounded text-sm"
                            >
                              👎
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="ml-2">{typingUser ? `${typingUser} is typing...` : "Someone is typing..."}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              {/* Attachment Menu */}
              {showAttachments && (
                <div className="mb-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center p-3 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Image className="w-6 h-6 text-blue-600 mb-2" />
                      <span className="text-xs text-gray-600 font-medium">Image</span>
                    </button>
                    <button
                      onClick={handleLocationShare}
                      className="flex flex-col items-center p-3 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      <MapPin className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs text-gray-600 font-medium">Location</span>
                    </button>
                    <button
                      onClick={handleVoiceRecording}
                      className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                        isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-orange-100'
                      }`}
                    >
                      <Mic className={`w-6 h-6 mb-2 ${isRecording ? 'text-red-600 animate-pulse' : 'text-orange-600'}`} />
                      <span className="text-xs text-gray-600 font-medium">{isRecording ? 'Recording' : 'Voice'}</span>
                    </button>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex flex-col items-center p-3 rounded-xl hover:bg-yellow-100 transition-colors"
                    >
                      <Smile className="w-6 h-6 text-yellow-600 mb-2" />
                      <span className="text-xs text-gray-600 font-medium">Emoji</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mb-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="grid grid-cols-8 gap-2">
                    {['😀', '😂', '❤️', '👍', '👎', '🎉', '🔥', '💯', '😍', '🤔', '😭', '😡', '🥳', '🤩', '😎', '🤗'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setContent(content + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <input
                  type="text"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    socket.emit("typing", { chatId, userId: user?.id });
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Type your message..."
                />
                
                <button
                  onClick={handleSend}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget; 
