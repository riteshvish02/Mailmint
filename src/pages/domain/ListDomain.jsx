import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDomains } from '../../store/actions/domainaction';
import { Database, Edit, Trash2, Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DomainsList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { domains, fetchLoading, fetchError } = useSelector((state) => state.domain);
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

    return domains && (
        <div className="p-3 sm:p-4 md:p-6">
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center">
                                <div className="flex items-center">
                                    <Database className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                                    <span>Domains List</span>
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
                                <RefreshCw className={`h-4 w-4 ${fetchLoading ? 'animate-spin' : ''} sm:mr-2`} />
                                <span className="hidden sm:inline ml-2 sm:ml-0">Refresh</span>
                            </button>
                            <button
                                onClick={() => navigate('/add-domain')}
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

            {/* {fetchError && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error fetching domains</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{fetchError}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}

            {domains.length === 0 ? (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                    <Database className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No domains found</h3>
                    <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto px-2">
                        You haven't added any domains yet. Add your first domain to start sending emails.
                    </p>
                    <button 
                        onClick={() => navigate('/add-domain')}
                        className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto text-sm sm:text-base"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Domain
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Mobile Card View */}
                    <div className="block sm:hidden bg-white">
                        <div className="divide-y divide-gray-100">
                            {domains.map((domain) => (
                                <div key={domain._id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 flex items-center justify-center bg-blue-50 rounded-lg">
                                                <Database className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium text-gray-900 truncate">{domain.domain}</h3>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    domain.status === 'verified'
                                                        ? 'bg-green-100 text-green-800'
                                                        : domain.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="mt-1">
                                                <p className="text-sm text-gray-600 truncate">{domain.senderMail}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Added on {new Date(domain.createdAt).toLocaleDateString()}
                                                </p>
                                                {domain.description && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {domain.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Domain
                                    </th>
                                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {domains.map((domain) => (
                                    <tr key={domain._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 lg:px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10 flex items-center justify-center bg-blue-50 rounded-lg">
                                                    <Database className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                                                </div>
                                                <div className="ml-3 lg:ml-4">
                                                    <div className="font-medium text-gray-900 text-sm lg:text-base">{domain.domain}</div>
                                                    <div className="text-gray-500 text-xs lg:text-sm">Added on {new Date(domain.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4">
                                            <div className="text-gray-900 text-sm lg:text-base truncate max-w-[150px] lg:max-w-none" title={domain.senderMail}>
                                                {domain.senderMail}
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs lg:text-sm font-medium ${
                                                domain.status === 'verified'
                                                    ? 'bg-green-100 text-green-800'
                                                    : domain.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="hidden lg:table-cell px-6 py-4">
                                            <div className="text-gray-900 line-clamp-2 max-w-xs text-sm" title={domain.description}>
                                                {domain.description || 'No description'}
                                            </div>
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
                                    Showing <span className="font-medium">1</span> to <span className="font-medium">{domains.length}</span> of{' '}
                                    <span className="font-medium">{domains.length}</span> domains
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
    );
};

export default DomainsList;