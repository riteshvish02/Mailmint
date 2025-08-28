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

  const fetchSubscribers = async (pageNum = 1, perPageNum = 20) => {
    if (!domain) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/v1/track-subscribers/${domain}?perPage=${perPageNum}&page=${pageNum}`);
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
    fetchSubscribers(newPage, perPage);
  };

  useEffect(() => {
    if (domain) fetchSubscribers(1, perPage);
    // eslint-disable-next-line
  }, [domain, perPage]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-4">Track Subscribers</h2>
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
              {subscribers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4">No data</td></tr>
              ) : (
                subscribers.map((sub, idx) => (
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
