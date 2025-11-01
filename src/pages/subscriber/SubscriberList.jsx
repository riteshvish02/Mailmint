import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Search, Mail, User, Loader2, AlertCircle, RefreshCw, Trash2, Edit2, Plus, Save, X } from 'lucide-react';
import { fetchDomains } from "../../store/actions/domainaction";
import { 
  getSubscribersByDomain, 
  deleteSubscriber, 
  bulkDeleteSubscribers, 
  updateSubscriber,
  addSubscriber 
} from "../../store/actions/subsaction";
import { 
  setCurrentViewedDomain,
  addSubscriberOptimistic,
  removeOptimisticSubscriber
} from "../../store/reducers/subsReducer";
import { bulkInactiveSubscribers } from "../../store/actions/subsaction";
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../utils/Axios';

const SubscriberList = () => {
  const [viewDomain, setViewDomain] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState(new Set());
  
  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const subscribersPerPage = 20;

  // Add subscriber modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', name: '', status: 'active' });

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredSubscribers.length === 0) {
      alert('No subscribers to export!');
      return;
    }
    const dataToExport = filteredSubscribers.map(sub => ({
      Email: sub.emailAddress,
      Name: sub.subscriberName,
      Status: sub.status,
      // Track: sub.Track || sub.track || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscribers');
    // Use XLSX.write to get a Blob and trigger download manually
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viewDomain || 'subscribers'}-list.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };
    
  const navigate = useNavigate();

  // Inline edit state
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [editForm, setEditForm] = useState({ subscriberName: '', email: '' });

  const dispatch = useDispatch();

  const {
    domains,
    fetchLoading: domainLoading,
    fetchError: domainError,
  } = useSelector((state) => state.domain);

  const {
    currentDomainSubscribers: domainSubscribers,
    currentViewedDomain,
    domainSubscribersLoading: subscriberLoading,
    domainSubscribersError: subscriberError,
    loading: addSubscriberLoading,
    error: addSubscriberError,
  } = useSelector((state) => state.subs);

  useEffect(() => {
    dispatch(fetchDomains());
  }, [dispatch]);

  const handleRefreshDomains = () => {
    dispatch(fetchDomains());
  };

  const handleViewDomainSubscribers = (domainName, page = 1, search = '') => {
    setViewDomain(domainName);
    dispatch(setCurrentViewedDomain(domainName));
    
    // Send pagination and search parameters to backend
    const params = {
      page: page,
      limit: subscribersPerPage,
      search: search.trim()
    };
    
    dispatch(getSubscribersByDomain(
      domainName, 
      params,
      (data) => {
        // Success callback - data is already handled by reducer
        console.log('Subscribers loaded successfully:', data);
      },
      (error) => {
        // Error callback
        console.error('Failed to load subscribers:', error);
      }
    ));
    
    setCurrentPage(page);
    if (page === 1) {
      setSelectedSubscribers(new Set());
      setEditingSubscriber(null);
    }
  };

  // Add subscriber functions
  const handleAddSubscriber = () => {
    navigate('/add-subscriber');
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFormSubmit = (e) => {
    e.preventDefault();
    
    if (!addForm.email || !viewDomain) {
      alert('Email and domain are required');
      return;
    }

    const subscriberData = {
      email: addForm.email,
      name: addForm.name,
      status: addForm.status,
      domain: viewDomain
    };

    // Optimistic update
    dispatch(addSubscriberOptimistic({ subscriberData, domain: viewDomain }));

    dispatch(addSubscriber(
      subscriberData,
      (data) => {
        // Success callback - refetch to get accurate data
        dispatch(getSubscribersByDomain(viewDomain, { page: currentPage, limit: subscribersPerPage, search: searchTerm }));
        setShowAddModal(false);
        setAddForm({ email: '', name: '', status: 'active' });
      },
      (error) => {
        // Error callback - remove optimistic update and show error
        dispatch(removeOptimisticSubscriber({ email: addForm.email }));
        alert('Failed to add subscriber: ' + error);
      },
      viewDomain
    ));
  };

  const handleAddCancel = () => {
    setShowAddModal(false);
    setAddForm({ email: '', name: '', status: 'active' });
  };

  // Inline edit functions
  const handleStartEdit = (subscriber) => {
    setEditingSubscriber(subscriber.emailAddress);
    setEditForm({
      subscriberName: subscriber.subscriberName || '',
      email: subscriber.emailAddress || '',
      status: subscriber.status || 'active',
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = (subscriber) => {
    // If email is being changed, send oldEmail as query param
    const originalEmail = subscriber.emailAddress || subscriber.Email || '';
    const newEmail = editForm.email ? editForm.email : originalEmail;
    const updatedData = {
      ...subscriber,
      name: editForm.subscriberName, // backend expects 'name'
      email: newEmail,
      status: editForm.status,
      domain: viewDomain,
    };
    // If email is changed, pass oldEmail as query param
    const updateAction = (dispatchUpdateSubscriber) => {
      if (newEmail !== originalEmail) {
        dispatch(updateSubscriber(
          viewDomain,
          { ...updatedData },
          () => {
            dispatch(getSubscribersByDomain(viewDomain, { page: currentPage, limit: subscribersPerPage, search: searchTerm }));
            setEditingSubscriber(null);
          },
          (error) => {
            alert('Update failed: ' + error);
          },
          originalEmail // pass oldEmail
        ));
      } else {
        dispatch(updateSubscriber(
          viewDomain,
          { ...updatedData },
          () => {
            dispatch(getSubscribersByDomain(viewDomain, { page: currentPage, limit: subscribersPerPage, search: searchTerm }));
            setEditingSubscriber(null);
          },
          (error) => {
            alert('Update failed: ' + error);
          }
        ));
      }
    };
    updateAction(dispatch);
  };

  const handleCancelEdit = () => {
    setEditingSubscriber(null);
    setEditForm({ subscriberName: '', email: '' });
  };

  // Selection functions
  const handleSelectSubscriber = (subscriberEmail) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(subscriberEmail)) {
      newSelected.delete(subscriberEmail);
    } else {
      newSelected.add(subscriberEmail);
    }
    setSelectedSubscribers(newSelected);
  };

  const handleSelectAll = () => {
    const currentPageEmails = filteredSubscribers.map(sub => sub.emailAddress);
    const newSelected = new Set(selectedSubscribers);
    
    // Check if all current page items are selected
    const allCurrentPageSelected = currentPageEmails.every(email => selectedSubscribers.has(email));
    
    if (allCurrentPageSelected) {
      // Deselect all current page items
      currentPageEmails.forEach(email => newSelected.delete(email));
    } else {
      // Select all current page items
      currentPageEmails.forEach(email => newSelected.add(email));
    }
    
    setSelectedSubscribers(newSelected);
  };

  // Simple delete functions with window popups
  const handleSingleDelete = (subscriberEmail) => {
    if (window.confirm(`Are you sure you want to delete subscriber: ${subscriberEmail}?\n\nThis action cannot be undone.`)) {
      dispatch(deleteSubscriber(
        viewDomain,
        subscriberEmail,
        () => {
          dispatch(getSubscribersByDomain(viewDomain, { page: currentPage, limit: subscribersPerPage, search: searchTerm }));
          alert('Subscriber deleted successfully!');
        },
        (error) => {
          alert('Failed to delete subscriber: ' + error);
        }
      ));
    }
  };

  const handleBulkDelete = () => {
    if (selectedSubscribers.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedSubscribers.size} selected subscribers?\n\nThis action cannot be undone.`)) {
      dispatch(bulkDeleteSubscribers(
        viewDomain,
        Array.from(selectedSubscribers),
        () => {
          dispatch(getSubscribersByDomain(viewDomain, { page: currentPage, limit: subscribersPerPage, search: searchTerm }));
          setSelectedSubscribers(new Set());
          alert(`Successfully deleted ${selectedSubscribers.size} subscribers!`);
        },
        (error) => {
          alert('Bulk delete failed: ' + error);
        }
      ));
    }
  };

    // Bulk Inactive logic
    const handleBulkInactive = () => {
      if (selectedSubscribers.size === 0) return;
      if (window.confirm(`Are you sure you want to mark ${selectedSubscribers.size} selected subscribers as inactive?`)) {
        dispatch(bulkInactiveSubscribers(
          viewDomain,
          Array.from(selectedSubscribers),
          () => {
            dispatch(getSubscribersByDomain(viewDomain, { page: currentPage, limit: subscribersPerPage, search: searchTerm }));
            setSelectedSubscribers(new Set());
            alert(`Successfully marked ${selectedSubscribers.size} subscribers as inactive!`);
          },
          (error) => {
            alert('Bulk inactive failed: ' + error);
          }
        ));
      }
    };

  // Handle paginated response from backend
  let safeDomainSubscribers = [];
  
  useEffect(() => {
    if (domainSubscribers) {
      if (Array.isArray(domainSubscribers)) {
        // Legacy support - if backend still returns array (fallback)
        safeDomainSubscribers = domainSubscribers;
        setTotalPages(Math.ceil(domainSubscribers.length / subscribersPerPage));
        setTotalSubscribers(domainSubscribers.length);
      } else if (domainSubscribers.subscribers) {
        // New paginated response structure
        safeDomainSubscribers = domainSubscribers.subscribers;
        
        // Check if backend provides pagination info
        if (domainSubscribers.pagination) {
          setTotalPages(domainSubscribers.pagination.totalPages);
          setTotalSubscribers(domainSubscribers.pagination.totalSubscribers);
          setCurrentPage(domainSubscribers.pagination.currentPage);
        } else {
          // Fallback: calculate pagination client-side 
          setTotalPages(Math.ceil(domainSubscribers.subscribers.length / subscribersPerPage));
          setTotalSubscribers(domainSubscribers.totalSubscribers || domainSubscribers.subscribers.length);
        }
      }
    }
  }, [domainSubscribers]);
  
  if (Array.isArray(domainSubscribers)) {
    safeDomainSubscribers = domainSubscribers;
  } else if (domainSubscribers && Array.isArray(domainSubscribers.subscribers)) {
    safeDomainSubscribers = domainSubscribers.subscribers;
  }

  // Backend now supports pagination, so use subscribers directly
  const filteredSubscribers = safeDomainSubscribers;
  const shouldUseClientPagination = !domainSubscribers?.pagination;
  
  const paginatedSubscribers = shouldUseClientPagination 
    ? filteredSubscribers.slice((currentPage - 1) * subscribersPerPage, currentPage * subscribersPerPage)
    : filteredSubscribers;


  // Log Track column for debugging
  useEffect(() => {
    if (filteredSubscribers.length > 0) {
      console.log('Track values:', filteredSubscribers.map(sub => sub.Track || sub.track || ''));
    }
  }, [filteredSubscribers]);

  // Backend now supports pagination with search
  
  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (viewDomain) {
        // Backend now supports both pagination and search
        handleViewDomainSubscribers(viewDomain, 1, searchTerm);
      }
    }, 500); // 500ms delay for debouncing

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reset to first page when domain changes
  useEffect(() => {
    if (viewDomain) {
      setCurrentPage(1);
      setSearchTerm('');
    }
  }, [viewDomain]);

  // Function to download the entire domain subscriber list
  const handleDownloadDomainSubscribers = async () => {
    if (!viewDomain) {
      alert('Please select a domain first.');
      return;
    }

    try {
      const response = await axios.get(`/api/v1/domain/${viewDomain}/export`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${viewDomain}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('Error downloading the file:', error);
      alert('An error occurred while downloading the file.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-10 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-2">MailMint</h1>
          <p className="text-blue-600 text-base sm:text-lg">Subscriber List Management</p>
        </div>

        {/* Domain Selection and Search */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-blue-100 mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900">View Subscribers</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Domain Selection */}
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Select Domain to View
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <select
                  value={viewDomain}
                  onChange={(e) => handleViewDomainSubscribers(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  disabled={domainLoading}
                >
                  <option value="">
                    {domainLoading ? "Loading domains..." : "Select Domain"}
                  </option>
                  {domains?.map((domain, index) => (
                    <option
                      key={domain.id || domain.name || `view-domain-${index}`}
                      value={domain.name || domain.domain}
                    >
                      {domain.name || domain.domain}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewDomain && handleViewDomainSubscribers(viewDomain)}
                    disabled={!viewDomain || subscriberLoading}
                    className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <Eye className="h-4 w-4 mx-auto sm:mx-0" />
                    <span className="ml-1 sm:hidden">View</span>
                  </button>
                  <button
                    onClick={handleRefreshDomains}
                    disabled={domainLoading}
                    className="flex-1 sm:flex-none px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <RefreshCw className="h-4 w-4 mx-auto sm:mx-0" />
                    <span className="ml-1 sm:hidden">Refresh</span>
                  </button>
                </div>
              </div>
              {domainError && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span>{domainError}</span>
                </div>
              )}
            </div>

            {/* Search Bar */}
            {viewDomain && (
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Search Subscribers
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by email or name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscribers Display Section */}
        {viewDomain && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-100">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-blue-900">
                    Subscribers for {viewDomain}
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={handleExportExcel}
                      className="px-3 sm:px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs sm:text-sm flex items-center justify-center"
                      disabled={filteredSubscribers.length === 0}
                      title="Export filtered subscribers to Excel"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Export to Excel</span>
                      <span className="sm:hidden">Export</span>
                    </button>
                    <button
                      onClick={handleAddSubscriber}
                      className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs sm:text-sm flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Add Subscriber</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                    <button
                      onClick={handleDownloadDomainSubscribers}
                      className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm flex items-center justify-center"
                      disabled={!viewDomain}
                      title="Download entire domain subscriber list"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Download Domain List</span>
                      <span className="sm:hidden">Download</span>
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    {searchTerm ? (
                      `Showing ${filteredSubscribers.length} results (Total: ${totalSubscribers})`
                    ) : (
                      `Total: ${totalSubscribers} subscribers`
                    )}
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {filteredSubscribers.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filteredSubscribers.length > 0 && filteredSubscribers.every(sub => selectedSubscribers.has(sub.emailAddress))}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs sm:text-sm text-gray-700">
                        Select All ({selectedSubscribers.size} selected)
                      </span>
                    </label>
                  </div>
                  
                  {selectedSubscribers.size > 0 && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs sm:text-sm flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Delete Selected ({selectedSubscribers.size})</span>
                        <span className="sm:hidden">Delete ({selectedSubscribers.size})</span>
                      </button>
                      <button
                        onClick={handleBulkInactive}
                        className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs sm:text-sm flex items-center justify-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Mark Inactive ({selectedSubscribers.size})</span>
                        <span className="sm:hidden">Inactive ({selectedSubscribers.size})</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Error display for add subscriber */}
              {addSubscriberError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center text-red-700">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{addSubscriberError}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {subscriberLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mr-2" />
                  <span className="text-blue-700 text-sm sm:text-base">Loading subscribers...</span>
                </div>
              ) : subscriberError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 mb-4 text-sm sm:text-base">{subscriberError}</p>
                  <button
                    onClick={() => handleViewDomainSubscribers(viewDomain)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base">
                    {searchTerm ? 'No subscribers found matching your search' : 'No subscribers found for this domain'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Mobile Card Layout */}
                  <div className="block lg:hidden space-y-4">
                    {paginatedSubscribers.map((subscriber, index) => (
                      <div 
                        key={subscriber.emailAddress || index}
                        className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                          subscriber.isOptimistic ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedSubscribers.has(subscriber.emailAddress)}
                              onChange={() => handleSelectSubscriber(subscriber.emailAddress)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1">
                                <Mail className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                                {editingSubscriber === subscriber.emailAddress ? (
                                  <input
                                    type="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleEditFormChange}
                                    className="text-sm px-2 py-1 border border-gray-300 rounded w-full"
                                    placeholder="Email"
                                  />
                                ) : (
                                  <span className="text-gray-900 font-medium text-sm truncate flex-1">
                                    {subscriber.emailAddress}
                                  </span>
                                )}
                                {subscriber.isOptimistic && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex-shrink-0">Pending</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="space-y-3">
                          {/* Name */}
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-xs text-gray-500 mr-2 w-12 flex-shrink-0">Name:</span>
                            {editingSubscriber === subscriber.emailAddress ? (
                              <input
                                type="text"
                                name="subscriberName"
                                value={editForm.subscriberName}
                                onChange={handleEditFormChange}
                                className="text-sm px-2 py-1 border border-gray-300 rounded flex-1"
                                placeholder="Name"
                              />
                            ) : (
                              <span className="text-gray-700 text-sm flex-1 truncate">
                                {subscriber.subscriberName || 'Not provided'}
                              </span>
                            )}
                          </div>

                          {/* Status */}
                          <div className="flex items-center">
                            <div className="h-4 w-4 mr-2 flex-shrink-0"></div>
                            <span className="text-xs text-gray-500 mr-2 w-12 flex-shrink-0">Status:</span>
                            {editingSubscriber === subscriber.emailAddress ? (
                              <select
                                name="status"
                                value={editForm.status || subscriber.status || 'active'}
                                onChange={handleEditFormChange}
                                className="text-sm px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                subscriber.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {subscriber.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                          {editingSubscriber === subscriber.emailAddress ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(subscriber)}
                                className="flex items-center px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded text-sm"
                                title="Save changes"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded text-sm"
                                title="Cancel edit"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(subscriber)}
                                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-sm"
                                title="Edit subscriber"
                                disabled={subscriber.isOptimistic}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleSingleDelete(subscriber.emailAddress)}
                                className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-sm"
                                title="Delete subscriber"
                                disabled={subscriber.isOptimistic}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden lg:block">
                    <div className="space-y-3">
                      {/* Table Header */}
                      <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-gray-700 border">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filteredSubscribers.length > 0 && filteredSubscribers.every(sub => selectedSubscribers.has(sub.emailAddress))}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                          />
                          Email
                        </div>
                        <div>Name</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>

                      {/* Subscriber Rows */}
                      {paginatedSubscribers.map((subscriber, index) => (
                        <div 
                          key={subscriber.emailAddress || index}
                          className={`grid grid-cols-4 gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                            subscriber.isOptimistic ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedSubscribers.has(subscriber.emailAddress)}
                              onChange={() => handleSelectSubscriber(subscriber.emailAddress)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            <Mail className="h-4 w-4 text-blue-400 mr-2" />
                            {editingSubscriber === subscriber.emailAddress ? (
                              <input
                                type="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleEditFormChange}
                                className="text-sm px-2 py-1 border border-gray-300 rounded w-full"
                                placeholder="Email"
                              />
                            ) : (
                              <span className="text-gray-900 truncate">{subscriber.emailAddress}</span>
                            )}
                            {subscriber.isOptimistic && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Pending</span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            {editingSubscriber === subscriber.emailAddress ? (
                              <input
                                type="text"
                                name="subscriberName"
                                value={editForm.subscriberName}
                                onChange={handleEditFormChange}
                                className="text-sm px-2 py-1 border border-gray-300 rounded w-full"
                                placeholder="Name"
                              />
                            ) : (
                              <span className="text-gray-700 truncate">{subscriber.subscriberName || 'Not provided'}</span>
                            )}
                          </div>
                          <div className="flex items-center">
                            {editingSubscriber === subscriber.emailAddress ? (
                              <select
                                name="status"
                                value={editForm.status || subscriber.status || 'active'}
                                onChange={handleEditFormChange}
                                className="text-sm px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                subscriber.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {subscriber.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {editingSubscriber === subscriber.emailAddress ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(subscriber)}
                                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                  title="Save changes"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                                  title="Cancel edit"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(subscriber)}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                  title="Edit subscriber"
                                  disabled={subscriber.isOptimistic}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleSingleDelete(subscriber.emailAddress)}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                  title="Delete subscriber"
                                  disabled={subscriber.isOptimistic}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-y-2 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={() => {
                          const prevPage = Math.max(currentPage - 1, 1);
                          if (shouldUseClientPagination) {
                            setCurrentPage(prevPage);
                          } else {
                            handleViewDomainSubscribers(viewDomain, prevPage, searchTerm);
                          }
                        }}
                        disabled={currentPage === 1 || subscriberLoading}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 text-sm sm:text-base"
                      >
                        Previous
                      </button>
                      <span className="text-gray-700 text-sm sm:text-base text-center">
                        <span className="block sm:hidden">Page {currentPage}/{totalPages}</span>
                        <span className="hidden sm:block">Page {currentPage} of {totalPages} ({totalSubscribers} total)</span>
                      </span>
                      <button
                        onClick={() => {
                          const nextPage = Math.min(currentPage + 1, totalPages);
                          if (shouldUseClientPagination) {
                            setCurrentPage(nextPage);
                          } else {
                            handleViewDomainSubscribers(viewDomain, nextPage, searchTerm);
                          }
                        }}
                        disabled={currentPage === totalPages || subscriberLoading}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 text-sm sm:text-base"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Add Subscriber Modal removed. */}
      </div>
    </div>
  );
};

export default SubscriberList;