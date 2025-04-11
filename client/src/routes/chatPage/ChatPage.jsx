import { useState } from 'react';
import './chatPage.css';

const ChatPage = () => {
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([]);

    const getTimeStamp = () => {
        return new Date().toLocaleTimeString(); // Formats time as HH:MM:SS AM/PM
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) return; // Prevents sending empty messages

        const userMessage = {
            message: message,
            isUser: true,
            timestamp: getTimeStamp()
        };

        setHistory(prevHistory => [...prevHistory, userMessage]);
        setMessage(""); // Clears input field

        try {
            const response = await fetch('http://localhost:3001/api/active-listener', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history, isUser: true }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reply = await response.json();
            reply.timestamp = getTimeStamp(); // Adds timestamp to AI response

            setHistory(prevHistory => [...prevHistory, reply]);
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
            <div className="chat-container">
                <div className="chat-header">
                    <h2>Calming Echo Active Listener</h2>
                    <p>How are you feeling today?</p>
                </div>

                <div className="messages-container">
                    {history.map((entry, index) => (
                        <div key={index} className={entry.isUser ? 'user-message' : 'ai-message'}>
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
                    <input type='submit' />
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
