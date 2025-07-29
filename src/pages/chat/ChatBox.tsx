import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMessage, fetchChatMessages, sendMessage, Message } from "@/store/chatBoxSlice";
import { socket } from "@/App";
import { Send, Image, MapPin, Paperclip, X, Search, Mic, MoreVertical, Check, CheckCheck, Smile } from "lucide-react";
import toast from "react-hot-toast";


interface ChatBoxProps {
  chatId: string;
  userId: string;
  otherUserId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chatId, userId, otherUserId }) => {
  const dispatch = useAppDispatch();
  const { messages, messageLoading,  } = useAppSelector((state)=>state.chat);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

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
      }
    });

    // Listen for typing indicators
    socket.on("typing", (data: { chatId: string; userId: string }) => {
      if (data.chatId === chatId && data.userId !== userId) {
        setIsTyping(true);
        setTypingUser(data.userId);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    // Listen for new message notifications
    socket.on("newMessageNotification", (data: { chatId: string; sender: string }) => {
      if (data.chatId === chatId) {
        // You can show a toast notification here
        console.log(`New message from ${data.sender}`);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("newMessageNotification");
    };
  }, [chatId, dispatch]);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
        setShowAttachments(false);
      } else {
        toast.error("Please select an image file");
      }
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

  // Handle file attachment (removed as we're using direct image upload)
  // const handleFileAttachment = () => {
  //   fileInputRef.current?.click();
  // };

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

  const handleSend = () => {
    if (!content.trim() && !selectedImage) return;

    const message = {
      chatId,
      senderId: userId,
      receiverId: otherUserId,
      content: selectedImage ? `📷 Image: ${selectedImage.name}\n${content}` : content,
    };

    // Send via both Socket.io and REST API
    socket.emit("sendMessage", message);
    dispatch(sendMessage(chatId, selectedImage ? `📷 Image: ${selectedImage.name}\n${content}` : content));
    setContent("");
    setSelectedImage(null);
    setImagePreview("");
  };

  return (
    <div className="w-full max-w-md h-[500px] border-0 rounded-2xl flex flex-col shadow-2xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span>💬 Live Chat Support</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-white/20 rounded transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="text-xs opacity-75">Online</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-3 bg-gray-50 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-3 text-sm">
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
          <p className="text-center text-gray-400">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet</p>
        ) : (
          (searchQuery ? filteredMessages : messages).map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg relative group ${
                  msg.senderId === userId
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
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
                <div className="break-words">{msg.content}</div>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="opacity-75">{formatTime(msg.createdAt)}</span>
                  <div className="flex items-center space-x-1">
                    {msg.senderId === userId && (
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

        <div ref={endRef} />
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[75%] px-4 py-2 rounded-lg bg-gray-200 text-gray-600 text-sm">
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
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        {/* Attachment Menu */}
        {showAttachments && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Image className="w-6 h-6 text-blue-600 mb-1" />
                <span className="text-xs text-gray-600">Image</span>
              </button>
              <button
                onClick={handleLocationShare}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-green-100 transition-colors"
              >
                <MapPin className="w-6 h-6 text-green-600 mb-1" />
                <span className="text-xs text-gray-600">Location</span>
              </button>
              <button
                onClick={handleVoiceRecording}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-orange-100'
                }`}
              >
                <Mic className={`w-6 h-6 mb-1 ${isRecording ? 'text-red-600 animate-pulse' : 'text-orange-600'}`} />
                <span className="text-xs text-gray-600">{isRecording ? 'Recording' : 'Voice'}</span>
              </button>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <Smile className="w-6 h-6 text-yellow-600 mb-1" />
                <span className="text-xs text-gray-600">Emoji</span>
              </button>
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-8 gap-1">
              {['😀', '😂', '❤️', '👍', '👎', '🎉', '🔥', '💯', '😍', '🤔', '😭', '😡', '🥳', '🤩', '😎', '🤗'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setContent(content + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-2 hover:bg-gray-200 rounded text-lg transition-colors"
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
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              socket.emit("typing", { chatId, userId });
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            placeholder="Type your message..."
          />
          
          <button
            onClick={handleSend}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;