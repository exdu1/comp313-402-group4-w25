// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ChatPage from './routes/chatPage/ChatPage';
import Homepage from './routes/homepage/Homepage';
import SigninPage from './routes/signinPage/SigninPage';
import SignUpPage from './routes/signUpPage/SignUpPage';
// import Dashboard from './routes/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/signin" element={<SigninPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route 
                        path="/chat" 
                        element={
                            <ProtectedRoute>
                                <ChatPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;