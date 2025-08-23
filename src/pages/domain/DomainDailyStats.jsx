import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDomains } from "../../store/actions/domainaction";

const DomainDailyStats = () => {
  const dispatch = useDispatch();
  const { domains, fetchLoading } = useSelector((state) => state.domain);
  const [today, setToday] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  useEffect(() => {
    dispatch(fetchDomains());
  }, [dispatch]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Domain Daily Email Stats</h1>
      {fetchLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Today</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sent</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domains && domains.map(domain => {
                const todayEntry = domain.emailSentHistory?.find(h => {
                  const d = new Date(h.date);
                  d.setHours(0,0,0,0);
                  return d.getTime() === today;
                });
                return (
                  <tr key={domain._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{domain.domain}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{todayEntry ? todayEntry.count : 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{domain.emailsSent || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DomainDailyStats;
