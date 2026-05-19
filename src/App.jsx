import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Хуудсуудаа импортлох (таны жижиг үсгээр нэрлэсэн бүтцээр)
import Landing from './pages/01-landing/landing';
import Login from './pages/02-login/login';
import Otp from './pages/03-otp/otp';
import Setup from './pages/04-setup/setup';
import Discover from './pages/05-discover/discover';
import Schedule from './pages/06-schedule/schedule';
import Chat from './pages/07-chat/chat';
import Premium from './pages/08-premium/premium';
import Admin from './pages/09-admin/admin';

function App() {
  return (
    <Router>
      <Routes>
        {/* Аль зам (path) дээр ямар компонент харуулахыг заана */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;