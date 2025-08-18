import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, Mail, User, Check, X, Download, Users, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { fetchDomains } from "../../store/actions/domainaction";
import { addSubscriber, bulkUploadSubscribers } from "../../store/actions/subsaction";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const SubscriberManager = () => {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [bulkUploadDomain, setBulkUploadDomain] = useState('');
  const [subscriberData, setSubscriberData] = useState({
    email: '',
    name: '',
    status: 'active'
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    domains,
    loading: domainLoading,
    error: domainError,
  } = useSelector((state) => state.domain);
  console.log(domains);
  const {
    subscribers,
    loading: subscriberLoading,
    error: subscriberError,
    message: subscriberMessage,
    bulkUploadLoading,
    bulkUploadError,
  } = useSelector((state) => state.subs);

  useEffect(() => {
    dispatch(fetchDomains());
  }, [dispatch]);

  // Handle subscriber success/error messages
  useEffect(() => {
    if (subscriberMessage) {
      setSuccessMessage(subscriberMessage);
    }
  }, [subscriberMessage]);

  useEffect(() => {
    if (subscriberError) {
      setErrorMessage(subscriberError);
    }
  }, [subscriberError]);

  useEffect(() => {
    if (bulkUploadError) {
      setErrorMessage(bulkUploadError);
    }
  }, [bulkUploadError]);

  const handleRefreshDomains = () => {
    dispatch(fetchDomains());
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDomain || !subscriberData.email) {
      setErrorMessage('Please fill all required fields (Domain and Email)');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    const subscriberPayload = {
      email: subscriberData.email,
      name: subscriberData.name || null,
      status: subscriberData.status,
      domain: selectedDomain
    };

    dispatch(addSubscriber(
      subscriberPayload,
      (result) => {
        setSuccessMessage(`Subscriber added successfully to ${selectedDomain}`);
        setSubscriberData({ email: '', name: '', status: 'active' });
        setSelectedDomain('');
      },
      (error) => {
        setErrorMessage(error);
      }
    ));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!bulkUploadDomain) {
      setErrorMessage('Please select a domain first');
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMessage('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploadProgress(0);
    setErrorMessage('');
    setSuccessMessage('');

    // Simulate progress for UI feedback
    setUploadProgress(20);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setUploadProgress(50);
    await new Promise(resolve => setTimeout(resolve, 200));

    // Create FormData
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('domain', bulkUploadDomain);
     console.log([...formData.entries()])
    
    setUploadProgress(80);

    dispatch(bulkUploadSubscribers(
      formData,
      (result) => {
        setUploadProgress(100);
        setSuccessMessage(`Successfully uploaded subscribers from ${file.name} to ${bulkUploadDomain}`);
        setBulkUploadDomain('');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        setTimeout(() => setUploadProgress(0), 1000);
      },
      (error) => {
        setErrorMessage(error);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    ));
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const downloadTemplate = () => {
    // Create a sample Excel template with only email column
    const templateData = [
      { Email: 'john@example.com' },
      { Email: 'jane@example.com' },
      { Email: 'user@domain.com' }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subscribers');
    XLSX.writeFile(wb, 'subscriber_template.xlsx');
  };

  return domains && (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">MailMint</h1>
          <p className="text-blue-600 text-lg">Subscriber Management</p>
        </div>

        {/* Success/Error Messages */}
        {(successMessage || errorMessage) && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            successMessage ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {successMessage ? (
                <Check className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <X className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={successMessage ? 'text-green-800' : 'text-red-800'}>
                {successMessage || errorMessage}
              </span>
            </div>
            <button onClick={clearMessages} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Single Subscriber Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center mb-6">
              <Plus className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-blue-900">Add Single Subscriber</h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Domain Selection */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Domain *
                </label>
                <div className="relative">
                  <select
                    name="domain"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={domainLoading || subscriberLoading}
                  >
                    <option value="">
                      {domainLoading ? "Loading domains..." : "Select Domain"}
                    </option>
                    {domains?.map((domain, index) => (
                      <option
                        key={domain.id || domain.name || `domain-${index}`}
                        value={domain.name || domain.domain}
                      >
                        {domain.name || domain.domain}
                      </option>
                    ))}
                  </select>
                  {domainLoading && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {domainError && (
                  <div className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{domainError}</span>
                    <button
                      type="button"
                      onClick={handleRefreshDomains}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      disabled={domainLoading}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-blue-400" />
                  <input
                    type="email"
                    value={subscriberData.email}
                    onChange={(e) => setSubscriberData({...subscriberData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="subscriber@example.com"
                    required
                    disabled={subscriberLoading}
                  />
                </div>
              </div>

              {/* Name Input - Now Optional */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Subscriber Name <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-blue-400" />
                  <input
                    type="text"
                    value={subscriberData.name}
                    onChange={(e) => setSubscriberData({...subscriberData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe (optional)"
                    disabled={subscriberLoading}
                  />
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Status
                </label>
                <select
                  value={subscriberData.status}
                  onChange={(e) => setSubscriberData({...subscriberData, status: e.target.value})}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  disabled={subscriberLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={subscriberLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {subscriberLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Subscriber
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bulk Upload */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center mb-6">
              <Upload className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-blue-900">Bulk Upload</h2>
            </div>

            <div className="space-y-4">
              {/* Domain Selection for Bulk Upload */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Select Domain *
                </label>
                <div className="relative">
                  <select
                    value={bulkUploadDomain}
                    onChange={(e) => setBulkUploadDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={domainLoading || bulkUploadLoading}
                  >
                    <option value="">
                      {domainLoading ? "Loading domains..." : "Select Domain"}
                    </option>
                    {domains?.map((domain, index) => (
                      <option
                        key={domain.id || domain.name || `bulk-domain-${index}`}
                        value={domain.name || domain.domain}
                      >
                        {domain.name || domain.domain}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Format Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-blue-800">Excel Format Required:</h3>
                  <button
                    onClick={downloadTemplate}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Template
                  </button>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Column 1: Email (required)</p>
                  <p>• Name and Status will be auto-generated</p>
                  <p>• Status will be set to 'active' by default</p>
                </div>
              </div>

              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  bulkUploadDomain && !bulkUploadLoading
                    ? 'border-blue-300 hover:border-blue-400' 
                    : 'border-gray-300 cursor-not-allowed'
                }`}
                onClick={() => bulkUploadDomain && !bulkUploadLoading && fileInputRef.current?.click()}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${
                  bulkUploadDomain && !bulkUploadLoading ? 'text-blue-400' : 'text-gray-400'
                }`} />
                <p className={`font-medium mb-2 ${
                  bulkUploadDomain && !bulkUploadLoading ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  {bulkUploadLoading 
                    ? 'Uploading...' 
                    : bulkUploadDomain 
                      ? 'Click to upload Excel file' 
                      : 'Select domain first'
                  }
                </p>
                <p className="text-sm text-blue-500">
                  Supports .xlsx and .xls files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={!bulkUploadDomain || bulkUploadLoading}
                />
              </div>

              {/* Progress Bar */}
              {(bulkUploadLoading || uploadProgress > 0) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-blue-700">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriberManager;