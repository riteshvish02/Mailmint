import React, { useState, useEffect } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';

const SubscriberList = () => {
  const [viewDomain, setViewDomain] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState(new Set());
    
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

  const handleViewDomainSubscribers = (domainName) => {
    setViewDomain(domainName);
    dispatch(setCurrentViewedDomain(domainName));
    dispatch(getSubscribersByDomain(domainName));
    setSearchTerm('');
    setSelectedSubscribers(new Set());
    setEditingSubscriber(null); 
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
        dispatch(getSubscribersByDomain(viewDomain));
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
            dispatch(getSubscribersByDomain(viewDomain));
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
            dispatch(getSubscribersByDomain(viewDomain));
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
    if (selectedSubscribers.size === filteredSubscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(filteredSubscribers.map(sub => sub.emailAddress)));
    }
  };

  // Simple delete functions with window popups
  const handleSingleDelete = (subscriberEmail) => {
    if (window.confirm(`Are you sure you want to delete subscriber: ${subscriberEmail}?\n\nThis action cannot be undone.`)) {
      dispatch(deleteSubscriber(
        viewDomain,
        subscriberEmail,
        () => {
          dispatch(getSubscribersByDomain(viewDomain));
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
          dispatch(getSubscribersByDomain(viewDomain));
          setSelectedSubscribers(new Set());
          alert(`Successfully deleted ${selectedSubscribers.size} subscribers!`);
        },
        (error) => {
          alert('Bulk delete failed: ' + error);
        }
      ));
    }
  };

  // Support both array and paginated object response for domainSubscribers
  let safeDomainSubscribers = [];
  if (Array.isArray(domainSubscribers)) {
    safeDomainSubscribers = domainSubscribers;
  } else if (domainSubscribers && Array.isArray(domainSubscribers.subscribers)) {
    safeDomainSubscribers = domainSubscribers.subscribers;
  }
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const subscribersPerPage = 20;

  // Filter subscribers based on search term
  const filteredSubscribers = safeDomainSubscribers.filter(subscriber => 
    subscriber.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscriber.subscriberName?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Log Track column for debugging
  useEffect(() => {
    if (filteredSubscribers.length > 0) {
      console.log('Track values:', filteredSubscribers.map(sub => sub.Track || sub.track || ''));
    }
  }, [filteredSubscribers]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * subscribersPerPage,
    currentPage * subscribersPerPage
  );

  // Reset to first page when filter or domain changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewDomain, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">MailMint</h1>
          <p className="text-blue-600 text-lg">Subscriber List Management</p>
        </div>

        {/* Domain Selection and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 mb-8">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-blue-900">View Subscribers</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Domain Selection */}
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Select Domain to View
              </label>
              <div className="flex space-x-2">
                <select
                  value={viewDomain}
                  onChange={(e) => handleViewDomainSubscribers(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <button
                  onClick={() => viewDomain && handleViewDomainSubscribers(viewDomain)}
                  disabled={!viewDomain || subscriberLoading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRefreshDomains}
                  disabled={domainLoading}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscribers Display Section */}
        {viewDomain && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-blue-900">
                    Subscribers for {viewDomain}
                  </h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Total: {filteredSubscribers.length} {searchTerm && `(filtered from ${safeDomainSubscribers?.length || 0})`}
                  </div>
                  <button
                    onClick={handleAddSubscriber}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Subscriber
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {filteredSubscribers.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.size === filteredSubscribers.length && filteredSubscribers.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Select All ({selectedSubscribers.size} selected)
                      </span>
                    </label>
                  </div>
                  
                  {selectedSubscribers.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected ({selectedSubscribers.size})
                    </button>
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

            <div className="p-6">
              {subscriberLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
                  <span className="text-blue-700">Loading subscribers...</span>
                </div>
              ) : subscriberError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{subscriberError}</p>
                  <button
                    onClick={() => handleViewDomainSubscribers(viewDomain)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No subscribers found matching your search' : 'No subscribers found for this domain'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {/* Table Header */}
                    <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-gray-700 border">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.size === filteredSubscribers.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        Email
                      </div>
                      <div>Name</div>
                      <div>Status</div>
                      <div>Track</div>
                      <div>Actions</div>
                    </div>

                    {/* Subscriber Rows */}
                    {paginatedSubscribers.map((subscriber, index) => (
                      <div 
                        key={subscriber.emailAddress || index}
                        className={`grid grid-cols-5 gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
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
                        {/* Track column */}
                        <div className="flex items-center">
                          <span className="text-xs text-gray-700 truncate">{subscriber.Track || subscriber.track || ''}</span>
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
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 space-x-4">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
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