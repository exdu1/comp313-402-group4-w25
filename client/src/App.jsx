import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './routes/chatPage/ChatPage';
import Homepage from './routes/homepage/Homepage';
import SigninPage from './routes/signinPage/SigninPage';
import SignUpPage from './routes/signUpPage/SignUpPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
