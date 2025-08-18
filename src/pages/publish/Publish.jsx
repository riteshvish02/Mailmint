import React, { useEffect, useState } from "react";
const POLL_INTERVAL = 30; // 3 seconds (changed from 20ms which was too fast)
import { useDispatch, useSelector } from "react-redux";
import { fetchDomains, PublishMail, resetDomainEmailStatus } from "../../store/actions/domainaction";
import {
  Database,
  Plus,
  RefreshCw,
  FileText,
  Mail,
} from "lucide-react";
import {toast} from "react-toastify";
import { useNavigate } from "react-router-dom";

const Publish = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [needsPolling, setNeedsPolling] = useState(false);

  const { domains, fetchLoading, fetchError } = useSelector(
    (state) => state.domain
  );

  // Check if any domain is in progress
  const hasActiveSending = domains?.some(domain => domain.sendingInProgress);

  useEffect(() => {
    dispatch(fetchDomains()); // initial fetch
    
    // Start polling if there's active sending
    if (hasActiveSending) {
      setNeedsPolling(true);
    }
  }, [dispatch, hasActiveSending]);

  useEffect(() => {
    let interval;
    
    if (needsPolling) {
      interval = setInterval(() => {
        dispatch(fetchDomains());
        
        // Check if we can stop polling (no more active sending)
        const stillActive = domains?.some(domain => domain.sendingInProgress);
        if (!stillActive) {
          setNeedsPolling(false);
        }
      }, POLL_INTERVAL);
    }

    return () => clearInterval(interval);
  }, [needsPolling, dispatch, domains]);

  const handleRefresh = () => {
    dispatch(fetchDomains());
  };

  const handlePublishDomain = (domainId) => {
    dispatch(PublishMail(domainId, toast)).then(() => {
      // After publishing, start polling to track progress
      setNeedsPolling(true);
    });
  };

  const handleResetDomain = (domainId) => {
    dispatch(resetDomainEmailStatus(domainId, toast));
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
    domains && (
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
                      Subscribers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivered
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
                        {domain.sendingInProgress ? (
                          <span className="text-blue-600">In Progress</span>
                        ) : (
                          <span className="text-green-600">Idle</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {domain.emailsSent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                        <button
                          onClick={() => handlePublishDomain(domain._id)}
                          disabled={domain.sendingInProgress || (!domain.sendingInProgress && domain.emailsTotal > 0)}
                          className={`inline-flex items-center px-3 py-2 border border-blue-500 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${(domain.sendingInProgress || (!domain.sendingInProgress && domain.emailsTotal > 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    )
  );
};

export default Publish;
