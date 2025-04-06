import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { exportToCSV } from '../../utils/export';
import Notification from '../Shared/Notification';

const ExportData = () => {
  const [exportType, setExportType] = useState<'workshops' | 'submissions'>('workshops');
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let data = [];
      
      if (exportType === 'workshops') {
        const querySnapshot = await getDocs(collection(firestore, 'workshops'));
        data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate().toISOString()
        }));
      } else {
        const querySnapshot = await getDocs(collection(firestore, 'submissions'));
        data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate().toISOString()
        }));
      }
      
      exportToCSV(data, `${exportType}-export-${new Date().toISOString().slice(0,10)}.csv`);
      setNotification({ type: 'success', message: 'Data exported successfully' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setNotification({ type: 'error', message: 'Failed to export data' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-6">Export Data</h2>
      
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Data to Export</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="exportType"
                value="workshops"
                checked={exportType === 'workshops'}
                onChange={() => setExportType('workshops')}
              />
              <span className="ml-2">Workshops</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="exportType"
                value="submissions"
                checked={exportType === 'submissions'}
                onChange={() => setExportType('submissions')}
              />
              <span className="ml-2">Submissions</span>
            </label>
          </div>
        </div>
        
        <div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`px-4 py-2 rounded text-white ${
              isExporting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isExporting ? 'Exporting...' : 'Export to CSV'}
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <h3 className="font-medium mb-2">Export Information</h3>
          <p className="text-sm text-gray-600">
            {exportType === 'workshops' 
              ? 'This will export all workshop data including names, dates, and statuses.'
              : 'This will export all student submissions including feedback and contact information.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportData;