import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { listTemplates } from '../../store/actions/templateaction';
import { fetchMailSettings } from '../../store/actions/mailSettingaction';
import { getSingleDomain,updateDomain } from '../../store/actions/domainaction';
import {toast} from 'react-toastify';
import { 
    Database, 
    Save, 
    ArrowLeft, 
    Mail, 
    FileText, 
    AlertCircle,
    Loader2 
} from 'lucide-react';

const EditDomain = () => {
    const { id: domainId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Selectors for getting data from Redux store
    const { domain: currentDomain, loading: domainLoading, updateLoading } = useSelector((state) => state.domain);
    const { templates, fetchLoading: templatesLoading } = useSelector((state) => state.template || {});
    const { mailSettings, fetchLoading: mailSettingsLoading } = useSelector((state) => state.mailSetting || {});
    
    // Local state
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedMailSetting, setSelectedMailSetting] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Always fetch the single domain
        dispatch(getSingleDomain(domainId));
        
        // Fetch templates and mail settings if not already loaded
        if (!templates || templates.length === 0) {
            dispatch(listTemplates());
        }
        if (!mailSettings || mailSettings.length === 0) {
            dispatch(fetchMailSettings());
        }
    }, [domainId, dispatch, templates, mailSettings]);

    useEffect(() => {
        // Set selected values when domain data is loaded
        if (currentDomain) {
            setSelectedTemplate(currentDomain.template?._id || '');
            setSelectedMailSetting(currentDomain.mailSetting?._id || '');
        }
    }, [currentDomain]);

    const handleSave = async () => {
        try {
            const updateData = {
                template: selectedTemplate || null,
                mailSetting: selectedMailSetting || null,
            };

            // dispatch(updateDomain(domainId, updateData));
            console.log('Updating domain:', domainId, updateData);
            dispatch(updateDomain(updateData, domainId, toast));
        } catch (err) {
            setError('Failed to update domain. Please try again.');
        }
    };

    const handleGoBack = () => {
        navigate('/domains');
    };

    // Show loading while fetching domain data
    if (domainLoading || !currentDomain) {
        return (
            <div className="p-6 flex justify-center items-center min-h-64">
                <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading domain...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={handleGoBack}
                    className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Domains
                </button>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Database className="h-6 w-6 mr-2 text-blue-600" />
                            Edit Domain Configuration
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure template and mail settings for {currentDomain.domain}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Domain Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-600" />
                    Domain Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Domain Name
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                            {currentDomain.domain}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sender Email
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                            {currentDomain.senderMail}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                currentDomain.status === 'verified'
                                    ? 'bg-green-100 text-green-800'
                                    : currentDomain.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {currentDomain.status?.charAt(0).toUpperCase() + currentDomain.status?.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
                
                {currentDomain.description && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                            {currentDomain.description}
                        </div>
                    </div>
                )}
            </div>

            {/* Configuration Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Email Configuration
                </h2>
                
                <div className="space-y-6">
                    {/* Template Selection */}
                    <div>
                        <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="h-4 w-4 inline mr-1" />
                            Email Template
                        </label>
                        <select
                            id="template"
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={templatesLoading}
                        >
                            <option value="">Select a template...</option>
                            {templatesLoading ? (
                                <option disabled>Loading templates...</option>
                            ) : (
                                templates?.map((template) => (
                                    <option key={template._id} value={template._id}>
                                        {template.title} ({template.status})
                                    </option>
                                ))
                            )}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            Choose an email template for this domain. Only active templates are recommended.
                        </p>
                        
                        {/* Current Template Status */}
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                                <FileText className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="text-sm font-medium text-blue-800">
                                    Current Template: 
                                </span>
                                <span className="ml-1 text-sm text-blue-700">
                                    {currentDomain.template ? currentDomain.template.title || 'Template Set' : 'No template assigned'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mail Setting Selection */}
                    <div>
                        <label htmlFor="mailSetting" className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="h-4 w-4 inline mr-1" />
                            Mail Subject
                        </label>
                        <select
                            id="mailSetting"
                            value={selectedMailSetting}
                            onChange={(e) => setSelectedMailSetting(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={mailSettingsLoading}
                        >
                            <option value="">Select a mail subject...</option>
                            {mailSettingsLoading ? (
                                <option disabled>Loading mail subjects...</option>
                            ) : (
                                mailSettings?.map((setting) => (
                                    <option key={setting._id} value={setting._id}>
                                        {setting.title} - {setting.subject}
                                    </option>
                                ))
                            )}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            Choose mail subjects that define the campaign parameters and sending configuration.
                        </p>
                        
                        {/* Current Mail Setting Status */}
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-800">
                                    Current Mail Subject: 
                                </span>
                                <span className="ml-1 text-sm text-green-700">
                                    {currentDomain.mailSetting ? currentDomain.mailSetting.title || 'Mail Setting Set' : 'No mail setting assigned'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={updateLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        {updateLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditDomain;