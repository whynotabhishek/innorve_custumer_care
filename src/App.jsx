import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import LoginScreen from './components/LoginScreen';
import ChatPage from './pages/ChatPage';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = ({ name, memberId }) => {
    setUser({ name, memberId });
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<ChatPage user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
