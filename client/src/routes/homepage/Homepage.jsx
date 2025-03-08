import { Link } from 'react-router-dom';
import './homepage.css'

const Homepage = () => {
    return (
      <div className="homepage">
        <div className="actions">
            <Link to="/chat" className="cta-button">Start Chatting</Link>
        </div>
      </div>  
    );
};

export default Homepage;