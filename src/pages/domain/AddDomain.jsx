import React, { useState, useEffect } from 'react';
import { Plus, Save, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { addDomain } from '../../store/actions/domainaction';
import { clearDomainError } from '../../store/reducers/domainReducer';

const domainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain name is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.([a-zA-Z]{2,}\.?)+$/, 'Please enter a valid domain name (e.g., example.com)'),
  senderEmail: z
    .string()
    .min(1, 'Sender email is required')
    .email('Please enter a valid email address'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters long')
    .max(500, 'Description must be less than 500 characters')
});

const AddDomain = () => {
  const [formData, setFormData] = useState({
    domain: '',
    senderEmail: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainData, setDomainData] = useState(null);
  const [showVerificationData, setShowVerificationData] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.domain);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    try {
      domainSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const clearForm = () => {
    setFormData({
      domain: '',
      senderEmail: '',
      description: ''
    });
    setErrors({});
    setIsSubmitting(false);
    setDomainData(null);
    setShowVerificationData(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    dispatch(addDomain(
      formData,
      (responseData) => {
        console.log('✅ Success Response Data:', responseData); // Debug log
        toast.success("Domain added successfully 🎉");
        
        // Set domain data and show verification section
        setDomainData(responseData);
        setShowVerificationData(true);
        setIsSubmitting(false);
      },
      (errorMessage) => {
        setIsSubmitting(false);
      }
    ));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearDomainError());
      setIsSubmitting(false);
    }
  }, [error, dispatch]);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold flex items-center text-gray-800 mb-6">
        <Plus className="h-6 w-6 mr-2" />
        Add Domain Details
      </h1>

      <div className="bg-white border rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Domain Name*</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                placeholder="example.com"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.domain ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.domain && <p className="mt-1 text-sm text-red-600">{errors.domain}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sender Email*</label>
              <input
                type="email"
                name="senderEmail"
                value={formData.senderEmail}
                onChange={handleChange}
                placeholder="admin@example.com"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.senderEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.senderEmail && <p className="mt-1 text-sm text-red-600">{errors.senderEmail}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter a detailed description about this domain..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={clearForm}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading || isSubmitting ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Domain Verification Data Section */}
      {showVerificationData && domainData && (
        <div className="mt-6 bg-white border rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Domain Verification Required</h2>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                Please add the following DNS records to verify your domain:
              </span>
            </div>
            <p className="text-sm text-yellow-700">
              Domain: <strong>{domainData.domain || 'N/A'}</strong> | 
              Status: <strong>{domainData.status || 'N/A'}</strong>
            </p>
          </div>

         

          {/* TXT Record */}
          {domainData.txtRecord && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">TXT Record (Domain Verification)</h3>
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                    <div className="flex items-center">
                      <code className="bg-white px-2 py-1 rounded border text-sm flex-1 break-all">
                        {domainData.txtRecord.name}
                      </code>
                      <button
                        onClick={() => copyToClipboard(domainData.txtRecord.name)}
                        className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                    <code className="bg-white px-2 py-1 rounded border text-sm block">
                      {domainData.txtRecord.type}
                    </code>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Value</label>
                    <div className="flex items-center">
                      <code className="bg-white px-2 py-1 rounded border text-sm flex-1 break-all">
                        {domainData.txtRecord.value}
                      </code>
                      <button
                        onClick={() => copyToClipboard(domainData.txtRecord.value)}
                        className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DKIM Records */}
          {domainData.dkimRecords && Array.isArray(domainData.dkimRecords) && domainData.dkimRecords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">DKIM Records (Email Authentication)</h3>
              <div className="space-y-4">
                {domainData.dkimRecords.map((record, index) => (
                  <div key={index} className="bg-gray-50 border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">DKIM Record {index + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                        <div className="flex items-center">
                          <code className="bg-white px-2 py-1 rounded border text-sm flex-1 break-all">
                            {record.name}
                          </code>
                          <button
                            onClick={() => copyToClipboard(record.name)}
                            className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                        <code className="bg-white px-2 py-1 rounded border text-sm block">
                          {record.type}
                        </code>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Value</label>
                        <div className="flex items-center">
                          <code className="bg-white px-2 py-1 rounded border text-sm flex-1 break-all">
                            {record.value}
                          </code>
                          <button
                            onClick={() => copyToClipboard(record.value)}
                            className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show message if no DNS records are available */}
          {(!domainData.txtRecord && (!domainData.dkimRecords || domainData.dkimRecords.length === 0)) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">
                  No DNS records found in the response. Please check the backend response format.
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setShowVerificationData(false);
                setDomainData(null);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Another Domain
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDomain;