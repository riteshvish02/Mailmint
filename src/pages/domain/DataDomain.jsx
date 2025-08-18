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
              Domains Data
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mail Setting
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
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
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium ${
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
                      <td className="px-6 py-4">
                        <div
                          className="text-gray-900 line-clamp-2 max-w-xs"
                          title={domain.description}
                        >
                          {domain.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

export default DataDomain;
