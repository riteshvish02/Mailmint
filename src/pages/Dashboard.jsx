import React, { useState, useEffect } from 'react'
import { 
    Mail, 
    Users, 
    Send, 
    TrendingUp, 
    MousePointer, 
    LogOut, 
    Plus, 
    Settings,
    BarChart3,
    Eye,
    FileText,
    Database,
    UserPlus,
    Upload,
    List,
    MessageSquare,
    Lock,
    RefreshCw,
    Activity,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userLogout } from '../store/actions/useraction';
import { fetchDomains } from '../store/actions/domainaction';
import { listTemplates } from '../store/actions/templateaction';
import { getSubscribersByDomain } from '../store/actions/subsaction'; // Import the action

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, token } = useSelector(state => state.User);
    
    // Get real data from Redux store
    const { domains = [], loading: domainLoading } = useSelector(state => state.domain);
    const { templates = [], fetchLoading: templateLoading } = useSelector(state => state.template);
    
    // Handle subscriber state safely - it might not exist in Redux store yet
    const subscriberState = useSelector(state => state.subscriber || {});
    const { subscribersByDomain = {}, loading: subscribersLoading = false } = subscriberState;
    
    const [dashboardStats, setDashboardStats] = useState({
        totalDomains: 0,
        activeDomains: 0,
        totalTemplates: 0,
        activeTemplates: 0,
        totalSubscribers: 0,
        emailsSentToday: 0,
        emailsSentThisMonth: 0,
        dailyLimit: 2000,
        monthlyLimit: 60000
    });

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadingSubscribers, setLoadingSubscribers] = useState(false);

    // Check authentication status on component mount
    useEffect(() => {
        const storedToken = localStorage.getItem('userToken');
        if (!isAuthenticated && !storedToken) {
            navigate('/auth');
        }
    }, [isAuthenticated, navigate]);

    // Load real data on component mount
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Load domains and templates data
                await Promise.all([
                    dispatch(fetchDomains()),
                    dispatch(listTemplates())
                ]);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                toast.error('Failed to load dashboard data');
            }
        };

        if (isAuthenticated || localStorage.getItem('userToken')) {
            loadDashboardData();
        }
    }, [dispatch, isAuthenticated]);

    // Load subscribers count for all domains
    useEffect(() => {
        const loadSubscribersData = async () => {
            if (domains.length === 0) return;
            
            setLoadingSubscribers(true);
            try {
                let totalSubscribers = 0;
                
                // Fetch subscribers for each domain sequentially to avoid overwhelming the API
                for (const domain of domains) {
                    try {
                        const domainName = domain.domain || domain.name || domain.domainName;
                        if (!domainName) {
                            console.warn('Domain name not found for domain:', domain);
                            continue;
                        }

                        await new Promise((resolve) => {
                            dispatch(getSubscribersByDomain(
                                domainName,
                                (data) => {
                                    // Handle different possible response structures
                                    let count = 0;
                                    console.log(`Response for ${domainName}:`, data);
                                    
                                    // Check if it's a successful response with subscribers array
                                    if (data && data.subscribers && Array.isArray(data.subscribers)) {
                                        count = data.subscribers.length;
                                    } else if (data && data.data && Array.isArray(data.data)) {
                                        count = data.data.length;
                                    } else if (data && typeof data.count === 'number') {
                                        count = data.count;
                                    } else if (Array.isArray(data)) {
                                        count = data.length;
                                    } else {
                                        console.log(`Unexpected data structure for ${domainName}:`, data);
                                    }
                                    
                                    totalSubscribers += count;
                                    console.log(`Domain ${domainName}: ${count} subscribers (Total so far: ${totalSubscribers})`);
                                    resolve();
                                },
                                (error) => {
                                    // Note: Due to Redux action implementation, successful responses 
                                    // are sometimes routed to this error callback
                                    
                                    // Check if the "error" is actually a successful response
                                    if (error && error.subscribers && Array.isArray(error.subscribers)) {
                                        const count = error.subscribers.length;
                                        totalSubscribers += count;
                                        console.log(`Domain ${domainName}: ${count} subscribers (via error callback)`);
                                    } else {
                                        // This is an actual error
                                        console.error(`Error loading subscribers for ${domainName}:`, error);
                                    }
                                    
                                    resolve(); // Continue with other domains
                                }
                            ));
                        });
                        
                        // Small delay between API calls to be nice to the server
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                    } catch (error) {
                        console.error(`Error processing domain:`, domain, error);
                    }
                }
                
                console.log(`Total subscribers across all domains: ${totalSubscribers}`);
                
                setDashboardStats(prev => ({
                    ...prev,
                    totalSubscribers: totalSubscribers
                }));
                
            } catch (error) {
                console.error('Error loading subscribers data:', error);
                toast.error('Failed to load subscriber counts');
            } finally {
                setLoadingSubscribers(false);
            }
        };

        // Only load subscribers after domains are loaded
        if (domains.length > 0) {
            loadSubscribersData();
        }
    }, [dispatch, domains]);

    // Update stats when data changes
    useEffect(() => {
        const updateStats = () => {
            const activeDomains = domains.filter(domain => domain.status === 'Active').length;
            const activeTemplates = templates.filter(template => template.status === 'Active').length;
            
            setDashboardStats(prev => ({
                ...prev,
                totalDomains: domains.length,
                activeDomains: activeDomains,
                totalTemplates: templates.length,
                activeTemplates: activeTemplates,
                emailsSentToday: 17000,  // Keep these as mock data for now
                emailsSentThisMonth: 170000  
            }));
        };

        updateStats();
    }, [domains, templates]);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            try {
                dispatch(userLogout());
                toast.success("Logged out successfully");
                navigate('/auth', { replace: true });
            } catch (error) {
                console.error('Logout error:', error);
                toast.error("Error during logout");
            }
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                dispatch(fetchDomains()),
                dispatch(listTemplates())
            ]);
            toast.success('Dashboard data refreshed!');
        } catch (error) {
            toast.error('Failed to refresh data');
        } finally {
            setIsRefreshing(false);
        }
    };

    const calculateProgress = (sent, limit) => {
        return Math.min((sent / limit) * 100, 100);
    };

    const getProgressColor = (percentage) => {
        if (percentage < 50) return 'bg-green-500';
        if (percentage < 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Show loading or redirect if not authenticated
    if (!isAuthenticated && !localStorage.getItem('userToken')) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h2>
                    <p className="text-gray-600 mb-4">Please wait while we redirect you to login.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                                
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Domains Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                            <Database className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total Domains</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {domainLoading ? '...' : dashboardStats.totalDomains}
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">
                                                {dashboardStats.activeDomains} Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Link 
                                    to="/domains"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <ArrowUpRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                        
                        {/* Templates Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                                            <FileText className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email Templates</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {templateLoading ? '...' : dashboardStats.totalTemplates}
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">
                                                {dashboardStats.activeTemplates} Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Link 
                                    to="/templates"
                                    className="text-green-600 hover:text-green-800 transition-colors"
                                >
                                    <ArrowUpRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                        
                        {/* Subscribers Card - Now with real data */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                            <Users className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total Subscribers</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {loadingSubscribers ? (
                                                    <span className="flex items-center">
                                                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                                                        Loading...
                                                    </span>
                                                ) : (
                                                    dashboardStats.totalSubscribers.toLocaleString()
                                                )}
                                            </p>
                                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                {loadingSubscribers ? 'Calculating...' : 'Real-time count'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Link 
                                    to="/subscribers"
                                    className="text-purple-600 hover:text-purple-800 transition-colors"
                                >
                                    <ArrowUpRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <div className="bg-orange-100 p-3 rounded-lg mx-auto mb-3 w-fit">
                                    <Send className="h-6 w-6 text-orange-600" />
                                </div>
                                <p className="text-sm text-gray-700 mb-2">Quick Actions</p>
                                <div className="space-y-2">
                                    <Link 
                                        to="/templates/create"
                                        className="block bg-white text-orange-600 px-3 py-1 rounded text-xs hover:bg-orange-50 transition-colors"
                                    >
                                        Create Template
                                    </Link>
                                    <Link 
                                        to="/add-domain"
                                        className="block bg-white text-orange-600 px-3 py-1 rounded text-xs hover:bg-orange-50 transition-colors"
                                    >
                                        Add Domain
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Reports Section */}
                   

                    
                    
                </main>
            </div>
        </div>
    )
}

export default Dashboard