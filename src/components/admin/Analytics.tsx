import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../Shared/LoadingSpinner';
import { Workshop, Submission, AnalyticsData } from '../../types/types';


const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch workshops
        const workshopsQuery = query(collection(firestore, 'workshops'));
        const workshopsSnapshot = await getDocs(workshopsQuery);
        const workshops = workshopsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Workshop));

        // Fetch submissions
        const submissionsQuery = query(collection(firestore, 'submissions'));
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissions = submissionsSnapshot.docs.map(doc => ({
          ...doc.data()
        } as Submission));

        // Calculate analytics
        const totalWorkshops = workshops.length;
        const activeWorkshops = workshops.filter(w => w.isActive).length;
        const totalSubmissions = submissions.length;
        
        const submissionsByWorkshop = workshops.map(workshop => {
          const workshopSubmissions = submissions.filter(s => s.workshopId === workshop.id);
          const completionRate = workshopSubmissions.length > 0 
            ? Math.round((workshopSubmissions.filter(s => s.feedback).length / workshopSubmissions.length * 100)) : 0;
            
          return {
            workshopId: workshop.id,
            workshopName: workshop.workshopName,
            count: workshopSubmissions.length,
            completionRate
          };
        });

        const overallCompletionRate = totalSubmissions > 0
          ? Math.round((submissions.filter(s => s.feedback).length / totalSubmissions * 100))
          : 0;

        setAnalyticsData({
          totalWorkshops,
          activeWorkshops,
          totalSubmissions,
          completionRate: overallCompletionRate,
          submissionsByWorkshop
        });
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!analyticsData) return <div className="p-4">No analytics data available</div>;

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-6">Workshop Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Total Workshops</h3>
          <p className="text-2xl font-bold text-blue-900">{analyticsData.totalWorkshops}</p>
        </div>
        <div className="bg-green-50 p-4 rounded border border-green-100">
          <h3 className="text-sm font-medium text-green-800 mb-1">Active Workshops</h3>
          <p className="text-2xl font-bold text-green-900">{analyticsData.activeWorkshops}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded border border-purple-100">
          <h3 className="text-sm font-medium text-purple-800 mb-1">Total Submissions</h3>
          <p className="text-2xl font-bold text-purple-900">{analyticsData.totalSubmissions}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded border border-amber-100">
          <h3 className="text-sm font-medium text-amber-800 mb-1">Completion Rate</h3>
          <p className="text-2xl font-bold text-amber-900">{analyticsData.completionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-medium mb-4">Submissions by Workshop</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.submissionsByWorkshop}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="workshopName" 
                  tick={{ fontSize: 12 }} 
                  angle={-45} 
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#8884d8" 
                  name="Submissions" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Completion Rates</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.submissionsByWorkshop}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="workshopName" 
                  tick={{ fontSize: 12 }} 
                  angle={-45} 
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                />
                <Bar 
                  dataKey="completionRate" 
                  fill="#82ca9d" 
                  name="Completion Rate" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;