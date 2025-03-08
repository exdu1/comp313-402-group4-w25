import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './chatPage.css'

const ChatPage = () => {
    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-header">
                    <h2>Calming Echo Active Listener</h2>
                    <p>How are you feeling today?</p>
                </div>
                
                <div className="messages-container">

                </div>

                <form className="input-container" onSubmit= { handleSubmit }>
                    <input />
                    <button />
                </form>
            </div>
        </div>
    );
};

export default ChatPage;