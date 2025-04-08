import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import './chatPage.css'

const ChatPage = () => {
    const [message, setMessage] = useState("");
    const [history , setHistory] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(message, history);

        setHistory(prevHistory => [
            ...prevHistory,
            { message: message, isUser: true }
        ]);

        try {
            const response = await fetch('http://localhost:3001/api/active-listener', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                    message: message,
                    history: history,
                    isUser: true
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reply = await response.json();

            setHistory(prevHistory => [
                ...prevHistory,
                reply
            ]);

            console.log(reply);
        }
        catch (error) {
            console.error('Error during fetch request:', error);
        }
    }

    const handleChange = (e) => {
        setMessage(e.target.value);
    }

    return (
        <div className="chat-page">
            <Sidebar></Sidebar>
            <div className="chat-container">
                <div className="chat-header">
                    <h2>Calming Echo Active Listener</h2>
                    <p>How are you feeling today?</p>
                </div>
                
                <div className="messages-container">
                    {history.map((entry, index) => (
                        <div key={index} className={entry.isUser ? 'user-message' : 'ai-message'}>
                            <p>{entry.message}</p>
                            <p>{entry.summary}</p>
                            <br />
                            <p>{entry.question}</p>
                        </div>
                    ))}
                </div>

                <form className="input-container" onSubmit={handleSubmit}>
                    <input type='text' onChange={handleChange} value={message}/>
                    <input type='submit' value="✔️"/>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
