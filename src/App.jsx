import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Rules from './pages/Rules';
import Players from './pages/Players';
import Teams from './pages/Teams';
import Bracket from './pages/Bracket';
import TeamDetail from './pages/TeamDetail';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminPlayers from './pages/Admin/Players';
import AdminTeams from './pages/Admin/Teams';
import AdminMatches from './pages/Admin/Matches';
import AdminRules from './pages/Admin/Rules';
import AdminSettings from './pages/Admin/Settings';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="rules" element={<Rules />} />
          <Route path="players" element={<Players />} />
          <Route path="teams" element={<Teams />} />
          <Route path="bracket" element={<Bracket />} />
          <Route path="teams/:id" element={<TeamDetail />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/players" element={<AdminPlayers />} />
        <Route path="/admin/teams" element={<AdminTeams />} />
        <Route path="/admin/matches" element={<AdminMatches />} />
        <Route path="/admin/rules" element={<AdminRules />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

