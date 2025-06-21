import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { getSocket, joinChatRoom, sendMessage, onEvent, offEvent } from '../../services/socketService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

const ChatWindow = ({ conversationId, participantRole }) => {
  const { user, repairer } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [chatEnded, setChatEnded] = useState(false);
  const [chatEndedReason, setChatEndedReason] = useState(null);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);

  const currentUserId = participantRole === 'user' ? user?._id : repairer?._id;
  const currentUserModel = participantRole === 'user' ? 'User' : 'Repairer';

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setChatError("No conversation selected or user not logged in. Please select a chat to begin.");
      setLoadingMessages(false);
      return;
    }

    const socket = getSocket();

    if (!socket) {
      setChatError("Chat service not available. Please refresh the page.");
      setLoadingMessages(false);
      return;
    }

    setMessages([]);
    setNewMessage('');
    setLoadingMessages(true);
    setChatEnded(false);
    setChatEndedReason(null);
    setChatError(null);

    joinChatRoom(conversationId);

    const handlePastMessages = (pastMsgs) => {
     
      setMessages(pastMsgs);
      setLoadingMessages(false);
      scrollToBottom();
    };

    const handleReceiveMessage = (msg) => {

      setMessages((prevMessages) => [...prevMessages, msg]);
      scrollToBottom();
    };

    const handleChatEnded = (reason) => {
      console.warn("Chat ended:", reason);
      setChatEnded(true);
      setChatEndedReason(reason);
      toast.error(`Chat ended: ${reason}`);
    };

    const handleChatError = (err) => {
      console.error("Chat error:", err);
      setChatError(err);
      toast.error(`Chat error: ${err}`);
      setLoadingMessages(false);
    };

    onEvent('pastMessages', handlePastMessages);
    onEvent('receiveMessage', handleReceiveMessage);
    onEvent('chatEnded', handleChatEnded);
    onEvent('chatError', handleChatError);

    return () => {
      offEvent('pastMessages', handlePastMessages);
      offEvent('receiveMessage', handleReceiveMessage);
      offEvent('chatEnded', handleChatEnded);
      offEvent('chatError', handleChatError);
    };
  }, [conversationId, currentUserId, participantRole, setLoadingMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && !chatEnded) {
      const messageData = {
        conversationId,
        senderId: currentUserId,
        senderModel: currentUserModel,
        message: newMessage.trim(),
      };
      sendMessage(messageData);
      setNewMessage('');
    }
  };

  if (chatError && !loadingMessages && messages.length === 0 && !chatEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600 bg-red-50 p-4 sm:p-6 rounded-xl text-center shadow-md border border-red-200 font-lexend">
        <MessageCircle className="w-8 h-8 mb-3 sm:w-10 sm:h-10 sm:mb-4 text-red-500" />
        <p className="font-semibold text-base sm:text-lg text-[#2C2C2C] mb-1 sm:mb-2">Chat Error</p>
        <p className="text-sm sm:text-base text-[#2C2C2C]">{chatError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F9F6F1] rounded-xl shadow-md border border-gray-200 font-lexend overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar-light">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8CC76E]">
            <LoadingSpinner className="w-8 h-8 mb-3 sm:mb-4 animate-spin" />
            <p className="text-sm sm:text-base">Loading messages...</p>
          </div>
        ) : messages.length === 0 && !chatEnded ? (
          <div className="flex items-center justify-center h-full text-[#2C2C2C] text-sm sm:text-base">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg._id || index}
              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-2 rounded-xl max-w-[85%] sm:max-w-[75%] break-words shadow-sm ${
                  msg.senderId === currentUserId
                    ? 'bg-[#8CC76E] text-white rounded-br-none'
                    : 'bg-gray-100 text-[#2C2C2C] rounded-bl-none'
                }`}
              >
                <p className={`font-semibold text-xs sm:text-sm mb-0.5 ${msg.senderId === currentUserId ? 'text-green-100' : 'text-gray-600'}`}>
                  {msg.senderId === currentUserId ? 'You' : msg.senderName || 'Participant'}
                </p>
                <p className="text-sm sm:text-base mb-0.5">{msg.message || msg.text}</p>
                <span className={`text-xs opacity-75 mt-0.5 block text-right ${msg.senderId === currentUserId ? 'text-green-200' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 bg-white">
        {chatEnded ? (
          <p className="text-red-600 text-center font-semibold text-sm sm:text-base">
            Chat is closed. {chatEndedReason ? `(${chatEndedReason})` : ''}
          </p>
        ) : (
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8CC76E] placeholder-gray-400 text-[#2C2C2C] text-sm sm:text-base"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={loadingMessages || chatEnded}
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#8CC76E] text-white p-2 rounded-xl hover:bg-[#72A658] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              disabled={!newMessage.trim() || loadingMessages || chatEnded}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;