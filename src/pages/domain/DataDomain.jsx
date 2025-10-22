import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDomains } from "../../store/actions/domainaction";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DataDomain = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { domains, fetchLoading, fetchError } = useSelector(
    (state) => state.domain
  );
  console.log(domains);

  useEffect(() => {
    dispatch(fetchDomains());

    const interval = setInterval(() => {
      dispatch(fetchDomains());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDomains());
  };

  const handleEditDomain = (domainId) => {
    navigate(`/domain-edit/${domainId}`);
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
    domains && (
      <div className="p-3 sm:p-4 md:p-6 bg-gray-50 sm:bg-gray-100 min-h-screen">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                    <span>Domains Data</span>
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
            <div className="block lg:hidden bg-white">
              <div className="divide-y divide-gray-100">
                {domains.map((domain) => (
                  <div key={domain._id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="space-y-3">
                      {/* Header with domain and status */}
                      <div className="flex items-center justify-between">
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
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            domain.status === "verified"
                              ? "bg-green-100 text-green-800"
                              : domain.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Email */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Email Address</p>
                        <p className="text-sm text-gray-900 break-all">{domain.senderMail}</p>
                      </div>
                      
                      {/* Template and Mail Setting */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Template</p>
                          {domain.template ? (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded-md">
                                {domain.template.title || "Template Set"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                No Template
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Mail Subject</p>
                          {domain.mailSetting ? (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded-md">
                                {domain.mailSetting.subject || "Mail Setting Set"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                No Mail Setting
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="pt-2">
                        <button
                          onClick={() => handleEditDomain(domain._id)}
                          className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Domain
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mail Subject
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 xl:h-10 xl:w-10 flex items-center justify-center bg-blue-50 rounded-lg">
                            <Database className="h-4 w-4 xl:h-5 xl:w-5 text-blue-600" />
                          </div>
                          <div className="ml-3 xl:ml-4">
                            <div className="font-medium text-gray-900 text-sm xl:text-base">
                              {domain.domain}
                            </div>
                            <div className="text-gray-500 text-xs xl:text-sm">
                              Added on{" "}
                              {new Date(domain.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 text-sm xl:text-base max-w-[200px] truncate" title={domain.senderMail}>{domain.senderMail}</div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 xl:px-2.5 py-0.5 rounded-full text-xs xl:text-sm font-medium ${
                            domain.status === "verified"
                              ? "bg-green-100 text-green-800"
                              : domain.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {domain.status.charAt(0).toUpperCase() +
                            domain.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        {domain.template ? (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-xs xl:text-sm text-green-800 bg-green-100 px-2 py-1 rounded-md max-w-[120px] truncate">
                              {domain.template.title || "Template Set"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-xs xl:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              No Template
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        {domain.mailSetting ? (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-xs xl:text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded-md max-w-[150px] truncate">
                              {domain.mailSetting.subject || "Mail Setting Set"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-xs xl:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              No Mail Setting
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditDomain(domain._id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-3 sm:px-4 lg:px-6 py-3 border-t border-gray-200">
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
    )
  );
};

export default DataDomain;
