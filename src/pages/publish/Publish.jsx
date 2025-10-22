import React, { useEffect, useState } from "react";
const POLL_INTERVAL = 1400; // 500 milliseconds
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
import { useNavigate, Link } from "react-router-dom";


const Publish = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State for limit modal
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [emailLimit, setEmailLimit] = useState('');
  const [publishingDomains, setPublishingDomains] = useState(new Set());

  const { domains, fetchLoading,queuedLoad } = useSelector(
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
      <div className="p-3 sm:p-6 flex justify-center items-center min-h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          <span className="text-sm sm:text-base">Loading domains...</span>
        </div>
      </div>
    );
  }

  return (
    <>
    {domains && (
      <div className="p-3 sm:p-4 md:p-6 bg-gray-50 sm:bg-gray-100 min-h-screen">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                    <span>Publish Mail</span>
                  </div>
                  <span className="text-sm font-normal text-gray-500 mt-1 sm:mt-0 sm:ml-2">
                    ({domains.length} total)
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Manage your email sending domains and their verification status
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleRefresh}
                  className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-sm"
                  disabled={fetchLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      fetchLoading ? "animate-spin" : ""
                    } sm:mr-2`}
                  />
                  <span className="hidden sm:inline ml-2 sm:ml-0">Refresh</span>
                </button>
                <button
                  onClick={() => navigate("/add-domain")}
                  className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline ml-2 sm:ml-0">Add Domain</span>
                  <span className="sm:hidden ml-2">Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {domains.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <Database className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No domains found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto px-2">
              You haven't added any domains yet. Add your first domain to start
              sending emails.
            </p>
            <button
              onClick={() => navigate("/add-domain")}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Domain
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Mobile Card View */}
            <div className="block xl:hidden">
              <div className="divide-y divide-gray-100">
                {domains.map((domain) => (
                  <div key={domain._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="space-y-4">
                      
                      {/* Header with domain info */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 flex items-center justify-center bg-blue-50 rounded-lg">
                            <Database className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">{domain.domain}</h3>
                            <p className="text-xs text-gray-500">
                              Added on {new Date(domain.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress indicator for mobile */}
                        {domain.sendingInProgress && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <span className="text-xs text-blue-600 font-medium">Sending</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Email and basic info */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1 font-medium">Email Address</p>
                          <p className="text-sm text-gray-900 break-all">{domain.senderMail}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Template</p>
                            {domain.template ? (
                              <div className="flex items-center">
                                <FileText className="h-3 w-3 text-green-600 mr-1" />
                                <span className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded-md truncate">
                                  {domain.template.title || "Template Set"}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <FileText className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                  No Template
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Mail Subject</p>
                            {domain.mailSetting ? (
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 text-blue-600 mr-1" />
                                <span className="text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded-md truncate">
                                  {domain.mailSetting.subject || "Mail Setting Set"}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                  No Mail Setting
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats section */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 mb-1 font-medium">Total Subscribers</p>
                          <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-blue-900 text-sm">{domain.subscribers}</span>
                            {typeof domain.activeSubscribers === 'number' && (
                              <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
                                Active: {domain.activeSubscribers}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-orange-600 mb-1 font-medium">Remaining</p>
                          <span className={`text-sm font-semibold ${
                            (domain.emailsRemaining > 0) ? 'text-orange-800' : 'text-green-800'
                          }`}>
                            {domain.emailsRemaining}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress section */}
                      {domain.sendingInProgress ? (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-blue-600 font-medium">Sending Progress</p>
                            <span className="text-xs text-blue-600">
                              {domain.emailsSent || 0}/{domain.emailsTotal || 0}
                            </span>
                          </div>
                          
                          {domain.emailsTotal > 0 && (
                            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${Math.min(100, ((domain.emailsSent || 0) / domain.emailsTotal) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          )}
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-600">
                              {domain.emailsTotal > 0 
                                ? `${Math.round(((domain.emailsSent || 0) / domain.emailsTotal) * 100)}% sent`
                                : 'Preparing...'
                              }
                            </span>
                            <span className="text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                              {domain.emailsRemaining || 0} in progress
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-green-600 flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                              Idle
                            </span>
                            <div className="text-xs text-gray-600 space-x-4">
                              <span>Sent: {domain.emailsSent}</span>
                              <span>Failed: {domain.emailsFailed}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePublishDomain(domain._id)}
                          disabled={publishingDomains.has(domain._id) || domain.sendingInProgress}
                          className={`flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-500 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${(publishingDomains.has(domain._id) || domain.sendingInProgress) ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}`}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Publish
                        </button>

                        <Link
                          to={`/track-subscribers/${domain.domain}`}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-green-500 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Track
                        </Link>

                        {/* Show Reset button only if sending is NOT in progress and emailsTotal > 0 */}
                        {(!domain.sendingInProgress && domain.emailsTotal > 0) && (
                          <button
                            onClick={() => handleResetDomain(domain._id)}
                            className="px-3 py-2 border border-gray-400 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 2xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-4 2xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 2xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-4 2xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mail subject
                    </th>
                    <th className="px-4 2xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Subscribers
                    </th>
                    <th className="px-4 2xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining mails
                    </th>
                    <th className="px-4 2xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      In Progress
                    </th>
                    <th className="px-4 2xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivered
                    </th>
                    <th className="px-4 2xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Failed
                    </th>
                    <th className="px-4 2xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 2xl:h-10 2xl:w-10 flex items-center justify-center bg-blue-50 rounded-lg">
                            <Database className="h-4 w-4 2xl:h-5 2xl:w-5 text-blue-600" />
                          </div>
                          <div className="ml-3 2xl:ml-4">
                            <div className="font-medium text-gray-900 text-sm 2xl:text-base">
                              {domain.domain}
                            </div>
                            <div className="text-gray-500 text-xs 2xl:text-sm">
                              Added on{" "}
                              {new Date(domain.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 text-sm 2xl:text-base max-w-[120px] 2xl:max-w-none truncate" title={domain.senderMail}>{domain.senderMail}</div>
                      </td>
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap">
                        {domain.template ? (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-xs 2xl:text-sm text-green-800 bg-green-100 px-2 py-1 rounded-md max-w-[100px] 2xl:max-w-none truncate">
                              {domain.template.title || "Template Set"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-xs 2xl:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              No Template
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap">
                        {domain.mailSetting ? (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-xs 2xl:text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded-md max-w-[100px] 2xl:max-w-none truncate">
                              {domain.mailSetting.subject || "Mail Setting Set"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-xs 2xl:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              No Mail Setting
                            </span>
                          </div>
                        )}
                      </td>
                     
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 text-sm 2xl:text-base">{domain.subscribers}</span>
                        {typeof domain.activeSubscribers === 'number' && (
                          <span className="ml-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            Active: {domain.activeSubscribers}
                          </span>
                        )}
                      </td>
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          (domain.emailsRemaining > 0)
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {domain.emailsRemaining}
                        </span>
                      </td>
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap">
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
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap text-sm 2xl:text-base">
                        {domain.emailsSent}
                      </td>
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap text-sm 2xl:text-base">
                        {domain.emailsFailed}
                      </td>
                      <td className="px-4 2xl:px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                        <button
                          onClick={() => handlePublishDomain(domain._id)}
                          disabled={publishingDomains.has(domain._id) || domain.sendingInProgress}
                          className={`inline-flex items-center px-3 py-2 border border-blue-500 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${(publishingDomains.has(domain._id) || domain.sendingInProgress) ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}`}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Publish
                        </button>

                        <Link
                          to={`/track-subscribers/${domain.domain}`}
                          className="inline-flex items-center px-3 py-2 border border-green-500 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Track
                        </Link>

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
            <div className="bg-gray-50 px-3 sm:px-4 xl:px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{domains.length}</span> of{" "}
                    <span className="font-medium">{domains.length}</span>{" "}
                    domains
                  </p>
                </div>
                <div className="flex justify-center sm:justify-end space-x-2">
                  <button
                    disabled
                    className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled
                    className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Set Email Limit</h3>
            <button
              onClick={cancelPublish}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {(() => {
            const selectedDomain = domains.find(d => d._id === selectedDomainId);
            const remainingSubscribers = selectedDomain ? selectedDomain.emailsRemaining : 0;
            
            return (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Total Subscribers:</strong> {selectedDomain?.subscribers || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Already Sent:</strong> {selectedDomain?.fromIndex || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Remaining:</strong> {remainingSubscribers}
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Number of emails to send (max: {remainingSubscribers})
                  </label>
                  <input
                    type="number"
                    value={emailLimit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val || parseInt(val) <= remainingSubscribers) {
                        setEmailLimit(val);
                      }
                    }}
                    placeholder={`e.g. ${Math.min(2000, remainingSubscribers)} (leave empty for all remaining)`}
                    min="1"
                    max={remainingSubscribers}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={cancelPublish}
              className="flex-1 sm:flex-none px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={confirmPublish}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
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
