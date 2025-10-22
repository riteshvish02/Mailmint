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
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 sm:bg-gray-100 min-h-screen">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <span>Domain Daily Email Stats</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          View daily email statistics for all domains
        </p>
      </div>
      
      {fetchLoading ? (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm sm:text-base text-gray-600">Loading statistics...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {domains && domains.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {domains.map(domain => {
                  const todayEntry = domain.emailSentHistory?.find(h => {
                    const d = new Date(h.date);
                    d.setHours(0,0,0,0);
                    return d.getTime() === today;
                  });
                  
                  const sentToday = todayEntry ? todayEntry.count : 0;
                  const totalSent = domain.emailsSent || 0;
                  
                  return (
                    <div key={domain._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="space-y-3">
                        {/* Domain Header */}
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">{domain.domain}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-xs text-blue-600 font-medium">Active</span>
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 mb-1 font-medium">Sent Today</p>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-lg font-bold text-blue-900">{sentToday.toLocaleString()}</span>
                              <span className="text-xs text-blue-600">emails</span>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-600 mb-1 font-medium">Total Sent</p>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-lg font-bold text-green-900">{totalSent.toLocaleString()}</span>
                              <span className="text-xs text-green-600">emails</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Indicator */}
                        {totalSent > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-600 font-medium">Today's Progress</span>
                              <span className="text-xs text-gray-500">
                                {totalSent > 0 ? `${Math.round((sentToday / totalSent) * 100)}%` : '0%'} of total
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${totalSent > 0 ? Math.min(100, (sentToday / totalSent) * 100) : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-base text-gray-500 font-medium">No domains found</div>
                  <p className="text-sm text-gray-400">Add domains to view email statistics</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Today</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sent</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domains && domains.length > 0 ? (
                  domains.map(domain => {
                    const todayEntry = domain.emailSentHistory?.find(h => {
                      const d = new Date(h.date);
                      d.setHours(0,0,0,0);
                      return d.getTime() === today;
                    });
                    
                    const sentToday = todayEntry ? todayEntry.count : 0;
                    const totalSent = domain.emailsSent || 0;
                    
                    return (
                      <tr key={domain._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                            <span className="font-medium text-gray-900 text-sm xl:text-base">{domain.domain}</span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg font-semibold text-blue-600">{sentToday.toLocaleString()}</span>
                            <span className="text-xs text-gray-500 ml-1">emails</span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg font-semibold text-green-600">{totalSent.toLocaleString()}</span>
                            <span className="text-xs text-gray-500 ml-1">emails</span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          {totalSent > 0 ? (
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ 
                                    width: `${Math.min(100, (sentToday / totalSent) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 font-medium min-w-[40px]">
                                {Math.round((sentToday / totalSent) * 100)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="text-xl text-gray-500 font-medium">No domains found</div>
                        <p className="text-gray-400">Add domains to view email statistics</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer with summary */}
          {domains && domains.length > 0 && (
            <div className="bg-gray-50 px-3 sm:px-4 xl:px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-gray-700">
                    Showing statistics for <span className="font-medium">{domains.length}</span> domain{domains.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainDailyStats;
