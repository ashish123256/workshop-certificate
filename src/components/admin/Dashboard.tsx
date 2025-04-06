import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WorkshopForm from './WorkshopForm';
import WorkshopList from './WorkshopList';
import Analytics from './Analytics';
import CertificateTemplates from './CertificateTemplates';
import ExportData from './ExportData';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'workshops' | 'analytics' | 'templates' | 'export'>('workshops');
  const [showForm, setShowForm] = useState(false);

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4">Unauthorized Access</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/5 bg-white p-4 rounded shadow">
          <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('workshops')}
              className={`w-full text-left px-4 py-2 rounded ${activeTab === 'workshops' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            >
              Workshops
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-4 py-2 rounded ${activeTab === 'analytics' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full text-left px-4 py-2 rounded ${activeTab === 'templates' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            >
              Certificate Templates
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`w-full text-left px-4 py-2 rounded ${activeTab === 'export' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            >
              Export Data
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="md:w-4/5">
          {activeTab === 'workshops' && (
            <div className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Workshop Management</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {showForm ? 'View Workshops' : 'Create New Workshop'}
                </button>
              </div>

              {showForm ? (
                <WorkshopForm setShowForm={setShowForm} />
              ) : (
                <WorkshopList />
              )}
            </div>
          )}

          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'templates' && <CertificateTemplates />}
          {activeTab === 'export' && <ExportData />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;