// frontend/src/pages/RepairerMessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, User2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getRepairerConversations } from '../../../services/apiService';
import ChatWindow from '../../../components/Chat/ChatWindow';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/LoadingSpinner';

const RepairerMessagesPage = () => {
  const { repairer } = useAuthStore();
  const { conversationId: paramConversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const isMobileView = window.innerWidth < 768; 

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

        let conversationToSelect = null;
        if (paramConversationId) {
          conversationToSelect = fetchedConversations.find(conv => conv.id === paramConversationId);
          if (!conversationToSelect) {
            toast.error("Conversation not found.");
          }
        }

        if (!isMobileView && !conversationToSelect && fetchedConversations.length > 0) {
          conversationToSelect = fetchedConversations[0];
        }
        
        setSelectedConversation(conversationToSelect);

      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err.response?.data?.message || err.message || "Failed to load conversations. Please try again.");
        toast.error("Failed to load conversations.");
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [repairer, paramConversationId, isMobileView]);

  const handleChatSelect = (conversationSummary) => {
    setSelectedConversation(conversationSummary);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null); 
  };

  if (!repairer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in as a repairer to view messages.</p>
          <Link to="/repairer/login" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"> 
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loadingConversations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"> 
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" /> 
          
        </div>
      </div>
    );
  }

  if (error && (!conversations.length && !selectedConversation)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"> 
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Messages</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link to="/repairer/dashboard" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"> 
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-4 px-2 sm:px-4 md:py-12 md:px-6 lg:px-8 font-lexend"> 
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg flex flex-col h-[calc(100vh-32px)] md:h-[80vh] lg:h-[75vh] overflow-hidden"> 
        
        {isMobileView ? (
          selectedConversation ? (
            <div className="flex flex-col flex-1">
              <div className="bg-white p-3 border-b border-gray-200 flex items-center space-x-2">
                <button onClick={handleBackToConversations} className="p-1 rounded-full hover:bg-gray-100">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h2 className="text-xl font-semibold text-gray-800 truncate">
                  Chat with {selectedConversation.sender}
                </h2>
              </div>
              <ChatWindow
                conversationId={selectedConversation.id}
                participantRole="repairer"
              />
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className="flex items-center space-x-4 mb-4 p-4 border-b border-gray-200">
                <Link to="/repairer/dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MessageCircle className="w-7 h-7 mr-2 text-green-600" /> 
                  Messages
                </h1>
              </div>

              <ul className="flex-1 overflow-y-auto space-y-2 px-4 pb-4 custom-scrollbar">
                {conversations.length === 0 ? (
                  <li className="text-center text-gray-500 py-4">No conversations yet.</li>
                ) : (
                  conversations.map((conv) => (
                    <li
                      key={conv.id}
                      onClick={() => handleChatSelect(conv)}
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors border ${
                        selectedConversation?.id === conv.id
                          ? 'bg-green-50 border-green-200 shadow-sm'
                          : 'bg-gray-50 border-transparent hover:bg-gray-100'
                      }
                      ${conv.unread ? 'border-l-4 border-green-500 font-semibold' : ''}`} 
                    >
                      <div className="flex-shrink-0 w-9 h-9 bg-green-200 rounded-full flex items-center justify-center mr-2"> 
                        <User2 className="w-4 h-4 text-green-700" /> 
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-gray-900 font-medium text-sm truncate">{conv.sender}</div>
                        <div className="text-gray-600 text-xs truncate">{conv.lastMessage}</div>
                      </div>
                      <div className="text-xs text-gray-500 ml-2 flex-shrink-0 text-right">
                        {conv.time}
                        {conv.unread && <span className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1 inline-block"></span>} 
                      </div>
                      {!conv.isActive && (
                        <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full ml-1.5 flex-shrink-0">Closed</span>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )
        ) : (
          <div className="flex flex-row h-full">
            <div className="w-1/3 border-r border-gray-200 pr-4 md:pr-8 overflow-y-auto flex-none custom-scrollbar pb-4 md:pb-0">
              <div className="flex items-center space-x-4 mb-8">
                <Link to="/repairer/dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MessageCircle className="w-7 h-7 mr-2 text-green-600" /> 
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
                      className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors border ${
                        selectedConversation?.id === conv.id
                          ? 'bg-green-50 border-green-200 shadow-sm'
                          : 'bg-gray-50 border-transparent hover:bg-gray-100'
                      }
                      ${conv.unread ? 'border-l-4 border-green-500 font-semibold' : ''}`} 
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mr-3"> 
                        <User2 className="w-5 h-5 text-green-700" /> 
                      </div>
                      <div className="flex-grow">
                        <div className="text-gray-900 font-medium">{conv.sender}</div>
                        <div className="text-gray-600 text-sm truncate">{conv.lastMessage}</div>
                      </div>
                      <div className="text-xs text-gray-500 ml-2 flex-shrink-0 text-right">
                        {conv.time}
                        {conv.unread && <span className="w-2 h-2 bg-green-500 rounded-full ml-1 inline-block"></span>} 
                      </div>
                      {!conv.isActive && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">Closed</span>
                      )}
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
                    {!selectedConversation.isActive && (
                      <p className="text-red-500 text-sm mt-1 font-semibold">This chat is closed (Job {selectedConversation.serviceRequestStatus}).</p>
                    )}
                  </div>
                  <ChatWindow
                    conversationId={selectedConversation.id}
                    participantRole="repairer"
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                  Select a conversation from the left to start chatting.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairerMessagesPage;