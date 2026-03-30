import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalError } from './pages/GlobalError';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DriverDashboard } from './pages/DriverDashboard';
import { PassengerApp } from './pages/PassengerApp';
import { TripHistory } from './pages/TripHistory';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfileDashboard } from './pages/ProfileDashboard';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
        {/* Public-Only Access (Redirect if logged in) */}
        <Route element={<ProtectedRoute publicOnly={true} />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Public Discovery Node */}
        <Route path="/discover" element={<PassengerApp isPublic={true} />} />

        {/* Protected Core Node Control (All Identified Members) */}
        <Route element={<ProtectedRoute roles={['passenger', 'admin', 'driver', 'employee']} />}>
          <Route element={<Layout />}>
            <Route path="/ride" element={<PassengerApp />} />
            <Route path="/history" element={<TripHistory />} />
            <Route path="/profile" element={<ProfileDashboard />} />
          </Route>
        </Route>

        {/* Protected Driver Node Control */}
        <Route element={<ProtectedRoute roles={['driver', 'admin']} />}>
          <Route element={<Layout />}>
            <Route path="/driver" element={<DriverDashboard />} />
          </Route>
        </Route>

        {/* Admin Specific Terminal */}
        <Route element={<ProtectedRoute roles={['admin', 'employee']} />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Default Catch-all Node */}
        <Route path="*" element={<GlobalError code="404" />} />
      </Routes>
     </ErrorBoundary>
    </Router>
  );
}

export default App;
