import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { createTemplate, updateTemplate, getSingleTemplate } from '../../store/actions/templateaction';
import { clearTemplateError, clearTemplateMessage } from '../../store/reducers/templateReducer';
import EditBox from './EditBox';

const TemplateEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: templateId } = useParams();
  
  // Redux state
  const {
    loading: templateLoading,
    error: templateError,
    message: templateMessage,
    template: singleTemplate,
    updateLoading,
    updateError,
    updateMessage,
    singleLoading
  } = useSelector(state => state.template);

  // Local state
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    status: 'Draft'
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const isEditMode = !!templateId;
  const loading = templateLoading || updateLoading || singleLoading;
  const error = templateError || updateError;

  // Clear errors and reset state on component mount
  useEffect(() => {
    dispatch(clearTemplateError());
    dispatch(clearTemplateMessage());
    
    // Reset state when templateId changes or component mounts
    if (isEditMode) {
      setIsDataLoaded(false);
      setInitialLoadComplete(false);
      setFormData({
        title: '',
        body: '',
        status: 'Draft'
      });
    } else {
      setInitialLoadComplete(true);
    }
  }, [dispatch, templateId]);

  // Load template data for edit mode
  useEffect(() => {
    if (isEditMode && templateId && !isDataLoaded && !singleLoading) {
      dispatch(getSingleTemplate(templateId));
    }
  }, [dispatch, templateId, isEditMode, isDataLoaded, singleLoading]);

  // Populate form when template data is received
  useEffect(() => {
    if (isEditMode && singleTemplate && singleTemplate._id && !isDataLoaded) {
      const newFormData = {
        title: singleTemplate.title || '',
        body: singleTemplate.body || '',
        status: singleTemplate.status || 'Draft'
      };
      
      setFormData(newFormData);
      setIsDataLoaded(true);
      setInitialLoadComplete(true);
      toast.success('Template data loaded successfully!');
    }
  }, [singleTemplate, isEditMode, isDataLoaded]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('❌ Error occurred:', error);
      toast.error(typeof error === 'string' ? error : 'An error occurred');
      setIsSubmitting(false);
    }
  }, [error]);

  // Handle success messages
  useEffect(() => {
    if (templateMessage && !isEditMode) {
      toast.success(templateMessage);
      // Reset form for create mode
      setFormData({
        title: '',
        body: '',
        status: 'Draft'
      });
      setIsSubmitting(false);
      // Navigate back to list after a short delay
      setTimeout(() => navigate('/templates'), 1500);
    }

    if (updateMessage && isEditMode) {
      toast.success(updateMessage);
      setIsSubmitting(false);
      // Navigate back to list after a short delay
      setTimeout(() => navigate('/templates'), 1500);
    }
  }, [templateMessage, updateMessage, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      body: content
    }));
  };

  const cleanHtmlContent = (html) => {
    if (!html) return '';
    return html
      .replace(/<p><br><\/p>/gi, '')
      .replace(/<p>&nbsp;<\/p>/gi, '')
      .replace(/<p><\/p>/gi, '')
      .replace(/<div><br><\/div>/gi, '')
      .replace(/<div>&nbsp;<\/div>/gi, '')
      .replace(/<div><\/div>/gi, '')
      .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, '')
      .trim();
  };

  const getTextContent = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const validateForm = () => {
    const cleanedBody = cleanHtmlContent(formData.body);
    const textContent = getTextContent(cleanedBody);

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return false;
    }

    if (formData.title.trim().length < 3) {
      toast.error('Title must be at least 3 characters long');
      return false;
    }

    if (!cleanedBody) {
      toast.error('Please enter template content');
      return false;
    }

    if (textContent.length < 10) {
      toast.error('Template content must be at least 10 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    const submitData = {
      title: formData.title.trim(),
      body: cleanHtmlContent(formData.body),
      status: formData.status
    };

    try {
      if (isEditMode) {
        await dispatch(updateTemplate(templateId, submitData));
      } else {
        await dispatch(createTemplate(submitData));
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    if (isEditMode && isDataLoaded) {
      // In edit mode, restore original data
      const originalData = {
        title: singleTemplate?.title || '',
        body: singleTemplate?.body || '',
        status: singleTemplate?.status || 'Draft'
      };
      setFormData(originalData);
      toast.info('Form reset to original values');
    } else {
      // In create mode, clear everything
      setFormData({
        title: '',
        body: '',
        status: 'Draft'
      });
      toast.info('Form cleared');
    }
  };

  const handleCancel = () => {
    navigate('/templates');
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  // Show loading state for edit mode while data is being fetched
  if (isEditMode && (singleLoading || !initialLoadComplete)) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Templates
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Template</h1>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
            <div>
              <p className="text-blue-800 font-medium">Loading template data...</p>
              <p className="text-blue-600 text-sm">Please wait while we fetch the template details.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Templates
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Template' : 'Create New Template'}
        </h1>
        <p className="text-gray-600">
          {isEditMode 
            ? `Editing template: ${formData.title || 'Loading...'}`
            : 'Create and customize your email template'
          }
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                disabled={loading || isSubmitting}
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter template title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              required
              disabled={loading || isSubmitting}
            />
          </div>

          {/* Template Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Template Content *
              </label>
              <button
                type="button"
                onClick={togglePreview}
                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                disabled={loading || isSubmitting}
              >
                {isPreview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </>
                )}
              </button>
            </div>

            {!isPreview ? (
              <div className={loading || isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
                <EditBox
                  value={formData.body}
                  onChange={handleEditorChange}
                />
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[300px]">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Preview</h3>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.body || '<p class="text-gray-500 italic">No content to preview</p>' 
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              disabled={loading || isSubmitting}
            >
              {isEditMode ? 'Reset to Original' : 'Clear Form'}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={loading || isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || isSubmitting || (isEditMode && !isDataLoaded)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Update Template' : 'Create Template'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateEdit;