import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Preloader from './components/Preloader';
import LoginPage from './login/page';
import AdminLayout from './admin/page';
import { ToastProvider } from './hooks/useToast';

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  if (showPreloader) {
    return <Preloader onFinish={() => setShowPreloader(false)} />;
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;