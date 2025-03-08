import { Link } from 'react-router-dom';
import './homepage.css'

const Homepage = () => {
    return (
      <div className="homepage">
        <div className="hero">
          <h1>Welcome to Calming Echo, your AI Active Listening Companion</h1>
        </div>
        <div className="actions">
            <Link to="/chat" className="cta-button">Start Chatting</Link>
        </div>
      </div>  
    );
};

export default Homepage;