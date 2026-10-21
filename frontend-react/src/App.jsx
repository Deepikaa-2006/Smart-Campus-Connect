import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { EventsPage } from './pages/EventsPage';
import { FeedbackPage } from './pages/FeedbackPage';

export function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If no user is logged in, show Login page
  if (!currentUser || activeTab === 'switch-account') {
    return <Login onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return <EventsPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'dashboard':
      default:
        if (currentUser.role === 'admin') {
          return <AdminDashboard />;
        } else if (currentUser.role === 'faculty') {
          return <FacultyDashboard />;
        } else {
          return <StudentDashboard />;
        }
    }
  };

  const pageTitles = {
    dashboard: `${currentUser.role.toUpperCase()} Academic Dashboard`,
    events: 'Campus Events & Workshops',
    feedback: 'Student Feedback & Grievances',
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      <div className="main-content">
        <Navbar 
          title={pageTitles[activeTab] || 'Campus Portal'} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
