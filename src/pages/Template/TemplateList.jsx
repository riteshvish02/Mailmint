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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center text-gray-800">
            <Eye className="h-6 w-6 mr-2" />
            Email Templates
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your email templates ({validTemplates.length} template{validTemplates.length !== 1 ? 's' : ''})
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-200 transition-colors"
            disabled={fetchLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${fetchLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/templates/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && validTemplates.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <p className="text-yellow-800 font-medium">Warning</p>
              <p className="text-yellow-600 text-sm">
                There was an issue loading some templates: {fetchError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Templates Content */}
      <div className="bg-white border rounded-lg shadow-sm">
        {validTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📧</div>
            <div className="text-gray-500 text-xl mb-2">No templates found</div>
            <p className="text-gray-400 mb-6">Create your first email template to get started.</p>
            <button
              onClick={() => navigate('/templates/create')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center mx-auto hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                          
                          {/* Delete confirmation popup */}
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

                          {deleteConfirm && deleteConfirm._id === template._id && (
                            <div className="absolute -top-1 -right-1 bg-red-100 border border-red-300 rounded px-3 py-3 flex gap-1 z-50 text-xs">
                              <button
                                onClick={cancelDelete}
                                className="text-black-400 hover:text-gray-800"
                              >
                                No
                              </button>
                              <span className="text-gray-400">|</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete();
                                }}
                                disabled={deletingTemplateId === template._id}
                                className="text-red-500 hover:text-red-800 disabled:opacity-50"
                              >
                                {deletingTemplateId === template._id ? 'Wait...' : 'Yes'}
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
        )}
      </div>

      {/* Footer Info */}
      {validTemplates.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
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