import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProjectDashboard from './features/projects/ProjectDashboard';
import UserDashboard from './features/users/UserDashboard';
import { useEffect } from 'react';
import { useTaskStore } from './store/useTaskStore';

function App() {
  const checkOverdueTasks = useTaskStore(state => state.checkOverdueTasks);

  useEffect(() => {
    // Check for overdue tasks on load and every minute
    checkOverdueTasks();
    const interval = setInterval(checkOverdueTasks, 60000);
    return () => clearInterval(interval);
  }, [checkOverdueTasks]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectDashboard />} />
          <Route path="/projects/:projectId" element={<ProjectDashboard />} />
          <Route path="/my-tasks" element={<UserDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
