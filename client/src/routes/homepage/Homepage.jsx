import { Link, useNavigate } from 'react-router-dom';
import './homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  // Check for token in localStorage
  const token = localStorage.getItem('token');

  // Handler for the "Start Chatting" button
  const handleStartChatting = () => {
    if (token) {
      navigate('/chat');
    } else {
      navigate('/signin');
    }
  };

  return (
    <>
      <img src="../../../CalmBoat.jpg" alt="Calm Boat" className="background-img" />
      <div className="homepage">
        {/* Top right sign in / signed in button */}
        <div className="top-right">
          {token ? (
            <button className="top-button" disabled>
              Signed in
            </button>
          ) : (
            <Link to="/signin" className="top-button">
              Sign In
            </Link>
          )}
        </div>

        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&display=swap"
            rel="stylesheet"
          />
        </head>
        <img src="../../../TechPattern.png" alt="Tech Pattern" />
        <div className="hero">
          <h1>Welcome to Calming Echo</h1>
          <h2>"Your AI Active Listening Companion"</h2>
        </div>
        <div className="actions">
          <button onClick={handleStartChatting} className="cta-button">
            S T A R T &nbsp; C H A T T I N G
          </button>
        </div>
      </div>
    </>
  );
};

export default Homepage;
