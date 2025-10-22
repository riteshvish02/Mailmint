import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit, Trash2, RefreshCw, Mail, Settings, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchMailSettings, deleteMailSetting, updateMailSetting } from '../../store/actions/mailSettingaction';

const ListMailSettings = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { mailSettings = [], fetchLoading = false, error = null } = useSelector(state => state.mailSetting || {});
  
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({
    subject: '',
    title: ''
  });
  
  // Fetch mail settings on component mount
  useEffect(() => {
    dispatch(fetchMailSettings());
  }, [dispatch]);

  const handleRefreshData = () => {
    dispatch(fetchMailSettings());
    toast.info('Refreshing mail settings...', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === mailSettings.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(mailSettings.map(setting => setting._id || setting.id));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this mail setting?')) {
      dispatch(deleteMailSetting(
        id,
        (data) => {
          toast.success('Mail setting deleted successfully!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        },
        (errorMessage) => {
          toast.error(`Error: ${errorMessage}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      ));
    }
  };

  const handleEdit = (id, currentSubject, currentTitle) => {
    setEditingItem(id);
    setEditValues({
      subject: currentSubject || '',
      title: currentTitle || ''
    });
  };

  const handleSave = (id) => {
    const updateData = { 
      subject: editValues.subject,
      title: editValues.title
    };
    
    dispatch(updateMailSetting(
      id,
      updateData,
      (data) => {
        toast.success('Mail setting updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setEditingItem(null);
        setEditValues({ subject: '', title: '' });
      },
      (errorMessage) => {
        toast.error(`Error: ${errorMessage}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    ));
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditValues({ subject: '', title: '' });
  };

  const handleInputChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected items?`)) {
      selectedRows.forEach(id => {
        dispatch(deleteMailSetting(
          id, 
          (data) => {
            // Success handled by individual toast notifications
          },
          (error) => {
            toast.error(`Failed to delete item: ${error}`, {
              position: "top-right",
              autoClose: 5000,
            });
          }
        ));
      });
      
      toast.success(`Deleting ${selectedRows.length} selected items...`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      setSelectedRows([]);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex items-center space-x-4 max-w-sm w-full">
          <RefreshCw className="animate-spin text-blue-600" size={24} />
          <div className="text-base sm:text-lg text-gray-700 font-medium">Loading mail settings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex flex-col justify-center items-center space-y-6 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center max-w-md w-full">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <div className="text-lg sm:text-xl text-red-600 font-semibold mb-4">Error: {error}</div>
          <button
            onClick={handleRefreshData}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                  <Mail className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Mail Settings</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your email configuration settings</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-6">
                <div className="flex items-center space-x-2 bg-blue-50 px-3 sm:px-4 py-2 rounded-xl">
                  <Settings className="text-blue-600" size={14} />
                  <span className="text-xs sm:text-sm font-medium text-blue-700">
                    {mailSettings.length} Settings
                  </span>
                </div>
                <button
                  onClick={handleRefreshData}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 text-sm sm:text-base"
                >
                  <RefreshCw size={14} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {/* Mobile Header with Select All */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === mailSettings.length && mailSettings.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm font-semibold">Select All</span>
                  </div>
                  <span className="text-sm font-medium">{selectedRows.length} selected</span>
                </div>
              </div>
              
              {/* Mobile Cards */}
              <div className="divide-y divide-gray-100">
                {mailSettings.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <Mail className="text-gray-300" size={48} />
                      <div className="text-lg text-gray-500 font-medium">No mail settings found</div>
                      <p className="text-gray-400 text-sm">Get started by creating your first mail setting</p>
                      <button
                        onClick={handleRefreshData}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                      >
                        Refresh Data
                      </button>
                    </div>
                  </div>
                ) : (
                  mailSettings.map((setting, index) => (
                    <div key={setting._id || setting.id || index} className="p-4 hover:bg-blue-50/50 transition-colors duration-150">
                      <div className="space-y-3">
                        {/* Header with checkbox and index */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(setting._id || setting.id)}
                              onChange={() => handleRowSelect(setting._id || setting.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {editingItem === (setting._id || setting.id) ? (
                              <>
                                <button
                                  onClick={() => handleSave(setting._id || setting.id)}
                                  className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-1 text-xs"
                                  title="Save Changes"
                                >
                                  <CheckCircle size={12} />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-1 text-xs"
                                  title="Cancel Edit"
                                >
                                  <XCircle size={12} />
                                  <span>Cancel</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(setting._id || setting.id, setting.subject, setting.title)}
                                  className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(setting._id || setting.id)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Title Section */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1 font-medium">Title</p>
                          {editingItem === (setting._id || setting.id) ? (
                            <input
                              type="text"
                              value={editValues.title}
                              onChange={(e) => handleInputChange('title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                              maxLength="100"
                              placeholder="Enter title"
                            />
                          ) : (
                            <div className="text-sm text-gray-900 font-medium" title={setting.title}>
                              {setting.title || 'N/A'}
                            </div>
                          )}
                        </div>
                        
                        {/* Subject Section */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1 font-medium">Mail Subject</p>
                          {editingItem === (setting._id || setting.id) ? (
                            <input
                              type="text"
                              value={editValues.subject}
                              onChange={(e) => handleInputChange('subject', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                              maxLength="100"
                              placeholder="Enter mail subject"
                            />
                          ) : (
                            <div className="text-sm text-gray-700" title={setting.subject}>
                              {setting.subject || 'N/A'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <th className="px-4 xl:px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === mailSettings.length && mailSettings.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    </th>
                    <th className="px-4 xl:px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Sr No.</th>
                    <th className="px-4 xl:px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Title</th>
                    <th className="px-4 xl:px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Mail Subject</th>
                    <th className="px-4 xl:px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mailSettings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <Mail className="text-gray-300" size={64} />
                          <div className="text-xl text-gray-500 font-medium">No mail settings found</div>
                          <p className="text-gray-400">Get started by creating your first mail setting</p>
                          <button
                            onClick={handleRefreshData}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Refresh Data
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    mailSettings.map((setting, index) => (
                      <tr key={setting._id || setting.id || index} className="hover:bg-blue-50/50 transition-colors duration-150">
                        <td className="px-4 xl:px-6 py-5">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(setting._id || setting.id)}
                            onChange={() => handleRowSelect(setting._id || setting.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                        </td>
                        <td className="px-4 xl:px-6 py-5">
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-5">
                          {editingItem === (setting._id || setting.id) ? (
                            <input
                              type="text"
                              value={editValues.title}
                              onChange={(e) => handleInputChange('title', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              maxLength="100"
                              placeholder="Enter title"
                            />
                          ) : (
                            <div className="max-w-xs">
                              <div className="font-medium text-gray-900 truncate" title={setting.title}>
                                {setting.title || 'N/A'}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 xl:px-6 py-5">
                          {editingItem === (setting._id || setting.id) ? (
                            <input
                              type="text"
                              value={editValues.subject}
                              onChange={(e) => handleInputChange('subject', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              maxLength="100"
                              placeholder="Enter mail subject"
                            />
                          ) : (
                            <div className="max-w-xs">
                              <div className="text-gray-700 truncate" title={setting.subject}>
                                {setting.subject || 'N/A'}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 xl:px-6 py-5">
                          <div className="flex justify-center space-x-2">
                            {editingItem === (setting._id || setting.id) ? (
                              <>
                                <button
                                  onClick={() => handleSave(setting._id || setting.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
                                  title="Save Changes"
                                >
                                  <CheckCircle size={14} />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
                                  title="Cancel Edit"
                                >
                                  <XCircle size={14} />
                                  <span>Cancel</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(setting._id || setting.id, setting.subject, setting.title)}
                                  className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all duration-200"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(setting._id || setting.id)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRows.length > 0 && (
          <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-sm sm:max-w-none px-4 sm:px-0">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    {selectedRows.length} item(s) selected
                  </span>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button
                    onClick={handleBulkDelete}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedRows([])}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListMailSettings;