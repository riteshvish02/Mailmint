import React, { useEffect, useState } from "react";
const POLL_INTERVAL = 500; // 500 milliseconds
import { useDispatch, useSelector } from "react-redux";
import { fetchDomains, PublishMail, resetDomainEmailStatus,clearQueuedLoad } from "../../store/actions/domainaction";
import {
  Database,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Mail,
  FileText,
  X,
} from "lucide-react";
import {toast} from "react-toastify";
import { useNavigate } from "react-router-dom";


const Publish = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State for limit modal
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [emailLimit, setEmailLimit] = useState('');
  const [publishingDomains, setPublishingDomains] = useState(new Set());

  const { domains, fetchLoading, fetchError,queuedLoad } = useSelector(
    (state) => state.domain
  );
  console.log(queuedLoad);

useEffect(() => {
  let interval;

  // Initial fetch
  dispatch(fetchDomains());

  const startPolling = () => {
    interval = setInterval(() => {
      console.log("Fetching domains...");
      dispatch(fetchDomains());
    }, POLL_INTERVAL);
  };

  // Handle tab visibility changes
  const handleVisibilityChange = () => {
    if (document.hidden) {
      clearInterval(interval);
    } else {
      startPolling();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  startPolling();

  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [dispatch]); // Added fetchError as dependency

  // Monitor sendingInProgress and clear queuedLoad when sending is complete
  useEffect(() => {
    if (domains && domains.length > 0) {
      // Remove domains from publishingDomains when they start sending (sendingInProgress becomes true)
      // or when they finish sending (sendingInProgress becomes false and emailsTotal becomes 0)
      setPublishingDomains(prev => {
        const newSet = new Set(prev);
        domains.forEach(domain => {
          if (newSet.has(domain._id)) {
            // Remove if domain is now sending or finished
            if (domain.sendingInProgress || domain.emailsTotal === 0) {
              newSet.delete(domain._id);
            }
          }
        });
        return newSet;
      });

      // Clear global queuedLoad when no domains are sending
      if (queuedLoad) {
        const hasAnySendingInProgress = domains.some(domain => domain.sendingInProgress);
        if (!hasAnySendingInProgress) {
          console.log("No domains are sending, clearing queuedLoad");
          dispatch(clearQueuedLoad());
        }
      }
    }
  }, [domains, queuedLoad, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDomains());
  };

  
  

  const handlePublishDomain = (domainId) => {
    setSelectedDomainId(domainId);
    setShowLimitModal(true);
  };

  const confirmPublish = () => {
    const limit = emailLimit && emailLimit > 0 ? parseInt(emailLimit) : null;
    
    // Add domain to publishing set
    setPublishingDomains(prev => new Set(prev).add(selectedDomainId));
    
    dispatch(PublishMail(selectedDomainId, toast, limit));
    setShowLimitModal(false);
    setEmailLimit('');
    setSelectedDomainId(null);
  };

  const cancelPublish = () => {
    setShowLimitModal(false);
    setEmailLimit('');
    setSelectedDomainId(null);
  };

  const handleResetDomain = (domainId) => {
    dispatch(resetDomainEmailStatus(domainId, toast));
    // setPublishingIds((prev) => prev.filter(id => id !== domainId)); // Enable publish after reset
  };

  if (fetchLoading && domains.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading domains...</span>
        </div>
      </div>
    );
  }

  return (
    <>
    {domains && (
      <div className="p-4 md:p-6 bg-gray-100">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Database className="h-6 w-6 mr-2 text-blue-600" />
              Publish Mail
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({domains.length} total)
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your email sending domains and their verification status
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-200 transition-colors"
                disabled={fetchLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    fetchLoading ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => navigate("/add-domain")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Domain</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {domains.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No domains found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't added any domains yet. Add your first domain to start
              sending emails.
            </p>
            <button
              onClick={() => navigate("/add-domain")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Domain
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mail Setting
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Subscribers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining mails
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      In Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Failed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {domains.map((domain) => (
                    <tr
                      key={domain._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-50 rounded-lg">
                            <Database className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {domain.domain}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Added on{" "}
                              {new Date(domain.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{domain.senderMail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.template ? (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-800 bg-green-100 px-2 py-1 rounded-md">
                              {domain.template.title || "Template Set"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              No Template
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.mailSetting ? (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded-md">
                              {domain.mailSetting.title || "Mail Setting Set"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              No Mail Setting
                            </span>
                          </div>
                        )}
                      </td>
                     
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.subscribers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          (domain.subscribers - (domain.fromIndex || 0)) > 0 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {domain.subscribers - (domain.fromIndex || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.sendingInProgress ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                              <span className="text-sm text-blue-600 font-medium">
                                {domain.emailsSent || 0}/{domain.emailsTotal || 0}
                              </span>
                              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                {domain.emailsRemaining || 0} in progress
                              </span>
                            </div>
                            {domain.emailsTotal > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                  style={{ 
                                    width: `${Math.min(100, ((domain.emailsSent || 0) / domain.emailsTotal) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                            )}
                            <span className="text-xs text-gray-500">
                              {domain.emailsTotal > 0 
                                ? `${Math.round(((domain.emailsSent || 0) / domain.emailsTotal) * 100)}% sent`
                                : 'Preparing...'
                              }
                            </span>
                          </div>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            Idle
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.emailsSent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.emailsFailed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                        <button
                          onClick={() => handlePublishDomain(domain._id)}
                          disabled={publishingDomains.has(domain._id) || domain.sendingInProgress}
                          className={`inline-flex items-center px-3 py-2 border border-blue-500 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${(publishingDomains.has(domain._id) || domain.sendingInProgress) ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}`}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Publish
                        </button>
  
                        {/* Show Reset button only if sending is NOT in progress and emailsTotal > 0 */}
                        {(!domain.sendingInProgress && domain.emailsTotal > 0) && (
                          <button
                            onClick={() => handleResetDomain(domain._id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-400 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{domains.length}</span> of{" "}
                    <span className="font-medium">{domains.length}</span>{" "}
                    domains
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
    
    {/* Limit Selection Modal */}
    {showLimitModal && (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Set Email Limit</h3>
            <button
              onClick={cancelPublish}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {(() => {
            const selectedDomain = domains.find(d => d._id === selectedDomainId);
            const remainingSubscribers = selectedDomain ? (selectedDomain.subscribers - (selectedDomain.fromIndex || 0)) : 0;
            
            return (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Total Subscribers:</strong> {selectedDomain?.subscribers || 0}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Already Sent:</strong> {selectedDomain?.fromIndex || 0}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Remaining:</strong> {remainingSubscribers}
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of emails to send (max: {remainingSubscribers})
                  </label>
                  <input
                    type="number"
                    value={emailLimit}
                    onChange={(e) => setEmailLimit(e.target.value)}
                    placeholder={`e.g. ${Math.min(2000, remainingSubscribers)} (leave empty for all remaining)`}
                    min="1"
                    max={remainingSubscribers}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {emailLimit && parseInt(emailLimit) > remainingSubscribers 
                      ? `⚠️ Only ${remainingSubscribers} subscribers remaining. Will send to all remaining.`
                      : `Enter the number of emails to send in this batch (max ${remainingSubscribers})`
                    }
                  </p>
                </div>
              </>
            );
          })()}
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelPublish}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmPublish}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Publish;
