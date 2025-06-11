// frontend/src/pages/RepairerMessagesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, User, Loader } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getRepairerConversations, getConversationMessages, sendMessage } from '../../../services/apiService';

const RepairerMessagesPage = () => {
  const { repairer } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null); // Stores conversation summary from list
  const [currentMessages, setCurrentMessages] = useState([]); // Stores detailed messages for selected chat
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      if (!repairer || !repairer._id) {
        setLoadingConversations(false);
        setError("Repairer not logged in or ID is missing.");
        return;
      }
      setLoadingConversations(true);
      setError(null);
      try {
        const fetchedConversations = await getRepairerConversations();
        setConversations(fetchedConversations);
        // Automatically select the first conversation if available
        if (fetchedConversations.length > 0) {
          handleChatSelect(fetchedConversations[0]);
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err.message || "Failed to load conversations. Please try again.");
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [repairer]);

  // Fetch messages for selected chat
  const handleChatSelect = async (conversationSummary) => {
    setSelectedChat(conversationSummary);
    setLoadingMessages(true);
    setCurrentMessages([]); // Clear previous messages
    setError(null);
    try {
      // Use serviceId as the identifier for fetching messages
      const fetchedMessagesData = await getConversationMessages(conversationSummary.serviceId);
      setCurrentMessages(fetchedMessagesData.messages);
    } catch (err) {
      console.error("Error fetching messages for conversation:", err);
      setError(err.message || "Failed to load messages for this chat.");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, loadingMessages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      const messageContent = newMessage.trim();
      const tempId = Date.now(); // Temporary ID for optimistic update
      const newMsgObj = {
        _id: tempId,
        senderId: repairer._id,
        senderName: repairer.fullname, // Frontend knows sender name
        text: messageContent,
        createdAt: new Date().toISOString(),
        isSending: true, // Mark as sending for UI feedback
      };

      // Optimistically update UI
      setCurrentMessages(prev => [...prev, newMsgObj]);
      setNewMessage('');
      scrollToBottom();

      try {
        const response = await sendMessage(selectedChat.id, messageContent); // selectedChat.id is Conversation ID
        console.log("Message sent:", response);
        // Update the optimistically added message with real data/ID
        setCurrentMessages(prev => prev.map(msg =>
          msg._id === tempId ? { ...msg, _id: response.newMessage._id, isSending: false } : msg
        ));

        // Update the last message in conversations list
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === selectedChat.id
              ? {
                  ...conv,
                  lastMessage: messageContent,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  unread: false // If I send a message, it's not unread for me
                }
              : conv
          )
        );

      } catch (err) {
        console.error("Failed to send message:", err);
        setError(err.message || "Failed to send message.");
        // Revert optimistic update or show error for failed message
        setCurrentMessages(prev => prev.filter(msg => msg._id !== tempId));
      }
    }
  };

  if (!repairer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in as a repairer to view messages.</p>
          <Link to="/repairer/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loadingConversations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error && !conversations.length && !selectedChat) { // Show general error if no conversations loaded at all
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Messages</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link to="/repairer/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row h-[70vh]">
        {/* Sidebar for chat list */}
        <div className="w-full md:w-1/3 border-r border-gray-200 pr-4 md:pr-8 overflow-y-auto flex-none">
          <div className="flex items-center space-x-4 mb-8">
            <Link to="/repairer/dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-7 h-7 mr-2 text-blue-600" />
              Messages
            </h1>
          </div>

          <ul className="space-y-4">
            {conversations.length === 0 ? (
              <li className="text-center text-gray-500 py-4">No conversations yet.</li>
            ) : (
              conversations.map((conv) => (
                <li
                  key={conv.id}
                  onClick={() => handleChatSelect(conv)}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors
                    ${selectedChat?.id === conv.id ? 'bg-blue-100 shadow-md' : 'bg-gray-50 hover:bg-gray-100'}
                    ${conv.unread ? 'border-l-4 border-blue-500 font-semibold' : ''}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-gray-900 font-medium">{conv.sender}</div>
                    <div className="text-gray-600 text-sm truncate">{conv.lastMessage}</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-auto">{conv.time}</div>
                  {conv.unread && <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>}
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Chat window */}
        <div className="flex-1 pl-4 md:pl-8 flex flex-col pt-8 md:pt-0">
          {selectedChat ? (
            <>
              <div className="flex-none pb-4 border-b border-gray-200 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chat with {selectedChat.sender}</h2>
                <p className="text-gray-600 text-sm">Service: {selectedChat.title}</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {loadingMessages ? (
                  <div className="text-center py-10">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 mt-2">Loading messages...</p>
                  </div>
                ) : (
                  currentMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No messages in this conversation yet.</div>
                  ) : (
                    currentMessages.map((chatMsg, index) => (
                      <div
                        key={chatMsg._id || index}
                        className={`p-3 rounded-lg max-w-[80%] ${
                          chatMsg.senderId === repairer._id ? 'bg-blue-100 ml-auto' : 'bg-gray-100 self-start'
                        }`}
                      >
                        <p className="font-semibold text-xs text-gray-600 mb-1">
                          {chatMsg.senderId === repairer._id ? 'You' : chatMsg.senderName || selectedChat.sender}:
                        </p>
                        <p className="text-gray-800">{chatMsg.text}</p>
                        <span className="text-xs text-gray-500 block mt-1 text-right">
                          {new Date(chatMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {chatMsg.isSending && (
                          <span className="text-xs text-gray-400 block text-right">Sending...</span>
                        )}
                      </div>
                    ))
                  )
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex-none pt-4 border-t border-gray-200 mt-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    disabled={loadingMessages} // Disable input while messages are loading
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newMessage.trim() || loadingMessages}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg">
              Select a conversation from the left to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairerMessagesPage;