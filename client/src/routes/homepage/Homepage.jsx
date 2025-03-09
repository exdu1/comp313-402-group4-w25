import { Link } from 'react-router-dom';
import './homepage.css'

const Homepage = () => {
    return (
      <>
        <img src="../../../CalmBoat.jpg" alt=""  className='background-img'/>
        <div className="homepage">
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet"/>
          </head>
          <img src="../../../TechPattern.png" alt="" />
          <div className="hero">
            <h1>Welcome to Calming Echo</h1>
            <h2>"Your AI Active Listening Companion"</h2>
          </div>
          <div className="actions">
              <Link to="/chat" className="cta-button">S T A R T &nbsp;  C H A T T I N G</Link>
          </div>
        </div>  
      </>
    )
      
};

export default Homepage;