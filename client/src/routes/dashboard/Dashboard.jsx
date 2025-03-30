// client/src/routes/dashboard/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import './dashboard.css';

const Dashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [renameMode, setRenameMode] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3001/api/conversations', {
          withCredentials: true
        });
        
        setConversations(res.data.data);
        
        // Set active conversation to the first one if none is selected
        if (res.data.data.length > 0 && !activeConversation) {
          setActiveConversation(res.data.data[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch conversations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [isAuthenticated, activeConversation]);

  // Create new conversation
  const createConversation = async () => {
    try {
      const res = await axios.post('http://localhost:3001/api/conversations', {
        title: 'New Conversation'
      }, {
        withCredentials: true
      });
      
      setConversations([...conversations, res.data.data]);
      setActiveConversation(res.data.data._id);
    } catch (err) {
      setError('Failed to create conversation');
      console.error(err);
    }
  };

  // Delete conversation
  const deleteConversation = async (id) => {
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:3001/api/conversations/${id}`, {
        withCredentials: true
      });
      
      // Update conversations list
      setConversations(conversations.filter(conv => conv._id !== id));
      
      // If active conversation was deleted, set active to the first one
      if (activeConversation === id) {
        const remaining = conversations.filter(conv => conv._id !== id);
        setActiveConversation(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch (err) {
      setError('Failed to delete conversation');
      console.error(err);
    }
  };

  // Start rename mode
  const startRename = (id, currentTitle) => {
    setRenameMode(id);
    setNewTitle(currentTitle);
  };

  // Cancel rename
  const cancelRename = () => {
    setRenameMode(null);
    setNewTitle('');
  };

  // Submit rename
  const submitRename = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3001/api/conversations/${id}`, {
        title: newTitle
      }, {
        withCredentials: true
      });
      
      // Update conversations list
      setConversations(
        conversations.map(conv => 
          conv._id === id ? { ...conv, title: newTitle } : conv
        )
      );
      
      // Exit rename mode
      setRenameMode(null);
      setNewTitle('');
    } catch (err) {
      setError('Failed to rename conversation');
      console.error(err);
    }
  };

  // Handle conversation selection
  const selectConversation = (id) => {
    setActiveConversation(id);
    navigate(`/chat?conversation=${id}`);
  };

  // Loading indicator
  if (loading && authLoading) {
    return (
      <div className="dashboard loading">
        <div className="spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your Conversations</h1>
        <button className="new-conversation-btn" onClick={createConversation}>
          New Conversation
        </button>
      </div>
      
      {error && <div className="error-alert">{error}</div>}
      
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>You don't have any conversations yet.</p>
            <button onClick={createConversation}>Start a new conversation</button>
          </div>
        ) : (
          conversations.map(conversation => (
            <div 
              key={conversation._id} 
              className={`conversation-item ${activeConversation === conversation._id ? 'active' : ''}`}
            >
              {renameMode === conversation._id ? (
                <div className="rename-form">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                  <div className="rename-actions">
                    <button onClick={() => submitRename(conversation._id)}>Save</button>
                    <button onClick={cancelRename}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="conversation-title"
                    onClick={() => selectConversation(conversation._id)}
                  >
                    {conversation.title}
                  </div>
                  <div className="conversation-actions">
                    <button onClick={() => startRename(conversation._id, conversation.title)}>
                      Rename
                    </button>
                    <button onClick={() => deleteConversation(conversation._id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;