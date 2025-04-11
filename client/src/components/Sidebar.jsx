import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Sidebar.css"; 

const Sidebar = ({ history, onLoadConversation }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (id) => {
    onLoadConversation(id); 
    setIsOpen(false); 
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
        {isOpen ? <X /> : <Menu />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2>HISTORY</h2>
        <ul>
          {history && history.length > 0 ? (
            history.map((conversation) => (
              <li key={conversation._id}>
                <button className="history-btn" value={conversation._id} onClick={() => handleClick(conversation._id)}>
                  {conversation._id}
                </button>
              </li>
            ))
          ) : (
            <li>No conversation history found.</li>
          )}
        </ul>
      </div>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
