import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppStore } from './store';
import { lightTheme, darkTheme } from './theme';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import FormBuilder from './pages/FormBuilder';
import PublicForm from './pages/PublicForm';
import Upgrade from './pages/Upgrade';
import FunnelBuilderV2 from './pages/FunnelBuilderV2';

function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isPublicForm = location.pathname.startsWith('/p/');

  return (
    <>
      {!isPublicForm && <Navbar />}
      {children}
    </>
  );
}

function App() {
  const themeMode = useAppStore((state) => state.themeMode);

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/analytics/:id" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/builder/:id?" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
            <Route path="/funnel-builder/:id?" element={<ProtectedRoute><FunnelBuilderV2 /></ProtectedRoute>} />
            <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
            <Route path="/p/:public_id" element={<PublicForm />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
