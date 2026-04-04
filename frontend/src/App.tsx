import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  const themeMode = useAppStore((state) => state.themeMode);

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/analytics/:id" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/builder/:id?" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
          <Route path="/p/:public_id" element={<PublicForm />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
