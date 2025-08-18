import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit, Trash2, Eye, Send, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchMailSettings, deleteMailSetting, updateMailSetting } from '../../store/actions/mailSettingaction';

const ListMailSettings = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { mailSettings = [], fetchLoading = false, error = null } = useSelector(state => state.mailSetting || {});
  
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editSubjectValue, setEditSubjectValue] = useState('');
  
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

  const handleEditSubject = (id, currentSubject) => {
    setEditingSubject(id);
    setEditSubjectValue(currentSubject);
  };

  const handleSaveSubject = (id) => {
    const updateData = { 
      subject: editSubjectValue
    };
    
    dispatch(updateMailSetting(
      id,
      updateData,
      (data) => {
        toast.success('Mail subject updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setEditingSubject(null);
        setEditSubjectValue('');
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
    setEditingSubject(null);
    setEditSubjectValue('');
  };

  const handlePublish = (id) => {
    toast.info('Publishing functionality will be implemented', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleView = (id) => {
    toast.info('View functionality will be implemented', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Function to get domain name based on data structure
  const getDomainName = (setting) => {
    if (setting?.domain?.domain) {
      return setting.domain.domain;
    }
    
    if (setting?.domain?.name) {
      return setting.domain.name;
    }
    
    if (setting?.domainName) {
      return setting.domainName;
    }
    
    return 'N/A';
  };

  // Function to get template name based on data structure  
  const getTemplateName = (setting) => {
    if (setting?.template?.title) {
      return setting.template.title;
    }
    
    if (setting?.template?.name) {
      return setting.template.name;
    }
    
    if (setting?.templateTitle) {
      return setting.templateTitle;
    }
    
    return 'N/A';
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
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin" size={20} />
          <div className="text-lg text-gray-600">Loading mail settings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-lg text-red-600">Error: {error}</div>
        <button
          onClick={handleRefreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Mail Settings List</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Total: {mailSettings.length} mail settings
              </div>
              <button
                onClick={handleRefreshData}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center space-x-1"
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === mailSettings.length && mailSettings.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Sr No.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Domain Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Template</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Mail Subject</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mailSettings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                          <div>No mail settings found</div>
                          <button
                            onClick={handleRefreshData}
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Refresh Data
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    mailSettings.map((setting, index) => (
                      <tr key={setting._id || setting.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(setting._id || setting.id)}
                            onChange={() => handleRowSelect(setting._id || setting.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-4 text-sm text-blue-600">
                          {getDomainName(setting)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {getTemplateName(setting)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {editingSubject === (setting._id || setting.id) ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editSubjectValue}
                                onChange={(e) => setEditSubjectValue(e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                maxLength="100"
                              />
                              <button
                                onClick={() => handleSaveSubject(setting._id || setting.id)}
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="max-w-xs truncate" title={setting.subject}>
                              {setting.subject || 'N/A'}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleView(setting._id || setting.id)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handlePublish(setting._id || setting.id)}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                              title="Publish"
                            >
                              <Send size={16} />
                            </button>
                            <button
                              onClick={() => handleEditSubject(setting._id || setting.id, setting.subject)}
                              className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded"
                              title="Edit Subject"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(setting._id || setting.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
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
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedRows.length} item(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRows([])}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListMailSettings;