import { useState, useEffect } from 'react';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';
import { doc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import PDFPreview from '../Shared/PDFPreview';
import LoadingSpinner from '../Shared/LoadingSpinner';
import Notification from '../Shared/Notification';

const CertificateTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Get all templates from storage
        const listRef = ref(storage, 'certificate-templates/');
        const res = await listAll(listRef);
        
        // Get active template from Firestore
        const q = query(collection(firestore, 'settings'), where('key', '==', 'activeCertificateTemplate'));
        const querySnapshot = await getDocs(q);
        const activeTemplateDoc = querySnapshot.docs[0]?.data();
        
        const templateUrls = await Promise.all(
          res.items.map(async (item) => {
            const url = await getDownloadURL(item);
            return {
              name: item.name,
              url,
              isActive: activeTemplateDoc?.value === item.name
            };
          })
        );
        
        setTemplates(templateUrls);
        setActiveTemplate(activeTemplateDoc?.value || null);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setNotification({ type: 'error', message: 'Failed to load templates' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadTemplate = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      const fileName = `${uuidv4()}-${selectedFile.name}`;
      const fileRef = ref(storage, `certificate-templates/${fileName}`);
      await uploadBytes(fileRef, selectedFile);
      
      // Add to templates list
      const url = await getDownloadURL(fileRef);
      setTemplates([...templates, { name: fileName, url, isActive: false }]);
      
      setNotification({ type: 'success', message: 'Template uploaded successfully' });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading template:', error);
      setNotification({ type: 'error', message: 'Failed to upload template' });
    } finally {
      setUploading(false);
    }
  };

  const setAsActiveTemplate = async (templateName: string) => {
    try {
      // Update in Firestore
      const q = query(collection(firestore, 'settings'), where('key', '==', 'activeCertificateTemplate'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await addDoc(collection(firestore, 'settings'), {
          key: 'activeCertificateTemplate',
          value: templateName,
          updatedAt: new Date()
        });
      } else {
        await updateDoc(doc(firestore, 'settings', querySnapshot.docs[0].id), {
          value: templateName,
          updatedAt: new Date()
        });
      }
      
      // Update local state
      setActiveTemplate(templateName);
      setTemplates(templates.map(t => ({
        ...t,
        isActive: t.name === templateName
      })));
      
      setNotification({ type: 'success', message: 'Active template updated' });
    } catch (error) {
      console.error('Error setting active template:', error);
      setNotification({ type: 'error', message: 'Failed to set active template' });
    }
  };

  const deleteTemplate = async (templateName: string) => {
    if (templateName === activeTemplate) {
      setNotification({ type: 'error', message: 'Cannot delete active template' });
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      // Delete from storage
      const fileRef = ref(storage, `certificate-templates/${templateName}`);
      await deleteObject(fileRef);
      
      // Remove from local state
      setTemplates(templates.filter(t => t.name !== templateName));
      
      setNotification({ type: 'success', message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      setNotification({ type: 'error', message: 'Failed to delete template' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Certificate Templates</h2>
      
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Upload New Template</h3>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full md:w-auto"
          />
          <button
            onClick={uploadTemplate}
            disabled={!selectedFile || uploading}
            className={`px-4 py-2 rounded ${
              !selectedFile || uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Template'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">Only PDF files are supported</p>
      </div>
      
      <div>
      <h3 className="font-medium mb-2">Available Templates</h3>
        {templates.length === 0 ? (
          <p>No templates found. Upload your first template above.</p>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div 
                key={template.name} 
                className={`border rounded p-4 ${template.isActive ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    {template.isActive && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                        Active Template
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <PDFPreview url={template.url} />
                    
                    {!template.isActive && (
                      <button
                        onClick={() => setAsActiveTemplate(template.name)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Set as Active
                      </button>
                    )}
                    
                    {!template.isActive && (
                      <button
                        onClick={() => deleteTemplate(template.name)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateTemplates;