import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import apiConfig from '../../config/api';
import './chatPage.css';

const ChatPage = () => {
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([]);
    const [allConversations, setAllConversations] = useState([]);

    useEffect(() => {
        localStorage.setItem('conversation', null);
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.pullHistoryByUser}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                // const response = await fetch('http://localhost:3001/api/pullHistoryByUser', {
                //     method: 'GET',
                //     headers: {
                //         'Authorization': `Bearer ${token}`,
                //         'Content-Type': 'application/json',
                //     }
                // });
                if (!response.ok) throw new Error('Failed to fetch history');

                const data = await response.json();
                setAllConversations(data); 
            } catch (err) {
                console.error('Error fetching history:', err);
            }
        };

        fetchHistory();
    }, []);

    const loadConversationById = async (conversationId) => {
        try {
            localStorage.setItem('conversation', conversationId);
            const token = localStorage.getItem('token');

            const response = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.pullHistoryById(conversationId)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            // const response = await fetch(`http://localhost:3001/api/pullHistoryById/${conversationId}`, {
            //     method: 'GET',
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //     }
            // });

            if (!response.ok) throw new Error('Failed to fetch conversation');

            const data = await response.json();
            console.log("HERE IS THE CONVERSATION I FOUND: " + JSON.stringify(data));
            setHistory(data.history);
        } catch (err) {
            console.error("Error loading conversation by ID:", err);
        }
    };

    const getTimeStamp = () => {
        return new Date().toLocaleTimeString(); // Formats time as HH:MM:SS AM/PM
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let conversationId = localStorage.getItem('conversation');
        const token = localStorage.getItem('token');

        if (!message.trim()) return; // Prevents sending empty messages

        const userMessage = {
            message: message,
            isUser: true,
            timestamp: getTimeStamp()
        };

        setHistory(prevHistory => [...prevHistory, userMessage]);
        setMessage(""); // Clears input field

        try {
            const response = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.activeListener}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history, isUser: true }),
            });

            // const response = await fetch('http://localhost:3001/api/active-listener', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ message, history, isUser: true }),
            // });

            if (!response.ok) throw new Error('Network response was not ok');

            const reply = await response.json();
            reply.timestamp = getTimeStamp(); // Adds timestamp to AI response

            setHistory(prevHistory => [
                ...prevHistory,
                reply
            ]);

            const saveUserHistoryResponse = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.saveToHistory}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: 'user', 
                    message: message, 
                    conversationId: conversationId
                }),
            });
            // const saveUserHistoryResponse = await fetch('http://localhost:3001/api/saveToHistory', {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         sender: 'user', 
            //         message: message, 
            //         conversationId: conversationId
            //     }),
            // });

            const saveUserHistory = await saveUserHistoryResponse.json();
            console.log("HERE IS THE SAVED USER CONVERSAION " + JSON.stringify(saveUserHistory));
            if(conversationId === 'null'){
                conversationId = saveUserHistory._id;
            }

            const saveBotHistoryResponse = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.saveToHistory}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: 'bot', 
                    message: reply.summary + "\n" + reply.question,  
                    conversationId: conversationId
                }),
            });
            // const saveBotHistoryResponse = await fetch('http://localhost:3001/api/saveToHistory', {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         sender: 'bot', 
            //         message: reply.summary + "\n" + reply.question,  
            //         conversationId: conversationId
            //     }),
            // });
            
        } catch (error) {
            console.error('Error during fetch request:', error);
        }
    };

    const handleChange = (e) => {
        setMessage(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevents new line
            handleSubmit(e);
        }
    };

    return (
        <div className="chat-page">
            <Sidebar history={allConversations} onLoadConversation={loadConversationById} />
            <div className="chat-container">
                <div className="chat-header">
                    <h2>Calming Echo Active Listener</h2>
                    <p>How are you feeling today?</p>
                </div>

                <div className="messages-container">
                    {history.map((entry, index) => (
                        <div key={index} className={entry.sender == 'user' ? 'user-message' : 'ai-message'}>
                            <p>{entry.message}</p>
                            {entry.summary && <p>{entry.summary}</p>}
                            {entry.question && <p>{entry.question}</p>}
                            <small className="timestamp">{entry.timestamp}</small>
                        </div>
                    ))}
                </div>

                <form className="input-container" onSubmit={handleSubmit}>
                    <input 
                        type='text' 
                        onChange={handleChange} 
                        onKeyDown={handleKeyDown} 
                        value={message} 
                        placeholder="Type a message..."
                    />
                    <input type='submit' value="✔️" />
                </form>
            </div>
        </div>
    );
};

export default ChatPage;