// frontend/src/pages/user/messages/UserMessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Loader, User2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getUserConversations } from '../../../services/apiService';
import ChatWindow from '../../../components/Chat/ChatWindow';
import toast from 'react-hot-toast';

const UserMessagesPage = () => {
  const { user } = useAuthStore();
  const { conversationId: paramConversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || !user._id) {
        setLoadingConversations(false);
        setError("User not logged in or ID is missing.");
        return;
      }
      setLoadingConversations(true);
      setError(null);
      try {
        const fetchedConversations = await getUserConversations();
        // Filter out conversations that are not active
        const activeConversations = fetchedConversations.filter(conv => conv.isActive);
        setConversations(activeConversations);

        if (paramConversationId) {
          const preSelected = activeConversations.find(conv => conv.id === paramConversationId);
          if (preSelected) {
            setSelectedConversation(preSelected);
          } else if (activeConversations.length > 0) {
            setSelectedConversation(activeConversations[0]);
            toast.error("Conversation not found or is inactive. Displaying first available chat.");
          } else {
            setSelectedConversation(null); 
          }
        } else if (activeConversations.length > 0) {
          setSelectedConversation(activeConversations[0]);
        } else {
          setSelectedConversation(null); 
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err.response?.data?.message || err.message || "Failed to load conversations. Please try again.");
        toast.error("Failed to load conversations.");
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user, paramConversationId]);

  const handleChatSelect = (conversationSummary) => {
    setSelectedConversation(conversationSummary);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in as a user to view your messages.</p>
          <Link to="/user/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

  if (error && (!conversations.length && !selectedConversation)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Messages</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link to="/user/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row h-[70vh]">
        <div className="w-full md:w-1/3 border-r border-gray-200 pr-4 md:pr-8 overflow-y-auto flex-none custom-scrollbar">
          <div className="flex items-center space-x-4 mb-8">
            <Link to="/user/dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-7 h-7 mr-2 text-blue-600" />
              Messages
            </h1>
          </div>

          <ul className="space-y-4">
            {conversations.length === 0 ? (
              <li className="text-center text-gray-500 py-4">No active conversations.</li>
            ) : (
              conversations.map((conv) => (
                <li
                  key={conv.id}
                  onClick={() => handleChatSelect(conv)}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors
                    ${selectedConversation?.id === conv.id ? 'bg-blue-100 shadow-md' : 'bg-gray-50 hover:bg-gray-100'}
                    ${conv.unread ? 'border-l-4 border-blue-500 font-semibold' : ''}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                    <User2 className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-gray-900 font-medium">{conv.sender}</div>
                    <div className="text-gray-600 text-sm truncate">{conv.lastMessage}</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-auto flex-shrink-0">{conv.time}</div>
                  {conv.unread && <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="flex-1 pl-4 md:pl-8 flex flex-col pt-8 md:pt-0">
          {selectedConversation ? (
            <>
              <div className="flex-none pb-4 border-b border-gray-200 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chat with {selectedConversation.sender}</h2>
                <p className="text-gray-600 text-sm">Job: {selectedConversation.title}</p>
                {/* No need for this status check here as we only show active chats */}
              </div>
              <ChatWindow
                conversationId={selectedConversation.id}
                participantRole="user"
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg">
              {conversations.length === 0 ? "No active conversations to display." : "Select a conversation from the left to start chatting."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMessagesPage;