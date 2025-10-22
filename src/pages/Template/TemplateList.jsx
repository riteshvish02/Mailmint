import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { listTemplates, deleteTemplate } from '../../store/actions/templateaction';
import { clearFetchError } from '../../store/reducers/templateReducer';
import { z } from 'zod';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Edit, Trash2, Plus, RefreshCw, Eye } from 'lucide-react';

// Updated schema without domain field
const templateSchema = z.object({
  _id: z.string(),
  status: z.enum(['Active', 'Draft']).optional().default('Active'),
  title: z.string().min(1),
  body: z.string(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const TemplateList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { templates, fetchLoading, fetchError, deleteLoading } = useSelector((state) => state.template);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    dispatch(listTemplates());

    return () => {
      dispatch(clearFetchError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (fetchError) {
      toast.error(`Error loading templates: ${fetchError}`);
    }
  }, [fetchError]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    dispatch(listTemplates());
    toast.info('Refreshing templates...');
  };

  const handleEdit = (template) => {
    navigate(`/templates/edit/${template._id}`);
  };

  const handleDelete = (template, event) => {
    event.stopPropagation();
    setDeleteConfirm(template);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    setDeletingTemplateId(deleteConfirm._id);
    try {
      await dispatch(deleteTemplate(deleteConfirm._id));
      setDeleteConfirm(null);
      setDeletingTemplateId(null);
      toast.success('Template deleted successfully!');
      // Refresh the list to ensure consistency
      dispatch(listTemplates());
    } catch (error) {
      setDeletingTemplateId(null);
      toast.error('Failed to delete template');
    }
  };

  const cancelDelete = (event) => {
    event.stopPropagation();
    setDeleteConfirm(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100';
      case 'Draft':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Loading state
  if (fetchLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading templates...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your templates</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter valid templates
  const validTemplates = templates.filter((template) => {
    try {
      const result = templateSchema.safeParse(template);
      if (!result.success) {
        // Still include template if it has basic required fields
        return template._id && template.title && template.body !== undefined;
      }
      return true;
    } catch (error) {
      // Fallback: include if basic fields exist
      return template._id && template.title && template.body !== undefined;
    }
  });

  // Error state with retry option
  if (fetchError && !fetchLoading && validTemplates.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Templates</h2>
            <p className="text-gray-600 mb-6">{fetchError}</p>
            <div className="space-x-4">
              <button
                onClick={handleRetry}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center mx-auto hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center text-gray-800">
            <Eye className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Email Templates
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your email templates ({validTemplates.length} template{validTemplates.length !== 1 ? 's' : ''})
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-sm sm:text-base"
            disabled={fetchLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 sm:mr-2 ${fetchLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh</span>
          </button>
          <button
            onClick={() => navigate('/templates/create')}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Create Template</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && validTemplates.length > 0 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start sm:items-center">
            <div className="text-yellow-600 mr-3 text-lg sm:text-base">⚠️</div>
            <div className="flex-1">
              <p className="text-yellow-800 font-medium text-sm sm:text-base">Warning</p>
              <p className="text-yellow-600 text-xs sm:text-sm">
                There was an issue loading some templates: {fetchError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Templates Content */}
      <div className="bg-white border rounded-lg shadow-sm">
        {validTemplates.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📧</div>
            <div className="text-gray-500 text-lg sm:text-xl mb-2">No templates found</div>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Create your first email template to get started.</p>
            <button
              onClick={() => navigate('/templates/create')}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center mx-auto hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block lg:hidden divide-y divide-gray-200">
              {validTemplates
                .filter(template => deletingTemplateId !== template._id)
                .map((template) => (
                <div key={template._id} className="p-4 hover:bg-gray-50 transition-colors">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {template.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {template._id.substring(0, 8)}...
                      </p>
                    </div>
                    <span className={`ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(template.status)}`}>
                      {template.status || 'Draft'}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-3">
                    {/* Content Preview */}
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Content Preview:</span>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {stripHtml(template.body).substring(0, 150)}
                        {stripHtml(template.body).length > 150 && '...'}
                      </p>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Created:</span>
                      <span className="text-sm text-gray-600">
                        {formatDate(template.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-end space-x-3 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-sm transition-colors"
                      title="Edit Template"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={(e) => handleDelete(template, e)}
                        className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-sm transition-colors"
                        disabled={deletingTemplateId === template._id}
                        title="Delete Template"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                      
                      {/* Delete confirmation popup for mobile */}
                      {deleteConfirm && deleteConfirm._id === template._id && (
                        <div className="absolute -top-12 right-0 bg-white border border-red-200 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
                          <p className="text-sm text-gray-700 mb-3">Delete this template?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={cancelDelete}
                              className="flex-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete();
                              }}
                              disabled={deletingTemplateId === template._id}
                              className="flex-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                              {deletingTemplateId === template._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Content Preview</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {validTemplates
                    .filter(template => deletingTemplateId !== template._id)
                    .map((template) => (
                    <tr key={template._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{template.title}</div>
                        <div className="text-sm text-gray-500">
                          ID: {template._id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                          {template.status || 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-sm text-gray-600 truncate">
                          {stripHtml(template.body).substring(0, 100)}
                          {stripHtml(template.body).length > 100 && '...'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(template.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(template)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                            title="Edit Template"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <div className="relative">
                            <button
                              onClick={(e) => handleDelete(template, e)}
                              className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                              disabled={deletingTemplateId === template._id}
                              title="Delete Template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            
                            {/* Delete confirmation popup for desktop */}
                            {deleteConfirm && deleteConfirm._id === template._id && (
                              <div className="absolute -top-2 -right-2 bg-white border border-red-200 rounded-md shadow-lg p-1 flex gap-1 z-50 min-w-[60px]">
                                <button
                                  onClick={cancelDelete}
                                  className="w-6 h-6 text-xs text-gray-500 hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
                                  title="Cancel"
                                >
                                  ✕
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete();
                                  }}
                                  disabled={deletingTemplateId === template._id}
                                  className="w-6 h-6 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                                  title="Confirm Delete"
                                >
                                  {deletingTemplateId === template._id ? (
                                    <div className="animate-spin text-[10px]">⟳</div>
                                  ) : (
                                    '✓'
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      {validTemplates.length > 0 && (
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
          <p>
            Showing {validTemplates.length} template{validTemplates.length !== 1 ? 's' : ''}
            {retryCount > 0 && ` • Refreshed ${retryCount} time${retryCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {/* Delete confirmation overlay */}
      {deleteConfirm && (
        <div 
          className="bg-red-400"
          onClick={cancelDelete}
        />
      )}
    </div>
  );
};

export default TemplateList;