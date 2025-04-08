import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Sidebar.css"; 

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
        {isOpen ? <X /> : <Menu />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2>HISTORY</h2>
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </div>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
