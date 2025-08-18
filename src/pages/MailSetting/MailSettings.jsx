import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addMailSetting } from '../../store/actions/mailSettingaction';

// Zod schema for form validation
const mailSettingsSchema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters"),
  mailSubject: z.string().min(1, "Mail Subject is required").max(100, "Mail Subject must be less than 100 characters")
});

const MailSettings = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { loading: mailSettingLoading = false, error: mailSettingError = null } = useSelector(state => state.mailSetting || {});
  
  const [formData, setFormData] = useState({
    title: '',
    mailSubject: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data with Zod
      const validatedData = mailSettingsSchema.parse(formData);
      
      // Transform data to match backend expectations
      const transformedData = {
        title: validatedData.title,
        subject: validatedData.mailSubject     
      };
      
      // Dispatch add mail setting action
      dispatch(addMailSetting(
        transformedData,
        () => {
          // Success callback
          toast.success('Mail settings saved successfully!', {
            position: "top-right",
            autoClose: 3000,
          });
          setFormData({
            title: '',
            mailSubject: ''
          });
        },
        (errorMessage) => {
          // Error callback
          toast.error(`Error: ${errorMessage}`, {
            position: "top-right",
            autoClose: 5000,
          });
        }
      ));
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const fieldErrors = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the form errors before submitting.', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error('An error occurred while saving settings.', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Mail Settings</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title Field */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter title"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <div className="mt-1 text-sm text-gray-500">
                      {formData.title.length}/50 characters
                    </div>
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Mail Subject */}
                  <div>
                    <label htmlFor="mailSubject" className="block text-sm font-medium text-gray-700 mb-2">
                      Mail Subject*
                    </label>
                    <input
                      type="text"
                      id="mailSubject"
                      name="mailSubject"
                      value={formData.mailSubject}
                      onChange={handleInputChange}
                      placeholder="Enter mail subject"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.mailSubject ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <div className="mt-1 text-sm text-gray-500">
                      {formData.mailSubject.length}/100 characters
                    </div>
                    {errors.mailSubject && (
                      <p className="mt-1 text-sm text-red-600">{errors.mailSubject}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || mailSettingLoading}
                    className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      (isSubmitting || mailSettingLoading) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {(isSubmitting || mailSettingLoading) ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailSettings;