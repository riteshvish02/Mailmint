import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDomains, PublishMail, resetDomainEmailStatus, clearQueuedLoad } from "../../store/actions/domainaction";
import { updateDomainProgress } from "../../store/reducers/domainReducer";
import socket from "../../utils/socket";
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
  Radio,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const Publish = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State for limit modal
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [emailLimit, setEmailLimit] = useState('');
  const [publishingDomains, setPublishingDomains] = useState(new Set());
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [resetModalData, setResetModalData] = useState(null);

  const { domains = [], fetchLoading, queuedLoad } = useSelector(
    (state) => state.domain
  );
  const domainList = Array.isArray(domains) ? domains : [];

  useEffect(() => {
    // Initial fetch
    dispatch(fetchDomains());

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    // Socket event handlers for real-time progress
    const handleProgress = (data) => {
      console.log("⚡ [Socket] campaign:progress received:", data);
      dispatch(updateDomainProgress(data));
    };

    const handleComplete = (data) => {
      console.log("✅ [Socket] campaign:complete received:", data);
      dispatch(updateDomainProgress(data));
      dispatch(fetchDomains());
    };

    const handleStatsUpdated = (data) => {
      console.log("🔄 [Socket] domain:stats_updated received:", data);
      dispatch(fetchDomains());
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("campaign:progress", handleProgress);
    socket.on("campaign:complete", handleComplete);
    socket.on("domain:stats_updated", handleStatsUpdated);

    // Lightweight 30s fallback (replaces previous aggressive 1.4s loop)
    const interval = setInterval(() => {
      dispatch(fetchDomains());
    }, 30000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        dispatch(fetchDomains());
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("campaign:progress", handleProgress);
      socket.off("campaign:complete", handleComplete);
      socket.off("domain:stats_updated", handleStatsUpdated);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);

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

  const handleResetDomain = (domainOrId) => {
    const domain = typeof domainOrId === 'object'
      ? domainOrId
      : domainList.find(d => d._id === domainOrId) || { _id: domainOrId, domain: 'this domain' };

    setResetModalData({
      isOpen: true,
      domain: domain
    });
  };

  const closeResetModal = () => {
    setResetModalData(null);
  };

  const confirmResetAction = () => {
    if (!resetModalData?.domain) return;
    const domain = resetModalData.domain;

    setPublishingDomains(prev => {
      const next = new Set(prev);
      next.delete(domain._id);
      return next;
    });

    dispatch(resetDomainEmailStatus(domain._id, toast));
    setResetModalData(null);
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
        <div className="mb-4 sm:mb-6 ">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                    <span>Publish Mail</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 ${
                      socketConnected 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}></span>
                      {socketConnected ? 'Live Sync' : 'Reconnecting...'}
                    </span>
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
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden w-fit">
            
            {/* Mobile Card View */}
            <div className="block xl:hidden">
              <div className="divide-y divide-gray-100">
                {domainList.map((domain) => (
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
                              <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                                Active: {domain.activeSubscribers}
                              </span>
                            )}
                            {typeof domain.inactiveSubscribers === 'number' && domain.inactiveSubscribers > 0 && (
                              <span className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full w-fit">
                                Inactive: {domain.inactiveSubscribers}
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

                        {/* Reset button - ALWAYS VISIBLE */}
                        <button
                          onClick={() => handleResetDomain(domain)}
                          title={domain.sendingInProgress ? "Stop active campaign and reset" : "Reset campaign & mark all subscribers pending"}
                          className={`inline-flex items-center justify-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md transition-all ${
                            domain.sendingInProgress
                              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 hover:border-rose-400 font-semibold'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <RotateCcw className={`h-4 w-4 mr-1 ${domain.sendingInProgress ? 'text-rose-600 animate-spin' : 'text-gray-500'}`} />
                          {domain.sendingInProgress ? 'Stop & Reset' : 'Reset'}
                        </button>
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden xl:block w-fit">
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
                  {domainList.map((domain) => (
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
                          <span className="ml-2 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                            Active: {domain.activeSubscribers}
                          </span>
                        )}
                        {typeof domain.inactiveSubscribers === 'number' && domain.inactiveSubscribers > 0 && (
                          <span className="ml-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-medium">
                            Inactive: {domain.inactiveSubscribers}
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

                        {/* Reset button - ALWAYS VISIBLE */}
                        <button
                          onClick={() => handleResetDomain(domain)}
                          title={domain.sendingInProgress ? "Stop active campaign and reset" : "Reset campaign & mark all subscribers pending"}
                          className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md transition-all ${
                            domain.sendingInProgress
                              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 hover:border-rose-400 font-semibold'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <RotateCcw className={`h-4 w-4 mr-1 ${domain.sendingInProgress ? 'text-rose-600 animate-spin' : 'text-gray-500'}`} />
                          {domain.sendingInProgress ? 'Stop & Reset' : 'Reset'}
                        </button>
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

    {/* Modern Reset Confirmation Modal */}
    {resetModalData?.isOpen && resetModalData?.domain && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 sm:p-6 w-full max-w-md mx-4 transform transition-all">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                resetModalData.domain.sendingInProgress 
                  ? 'bg-rose-100 text-rose-600 ring-4 ring-rose-50' 
                  : 'bg-indigo-100 text-indigo-600 ring-4 ring-indigo-50'
              }`}>
                {resetModalData.domain.sendingInProgress ? (
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                ) : (
                  <RotateCcw className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {resetModalData.domain.sendingInProgress 
                    ? 'Stop & Reset Campaign?' 
                    : 'Reset Campaign?'}
                </h3>
                <p className="text-xs text-gray-500">
                  {resetModalData.domain.sendingInProgress 
                    ? 'Active email sending in progress' 
                    : 'Prepare domain for fresh email delivery'}
                </p>
              </div>
            </div>
            <button
              onClick={closeResetModal}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Domain Pill */}
          <div className="my-4 p-3 bg-gray-50 rounded-xl border border-gray-200/70">
            <div className="text-xs text-gray-500 font-medium mb-1">Target Sender / Domain:</div>
            <div className="text-sm font-semibold text-gray-900 flex items-center justify-between">
              <span className="truncate">{resetModalData.domain.domain || resetModalData.domain.name}</span>
              {resetModalData.domain.sendingInProgress && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 animate-pulse">
                  ● Sending Active
                </span>
              )}
            </div>
          </div>

          {/* Clean User-Friendly Points */}
          <div className="space-y-2.5 text-xs sm:text-sm text-gray-600 mb-6">
            {resetModalData.domain.sendingInProgress ? (
              <>
                <div className="flex items-start gap-2.5 p-2.5 bg-rose-50/80 border border-rose-200/80 rounded-xl text-rose-900">
                  <span className="text-base leading-none">🛑</span>
                  <div>
                    <span className="font-bold">Immediate Abort:</span> Halts all remaining email batches right away. No further emails will be sent.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-gray-700 px-1">
                  <span className="text-base leading-none">🔄</span>
                  <div>
                    <span className="font-semibold text-gray-900">Subscribers reset to Pending:</span> All active subscribers can be emailed again from the beginning.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-gray-700 px-1">
                  <span className="text-base leading-none">📊</span>
                  <div>
                    <span className="font-semibold text-gray-900">Zero batch counters:</span> Sent, failed, and progress stats will reset to 0.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2.5 text-gray-700 px-1">
                  <span className="text-base leading-none">🔄</span>
                  <div>
                    <span className="font-semibold text-gray-900">Renew Subscriber Queue:</span> All active subscribers will be set to pending so you can start a fresh campaign.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-gray-700 px-1">
                  <span className="text-base leading-none">📊</span>
                  <div>
                    <span className="font-semibold text-gray-900">Reset Batch Counters:</span> Delivered, failed, and telemetry counters will reset back to 0.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-gray-700 px-1">
                  <span className="text-base leading-none">🛡️</span>
                  <div>
                    <span className="font-semibold text-gray-900">Data Safe:</span> Your subscribers, templates, and domain settings remain completely safe.
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={closeResetModal}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmResetAction}
              className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                resetModalData.domain.sendingInProgress
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              {resetModalData.domain.sendingInProgress ? 'Stop Sending & Reset' : 'Confirm Reset'}
            </button>
          </div>

        </div>
      </div>
    )}
    </>
  );
};

export default Publish;
