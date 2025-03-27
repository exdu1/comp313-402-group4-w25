// client/src/routes/chatPage/ChatPage.jsx
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import './chatPage.css';

const ChatPage = () => {
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const messagesEndRef = useRef(null);
    
    // Get conversation ID from URL
    const conversationId = searchParams.get('conversation');

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
                const res = await axios.get('http://localhost:3001/api/conversations', {
                    withCredentials: true
                });
                
                setConversations(res.data.data);
                
                // If no conversation is specified, redirect to the first one or create new
                if (!conversationId) {
                    if (res.data.data.length > 0) {
                        navigate(`/chat?conversation=${res.data.data[0]._id}`);
                    } else {
                        createNewConversation();
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        
        fetchConversations();
    }, [isAuthenticated, conversationId, navigate]);

    // Fetch messages for the current conversation
    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationId || !isAuthenticated) return;
            
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:3001/api/conversations/${conversationId}/messages`, {
                    withCredentials: true
                });
                
                // Transform messages to the expected format
                const formattedMessages = res.data.data.map(msg => ({
                    message: msg.content,
                    summary: msg.summary || '',
                    question: msg.question || '',
                    isUser: msg.isUser
                }));
                
                setHistory(formattedMessages);
            } catch (err) {
                console.error(err);
                setError('Failed to load messages');
            } finally {
                setLoading(false);
            }
        };
        
        fetchMessages();
    }, [conversationId, isAuthenticated]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    // Create new conversation
    const createNewConversation = async () => {
        try {
            const res = await axios.post('http://localhost:3001/api/conversations', {
                title: 'New Conversation'
            }, {
                withCredentials: true
            });
            
            navigate(`/chat?conversation=${res.data.data._id}`);
        } catch (err) {
            console.error(err);
            setError('Failed to create new conversation');
        }
    };

    // Send message
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!message.trim()) return;
        if (!conversationId) {
            setError('No active conversation');
            return;
        }
        
        try {
            // Optimistically update UI
            setHistory(prevHistory => [
                ...prevHistory,
                { message: message, isUser: true }
            ]);
            
            // Clear input
            setMessage("");
            
            // Send to API
            const response = await axios.post(`http://localhost:3001/api/conversations/${conversationId}/messages`, {
                content: message
            }, {
                withCredentials: true
            });
            
            // Add AI response to history
            const aiResponse = response.data.data.aiMessage;
            
            setHistory(prevHistory => [
                ...prevHistory,
                {
                    message: aiResponse.content,
                    summary: aiResponse.summary || '',
                    question: aiResponse.question || '',
                    isUser: false
                }
            ]);
        } catch (error) {
            console.error('Error during message send:', error);
            setError('Failed to send message');
        }
    };

    const handleChange = (e) => {
        setMessage(e.target.value);
    };

    // Get current conversation title
    const getCurrentConversationTitle = () => {
        if (!conversationId) return 'Calming Echo';
        const currentConv = conversations.find(c => c._id === conversationId);
        return currentConv ? currentConv.title : 'Calming Echo';
    };

    // Toggle drawer
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    // Switch conversation
    const switchConversation = (id) => {
        navigate(`/chat?conversation=${id}`);
        setIsDrawerOpen(false);
    };

    // Loading state
    if (loading && history.length === 0) {
        return (
            <div className="chat-page loading">
                <div className="spinner"></div>
                <p>Loading conversation...</p>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* Sidebar/Drawer for conversations */}
            <div className={`conversations-drawer ${isDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h2>Your Conversations</h2>
                    <button className="close-drawer" onClick={toggleDrawer}>×</button>
                </div>
                
                <div className="drawer-content">
                    <button className="new-chat-btn" onClick={createNewConversation}>
                        New Conversation
                    </button>
                    
                    <div className="conversations-list">
                        {conversations.map(conv => (
                            <div 
                                key={conv._id} 
                                className={`conversation-item ${conv._id === conversationId ? 'active' : ''}`}
                                onClick={() => switchConversation(conv._id)}
                            >
                                {conv.title}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="drawer-footer">
                    <Link to="/dashboard" className="manage-conversations-btn">
                        Manage Conversations
                    </Link>
                </div>
            </div>

            <div className="chat-container">
                <div className="chat-header">
                    <button className="menu-button" onClick={toggleDrawer}>☰</button>
                    <h2>{getCurrentConversationTitle()}</h2>
                </div>
                
                {error && (
                    <div className="error-alert">
                        {error}
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}
                
                <div className="messages-container">
                    {history.length === 0 ? (
                        <div className="empty-chat">
                            <h3>Welcome to Calming Echo</h3>
                            <p>Start chatting with your AI active listening companion</p>
                        </div>
                    ) : (
                        history.map((entry, index) => (
                            <div key={index} className={entry.isUser ? 'user-message' : 'ai-message'}>
                                <p>{entry.message}</p>
                                {!entry.isUser && entry.summary && <p className="summary">{entry.summary}</p>}
                                {!entry.isUser && entry.question && <p className="question">{entry.question}</p>}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="input-container" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Type your message..." 
                        onChange={handleChange} 
                        value={message}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !message.trim()}>
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;