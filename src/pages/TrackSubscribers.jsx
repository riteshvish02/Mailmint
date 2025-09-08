import React, { useState, useEffect } from 'react';
import axios from '../utils/Axios';
import { useParams } from 'react-router-dom';



const TrackSubscribers = () => {
  const { domain } = useParams();
  const [subscribers, setSubscribers] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dashboard summary state
  const [dashboard, setDashboard] = useState({
    total: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0
  });
  // Filter state
  const [trackFilter, setTrackFilter] = useState('all');
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  const fetchSubscribers = async (pageNum = 1, perPageNum = 20, filter = trackFilter) => {
    if (!domain) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/v1/track-subscribers/${domain}?perPage=${perPageNum}&page=${pageNum}&filter=${filter}`);
      setSubscribers(res.data.subscribers);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchSubscribers(newPage, perPage, trackFilter);
  };

  useEffect(() => {
    if (domain) fetchSubscribers(1, perPage, trackFilter);
    // eslint-disable-next-line
  }, [domain, perPage, trackFilter]);

    // Fetch dashboard summary
    useEffect(() => {
      if (!domain) return;
      setDashboardLoading(true);
      setDashboardError('');
      axios.get(`/api/v1/track-subscribers/${domain}/dashboard`)
        .then(res => {
          setDashboard(res.data);
        })
        .catch(err => {
          setDashboardError(err.response?.data?.error || 'Failed to fetch dashboard');
          setDashboard({
            total: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0
          });
        })
        .finally(() => setDashboardLoading(false));
    }, [domain]);

  // No need to filter on frontend, backend handles it
  const filteredSubscribers = subscribers;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-4">Track Subscribers</h2>
        <div className="mb-4">
          <button
            onClick={async () => {
              if (!domain) return;
              try {
                const res = await axios.get(`/api/v1/track-subscribers/${domain}/export`, {
                  responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${domain}-track.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                alert('Excel download failed!');
              }
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
          >
            Download Excel
          </button>
        </div>
        {/* Dashboard summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Dashboard Summary</h3>
          {dashboardLoading ? (
            <div>Loading dashboard...</div>
          ) : dashboardError ? (
            <div className="text-red-600">{dashboardError}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
              <div className="font-medium text-gray-700">Total: <span className="font-bold text-blue-900">{dashboard.total}</span></div>
              <div className="font-medium text-gray-700">Delivered: <span className="font-bold text-green-700">{dashboard.delivered}</span></div>
              <div className="font-medium text-gray-700">Opened: <span className="font-bold text-yellow-700">{dashboard.opened}</span></div>
              <div className="font-medium text-gray-700">Clicked: <span className="font-bold text-blue-700">{dashboard.clicked}</span></div>
              <div className="font-medium text-gray-700">Bounced: <span className="font-bold text-red-700">{dashboard.bounced}</span></div>
              <div className="font-medium text-gray-700">Unsubscribed: <span className="font-bold text-gray-700">{dashboard.unsubscribed}</span></div>
            </div>
          )}
        </div>
      <div className="flex items-center space-x-2 mb-6">
        <span className="font-semibold">Domain:</span>
        <span className="px-3 py-2 border rounded bg-gray-50">{domain}</span>
        <select
          value={perPage}
          onChange={e => setPerPage(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          {[10, 20, 50, 100].map(num => (
            <option key={num} value={num}>{num} per page</option>
          ))}
        </select>
        {/* Filter dropdown */}
        <select
          value={trackFilter}
          onChange={e => setTrackFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="delivered">Delivered</option>
          <option value="opened">Opened</option>
          <option value="clicked">Clicked</option>
          <option value="bounced">Bounced</option>
          <option value="failed">Failed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <table className="w-full border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Track</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4">No data</td></tr>
              ) : (
                filteredSubscribers.map((sub, idx) => (
                  <tr key={sub.Email + idx}>
                    <td className="border px-2 py-1">{sub.Email}</td>
                    <td className="border px-2 py-1">{sub.Name}</td>
                    <td className="border px-2 py-1">{sub.Status}</td>
                    <td className="border px-2 py-1">{sub.Track}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex space-x-2 items-center">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrackSubscribers;
