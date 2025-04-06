import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, EyeIcon, LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../Shared/LoadingSpinner';
import Notification from '../Shared/Notification';
import { Workshop } from '../../types/types';

const WorkshopList = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const q = query(collection(firestore, 'workshops'));
        const querySnapshot = await getDocs(q);
        const workshopsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Workshop));
        setWorkshops(workshopsData);
      } catch (err) {
        setError('Failed to load workshops');
        console.error('Error fetching workshops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const toggleWorkshopStatus = async (workshopId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(firestore, 'workshops', workshopId), {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      setWorkshops(workshops.map(w => 
        w.id === workshopId ? { ...w, isActive: !currentStatus } : w
      ));
      setNotification({ type: 'success', message: 'Workshop status updated' });
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update status' });
      console.error('Error updating workshop status:', err);
    }
  };

  const deleteWorkshop = async (workshopId: string) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;
    
    try {
      await deleteDoc(doc(firestore, 'workshops', workshopId));
      setWorkshops(workshops.filter(w => w.id !== workshopId));
      setNotification({ type: 'success', message: 'Workshop deleted' });
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete workshop' });
      console.error('Error deleting workshop:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotification({ type: 'success', message: 'Link copied to clipboard' });
  };

  const filteredWorkshops = workshops.filter(workshop => {
    if (activeTab === 'active') return workshop.isActive;
    if (activeTab === 'inactive') return !workshop.isActive;
    return true;
  });

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="bg-white rounded shadow">
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Workshops</h2>
        <Link
          to="/workshops/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Workshop
        </Link>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          All Workshops
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 ${activeTab === 'active' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-600'}`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('inactive')}
          className={`px-4 py-2 ${activeTab === 'inactive' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-600'}`}
        >
          Inactive
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workshop</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWorkshops.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No workshops found
                </td>
              </tr>
            ) : (
              filteredWorkshops.map((workshop) => (
                <tr key={workshop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{workshop.workshopName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{workshop.collegeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">
                      {new Date(workshop.date).toLocaleDateString()} at {workshop.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        workshop.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {workshop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {workshop.uniqueLink && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 truncate max-w-xs">
                          {window.location.origin}/feedback/{workshop.uniqueLink}
                        </span>
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/feedback/${workshop.uniqueLink}`)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy link"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/workshops/${workshop.id}/view`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/workshops/${workshop.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => toggleWorkshopStatus(workshop.id, workshop.isActive)}
                        className={`${
                          workshop.isActive
                            ? 'text-yellow-600 hover:text-yellow-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={workshop.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <LinkIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteWorkshop(workshop.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkshopList;